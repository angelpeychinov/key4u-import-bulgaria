// TEMPORARY one-off backfill: re-translate model/trim from the original Korean in raw_data. Delete after use.
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
import { translateListing } from "../_shared/encarMaps.ts";

Deno.serve(async (req) => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: cfg } = await supabase.from("encar_sync_config").select("value").eq("key", "cron_secret").maybeSingle();
  if (!cfg?.value || req.headers.get("x-cron-secret") !== cfg.value) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const t0 = Date.now();
  let after = new URL(req.url).searchParams.get("after") ?? "";
  let updated = 0;
  const filter = "raw_data->>Model.match.[가-힣],raw_data->>Badge.match.[가-힣],raw_data->>BadgeDetail.match.[가-힣]";
  while (Date.now() - t0 < 90_000) {
    const { data, error } = await supabase.from("encar_listings")
      .select("encar_id,model_slug,m:raw_data->>Model,b:raw_data->>Badge,bd:raw_data->>BadgeDetail")
      .or(filter).gt("encar_id", after).order("encar_id").limit(2000);
    if (error) return Response.json({ error: error.message, updated, after }, { status: 500 });
    if (!data?.length) return Response.json({ done: true, updated });
    const rows = data.map((r: any) => {
      const trimRaw = [r.b, r.bd].filter(Boolean).join(" ");
      const t: any = translateListing({ model_name: r.m ?? undefined, model_slug: r.model_slug, trim: trimRaw || undefined });
      const o: any = { encar_id: r.encar_id, trim: t.trim ?? null };
      if (r.m) { o.model_name = t.model_name; o.model_slug = t.model_slug ?? r.model_slug; }
      return o;
    });
    // group by key set so bulk upserts are uniform
    for (const grp of [rows.filter((x) => "model_name" in x), rows.filter((x) => !("model_name" in x))]) {
      for (let i = 0; i < grp.length; i += 1000) {
        if (!grp.length) break;
        const { error: e } = await supabase.from("encar_listings").upsert(grp.slice(i, i + 1000), { onConflict: "encar_id" });
        if (e) return Response.json({ error: e.message, updated, after }, { status: 500 });
      }
    }
    updated += rows.length;
    after = data[data.length - 1].encar_id;
  }
  return Response.json({ done: false, updated, after });
});
