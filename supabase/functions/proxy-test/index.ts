// TEMPORARY diagnostic — delete after use.
// deno-lint-ignore-file no-explicit-any
import { HEADERS, makeClient } from "../_shared/encarHttp.ts";
const BASE = "https://api.encar.com/search/car/list/general?count=true";
const SR = encodeURIComponent("|ModifiedDate|0|1");
Deno.serve(async () => {
  const raw = Deno.env.get("ENCAR_PROXY_URL");
  if (!raw) return Response.json({ error: "no proxy" });
  const client = makeClient(raw);
  const qs = [
    "(And.Hidden.N._.(C.CarType.Y._.Manufacturer.현대.)_.Price.range(1000..1199).)",
    "(And.Hidden.N._.Price.range(1000..1199)._.(C.CarType.Y._.Manufacturer.현대.))",
  ];
  const out: any[] = [];
  for (const q of qs) {
    const r = await fetch(`${BASE}&q=${encodeURIComponent(q)}&sr=${SR}`, { client, headers: HEADERS } as any);
    const t = await r.text(); let c = null; try { c = JSON.parse(t).Count; } catch { /* */ }
    out.push({ q, status: r.status, Count: c });
  }
  return Response.json(out);
});
