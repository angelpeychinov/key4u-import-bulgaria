import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { HEADERS, makeClient } from "../_shared/encarHttp.ts";
import { categoryBody, mergeModelBody, pairKey, type ModelBody } from "../_shared/encarModelBody.ts";

const schema = z.object({ action: z.enum(["explore", "build", "backfill", "null-placeholders"]), ct: z.enum(["Y", "N"]).default("Y"), category: z.string().max(100).optional(), manufacturer: z.string().max(100).optional(), manufacturers: z.array(z.string().max(100)).max(100).optional(), groups: z.array(z.string().max(100)).max(300).optional(), inav: z.string().max(500).default("|Metadata|Sort") });
function facet(node: any, name: string): any {
 if (!node || typeof node !== "object") return null;
 if (node.Name === name && Array.isArray(node.Facets)) return node;
 for (const value of Object.values(node)) { const found = facet(value, name); if (found) return found; }
 return null;
}
const escape = (s: string) => s.replace(/_/g, "__").replace(/[.)]/g, "_$&");
const or = (items: string[]) => items.length === 1 ? items[0] : `(Or.${items.join("_.")})`;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
Deno.serve(async (req) => {
 if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
 const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"), proxy = Deno.env.get("ENCAR_PROXY_URL");
 if (!url || !key || !proxy) return json({ error: "Required configuration missing" }, 500);
 const db = createClient(url, key);
 const provided = req.headers.get("x-cron-secret");
 if (!provided) return json({ error: "Unauthorized" }, 401);
 const envSecret = Deno.env.get("CRON_SECRET");
 if (!envSecret || provided !== envSecret) {
  const { data } = await db.from("encar_sync_config").select("value").eq("key", "cron_secret").maybeSingle();
  if (!data?.value || provided !== data.value) return json({ error: "Unauthorized" }, 401);
 }
 let client;
 try {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return json({ error: "Invalid request" }, 400);
  const { action, ct, category, manufacturer, manufacturers, groups, inav } = parsed.data;
  if (action === "backfill") {
   let updated = 0, batches = 0; const start = Date.now();
   while (Date.now() - start < 85000) {
    const { data, error } = await db.rpc("encar_backfill_model_body", { _limit: 3000 });
    if (error) throw new Error("Body backfill failed: " + error.message);
    updated += Number(data); batches++;
    if (!data) return json({ updated, batches, done: true });
   }
   return json({ updated, batches, done: false });
  }
  if (action === "null-placeholders") {
    // Encar "price on request" placeholders (9999 / 99999 만원) stored before the sync rule.
    const { data, error } = await db
      .from("encar_listings")
      .update({ price_original: null })
      .in("price_original", [99990000, 999990000])
      .select("id");
    if (error) return json({ error: error.message }, 500);
    return json({ nulled: (data ?? []).length });
  }
  client = makeClient(proxy);
  let requests = 0;
  const fetchFacet = async (q: string) => {
   const upstream = new URL("https://api.encar.com/search/car/list/general");
   upstream.search = new URLSearchParams({ count: "true", q, inav, sr: "|ModifiedDate|0|1" }).toString();
   const res = await fetch(upstream, { client, headers: HEADERS, redirect: "manual", signal: AbortSignal.timeout(25000) } as RequestInit);
   requests++;
   if (!res.ok) { console.error("Encar body facet failed", { status: res.status, request: requests, q }); throw new Error(JSON.stringify({ error: `Encar HTTP ${res.status}`, request: requests, q })); }
   const payload = await res.json(); delete payload.SearchResults;
   return payload;
  };
  if (action === "build") {
   if (!category || !categoryBody(category, "")) return json({ error: "Known category required" }, 400);
   const base = await fetchFacet(`(And.Hidden.N._.CarType.${ct}._.Category.${category}.)`);
   const makers = (facet(base, "Manufacturer")?.Facets ?? []).filter((m: any) => Number(m.Count) > 0);
   if (!makers.length) return json({ category, pairs: 0, requests });
   const makerSelection = or(makers.map((m: any) => `Manufacturer.${escape(m.Value)}.`));
   const groupTree = await fetchFacet(`(And.Hidden.N._.(C.CarType.${ct}._.${makerSelection})_.Category.${category}.)`);
   console.log("Encar body facet structure", JSON.stringify({ ct, category, nodes: facet(groupTree, "Manufacturer")?.Facets.map((m: any) => ({ manufacturer: m.Value, count: m.Count, refinements: m.Refinements?.Nodes.map((n: any) => ({ name: n.Name, values: n.Facets.length })) })) }));
   const branches = (facet(groupTree, "Manufacturer")?.Facets ?? []).filter((m: any) => m.IsSelected && Number(m.Count) > 0).flatMap((m: any) => {
    const groups = (facet(m.Refinements, "ModelGroup")?.Facets ?? []).filter((g: any) => Number(g.Count) > 0);
    const branches: string[] = []; let parts: string[] = [];
    for (const g of groups) {
     const part = g.Expression || `ModelGroup.${escape(g.Value)}.`;
     if (parts.length && encodeURIComponent(parts.join("_.") + part).length > 2400) { branches.push(`(C.Manufacturer.${escape(m.Value)}._.${or(parts)})`); parts = []; }
     parts.push(part);
    }
    if (parts.length) branches.push(`(C.Manufacturer.${escape(m.Value)}._.${or(parts)})`);
    return branches;
   }).filter(Boolean);
   const candidates = new Map<string, ModelBody>();
   // Split very large imported-category trees without losing manufacturer context.
   const chunks: string[][] = [];
   let chunk: string[] = [];
   for (const branch of branches) {
    if (chunk.length && encodeURIComponent(chunk.join("_.") + branch).length > 2800) { chunks.push(chunk); chunk = []; }
    chunk.push(branch);
   }
   if (chunk.length) chunks.push(chunk);
   for (const chunk of chunks) {
    const tree = await fetchFacet(`(And.Hidden.N._.(C.CarType.${ct}._.${or(chunk)})_.Category.${category}.)`);
    for (const m of facet(tree, "Manufacturer")?.Facets ?? []) {
     if (!m.IsSelected) continue;
     for (const g of facet(m.Refinements, "ModelGroup")?.Facets ?? []) {
      if (!g.IsSelected) continue;
      for (const model of facet(g.Refinements, "Model")?.Facets ?? []) {
       const body = categoryBody(category, String(model.Value));
       if (body && Number(model.Count) > 0) mergeModelBody(candidates, { manufacturer: m.Value, model: model.Value, category, body_type: body, category_count: Number(model.Count) });
      }
     }
    }
   }
   // Compare across categories before upsert: traversal order must not choose the winner.
   for (const maker of makers) {
    const { data, error } = await db.from("encar_model_body").select("*").eq("manufacturer", maker.Value);
    if (error) throw new Error(error.message);
    for (const existing of data ?? []) {
     const k = pairKey(existing.manufacturer, existing.model);
     if (candidates.has(k)) mergeModelBody(candidates, existing);
    }
   }
   const rows = [...candidates.values()];
   for (let offset = 0; offset < rows.length; offset += 500) {
    const { error } = await db.from("encar_model_body").upsert(rows.slice(offset, offset + 500), { onConflict: "manufacturer,model" });
    if (error) throw new Error(error.message);
   }
   console.log("Encar body map category complete", { ct, category, pairs: rows.length, requests });
   return json({ ct, category, pairs: rows.length, requests });
  }
  const selection = manufacturers?.length ? `(Or.${manufacturers.map(m => `Manufacturer.${escape(m)}.`).join("_.")})` : manufacturer ? `Manufacturer.${escape(manufacturer)}.` : "";
  const groupSelection = groups?.length ? `(Or.${groups.map(m => `ModelGroup.${escape(m)}.`).join("_.")})` : "";
  const q = selection && (manufacturers?.length || groups?.length)
   ? `(And.Hidden.N._.(C.CarType.${ct}._.${groupSelection ? `(Or.${(manufacturers ?? (manufacturer ? [manufacturer] : [])).map(m => `(C.Manufacturer.${escape(m)}._.${groupSelection})`).join("_.")})` : selection})${category ? `_.Category.${category}.` : ""})`
   : category || manufacturer
   ? `(And.Hidden.N._.${manufacturer ? `(C.CarType.${ct}._.Manufacturer.${escape(manufacturer)}.)` : `CarType.${ct}.`}${category ? `_.Category.${category}.` : ""})`
   : `(And.Hidden.N._.CarType.${ct}.)`;
  const payload = await fetchFacet(q);
  console.log("Encar body facet structure", JSON.stringify(payload).slice(0, 20000));
  return json({ q, payload });
 } catch (e) { if (e instanceof Error && e.message.startsWith('{"error":"Encar HTTP')) return json(JSON.parse(e.message), 502); return json({ error: "Body mapping failed; see function logs" }, 502); }
 finally { client?.close(); }
});