// encar-sync: self-running Encar crawler. Called every minute by a scheduler
// with header x-cron-secret. All *.encar.com traffic goes through ENCAR_PROXY_URL
// because Encar blocks cloud IPs. Each call works ~100 s then releases the lock.
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
import { upsertListings } from "../_shared/upsertListings.ts";
import { HEADERS, makeClient } from "../_shared/encarHttp.ts";

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
const CONCURRENCY = 4;
const BUDGET_MS = 100_000; // stop starting new work after this; hard budget ~120 s
const BLOCK_COOLDOWN_MS = 30 * 60_000;
const ERROR_PAUSE_MS = 2 * 60_000;
const ABANDON_MS = 36 * 3600_000;


class BlockedError extends Error {}

const json = (p: unknown, status = 200) =>
  new Response(JSON.stringify(p), { status, headers: { "Content-Type": "application/json" } });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const jitter = () => sleep(1200 + Math.random() * 1300);


// Price.range must sit at the top level next to the (C.…) group — nesting it inside returns HTTP 400.
function buildQ(maker: string, ct: string, lo?: number | null, hi?: number | null) {
  const group = `(C.CarType.${ct}._.Manufacturer.${maker}.)`;
  return lo != null && hi != null
    ? `(And.Hidden.N._.${group}_.Price.range(${lo}..${hi - 1}).)`
    : `(And.Hidden.N._.${group})`;
}

function findFacet(node: any, name: string): any {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) { for (const x of node) { const f = findFacet(x, name); if (f) return f; } return null; }
  if (node.Name === name && Array.isArray(node.Facets)) return node;
  for (const v of Object.values(node)) { const f = findFacet(v, name); if (f) return f; }
  return null;
}

// Returns [maker, car_type, count][] from Encar's Manufacturer facet (Count > 0 only).
async function fetchMakers(client: any): Promise<[string, string, number][]> {
  const out: [string, string, number][] = [];
  for (const ct of ["Y", "N"]) {
    const url = `https://api.encar.com/search/car/list/general?count=true&q=${encodeURIComponent(`(And.Hidden.N._.CarType.${ct}.)`)}&inav=${encodeURIComponent("|Metadata|Sort")}&sr=${encodeURIComponent("|ModifiedDate|0|1")}`;
    const r = await fetch(url, { client, headers: HEADERS, redirect: "manual", signal: AbortSignal.timeout(20_000) } as any);
    const text = await r.text();
    if (!r.ok) { console.error(`encar non-2xx ${r.status} ${url}`); throw new Error(`facet HTTP ${r.status}`); }
    const f = findFacet(JSON.parse(text), "Manufacturer");
    if (!f) throw new Error("Manufacturer facet not found");
    for (const c of f.Facets) {
      const v = String(c.Value ?? c.DisplayValue ?? ""); const n = Number(c.Count ?? 0);
      if (v && n > 0) out.push([v, ct, n]);
    }
    await jitter();
  }
  if (!out.length) throw new Error("facet returned no makers");
  return out;
}

async function encarSearch(client: any, q: string, offset: number, limit: number) {
  const sr = `|ModifiedDate|${offset}|${limit}`;
  const url = `https://api.encar.com/search/car/list/general?count=true&q=${encodeURIComponent(q)}&sr=${encodeURIComponent(sr)}`;
  let r: Response;
  try {
    r = await fetch(url, { client, headers: HEADERS, redirect: "manual", signal: AbortSignal.timeout(20_000) } as any);
  } catch (e) {
    console.warn("encar fetch failed, retrying once", String(e));
    await sleep(2000);
    r = await fetch(url, { client, headers: HEADERS, redirect: "manual", signal: AbortSignal.timeout(25_000) } as any);
  }
  const text = await r.text();
  if (!r.ok) console.error(`encar non-2xx ${r.status} ${url}`);
  if ([403, 407, 429].includes(r.status) || (r.status >= 300 && r.status < 400) || /blocked|captcha|client-verification/i.test(text.slice(0, 2000)) && !text.trimStart().startsWith("{")) {
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
    ? [...r.Photos].sort((a, b) => {
        const byOrdering = (a.ordering ?? 0) - (b.ordering ?? 0);
        if (byOrdering !== 0) return byOrdering;
        // Tiebreak by numeric part of the file name (_001, _003 …)
        const na = parseInt(String(a.location ?? "").match(/_(\d+)/)?.[1] ?? "0", 10);
        const nb = parseInt(String(b.location ?? "").match(/_(\d+)/)?.[1] ?? "0", 10);
        return na - nb;
      })
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
const INCR_MAX_PAGES = 8; // per car type; the list API has no ModifiedDate, so no date-based early stop

function sofiaHour(): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Sofia", hour: "2-digit", hourCycle: "h23" }).format(new Date()));
}

async function runIncremental(supabase: any, proxyUrl: string, t0: number) {
  const { data: lastInc } = await supabase.from("encar_sync_runs").select("started_at")
    .eq("kind", "incremental").order("started_at", { ascending: false }).limit(1);
  if (lastInc?.[0] && Date.now() - new Date(lastInc[0].started_at).getTime() < INCR_INTERVAL_MS) {
    return { ok: true, status: "idle" };
  }
  const maxPages = INCR_MAX_PAGES;

  const { data: inc, error } = await supabase.from("encar_sync_runs").insert({ kind: "incremental", windows_built: true }).select("*").single();
  if (error) throw new Error("create incremental failed: " + error.message);
  let pages = 0, upserted = 0;
  try {
    const client = makeClient(proxyUrl);
    for (const ct of ["Y", "N"]) {
      for (let p = 0; p < maxPages && Date.now() - t0 < BUDGET_MS; p++) {
        const { results } = await encarSearch(client, `(And.Hidden.N._.CarType.${ct}.)`, p * PAGE, PAGE);
        pages++;
        if (results.length === 0) break;
        const rows = results.filter((r) => { const p = Number(r.Price); return p > 0 && p !== 9999 && r.SellType === "일반"; })
          .map((r) => toRow(r, String(r.Manufacturer ?? "")));
        if (rows.length) {
          const { inserted, updated } = await upsertListings(supabase, rows);
          upserted += inserted + updated;
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

  const clearPause = async () => {
    if (!run || (!run.error && !run.paused_until)) return;
    run.error = null; run.paused_until = null;
    await supabase.from("encar_sync_runs").update({ error: null, paused_until: null }).eq("id", run.id);
  };

  try {
    // --- decide mode: continue full / start full / incremental / idle ---
    const { data: running } = await supabase.from("encar_sync_runs").select("*")
      .eq("status", "running").eq("kind", "full").order("started_at", { ascending: false }).limit(1);
    run = running?.[0] ?? null;
    // Safety valve: a full run stuck 'running' for >36 h is abandoned so a new one can start.
    if (run && Date.now() - new Date(run.started_at).getTime() > ABANDON_MS) {
      console.warn("abandoning stale full run", run.id);
      await supabase.from("encar_sync_runs").update({ status: "abandoned", finished_at: new Date().toISOString() }).eq("id", run.id);
      run = null;
    }
    // Paused full run: do nothing (no incremental either) until the pause expires.
    if (run?.paused_until && new Date(run.paused_until).getTime() > Date.now()) {
      const until = run.paused_until;
      run = null;
      await releaseLock();
      return json({ ok: true, status: "paused", until });
    }
    if (!run) {
      // Blocked cooldown applies to incremental runs only.
      const { data: last } = await supabase.from("encar_sync_runs").select("status, started_at, finished_at")
        .eq("kind", "incremental").order("started_at", { ascending: false }).limit(1);
      const l = last?.[0];
      const at = l ? new Date(l.finished_at ?? l.started_at).getTime() : 0;
      const incBlocked = l?.status === "blocked" && Date.now() - at < BLOCK_COOLDOWN_MS;
      const { data: lastFull } = await supabase.from("encar_sync_runs").select("started_at")
        .eq("kind", "full").eq("status", "done").order("started_at", { ascending: false }).limit(1);
      const lf = lastFull?.[0];
      const h = sofiaHour();
      const fullDue = !lf ||
        (Date.now() - new Date(lf.started_at).getTime() > FULL_INTERVAL_MS && h >= 2 && h < 6);
      if (!fullDue) {
        if (incBlocked) {
          await releaseLock();
          return json({ ok: true, status: "blocked-cooldown", retry_after_s: Math.round((BLOCK_COOLDOWN_MS - (Date.now() - at)) / 1000) });
        }
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
    if (!run.windows_built && !Array.isArray(run.makers)) {
      let makers: [string, string, number | null][];
      try { makers = await fetchMakers(client); await clearPause(); }
      catch (e) {
        if (e instanceof BlockedError) throw e;
        console.error("facet fetch failed, using fallback MAKERS", String(e));
        makers = MAKERS.map(([m, ct]) => [m, ct, null]);
      }
      run.makers = makers;
      await supabase.from("encar_sync_runs").update({ makers }).eq("id", run.id);
    }
    while (!run.windows_built && timeLeft()) {
      const idx = run.build_maker_idx;
      const list = run.makers as [string, string, number | null][];
      if (idx >= list.length) {
        run.windows_built = true;
        await supabase.from("encar_sync_runs").update({ windows_built: true }).eq("id", run.id);
        break;
      }
      const [maker, ct, known] = list[idx];
      let count = known;
      if (count == null) {
        ({ count } = await encarSearch(client, buildQ(maker, ct), 0, 1));
        await clearPause();
        await jitter();
      }
      if (!count) {
        console.log(`maker ${maker} has 0 listings, skipped`);
      } else if (count <= MAX_DEPTH) {
        const { error } = await supabase.from("encar_sync_windows").insert({ run_id: run.id, maker, car_type: ct, total: count });
        if (error) throw new Error("insert windows failed: " + error.message);
      } else {
        // Pending price ranges are persisted in run.build_stack so splitting resumes across invocations.
        let stack: [number, number][] = Array.isArray(run.build_stack) ? run.build_stack : [];
        if (!stack.length) for (let i = PRICE_EDGES.length - 2; i >= 0; i--) stack.push([PRICE_EDGES[i], PRICE_EDGES[i + 1]]);
        while (stack.length && timeLeft()) {
          const [lo, hi] = stack[stack.length - 1];
          const { count: c } = await encarSearch(client, buildQ(maker, ct, lo, hi), 0, 1);
          await clearPause();
          stack = stack.slice(0, -1);
          if (c > MAX_DEPTH && hi - lo > 1) {
            const mid = Math.floor((lo + hi) / 2);
            stack.push([mid, hi], [lo, mid]);
          } else if (c > 0) {
            const { error } = await supabase.from("encar_sync_windows").insert({ run_id: run.id, maker, car_type: ct, price_lo: lo, price_hi: hi, total: c });
            if (error) throw new Error("insert windows failed: " + error.message);
          }
          run.build_stack = stack;
          await supabase.from("encar_sync_runs").update({ build_stack: stack }).eq("id", run.id);
          await jitter();
        }
        if (stack.length) break; // out of time; resume this maker next invocation
        run.build_stack = null;
      }
      run.build_maker_idx = idx + 1;
      await supabase.from("encar_sync_runs").update({ build_maker_idx: run.build_maker_idx, build_stack: null }).eq("id", run.id);
    }

    // --- process windows ---
    while (run.windows_built && timeLeft()) {
      const { data: ws } = await supabase.from("encar_sync_windows").select("*")
        .eq("run_id", run.id).eq("done", false).order("id").limit(1);
      const w = ws?.[0];
      if (!w) break;
      const limit = Math.min(w.total, MAX_DEPTH);
      const q = buildQ(w.maker, w.car_type, w.price_lo, w.price_hi);
      while (timeLeft()) {
        if (w.next_offset >= limit) { w.done = true; break; }
        // Fetch up to CONCURRENCY pages in parallel; only advance over the contiguous successful prefix.
        const offsets: number[] = [];
        for (let k = 0; k < CONCURRENCY && w.next_offset + k * PAGE < limit; k++) offsets.push(w.next_offset + k * PAGE);
        const settled = await Promise.allSettled(offsets.map((o) => encarSearch(client, q, o, PAGE)));
        let firstErr: unknown = null;
        const good: any[][] = [];
        for (const s of settled) {
          if (s.status === "rejected") { firstErr = s.reason; break; }
          good.push(s.value.results);
        }
        const rows = good.flat()
          .filter((r) => { const p = Number(r.Price); return p > 0 && p !== 9999 && r.SellType === "일반"; })
          .map((r) => toRow(r, w.maker));
        if (rows.length) {
          const { inserted, updated } = await upsertListings(supabase, rows);
          stats.upserted += inserted + updated;
        }
        for (const res of good) {
          stats.pages++;
          w.fetched += res.length; // skipped results still count as seen
          w.next_offset += PAGE;
          if (res.length === 0) { w.done = true; break; }
        }
        if (w.next_offset >= limit) w.done = true;
        await supabase.from("encar_sync_windows")
          .update({ next_offset: w.next_offset, fetched: w.fetched, done: w.done }).eq("id", w.id);
        if (firstErr) { await bumpRun(); throw firstErr; }
        if (good.length) await clearPause();
        if (w.done) break;
        await sleep(300 + Math.random() * 400);
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
    let until: string | null = null;
    if (run) {
      // A full run is never abandoned on error/block: keep 'running' and pause it.
      until = new Date(Date.now() + (blocked ? BLOCK_COOLDOWN_MS : ERROR_PAUSE_MS)).toISOString();
      await bumpRun({ status: "running", error: ((blocked ? "BLOCKED: " : "") + msg).slice(0, 1000), paused_until: until });
    }
    await releaseLock();
    return json({ ok: false, status: blocked ? "blocked" : "error", error: msg, paused_until: until });
  }
});
