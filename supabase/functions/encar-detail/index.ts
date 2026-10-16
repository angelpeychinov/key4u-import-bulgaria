// encar-detail: on-demand rich details for one Encar car (only cars customers open),
// cached 24 h in encar_listing_details. All Encar traffic via ENCAR_PROXY_URL.
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { HEADERS, makeClient } from "../_shared/encarHttp.ts";

const CACHE_MS = 24 * 3600_000;
const MIN_FETCH_GAP_MS = 10 * 60_000;

const BODY_MAP: Record<string, string> = {
  "세단": "sedan", "해치백": "hatchback", "쿠페": "coupe", "컨버터블": "convertible", "SUV": "suv",
  "왜건": "wagon", "픽업트럭": "pickup", "승합": "van", "밴": "van", "승합/밴": "van", "RV": "minivan",
  "경차": "hatchback", "기타": "other",
};
const COLOR_MAP: Record<string, string> = {
  "흰색": "White", "화이트": "White", "검정색": "Black", "블랙": "Black", "은색": "Silver", "실버": "Silver",
  "쥐색": "Gray", "회색": "Gray", "그레이": "Gray", "파란색": "Blue", "청색": "Blue", "빨간색": "Red",
  "갈색": "Brown", "진주색": "Pearl white", "녹색": "Green", "베이지": "Beige",
};

const json = (p: unknown, status = 200) =>
  new Response(JSON.stringify(p), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

class BlockedError extends Error {}

// Returns parsed JSON, null for 404 (no data), throws BlockedError on block / non-JSON.
async function getJson(client: any, url: string): Promise<any | null> {
  const r = await fetch(url, { client, headers: HEADERS, redirect: "manual", signal: AbortSignal.timeout(15_000) } as any);
  const text = await r.text();
  if (r.status === 404) return null;
  if ([403, 407, 429].includes(r.status) || (r.status >= 300 && r.status < 400)) throw new BlockedError(`HTTP ${r.status}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  try { return JSON.parse(text); } catch { throw new BlockedError("Non-JSON body"); }
}

// error column format: "<ISO attempt time>|<message>" so the abuse guard can see failed attempts.
const lastAttempt = (row: any): number => {
  const t = [new Date(row.fetched_at).getTime()];
  const m = typeof row.error === "string" ? row.error.split("|")[0] : "";
  const e = Date.parse(m);
  if (!Number.isNaN(e)) t.push(e);
  return Math.max(...t);
};

const publicRow = (row: any) => row && ({
  encar_id: row.encar_id, vehicle: row.vehicle, inspection: row.inspection, record: row.record, fetched_at: row.fetched_at,
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^\d{1,15}$/.test(id)) return json({ error: "Invalid id" }, 400);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: cached } = await supabase.from("encar_listing_details").select("*").eq("encar_id", id).maybeSingle();
  const hasData = cached && (cached.vehicle || cached.inspection || cached.record);

  if (cached && hasData && Date.now() - new Date(cached.fetched_at).getTime() < CACHE_MS) {
    return json({ ok: true, cached: true, ...publicRow(cached) });
  }
  if (cached && Date.now() - lastAttempt(cached) < MIN_FETCH_GAP_MS) {
    return hasData ? json({ ok: true, cached: true, ...publicRow(cached) }) : json({ unavailable: true });
  }

  const proxyUrl = Deno.env.get("ENCAR_PROXY_URL");
  if (!proxyUrl) {
    console.log("ENCAR_PROXY_URL not set");
    return hasData ? json({ ok: true, cached: true, ...publicRow(cached) }) : json({ unavailable: true });
  }

  const { data: listing } = await supabase.from("encar_listings").select("encar_id").eq("encar_id", id).maybeSingle();
  if (!listing) return json({ unavailable: true });

  try {
    const client = makeClient(proxyUrl);
    const base = "https://api.encar.com/v1/readside";
    const [vehicle, inspection, record] = await Promise.all([
      getJson(client, `${base}/vehicle/${id}`),
      getJson(client, `${base}/inspection/vehicle/${id}`).catch((e) => { if (e instanceof BlockedError) throw e; return null; }),
      getJson(client, `${base}/record/vehicle/${id}/open`).catch((e) => { if (e instanceof BlockedError) throw e; return null; }),
    ]);
    const row = { encar_id: id, vehicle, inspection, record, fetched_at: new Date().toISOString(), error: null };
    const { error: upErr } = await supabase.from("encar_listing_details").upsert(row, { onConflict: "encar_id" });
    if (upErr) console.error("details upsert failed", upErr.message);

    const upd: Record<string, unknown> = {};
    const spec = vehicle?.spec;
    const body = typeof spec?.bodyName === "string" ? spec.bodyName.trim() : "";
    if (body) upd.body_type = BODY_MAP[body] ?? body.toLowerCase();
    const cc = Number(spec?.displacement);
    if (Number.isFinite(cc) && cc > 0) upd.engine_cc = Math.round(cc);
    const color = typeof spec?.colorName === "string" ? spec.colorName.trim() : "";
    if (color) upd.color = COLOR_MAP[color] ?? color;
    const tr = typeof spec?.transmissionName === "string" ? spec.transmissionName.trim() : "";
    const TR: Record<string, string> = { "오토": "auto", "수동": "manual", "CVT": "cvt", "세미오토": "semi_auto" };
    if (TR[tr]) upd.transmission = TR[tr];
    const acc = inspection?.master?.accdient ?? inspection?.master?.accident;
    if (typeof acc === "boolean") upd.has_accident = acc;
    if (Object.keys(upd).length) {
      const { error } = await supabase.from("encar_listings").update(upd).eq("encar_id", id);
      if (error) console.error("listing update failed", error.message);
    }
    return json({ ok: true, cached: false, ...publicRow(row) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("encar-detail failed", id, msg);
    const err = `${new Date().toISOString()}|${msg}`.slice(0, 500);
    if (cached) await supabase.from("encar_listing_details").update({ error: err }).eq("encar_id", id);
    else await supabase.from("encar_listing_details").insert({ encar_id: id, error: err, fetched_at: new Date(0).toISOString() });
    return hasData ? json({ ok: true, cached: true, stale: true, ...publicRow(cached) }) : json({ unavailable: true });
  }
});
