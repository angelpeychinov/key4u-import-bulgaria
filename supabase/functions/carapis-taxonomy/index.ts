const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const API_ROOT = "https://api.carapis.com/apix/catalog_api";
const SOURCE = "encar";


// Upstream taxonomy data is noisy (test rows with junk names) — keep plausible entries only.
const CLEAN_NAME = /^[A-Za-z0-9][A-Za-z0-9 .\-+&']*$/;
const CLEAN_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+){0,3}$/;

// Cached per isolate: the upstream API is aggressively rate limited.
const modelCache = new Map<string, { name: string; slug: string }[]>();

const clean = (items: unknown[]): { name: string; slug: string }[] => {
  const seen = new Set<string>();
  return items
    .map((item) => {
      const o = (item ?? {}) as Record<string, unknown>;
      return { name: String(o.name ?? "").trim(), slug: String(o.slug ?? "").trim() };
    })
    .filter(({ name, slug }) => {
      if (!name || !slug) return false;
      if (name.length > 24) return false;
      if (name.split(/\s+/).length > 3) return false;
      if (!CLEAN_NAME.test(name)) return false;
      if (!CLEAN_SLUG.test(slug)) return false;
      if (seen.has(slug)) return false;
      seen.add(slug);
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (payload: unknown) =>
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const apiKey = Deno.env.get("CARAPIS_API_KEY");
    if (!apiKey) return json({ results: [], unavailable: true });

    const incoming = new URL(req.url).searchParams;
    if (incoming.get("kind") !== "models") {
      // Brands are served from a static list: the upstream /brands/ endpoint is both
      // rate limited and polluted with junk rows.
      return json({ results: [] });
    }

    const brand = (incoming.get("brand") ?? "").trim().toLowerCase();
    if (!brand) return json({ results: [] });

    const cached = modelCache.get(brand);
    if (cached) return json({ results: cached });

    // Models are derived from real Encar vehicle rows: /models/ isn't scoped to a source
    // and lists models never offered on Encar.
    const PAGE_SIZE = 100;
    const MAX_VEHICLES = 500;
    const collected: unknown[] = [];

    for (let page = 1; page <= MAX_VEHICLES / PAGE_SIZE; page++) {
      const target = new URL(`${API_ROOT}/vehicles/`);
      target.searchParams.set("source", SOURCE);
      target.searchParams.set("brand", brand);
      target.searchParams.set("page_size", String(PAGE_SIZE));
      target.searchParams.set("page", String(page));

      const res = await fetch(target.toString(), {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      });

      if (!res.ok) {
        console.error(`carapis vehicles error ${res.status}: ${(await res.text()).slice(0, 200)}`);
        if (page === 1) return json({ results: [], unavailable: true });
        break;
      }

      const body = await res.json().catch(() => null);
      const items = Array.isArray(body?.results) ? body.results : [];
      collected.push(
        ...items.map((v: Record<string, unknown>) => ({ name: v.model_name, slug: v.model_slug })),
      );
      if (body?.has_next !== true || items.length === 0) break;
    }

    const results = clean(collected);
    modelCache.set(brand, results);

    return json({ results });
  } catch (err) {
    console.error("carapis-taxonomy failed", err);
    return json({ results: [], unavailable: true });
  }
});
