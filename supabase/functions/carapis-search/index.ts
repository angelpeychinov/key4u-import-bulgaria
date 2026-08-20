const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const ALLOWED_PARAMS = [
  "source",
  "brand",
  "model",
  "year_from",
  "year_to",
  "price_from",
  "price_to",
  "mileage_max",
  "limit",
  "page",
] as const;

const ALLOWED_SOURCES = ["encar", "auto1", "openlane"];

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
    const target = new URL("https://api.carapis.com/v2/listings");

    for (const key of ALLOWED_PARAMS) {
      const raw = incoming.get(key);
      if (raw === null) continue;
      const value = raw.trim().slice(0, 60);
      if (!value) continue;

      if (key === "source") {
        if (!ALLOWED_SOURCES.includes(value.toLowerCase())) continue;
        target.searchParams.set(key, value.toLowerCase());
        continue;
      }

      if (["year_from", "year_to", "price_from", "price_to", "mileage_max", "limit", "page"].includes(key)) {
        const num = Number(value);
        if (!Number.isFinite(num) || num < 0) continue;
        target.searchParams.set(key, String(Math.floor(num)));
        continue;
      }

      target.searchParams.set(key, value);
    }

    if (!target.searchParams.has("limit")) target.searchParams.set("limit", "24");

    const upstream = await fetch(target.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      console.error("Carapis upstream error", upstream.status, text.slice(0, 500));
      return new Response(JSON.stringify({ error: "Could not load listings" }), {
        status: upstream.status >= 500 ? 502 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(text, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("carapis-search failed", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
