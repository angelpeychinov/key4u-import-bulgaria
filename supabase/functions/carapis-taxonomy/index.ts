const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const API_ROOT = "https://api.carapis.com/apix/catalog_api";
const SOURCE = "encar";

// Carapis taxonomy endpoints contain noisy junk entries; keep only plausible names.
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
const CLEAN_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+){0,2}$/;
const CLEAN_NAME = /^[A-Za-z0-9][A-Za-z0-9 .\-+&']*$/;

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

    const counts = incoming.get("counts");
    if (counts) {
      const slugs = counts.split(",");
      const out = await Promise.all(
        slugs.map(async (slug) => {
          const r = await fetch(
            `${API_ROOT}/vehicles/?source=${SOURCE}&brand=${encodeURIComponent(slug)}&page_size=1`,
            { headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" } },
          );
          const j = await r.json().catch(() => ({}));
          return `${slug}:${j?.count ?? "err"}`;
        }),
      );
      return new Response(JSON.stringify({ counts: out }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const probe = incoming.get("probe");
    if (probe) {
      const probeRes = await fetch(`${API_ROOT}/${probe}`, {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      });
      const text = await probeRes.text();
      return new Response(JSON.stringify({ status: probeRes.status, body: text.slice(0, 3000) }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const kind = incoming.get("kind") === "models" ? "models" : "brands";
    const brand = (incoming.get("brand") ?? "").trim();
    const authHeaders = { Authorization: `Bearer ${apiKey}`, Accept: "application/json" };

    const fetchList = async (query: string): Promise<Record<string, unknown>[]> => {
      const target = new URL(`${API_ROOT}/${kind}/`);
      target.searchParams.set("source", SOURCE);
      target.searchParams.set("page_size", "100");
      if (kind === "models") target.searchParams.set("brand", brand);
      if (query) target.searchParams.set("search", query);
      const res = await fetch(target.toString(), { headers: authHeaders });
      if (!res.ok) {
        console.error(`carapis ${kind} error ${res.status}: ${(await res.text()).slice(0, 200)}`);
        return [];
      }
      const json = await res.json().catch(() => null);
      if (Array.isArray(json)) return json;
      if (Array.isArray(json?.results)) return json.results;
      return [];
    };

    if (kind === "models" && !brand) {
      return new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // The upstream taxonomy endpoints cap responses at ~50 rows and contain noisy
    // junk rows, so we sweep the alphabet with `search` and clean the results.
    const queries = kind === "brands" ? ["", ...ALPHABET] : [""];
    const batches = await Promise.all(queries.map((q) => fetchList(q)));
    const collected = batches.flat();

    const seen = new Set<string>();
    const results = collected
      .filter((item) => {
        const name = String((item as Record<string, unknown>)?.name ?? "").trim();
        const slug = String((item as Record<string, unknown>)?.slug ?? "").trim();
        if (!name || !slug) return false;
        if (name.length > 20) return false;
        if (name.split(/\s+/).length > 3) return false;
        if (!CLEAN_NAME.test(name)) return false;
        if (!CLEAN_SLUG.test(slug)) return false;
        if (seen.has(slug)) return false;
        seen.add(slug);
        return true;
      })
      .map((item) => ({
        name: String((item as Record<string, unknown>).name),
        slug: String((item as Record<string, unknown>).slug),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "en"));

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
