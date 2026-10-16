// encar-sync: self-running Encar crawler. Called every minute by a scheduler
// with header x-cron-secret. All *.encar.com traffic goes through ENCAR_PROXY_URL
// because Encar blocks cloud IPs. Each call works ~100 s then releases the lock.
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
import { upsertListings } from "../_shared/upsertListings.ts";

const MAKERS: [string, "Y" | "N"][] = [
  ["현대", "Y"], ["기아", "Y"], ["제네시스", "Y"], ["쉐보레(GM대우)", "Y"], ["르노코리아(삼성)", "Y"],
  ["KG모빌리티(쌍용)", "Y"], ["BMW", "N"], ["벤츠", "N"], ["아우디", "N"], ["폭스바겐", "N"],
  ["포르쉐", "N"], ["볼보", "N"], ["렉서스", "N"], ["랜드로버", "N"], ["도요타", "N"], ["미니", "N"],
  ["벤틀리", "N"], ["롤스로이스", "N"], ["재규어", "N"], ["마세라티", "N"], ["페라리", "N"],
  ["람보르기니", "N"], ["캐딜락", "N"], ["쉐보레", "N"], ["포드", "N"], ["푸조", "N"],
  ["크라이슬러", "N"], ["지프", "N"], ["인피니티", "N"], ["혼다", "N"], ["닛산", "N"], ["스바루", "N"],
  ["미쯔비시", "N"], ["스마트", "N"], ["테슬라", "N"], ["링컨", "N"], ["폴스타", "N"], ["마쯔다", "N"],
  ["르노", "N"], ["시트로엥", "N"], ["알파로메오", "N"], ["피아트", "N"], ["닷지", "N"],
];
const PRICE_EDGES = [0, 500, 800, 1000, 1200, 1500, 1800, 2000, 2300, 2600, 3000, 3500, 4000, 5000, 6000, 8000, 10000, 15000, 999999];
const MAX_DEPTH = 9000;
const PAGE = 50;
const BUDGET_MS = 100_000; // stop starting new work after this; hard budget ~120 s
const BLOCK_COOLDOWN_MS = 30 * 60_000;

const HEADERS = {
  accept: "application/json, text/javascript, */*; q=0.01",
  "accept-language": "ko-KR,ko;q=0.9",
  origin: "https://www.encar.com",
  referer: "https://www.encar.com/",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
};

class BlockedError extends Error {}

const json = (p: unknown, status = 200) =>
  new Response(JSON.stringify(p), { status, headers: { "Content-Type": "application/json" } });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const jitter = () => sleep(1200 + Math.random() * 1300);

function makeClient(proxyUrl: string) {
  const u = new URL(proxyUrl);
  const username = decodeURIComponent(u.username);
  const password = decodeURIComponent(u.password);
  u.username = ""; u.password = "";
  const proxy: any = { url: u.toString().replace(/\/$/, "") };
  if (username) proxy.basicAuth = { username, password };
  return (Deno as any).createHttpClient({ proxy });
}

function buildQ(maker: string, ct: string, lo?: number | null, hi?: number | null) {
  const price = lo != null && hi != null ? `._.Price.range(${lo}..${hi - 1}).` : ".";
  return `(And.Hidden.N._.(C.CarType.${ct}._.Manufacturer.${maker}${price}))`;
}

async function encarSearch(client: any, q: string, offset: number, limit: number) {
  const sr = `|ModifiedDate|${offset}|${limit}`;
  const url = `https://api.encar.com/search/car/list/general?count=true&q=${encodeURIComponent(q)}&sr=${encodeURIComponent(sr)}`;
  const r = await fetch(url, { client, headers: HEADERS, redirect: "manual", signal: AbortSignal.timeout(20_000) } as any);
  const text = await r.text();
  if ([403, 407, 429].includes(r.status) || (r.status >= 300 && r.status < 400)) {
    throw new BlockedError(`HTTP ${r.status} ${r.headers.get("location") ?? ""} ${text.slice(0, 200)}`.trim());
  }
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${text.slice(0, 200)}`);
  try {
    const j = JSON.parse(text);
    return { count: Number(j.Count ?? 0), results: (j.SearchResults ?? []) as any[] };
  } catch {
    throw new BlockedError(`Non-JSON body: ${text.slice(0, 200)}`);
  }
}

const modelSlug = (m?: string) =>
  m ? m.replace(/\([^)]*\)/g, "").trim().toLowerCase().replace(/\s+/g, "-") : undefined;

function toRow(r: any, maker: string) {
  const photos: string[] = Array.isArray(r.Photos) && r.Photos.length
    ? [...r.Photos].sort((a, b) => (a.ordering ?? 0) - (b.ordering ?? 0))
        .map((p) => "https://ci.encar.com/carpicture" + p.location)
    : r.Photo ? ["https://ci.encar.com/carpicture" + r.Photo + "001.jpg"] : [];
  return {
    encar_id: String(r.Id),
    brand_name: maker,
    model_name: r.Model ?? null,
    model_slug: modelSlug(r.Model) ?? null,
    trim: [r.Badge, r.BadgeDetail].filter(Boolean).join(" ") || null,
    year: parseInt(r.FormYear) || (r.Year ? Math.floor(Number(r.Year) / 100) : null),
    price_original: Math.round(Number(r.Price) * 10000),
    mileage: r.Mileage ?? null,
    fuel_type: r.FuelType ?? null,
    transmission: r.Transmission ?? null,
    region: r.OfficeCityState ?? null,
    photos,
    thumb: photos[0] ?? null,
    listing_url: "https://www.encar.com/dc/dc_cardetailview.do?carid=" + r.Id,
    source_code: "encar",
    raw_data: r,
  };
}

const FULL_INTERVAL_MS = 20 * 3600_000;
const INCR_INTERVAL_MS = 15 * 60_000;
const INCR_MAX_PAGES = 20;
const INCR_FIRST_PAGES = 4;

function sofiaHour(): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Sofia", hour: "2-digit", hourCycle: "h23" }).format(new Date()));
}

// Encar format: "2026-08-31 22:23:04.000 +09"
function parseEncarDate(s?: string): number | null {
  if (!s) return null;
  const m = String(s).trim().match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(\.\d+)?\s*([+-]\d{2})(?::?(\d{2}))?$/);
  if (!m) return null;
  const t = Date.parse(`${m[1]}T${m[2]}${m[3] ?? ""}${m[4]}:${m[5] ?? "00"}`);
  return Number.isNaN(t) ? null : t;
}

async function runIncremental(supabase: any, proxyUrl: string, t0: number) {
  const { data: lastInc } = await supabase.from("encar_sync_runs").select("started_at")
    .eq("kind", "incremental").order("started_at", { ascending: false }).limit(1);
  if (lastInc?.[0] && Date.now() - new Date(lastInc[0].started_at).getTime() < INCR_INTERVAL_MS) {
    return { ok: true, status: "idle" };
  }
  const { data: prevOk } = await supabase.from("encar_sync_runs").select("started_at")
    .eq("kind", "incremental").eq("status", "done").order("started_at", { ascending: false }).limit(1);
  const cutoff = prevOk?.[0] ? new Date(prevOk[0].started_at).getTime() - 10 * 60_000 : null;
  const maxPages = cutoff == null ? INCR_FIRST_PAGES : INCR_MAX_PAGES;

  const { data: inc, error } = await supabase.from("encar_sync_runs").insert({ kind: "incremental", windows_built: true }).select("*").single();
  if (error) throw new Error("create incremental failed: " + error.message);
  let pages = 0, upserted = 0;
  try {
    const client = makeClient(proxyUrl);
    for (const ct of ["Y", "N"]) {
      let olderStreak = 0;
      for (let p = 0; p < maxPages && Date.now() - t0 < BUDGET_MS; p++) {
        const { results } = await encarSearch(client, `(And.Hidden.N._.CarType.${ct}.)`, p * PAGE, PAGE);
        pages++;
        if (results.length === 0) break;
        const rows = results.filter((r) => Number(r.Price) < 9999 && r.SellType === "일반")
          .map((r) => toRow(r, String(r.Manufacturer ?? "")));
        if (rows.length) {
          const { inserted, updated } = await upsertListings(supabase, rows);
          upserted += inserted + updated;
        }
        // Sort order is unverified: stop only after 2 consecutive pages that are entirely older than the cutoff.
        if (cutoff != null) {
          const allOlder = results.every((r) => { const t = parseEncarDate(r.ModifiedDate); return t != null && t < cutoff; });
          olderStreak = allOlder ? olderStreak + 1 : 0;
          if (olderStreak >= 2) break;
        }
        await jitter();
      }
    }
    await supabase.from("encar_sync_runs").update({ status: "done", pages, upserted, finished_at: new Date().toISOString() }).eq("id", inc.id);
    return { ok: true, status: "incremental-done", pages, upserted };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const blocked = e instanceof BlockedError;
    console.error(blocked ? "encar blocked (incremental)" : "incremental error", msg);
    await supabase.from("encar_sync_runs").update({ status: blocked ? "blocked" : "error", error: msg.slice(0, 1000), pages, upserted, finished_at: new Date().toISOString() }).eq("id", inc.id);
    return { ok: false, status: blocked ? "blocked" : "error", error: msg };
  }
}

Deno.serve(async (req) => {
  const t0 = Date.now();
  const proxyUrl = Deno.env.get("ENCAR_PROXY_URL");
  if (!proxyUrl) {
    console.log("ENCAR_PROXY_URL not set");
    return json({ ok: true, skipped: "ENCAR_PROXY_URL not set" });
  }
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const provided = req.headers.get("x-cron-secret");
  let authorized = false;
  if (provided) {
    const envSecret = Deno.env.get("CRON_SECRET");
    if (envSecret && provided === envSecret) authorized = true;
    if (!authorized) {
      const { data: cfg } = await supabase
        .from("encar_sync_config").select("value").eq("key", "cron_secret").maybeSingle();
      if (cfg?.value && provided === cfg.value) authorized = true;
    }
  }
  if (!authorized) return json({ error: "Unauthorized" }, 401);

  const { data: locked, error: lockErr } = await supabase.rpc("encar_sync_try_lock", { _seconds: 150 });
  if (lockErr) return json({ error: "lock failed: " + lockErr.message }, 500);
  if (!locked) return json({ ok: true, status: "busy" });

  let run: any = null;
  const stats = { pages: 0, upserted: 0 };
  const timeLeft = () => Date.now() - t0 < BUDGET_MS;
  const releaseLock = () => supabase.rpc("encar_sync_release_lock");
  const bumpRun = async (extra: Record<string, unknown> = {}) => {
    if (!run) return;
    run.pages += stats.pages; run.upserted += stats.upserted;
    stats.pages = 0; stats.upserted = 0;
    await supabase.from("encar_sync_runs").update({ pages: run.pages, upserted: run.upserted, ...extra }).eq("id", run.id);
  };

  try {
    // --- decide mode: continue full / start full / incremental / idle ---
    const { data: running } = await supabase.from("encar_sync_runs").select("*")
      .eq("status", "running").eq("kind", "full").order("started_at", { ascending: false }).limit(1);
    run = running?.[0] ?? null;
    if (!run) {
      const { data: last } = await supabase.from("encar_sync_runs").select("status, started_at, finished_at")
        .order("started_at", { ascending: false }).limit(1);
      const l = last?.[0];
      if (l?.status === "blocked") {
        const at = new Date(l.finished_at ?? l.started_at).getTime();
        if (Date.now() - at < BLOCK_COOLDOWN_MS) {
          await releaseLock();
          return json({ ok: true, status: "blocked-cooldown", retry_after_s: Math.round((BLOCK_COOLDOWN_MS - (Date.now() - at)) / 1000) });
        }
      }
      const { data: lastFull } = await supabase.from("encar_sync_runs").select("started_at")
        .eq("kind", "full").eq("status", "done").order("started_at", { ascending: false }).limit(1);
      const lf = lastFull?.[0];
      const h = sofiaHour();
      const fullDue = !lf ||
        (Date.now() - new Date(lf.started_at).getTime() > FULL_INTERVAL_MS && h >= 2 && h < 6);
      if (!fullDue) {
        const res = await runIncremental(supabase, proxyUrl, t0);
        await releaseLock();
        return json(res);
      }
      const { data: created, error } = await supabase.from("encar_sync_runs").insert({ kind: "full" }).select("*").single();
      if (error) throw new Error("create run failed: " + error.message);
      run = created;
    }

    const client = makeClient(proxyUrl);

    // --- build windows maker by maker ---
    while (!run.windows_built && timeLeft()) {
      const idx = run.build_maker_idx;
      if (idx >= MAKERS.length) {
        run.windows_built = true;
        await supabase.from("encar_sync_runs").update({ windows_built: true }).eq("id", run.id);
        break;
      }
      const [maker, ct] = MAKERS[idx];
      const { count } = await encarSearch(client, buildQ(maker, ct), 0, 1);
      await jitter();
      const windows: any[] = [];
      if (count === 0) {
        console.log(`maker ${maker} has 0 listings, skipped`);
      } else if (count <= MAX_DEPTH) {
        windows.push({ run_id: run.id, maker, car_type: ct, total: count });
      } else {
        for (let i = 0; i < PRICE_EDGES.length - 1; i++) {
          const lo = PRICE_EDGES[i], hi = PRICE_EDGES[i + 1];
          const { count: c } = await encarSearch(client, buildQ(maker, ct, lo, hi), 0, 1);
          await jitter();
          if (c > 0) windows.push({ run_id: run.id, maker, car_type: ct, price_lo: lo, price_hi: hi, total: c });
        }
      }
      if (windows.length) {
        const { error } = await supabase.from("encar_sync_windows").insert(windows);
        if (error) throw new Error("insert windows failed: " + error.message);
      }
      run.build_maker_idx = idx + 1;
      await supabase.from("encar_sync_runs").update({ build_maker_idx: run.build_maker_idx }).eq("id", run.id);
    }

    // --- process windows ---
    while (run.windows_built && timeLeft()) {
      const { data: ws } = await supabase.from("encar_sync_windows").select("*")
        .eq("run_id", run.id).eq("done", false).order("id").limit(1);
      const w = ws?.[0];
      if (!w) break;
      const limit = Math.min(w.total, MAX_DEPTH);
      while (timeLeft()) {
        if (w.next_offset >= limit) { w.done = true; break; }
        const { results } = await encarSearch(client, buildQ(w.maker, w.car_type, w.price_lo, w.price_hi), w.next_offset, PAGE);
        stats.pages++;
        if (results.length === 0) { w.done = true; break; }
        const rows = results
          .filter((r) => Number(r.Price) < 9999 && r.SellType === "일반")
          .map((r) => toRow(r, w.maker));
        if (rows.length) {
          const { inserted, updated } = await upsertListings(supabase, rows);
          stats.upserted += inserted + updated;
        }
        w.next_offset += PAGE;
        w.fetched += results.length; // skipped results still count as seen
        if (w.next_offset >= limit) w.done = true;
        await supabase.from("encar_sync_windows")
          .update({ next_offset: w.next_offset, fetched: w.fetched, done: w.done }).eq("id", w.id);
        if (w.done) break;
        await jitter();
      }
      if (w.done) await supabase.from("encar_sync_windows").update({ done: true }).eq("id", w.id);
      await bumpRun();
    }

    // --- finalize ---
    if (run.windows_built) {
      const { count: remaining } = await supabase.from("encar_sync_windows")
        .select("id", { count: "exact", head: true }).eq("run_id", run.id).eq("done", false);
      if ((remaining ?? 0) === 0) {
        const { data: all } = await supabase.from("encar_sync_windows").select("maker, total, fetched").eq("run_id", run.id);
        const per = new Map<string, { total: number; fetched: number }>();
        for (const w of all ?? []) {
          const p = per.get(w.maker) ?? { total: 0, fetched: 0 };
          p.total += w.total; p.fetched += w.fetched; per.set(w.maker, p);
        }
        let sold = 0;
        for (const [maker, p] of per) {
          if (p.total === 0 || p.fetched < 0.95 * p.total) {
            console.log(`maker ${maker}: fetched ${p.fetched}/${p.total} < 95%, not marking sold`);
            continue;
          }
          const { count, error } = await supabase.from("encar_listings")
            .update({ status: "sold" }, { count: "exact" })
            .eq("status", "active").eq("raw_data->>Manufacturer", maker).lt("last_seen_at", run.started_at);
          if (error) console.error("mark sold failed", maker, error);
          else sold += count ?? 0;
        }
        await bumpRun({ status: "done", finished_at: new Date().toISOString(), marked_sold: sold });
        await releaseLock();
        return json({ ok: true, status: "done", run_id: run.id, marked_sold: sold });
      }
    }

    await bumpRun();
    await releaseLock();
    return json({ ok: true, status: "running", run_id: run.id, pages: run.pages, upserted: run.upserted });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const blocked = e instanceof BlockedError;
    console.error(blocked ? "encar blocked" : "encar-sync error", msg);
    if (run) await bumpRun({ status: blocked ? "blocked" : "error", error: msg.slice(0, 1000), finished_at: new Date().toISOString() });
    await releaseLock();
    return json({ ok: false, status: blocked ? "blocked" : "error", error: msg });
  }
});
