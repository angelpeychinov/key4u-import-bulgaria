// TEMPORARY diagnostic — delete after use.
// deno-lint-ignore-file no-explicit-any
import { HEADERS, makeClient } from "../_shared/encarHttp.ts";

const BASE = "https://api.encar.com/search/car/list/general?count=true";
const SR = encodeURIComponent("|ModifiedDate|0|1");

function findFacet(node: any, name: string): any {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) { for (const x of node) { const f = findFacet(x, name); if (f) return f; } return null; }
  for (const k of ["Name", "name", "Expression", "Key"]) if (node[k] === name) return node;
  for (const [k, v] of Object.entries(node)) {
    if (k === name && v && typeof v === "object") return v;
    const f = findFacet(v, name); if (f) return f;
  }
  return null;
}

async function facets(client: any, ct: string) {
  const url = `${BASE}&q=${encodeURIComponent(`(And.Hidden.N._.CarType.${ct}.)`)}&inav=${encodeURIComponent("|Metadata|Sort")}&sr=${SR}`;
  try {
    const r = await fetch(url, { client, headers: HEADERS } as any);
    const text = await r.text();
    let j: any; try { j = JSON.parse(text); } catch { return { url, status: r.status, body: text.slice(0, 500) }; }
    const f = findFacet(j, "Manufacturer");
    if (!f) return { url, status: r.status, error: "Manufacturer facet not found", top_keys: Object.keys(j) };
    const kids = f.Refinements?.Nodes?.[0]?.Facets ?? f.Facets ?? f.Children ?? f.Nodes ?? [];
    const list = (Array.isArray(kids) ? kids : []).map((c: any) => ({ Value: c.DisplayValue ?? c.Value, RawValue: c.Value, Count: c.Count }));
    return { url, status: r.status, facet_keys: Object.keys(f), count: list.length, children: list, facet_sample: list.length ? undefined : JSON.stringify(f).slice(0, 1500) };
  } catch (e) { return { url, error: String((e as Error)?.message ?? e) }; }
}

Deno.serve(async () => {
  const raw = Deno.env.get("ENCAR_PROXY_URL");
  if (!raw) return Response.json({ error: "ENCAR_PROXY_URL not set" });
  const client = makeClient(raw);
  const qs: Record<string, string> = {
    a: "(And.Hidden.N._.(C.CarType.Y._.Manufacturer.현대.))",
    b: "(And.Hidden.N._.(C.CarType.Y._.(C.Manufacturer.현대.)))",
    c: "(And.Hidden.N._.CarType.Y._.Manufacturer.현대.)",
    d: "(And.Hidden.N._.(C.CarType.N._.Manufacturer.BMW.))",
    e: "(And.Hidden.N._.(C.CarType.N._.Manufacturer.벤츠.))",
    f: "(And.Hidden.N._.(C.CarType.Y._.Manufacturer.현대._.Price.range(1000..1199).))",
    g: "(And.Hidden.N._.CarType.Y._.Price.range(1000..1199).)",
    h: "(And.Hidden.N._.(C.CarType.Y._.Manufacturer.기아.))",
  };
  const out: any = { queries: {} };
  for (const [k, q] of Object.entries(qs)) {
    const url = `${BASE}&q=${encodeURIComponent(q)}&sr=${SR}`;
    try {
      const r = await fetch(url, { client, headers: HEADERS } as any);
      const text = await r.text();
      let count: any = null; try { count = JSON.parse(text).Count; } catch { /* */ }
      out.queries[k] = { q, status: r.status, Count: count, body: text.slice(0, 200) };
    } catch (e) { out.queries[k] = { q, error: String((e as Error)?.message ?? e) }; }
  }
  out.facets_Y = await facets(client, "Y");
  out.facets_N = await facets(client, "N");
  let s = JSON.stringify(out, null, 2);
  try { const u = new URL(raw); for (const v of [u.username, u.password]) if (v) s = s.split(v).join("***"); } catch { /* */ }
  return new Response(s, { headers: { "Content-Type": "application/json" } });
});
