import { createClient } from "npm:@supabase/supabase-js@2";
Deno.serve(async req => {
  const secret = Deno.env.get("CATALOG_MAINTENANCE_SECRET");
  if (!secret || req.headers.get("x-maintenance-secret") !== secret) return new Response("Unauthorized", { status: 401 });
  const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return new Response("Configuration missing", { status: 500 });
  const db = createClient(url, key);
  const body = await req.json().catch(() => ({}));
  if (body.action === "refresh") {
    const { error } = await db.rpc("encar_refresh_base_facets");
    return Response.json(error ? { error: error.message } : { refreshed: true }, { status: error ? 500 : 200 });
  }
  let updated = 0;
  const start = Date.now();
  // Small batches with pauses so the backfill never starves live catalog queries.
  while (Date.now() - start < 40000) {
    const { data, error } = await db.rpc("encar_backfill_base_models", { _limit: 50 });
    if (error) return Response.json({ error: error.message, updated }, { status: 500 });
    updated += Number(data);
    if (!data) return Response.json({ updated, done: true });
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  return Response.json({ updated, done: false });
});