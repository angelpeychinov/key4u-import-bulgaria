// TEMPORARY one-off backfill: re-runs translateListing on rows that still contain Hangul. Delete after use.
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
import { translateListing } from "../_shared/encarMaps.ts";

const COLS = ["brand_name", "brand_slug", "model_name", "model_slug", "trim", "region", "fuel_type", "transmission"];

Deno.serve(async (req) => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: cfg } = await supabase.from("encar_sync_config").select("value").eq("key", "cron_secret").maybeSingle();
  if (!cfg?.value || req.headers.get("x-cron-secret") !== cfg.value) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const t0 = Date.now();
  let after = new URL(req.url).searchParams.get("after") ?? "";
  let updated = 0, scanned = 0;
  const filter = COLS.map((c) => `${c}.match.[가-힣]`).join(",");
  while (Date.now() - t0 < 100_000) {
    const { data, error } = await supabase.from("encar_listings").select(["encar_id", ...COLS].join(","))
      .or(filter).gt("encar_id", after).order("encar_id").limit(5000);
    if (error) return Response.json({ error: error.message, updated, after }, { status: 500 });
    if (!data?.length) return Response.json({ done: true, updated, scanned });
    scanned += data.length;
    const rows = data.map((r: any) => {
      const t: any = translateListing(r);
      const o: any = { encar_id: r.encar_id };
      for (const c of COLS) o[c] = t[c] ?? null;
      return o;
    });
    for (let i = 0; i < rows.length; i += 1000) {
      const { error: e } = await supabase.from("encar_listings").upsert(rows.slice(i, i + 1000), { onConflict: "encar_id" });
      if (e) return Response.json({ error: e.message, updated, after }, { status: 500 });
    }
    updated += rows.length;
    after = data[data.length - 1].encar_id;
  }
  return Response.json({ done: false, updated, scanned, after });
});
