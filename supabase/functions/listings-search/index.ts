import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

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
  const adjusted = priceKrw * 0.909;
  const bracketFee = (adjusted * bracketPct(adjusted)) / 100;
  const flatFees = 440000 + 250000;
  const price = (adjusted + bracketFee + flatFees) / DEFAULT_FX_RATE;

  const carSizeSurcharge = isOversize ? 350 : 0;
  const domTransportCost = isOversize ? 1000 : 900;
  const transport = DEFAULT_SHIPPING + carSizeSurcharge + SEA_SURCHARGE + dutyVatFee(price);
  const handling = HIDDEN_MARGIN + domTransportCost + commissionForPrice(priceKrw);

  return { price, transport, handling, total: price + transport + handling };
};

const isOversizeVehicle = (v: Record<string, unknown>): boolean => {
  const body = String(v?.body_type ?? "").toLowerCase();
  const cc = Number(v?.engine_cc ?? 0);
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
  return raw && raw !== "all" ? raw : undefined;
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
    const pageSize = Math.min(numParam(incoming, "limit") ?? 24, 48);
    const page = numParam(incoming, "page") ?? 1;
    const from = (page - 1) * pageSize;

    let query = supabase
      .from("encar_listings")
      .select("*", { count: "exact" })
      .eq("status", "active");

    const brand = textParam(incoming, "brand");
    if (brand) query = query.eq("brand_slug", brand);
    const model = textParam(incoming, "model");
    if (model) query = query.eq("model_slug", model);

    for (const key of ["fuel_type", "transmission", "body_type"] as const) {
      const value = textParam(incoming, key);
      if (value) query = query.ilike(key, value);
    }

    if (incoming.get("has_accident") === "false") query = query.eq("has_accident", false);

    const yearFrom = numParam(incoming, "year_from");
    if (yearFrom) query = query.gte("year", yearFrom);
    const yearTo = numParam(incoming, "year_to");
    if (yearTo) query = query.lte("year", yearTo);

    const mileageMax = numParam(incoming, "mileage_max");
    if (mileageMax) query = query.lte("mileage", mileageMax);

    // Price filters arrive in EUR; the catalog stores the original KRW price.
    const priceFrom = numParam(incoming, "price_from");
    if (priceFrom) query = query.gte("price_original", Math.round(priceFrom * DEFAULT_FX_RATE));
    const priceTo = numParam(incoming, "price_to");
    if (priceTo) query = query.lte("price_original", Math.round(priceTo * DEFAULT_FX_RATE));

    const { data, error, count } = await query
      .order("last_seen_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error("encar_listings query failed", error);
      return json({
        results: [],
        count: 0,
        page,
        pages: 0,
        page_size: pageSize,
        has_next: false,
        unavailable: true,
      });
    }

    const results = (data ?? []).map((row) => {
      const krw = Number(row.price_original ?? 0);
      const importPrice =
        Number.isFinite(krw) && krw > 0
          ? calculateKoreaImportPrice(krw, isOversizeVehicle(row))
          : undefined;
      return {
        ...row,
        price_eur: importPrice?.total,
        import_price: importPrice,
      };
    });

    const total = count ?? results.length;
    const pages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;

    return json({
      count: total,
      page,
      pages,
      page_size: pageSize,
      has_next: page < pages,
      results,
    });
  } catch (err) {
    console.error("listings-search failed", err);
    return json({ error: "Unexpected error" }, 500);
  }
});
