import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const SEA_SURCHARGE = 150;
const HIDDEN_MARGIN = 150;
// calibrated against Key4U's Rotterdam calculator
const DEFAULT_FX_RATE = 1544;
const DEFAULT_SHIPPING = 1720;
const EUR_CAD_CONVERSION_PCT = 2.0;

const bracketPct = (adjusted: number): number => {
  if (adjusted <= 15000000) return 3.0;
  if (adjusted <= 30000000) return 2.5;
  if (adjusted <= 45000000) return 2.0;
  if (adjusted <= 75000000) return 1.5;
  return 1.0;
};

const commissionForPrice = (krw: number): number => {
  if (krw <= 20000000) return 900;
  if (krw <= 35000000) return 1000;
  if (krw <= 50000000) return 1300;
  return 1500;
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

const calculateKoreaImportPrice = (priceKrw: number) => {
  const adjusted = priceKrw * 0.909;
  const bracketFee = (adjusted * bracketPct(adjusted)) / 100;
  const price = (adjusted + bracketFee + 440000 + 250000) / DEFAULT_FX_RATE;
  const transport = DEFAULT_SHIPPING + SEA_SURCHARGE + dutyVatFee(price);
  // 2% EUR->CAD only on (car price + sea transport to Rotterdam), not on duty/VAT.
  const conversionFee = ((price + DEFAULT_SHIPPING + SEA_SURCHARGE) * EUR_CAD_CONVERSION_PCT) / 100;
  const handling = HIDDEN_MARGIN + 900 + commissionForPrice(priceKrw);
  return price + conversionFee + transport + handling;
};

const firstKrwReaching = (eur: number): number => {
  if (calculateKoreaImportPrice(0) >= eur) return 0;
  const STEP = 5000;
  let k = 0;
  while (calculateKoreaImportPrice(k + STEP) < eur && k < 5_000_000_000) k += STEP;
  while (calculateKoreaImportPrice(k + 1) < eur) k += 1;
  return k + 1;
};

const numParam = (params: URLSearchParams, key: string): number | undefined => {
  const raw = params.get(key);
  if (!raw) return undefined;
  const trimmed = raw.replace(/\s/g, "");
  const decimal = trimmed.match(/^(\d+)[.,]\d{1,2}$/);
  const n = Number(decimal ? decimal[1] : trimmed.replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
};

const textParam = (params: URLSearchParams, key: string): string | undefined => {
  const raw = params.get(key)?.trim().slice(0, 60);
  return raw && raw !== "all" ? raw : undefined;
};

const listParam = (params: URLSearchParams, key: string): string[] | undefined => {
  const raw = params.get(key);
  if (!raw) return undefined;
  const items = raw
    .split(",")
    .map((s) => s.trim().toLowerCase().slice(0, 40))
    .filter((s) => s && s !== "all");
  return items.length ? [...new Set(items)] : undefined;
};

// Identical queries are cached in memory for 60s.
const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { at: number; payload: unknown }>();

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
    const incoming = new URL(req.url).searchParams;

    // Normalize: drop empty/irrelevant params so the cache key is stable.
    const cacheKey = [...incoming.entries()]
      .filter(([k, v]) => v && k !== "_")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("&");

    const hit = cache.get(cacheKey);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
      return json({ ...(hit.payload as Record<string, unknown>), cached: true });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const priceFrom = numParam(incoming, "price_from");
    const priceTo = numParam(incoming, "price_to");

    const args = {
      _brand: textParam(incoming, "brand") ?? null,
      _model: textParam(incoming, "model") ?? null,
      _year_from: numParam(incoming, "year_from") ?? null,
      _year_to: numParam(incoming, "year_to") ?? null,
      _price_min: priceFrom ? firstKrwReaching(priceFrom) : null,
      _price_max: priceTo ? firstKrwReaching(priceTo + 0.000001) - 1 : null,
      _mileage_min: numParam(incoming, "mileage_min") ?? null,
      _mileage_max: numParam(incoming, "mileage_max") ?? null,
      _fuels: listParam(incoming, "fuel_type") ?? null,
      _transmissions: listParam(incoming, "transmission") ?? null,
      _body_types: listParam(incoming, "body_type") ?? null,
      _regions: listParam(incoming, "region") ?? null,
      _no_accident: incoming.get("has_accident") === "false",
    };

    const started = Date.now();
    const { data, error } = await supabase.rpc("encar_facets", args);
    if (error) {
      console.error("encar_facets failed", error);
      return json({ unavailable: true, total: 0, brands: [], models: [], fuels: [], transmissions: [], body_types: [], regions: [] });
    }

    const payload = { ...(data as Record<string, unknown>), took_ms: Date.now() - started };
    cache.set(cacheKey, { at: Date.now(), payload });
    if (cache.size > 500) {
      // Simple eviction: drop expired entries first, then oldest.
      const now = Date.now();
      for (const [k, v] of cache) if (now - v.at >= CACHE_TTL_MS) cache.delete(k);
      while (cache.size > 500) {
        const oldest = cache.keys().next().value;
        if (oldest === undefined) break;
        cache.delete(oldest);
      }
    }

    return json(payload);
  } catch (err) {
    console.error("listings-facets failed", err);
    return json({ error: "Unexpected error" }, 500);
  }
});
