const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const API_BASE = "https://api.carapis.com/apix/catalog_api/vehicles/";
const SOURCE = "encar";

const SEA_SURCHARGE = 150;
const HIDDEN_MARGIN = 150;
const DEFAULT_FX_RATE = 1544; // KRW per EUR
const DEFAULT_SHIPPING = 1720; // EUR, Korea -> Rotterdam base rate

const bracketPct = (adjusted: number): number => {
  if (adjusted <= 15000000) return 3.0;
  if (adjusted <= 30000000) return 2.5;
  if (adjusted <= 45000000) return 2.0;
  if (adjusted <= 75000000) return 1.5;
  return 1.0;
};

const commissionForPrice = (krw: number): number => {
  if (krw <= 20000000) return 800;
  if (krw <= 35000000) return 1000;
  if (krw <= 50000000) return 1100;
  return 1150;
};

const dutyVatFee = (priceEur: number): number => {
  if (priceEur < 10000) return 1000;
  if (priceEur <= 15000) return 1300;
  if (priceEur <= 20000) return 1500;
  if (priceEur <= 25000) return 1800;
  if (priceEur <= 30000) return 2000;
  if (priceEur <= 35000) return 2200;
  return 2500;
};

const calculateKoreaImportPrice = (priceKrw: number, isOversize = false) => {
  const fxRate = DEFAULT_FX_RATE;
  const shipping = DEFAULT_SHIPPING;
  const adjusted = priceKrw * 0.909;
  const pct = bracketPct(adjusted);
  const bracketFee = (adjusted * pct) / 100;
  const flatFees = 440000 + 250000;
  const koreaTotalKrw = adjusted + bracketFee + flatFees;
  const price = koreaTotalKrw / fxRate;

  const carSizeSurcharge = isOversize ? 350 : 0;
  const domTransportCost = isOversize ? 1000 : 900;
  const commission = commissionForPrice(priceKrw);
  const dutyVat = dutyVatFee(price);

  const transport = shipping + carSizeSurcharge + SEA_SURCHARGE + dutyVat;
  const handling = HIDDEN_MARGIN + domTransportCost + commission;
  const total = price + transport + handling;

  return { price, transport, handling, total };
};

const isOversizeVehicle = (v: Record<string, unknown>): boolean => {
  const body = String(v?.body_type ?? "").toLowerCase();
  const cc = Number(v?.engine_cc ?? v?.engine_volume ?? 0);
  if (["pickup", "truck", "van", "minivan"].some((b) => body.includes(b))) return true;
  if (body.includes("suv") && Number.isFinite(cc) && cc > 2000) return true;
  return false;
};

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

    const authHeaders = { Authorization: `Bearer ${apiKey}`, Accept: "application/json" };
    const incoming = new URL(req.url).searchParams;
    const target = new URL(API_BASE);
    target.searchParams.set("source", SOURCE);

    for (const key of ["brand", "model", "fuel_type", "transmission", "body_type"]) {
      const value = textParam(incoming, key);
      if (value) target.searchParams.set(key, value);
    }

    if (incoming.get("has_accident") === "false") {
      target.searchParams.set("has_accident", "false");
    }

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

    const pageSize = Math.min(numParam(incoming, "limit") ?? 24, 24);
    const page = numParam(incoming, "page") ?? 1;
    target.searchParams.set("page_size", String(pageSize));
    target.searchParams.set("page", String(page));

    console.log(`carapis request: ${target.search}`);
    const res = await fetch(target.toString(), { headers: authHeaders });

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
    const results: Record<string, unknown>[] = Array.isArray(json?.results)
      ? json.results
      : Array.isArray(json)
        ? json
        : [];

    const enriched = await Promise.all(
      results.map(async (item) => {
        const id = item?.id;
        if (!id) return item;
        try {
          const detailRes = await fetch(`${API_BASE}${id}/`, { headers: authHeaders });
          if (!detailRes.ok) return item;
          const detail = await detailRes.json().catch(() => ({}));
          const merged = { ...item, ...detail } as Record<string, unknown>;
          const krw = Number(String(merged?.price_original ?? "").replace(/[^\d.]/g, ""));
          if (!Number.isFinite(krw) || krw <= 0) return merged;
          const breakdown = calculateKoreaImportPrice(krw, isOversizeVehicle(merged));
          return { ...merged, import_price: breakdown };
        } catch (e) {
          console.error("detail fetch failed", e);
          return item;
        }
      }),
    );

    return new Response(
      JSON.stringify({
        count: Number(json?.count) || enriched.length,
        page: Number(json?.page) || page,
        pages: Number(json?.pages) || 0,
        page_size: Number(json?.page_size) || pageSize,
        has_next: json?.has_next === true,
        results: enriched,
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
