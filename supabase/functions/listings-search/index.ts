import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SEA_SURCHARGE = 150;
const HIDDEN_MARGIN = 150;
// Live rates come from the pricing_config table (cached 5 min); these are
// fallbacks if the table is unreachable. fx = eur_to_cad * cad_to_krw already
// includes the exchange loss, so there is NO separate EUR->CAD conversion fee.
// calibrated against Key4U's Rotterdam calculator
const FALLBACK_FX = 1.5557 * 921.72; // KRW per EUR
const FALLBACK_SEA_BASE = 1917; // EUR, Korea -> Rotterdam base rate
const CONFIG_TTL_MS = 5 * 60 * 1000;

interface PricingConfig {
  fx: number;
  seaBase: number;
}

const FALLBACK_CFG: PricingConfig = { fx: FALLBACK_FX, seaBase: FALLBACK_SEA_BASE };
let pricingCache: { cfg: PricingConfig; at: number } | null = null;

const loadPricingConfig = async (
  supabase: ReturnType<typeof createClient>,
): Promise<PricingConfig> => {
  if (pricingCache && Date.now() - pricingCache.at < CONFIG_TTL_MS) return pricingCache.cfg;
  const cfg: PricingConfig = { ...FALLBACK_CFG };
  try {
    const { data } = await supabase.from("pricing_config").select("key,value");
    const map = new Map((data ?? []).map((r: { key: string; value: number }) => [r.key, Number(r.value)]));
    const eurToCad = map.get("eur_to_cad");
    const cadToKrw = map.get("cad_to_krw");
    const seaBase = map.get("sea_base_eur");
    if (eurToCad && cadToKrw) cfg.fx = eurToCad * cadToKrw;
    if (seaBase) cfg.seaBase = seaBase;
  } catch (e) {
    console.error("pricing_config load failed, using fallbacks", e);
  }
  pricingCache = { cfg, at: Date.now() };
  return cfg;
};

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

const calculateKoreaImportPrice = (priceKrw: number, isOversize = false) => {
  const adjusted = priceKrw * 0.909;
  const bracketFee = (adjusted * bracketPct(adjusted)) / 100;
  const flatFees = 440000 + 250000;
  const price = (adjusted + bracketFee + flatFees) / DEFAULT_FX_RATE;

  const carSizeSurcharge = isOversize ? 350 : 0;
  const domTransportCost = isOversize ? 1150 : 900;
  const transport = DEFAULT_SHIPPING + carSizeSurcharge + SEA_SURCHARGE + dutyVatFee(price);

  // Превалутиране EUR -> CAD: 2% само от (цена на колата + морски транспорт до Ротердам),
  // без митото/ДДС. Влиза в "Цена на автомобил", без отделен ред за клиента.
  const conversionFee =
    ((price + DEFAULT_SHIPPING + carSizeSurcharge + SEA_SURCHARGE) * EUR_CAD_CONVERSION_PCT) / 100;
  const priceWithConversion = price + conversionFee;

  const handling = HIDDEN_MARGIN + domTransportCost + commissionForPrice(priceKrw);

  return {
    price: priceWithConversion,
    transport,
    handling,
    total: priceWithConversion + transport + handling,
  };
};

// Smallest KRW price whose (non-oversize) final total reaches `eur`.
// The total has tiny dips at fee-bracket edges, so we scan upward instead of
// binary searching: everything below the result is guaranteed to cost < eur.
const firstKrwReaching = (eur: number): number => {
  const total = (k: number) => calculateKoreaImportPrice(k).total;
  if (total(0) >= eur) return 0;
  const STEP = 5000;
  let k = 0;
  while (total(k + STEP) < eur && k < 5_000_000_000) k += STEP;
  // refine inside (k, k+STEP]
  while (total(k + 1) < eur) k += 1;
  return k + 1;
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
  const trimmed = raw.replace(/\s/g, "");
  // "2020.5" / "30000,50" -> integer part; "30.000" / "50 000" -> thousand separators stripped.
  const decimal = trimmed.match(/^(\d+)[.,]\d{1,2}$/);
  const n = Number(decimal ? decimal[1] : trimmed.replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
};

const textParam = (params: URLSearchParams, key: string): string | undefined => {
  const raw = params.get(key)?.trim().slice(0, 60);
  return raw && raw !== "all" ? raw : undefined;
};

// Comma-separated multi-select param, e.g. fuel_type=gasoline,diesel
const listParam = (params: URLSearchParams, key: string): string[] | undefined => {
  const raw = params.get(key);
  if (!raw) return undefined;
  const items = raw
    .split(",")
    .map((s) => s.trim().toLowerCase().slice(0, 40))
    .filter((s) => s && s !== "all");
  return items.length ? [...new Set(items)] : undefined;
};

type SortKey = "newest" | "price_asc" | "price_desc" | "mileage_asc" | "year_desc" | "year_asc";

const SORTS: Record<SortKey, { column: string; ascending: boolean }> = {
  newest: { column: "last_seen_at", ascending: false },
  price_asc: { column: "price_original", ascending: true },
  price_desc: { column: "price_original", ascending: false },
  mileage_asc: { column: "mileage", ascending: true },
  year_desc: { column: "year", ascending: false },
  year_asc: { column: "year", ascending: true },
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
    const pageSize = Math.min(numParam(incoming, "limit") ?? 20, 48);
    const page = numParam(incoming, "page") ?? 1;
    const from = (page - 1) * pageSize;

    // Narrow searches (model, or 3+ filters) get exact counts; broad ones use the planner estimate for speed.
    const filterKeys = ["brand", "model", "fuel_type", "transmission", "body_type", "region", "has_accident", "year_from", "year_to", "mileage_min", "mileage_max", "price_from", "price_to", "ids"]
      .filter((k) => incoming.get(k));
    const narrow = !!incoming.get("model") || !!incoming.get("ids") || filterKeys.length >= 3;
    const COLS = "id,encar_id,brand_name,brand_slug,model_name,model_slug,trim,year,price_original,mileage,fuel_type,transmission,body_type,color,region,has_accident,engine_cc,thumb,photos,listing_url,source_code,status,first_seen_at,last_seen_at,price_changed_at,previous_price_krw";

    let query = supabase
      .from("encar_listings")
      .select(COLS, { count: narrow ? "exact" : "estimated" })
      .eq("status", "active");

    // Saved cars: explicit list of encar ids.
    const idsRaw = incoming.get("ids");
    if (idsRaw) {
      const ids = idsRaw.split(",").map((s) => s.trim()).filter((s) => /^\d{1,20}$/.test(s)).slice(0, 200);
      if (ids.length === 0) {
        return json({ results: [], count: 0, page, pages: 0, page_size: pageSize, has_next: false });
      }
      query = query.in("encar_id", ids);
    }

    const brand = textParam(incoming, "brand");
    if (brand) query = query.eq("brand_slug", brand);
    const model = textParam(incoming, "model");
    if (model) query = query.eq("model_slug", model);

    const fuels = listParam(incoming, "fuel_type");
    if (fuels) query = query.in("fuel_type", fuels);

    const transmissions = listParam(incoming, "transmission");
    if (transmissions) {
      // The Encar list API omits transmission; unknown rows are treated as automatic (~99% of Korean used cars).
      if (transmissions.includes("auto")) {
        const others = transmissions.filter((t) => t !== "auto");
        query = query.or(
          `transmission.is.null,transmission.in.(${["auto", ...others].join(",")})`,
        );
      } else {
        query = query.in("transmission", transmissions);
      }
    }

    const bodyTypes = listParam(incoming, "body_type");
    if (bodyTypes) query = query.in("body_type", bodyTypes);

    const regions = listParam(incoming, "region");
    if (regions) query = query.in("region", regions);

    if (incoming.get("has_accident") === "false") query = query.eq("has_accident", false);

    const yearFrom = numParam(incoming, "year_from");
    if (yearFrom) query = query.gte("year", yearFrom);
    const yearTo = numParam(incoming, "year_to");
    if (yearTo) query = query.lte("year", yearTo);

    const mileageMin = numParam(incoming, "mileage_min");
    if (mileageMin) query = query.gte("mileage", mileageMin);
    const mileageMax = numParam(incoming, "mileage_max");
    if (mileageMax) query = query.lte("mileage", mileageMax);

    // Price filters arrive in EUR as the final price to Bulgaria; translate to KRW bounds.
    const priceFrom = numParam(incoming, "price_from");
    if (priceFrom) query = query.gte("price_original", firstKrwReaching(priceFrom));
    const priceTo = numParam(incoming, "price_to");
    if (priceTo) query = query.lte("price_original", firstKrwReaching(priceTo + 0.000001) - 1);

    const sortParam = (incoming.get("sort") ?? "newest") as SortKey;
    const sort = SORTS[sortParam] ?? SORTS.newest;

    const { data, error, count } = await query
      // No nullsFirst override: DESC NULLS LAST can't use our plain DESC indexes
      // and forces a full sort of 180k+ rows (statement timeout). NULLS FIRST
      // matches the indexes; last_seen_at is always set on active rows anyway.
      .order(sort.column, { ascending: sort.ascending })
      .order("encar_id", { ascending: false })
      .range(from, from + pageSize); // one extra row tells us if there is a next page

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

    const hasMore = (data?.length ?? 0) > pageSize;
    const results = (data ?? []).slice(0, pageSize).map((row: any) => {
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

    let total = count ?? from + results.length + (hasMore ? 1 : 0);
    if (!hasMore) total = from + results.length; // last page: exact
    else total = Math.max(total, from + results.length + 1);
    const pages = pageSize > 0 ? Math.max(page + (hasMore ? 1 : 0), Math.ceil(total / pageSize)) : 0;

    return json({
      count: total,
      page,
      pages,
      page_size: pageSize,
      has_next: hasMore,
      results,
    });
  } catch (err) {
    console.error("listings-search failed", err);
    return json({ error: "Unexpected error" }, 500);
  }
});
