const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const API_URL = "https://api.carapis.com/apix/catalog_api/vehicles/";
const ALLOWED_SOURCES = ["encar", "auto1", "openlane"];

const numParam = (params: URLSearchParams, key: string): number | undefined => {
  const raw = params.get(key);
  if (!raw) return undefined;
  const n = Number(raw.replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
};

const textParam = (params: URLSearchParams, key: string): string | undefined => {
  const raw = params.get(key)?.trim().slice(0, 60);
  return raw ? raw : undefined;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("CARAPIS_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Search is temporarily unavailable" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const incoming = new URL(req.url).searchParams;

    const target = new URL(API_URL);

    const requestedSource = incoming.get("source")?.toLowerCase();
    if (requestedSource && ALLOWED_SOURCES.includes(requestedSource)) {
      target.searchParams.set("source", requestedSource);
    }

    const brand = textParam(incoming, "brand");
    const model = textParam(incoming, "model");
    if (brand) target.searchParams.set("brand", brand);
    if (model) target.searchParams.set("model", model);

    const numMap: Record<string, string> = {
      year_from: "min_year",
      year_to: "max_year",
      price_from: "min_price",
      price_to: "max_price",
      mileage_max: "max_mileage",
    };
    for (const [from, to] of Object.entries(numMap)) {
      const value = numParam(incoming, from);
      if (value !== undefined) target.searchParams.set(to, String(value));
    }

    const pageSize = Math.min(numParam(incoming, "limit") ?? 24, 50);
    const page = numParam(incoming, "page") ?? 1;
    target.searchParams.set("page_size", String(pageSize));
    target.searchParams.set("page", String(page));

    const res = await fetch(target.toString(), {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Carapis error ${res.status}: ${body.slice(0, 300)}`);
      return new Response(
        JSON.stringify({
          results: [],
          count: 0,
          page,
          pages: 0,
          page_size: pageSize,
          has_next: false,
          unavailable: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const json = await res.json().catch(() => ({}));
    let results = Array.isArray(json?.results) ? json.results : Array.isArray(json) ? json : [];

    if (requestedSource === "openlane" || requestedSource === "all") {
      results = results.filter((item: Record<string, unknown>) => {
        const sourceCode = String(item?.source_code ?? "").toLowerCase();
        if (sourceCode !== "openlane") return true;

        const loc = item?.source_location as Record<string, unknown> | undefined;
        if (!loc || typeof loc !== "object") return false;

        const iso2 = String(loc?.iso2 ?? "").toUpperCase();
        const countryName = String(loc?.country_name ?? "").toLowerCase();
        return iso2 === "CA" || countryName.includes("canada");
      });
    }

    return new Response(
      JSON.stringify({
        count: results.length,
        page: Number(json?.page) || page,
        pages: Number(json?.pages) || 0,
        page_size: Number(json?.page_size) || pageSize,
        has_next: json?.has_next === true,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("carapis-search failed", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
