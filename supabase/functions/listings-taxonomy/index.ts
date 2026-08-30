import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

// Pinned brands (in this order) shown before the alphabetical list, matched by slug.
const PINNED_BRAND_SLUGS = [
  "mercedes-benz",
  "bmw",
  "audi",
  "volvo",
  "volkswagen",
  "toyota",
  "hyundai",
  "kia",
  "mazda",
  "porsche",
  "lexus",
];

const PAGE = 1000;

type Item = { name: string; slug: string };

const dedupe = (rows: { name: unknown; slug: unknown }[]): Item[] => {
  const seen = new Map<string, Item>();
  for (const row of rows) {
    const name = String(row.name ?? "").trim();
    const slug = String(row.slug ?? "").trim();
    if (!name || !slug || seen.has(slug)) continue;
    seen.set(slug, { name, slug });
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name, "en"));
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const incoming = new URL(req.url).searchParams;
    const kind = incoming.get("kind");
    const isBrands = kind === "brands";
    if (!isBrands && kind !== "models") return json({ results: [] });

    const columns = isBrands ? "brand_name, brand_slug" : "model_name, model_slug";
    let query = supabase
      .from("encar_listings")
      .select(columns)
      .eq("status", "active")
      .limit(PAGE);

    if (!isBrands) {
      const brand = incoming.get("brand")?.trim();
      if (!brand) return json({ results: [] });
      query = query.eq("brand_slug", brand);
    }

    const { data, error } = await query;
    if (error) {
      console.error("taxonomy query failed", error);
      return json({ results: [], unavailable: true });
    }

    const rows = (data ?? []) as unknown as Record<string, unknown>[];
    const items = dedupe(
      rows.map((r) => ({
        name: isBrands ? r.brand_name : r.model_name,
        slug: isBrands ? r.brand_slug : r.model_slug,
      })),
    );

    if (!isBrands) return json({ results: items });

    const pinned = PINNED_BRAND_SLUGS.map((slug) =>
      items.find((b) => b.slug.toLowerCase() === slug),
    ).filter(Boolean) as Item[];
    const pinnedSlugs = new Set(pinned.map((b) => b.slug.toLowerCase()));
    const rest = items.filter((b) => !pinnedSlugs.has(b.slug.toLowerCase()));

    return json({ results: [...pinned, ...rest], pinned_count: pinned.length });
  } catch (err) {
    console.error("listings-taxonomy failed", err);
    return json({ error: "Unexpected error" }, 500);
  }
});
