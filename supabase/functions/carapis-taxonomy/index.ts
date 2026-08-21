const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const API_ROOT = "https://api.carapis.com/apix/catalog_api";
const SOURCE = "encar";

// Carapis taxonomy endpoints contain noisy junk entries; keep only plausible names.
const CLEAN_NAME = /^[A-Za-z0-9\uAC00-\uD7A3][A-Za-z0-9\uAC00-\uD7A3 .\-+&/']*$/;

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
    if (incoming.get("nosource") !== "1") target.searchParams.set("source", SOURCE);
    const raw = incoming.get("raw") === "1";
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

    const collected: Record<string, unknown>[] = [];
    let meta: Record<string, unknown> = {};

    for (let p = 1; p <= 6; p++) {
      target.searchParams.set("page", String(p));
      const res = await fetch(target.toString(), {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`carapis ${kind} error ${res.status}: ${body.slice(0, 300)}`);
        if (p === 1) {
          return new Response(JSON.stringify({ results: [], unavailable: true }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        break;
      }
      const json = await res.json().catch(() => ({}));
      meta = { count: json?.count, pages: json?.pages, has_next: json?.has_next };
      const items = Array.isArray(json?.results) ? json.results : Array.isArray(json) ? json : [];
      collected.push(...items);
      if (json?.has_next !== true || items.length === 0) break;
    }

    const seen = new Set<string>();
    const results = collected
      .filter((item) => {
        if (raw) return true;
        const name = String((item as Record<string, unknown>)?.name ?? "").trim();
        const slug = String((item as Record<string, unknown>)?.slug ?? "").trim();
        if (!name || !slug) return false;
        if (name.length > 24) return false;
        if (!CLEAN_NAME.test(name)) return false;
        if (seen.has(slug)) return false;
        seen.add(slug);
        return true;
      })
      .sort((a, b) =>
        String((a as Record<string, unknown>).name).localeCompare(String((b as Record<string, unknown>).name), "en"),
      );

    return new Response(JSON.stringify({ results, meta }), {
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
