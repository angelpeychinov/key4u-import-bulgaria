// TEMPORARY backfill: re-translate model_name/trim from raw_data for all rows. Delete after use.
import { createClient } from "npm:@supabase/supabase-js@2";
import { translateListing } from "../_shared/encarMaps.ts";

Deno.serve(async (req) => {
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: cfg } = await sb.from("encar_sync_config").select("value").eq("key", "cron_secret").maybeSingle();
  if (!cfg || req.headers.get("x-cron-secret") !== cfg.value) return new Response("unauthorized", { status: 401 });
  const body = await req.json().catch(() => ({}));
  const after = String(body.after ?? "");
  const { data, error } = await sb.from("encar_listings")
    .select("id,encar_id,model_name,model_slug,trim,raw_data")
    .gt("encar_id", after).order("encar_id").limit(2000);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  let changed = 0;
  const updates: Promise<unknown>[] = [];
  for (const r of data ?? []) {
    // deno-lint-ignore no-explicit-any
    const raw = r.raw_data as any;
    const model = raw?.Model ?? raw?.model_name ?? r.model_name;
    const badge = [raw?.Badge, raw?.BadgeDetail].filter(Boolean).join(" ") || raw?.trim || r.trim;
    const t = translateListing({ model_name: model, model_slug: r.model_slug, trim: badge });
    const patch: Record<string, unknown> = {};
    if (t.model_name && t.model_name !== r.model_name) { patch.model_name = t.model_name; patch.model_slug = t.model_slug ?? r.model_slug; }
    if ((t.trim ?? null) !== (r.trim ?? null)) patch.trim = t.trim ?? null;
    if (Object.keys(patch).length) { changed++; updates.push(sb.from("encar_listings").update(patch).eq("id", r.id)); }
    if (updates.length >= 50) await Promise.all(updates.splice(0));
  }
  await Promise.all(updates);
  const last = data?.length ? data[data.length - 1].encar_id : null;
  return Response.json({ scanned: data?.length ?? 0, changed, next: data?.length === 2000 ? last : null });
});
