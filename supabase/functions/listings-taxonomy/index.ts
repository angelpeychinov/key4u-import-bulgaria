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

    let result;
    if (isBrands) {
      result = await supabase.rpc("encar_brands");
    } else {
      const brand = incoming.get("brand")?.trim();
      if (!brand) return json({ results: [] });
      result = await supabase.rpc("encar_models", { _brand: brand });
    }

    const { data, error } = result;
    if (error) {
      console.error("taxonomy query failed", error);
      return json({ results: [], unavailable: true });
    }

    const items = dedupe((data ?? []) as { name: unknown; slug: unknown }[]);

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
