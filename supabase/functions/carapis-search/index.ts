const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const API_URL = "https://api.carapis.com/v2/listings";
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

    const requestedSource = incoming.get("source")?.toLowerCase();
    const sources =
      requestedSource && ALLOWED_SOURCES.includes(requestedSource) ? [requestedSource] : ALLOWED_SOURCES;

    const limit = Math.min(numParam(incoming, "limit") ?? 24, 50);
    const page = numParam(incoming, "page") ?? 1;
    const mileageMax = numParam(incoming, "mileage_max");

    const shared = new URLSearchParams();
    const make = textParam(incoming, "brand");
    const model = textParam(incoming, "model");
    if (make) shared.set("make", make);
    if (model) shared.set("model", model);
    const map: Record<string, string> = {
      year_from: "year_min",
      year_to: "year_max",
      price_from: "price_min",
      price_to: "price_max",
    };
    for (const [from, to] of Object.entries(map)) {
      const value = numParam(incoming, from);
      if (value !== undefined) shared.set(to, String(value));
    }

    const perSource = sources.length > 1 ? Math.max(Math.ceil(limit / sources.length), 4) : limit;

    const responses = await Promise.all(
      sources.map(async (source) => {
        const target = new URL(API_URL);
        shared.forEach((value, key) => target.searchParams.set(key, value));
        target.searchParams.set("source", source);
        target.searchParams.set("limit", String(perSource));
        target.searchParams.set("page", String(page));

        const res = await fetch(target.toString(), {
          headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
        });

        if (!res.ok) {
          const body = await res.text();
          console.error(`Carapis ${source} error ${res.status}: ${body.slice(0, 300)}`);
          return { source, status: res.status, results: [] as unknown[], count: 0 };
        }

        const json = await res.json().catch(() => ({}));
        const results = Array.isArray(json?.results) ? json.results : Array.isArray(json) ? json : [];
        return { source, status: 200, results, count: Number(json?.count) || results.length };
      }),
    );

    const ok = responses.filter((r) => r.status === 200);
    if (ok.length === 0) {
      return new Response(JSON.stringify({ error: "Could not load listings", results: [], count: 0 }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let results = responses.flatMap((r) =>
      (r.results as Record<string, unknown>[]).map((item) => ({ source: r.source, ...item })),
    );

    if (mileageMax !== undefined) {
      results = results.filter((item) => {
        const m = Number((item as Record<string, unknown>).mileage);
        return !Number.isFinite(m) || m <= mileageMax;
      });
    }

    return new Response(
      JSON.stringify({
        count: ok.reduce((sum, r) => sum + r.count, 0),
        page,
        limit,
        results: results.slice(0, limit),
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
