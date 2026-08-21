const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const API_ROOT = "https://api.carapis.com/apix/catalog_api";
const SOURCE = "encar";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("CARAPIS_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ results: [], unavailable: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const incoming = new URL(req.url).searchParams;
    const kind = incoming.get("kind") === "models" ? "models" : "brands";
    const brand = (incoming.get("brand") ?? "").trim();

    const target = new URL(`${API_ROOT}/${kind}/`);
    target.searchParams.set("source", SOURCE);
    target.searchParams.set("page_size", "500");
    if (kind === "models") {
      if (!brand) {
        return new Response(JSON.stringify({ results: [] }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      target.searchParams.set("brand", brand);
    }

    const res = await fetch(target.toString(), {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`carapis ${kind} error ${res.status}: ${body.slice(0, 300)}`);
      return new Response(JSON.stringify({ results: [], unavailable: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await res.json().catch(() => ({}));
    const results = Array.isArray(json?.results) ? json.results : Array.isArray(json) ? json : [];

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("carapis-taxonomy failed", err);
    return new Response(JSON.stringify({ results: [], unavailable: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
