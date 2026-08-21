import { supabase } from "@/integrations/supabase/client";

export interface ImportPrice {
  price: number;
  transport: number;
  handling: number;
  total: number;
}

export interface Listing {
  id: string;
  title: string;
  brand?: string;
  model?: string;
  trim?: string;
  year?: number;
  price?: number;
  currency?: string;
  mileage?: number;
  location?: string;
  source?: string;
  thumb?: string;
  photos: string[];
  url?: string;
  specs: Record<string, string>;
  importPrice?: ImportPrice;
}

export interface SearchFilters {
  brand?: string;
  model?: string;
  year_from?: string;
  year_to?: string;
  price_from?: string;
  price_to?: string;
  mileage_max?: string;
}

export interface SearchResult {
  listings: Listing[];
  count?: number;
  page: number;
  pages?: number;
  hasNext: boolean;
  unavailable?: boolean;
}

const toNumber = (v: unknown): number | undefined => {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "string" ? Number(v.replace(/[^\d.]/g, "")) : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const MEDIA_BASE = "https://api.carapis.com";

const absolute = (url: string): string => (url.startsWith("http") ? url : `${MEDIA_BASE}${url}`);

const toUrl = (v: unknown): string | undefined => {
  if (typeof v === "string" && v) return absolute(v);
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    for (const key of ["url", "original_url", "thumb_url"]) {
      const url = o[key];
      if (typeof url === "string" && url) return absolute(url);
    }
  }
  return undefined;
};

const SPEC_KEYS: [string, string][] = [
  ["fuel_type", "гориво"],
  ["transmission", "скоростна кутия"],
  ["body_type", "тип каросерия"],
  ["color", "цвят"],
  ["trim", "ниво на оборудване"],
  ["region", "регион"],
];

export const normalizeListing = (raw: Record<string, unknown>, index: number): Listing => {
  const brand = (raw.brand_name as string | undefined) ?? undefined;
  const model = (raw.model_name as string | undefined) ?? undefined;
  const trim = (raw.trim as string | undefined) ?? undefined;
  const year = toNumber(raw.year);

  const title = [year, brand, model, trim].filter(Boolean).join(" ") || "Listing";

  const specs: Record<string, string> = {};
  for (const [key, label] of SPEC_KEYS) {
    const v = raw[key];
    if (v !== undefined && v !== null && v !== "" && typeof v !== "object") {
      specs[label] = String(v);
    }
  }
  if (typeof raw.has_accident === "boolean") {
    specs["щети"] = raw.has_accident ? "да" : "не";
  }

  const thumb = toUrl(raw.thumb);
  const photos = Array.isArray(raw.photos)
    ? (raw.photos.map(toUrl).filter((u): u is string => !!u) as string[])
    : [];

  const ip = raw.import_price as Record<string, unknown> | undefined;
  const importPrice =
    ip && typeof ip === "object"
      ? {
          price: toNumber(ip.price) ?? 0,
          transport: toNumber(ip.transport) ?? 0,
          handling: toNumber(ip.handling) ?? 0,
          total: toNumber(ip.total) ?? 0,
        }
      : undefined;

  return {
    id: String(raw.id ?? `listing-${index}`),
    title,
    brand,
    model,
    trim,
    year,
    price: toNumber(raw.price_usd),
    currency: "USD",
    mileage: toNumber(raw.mileage),
    location: (raw.region as string | undefined) ?? undefined,
    source: (raw.source_code as string | undefined)?.toLowerCase(),
    thumb,
    photos: photos.length ? photos : thumb ? [thumb] : [],
    url: (raw.listing_url as string | undefined) ?? undefined,
    specs,
    importPrice,
  };
};

export const searchListings = async (
  filters: SearchFilters,
  page: number,
  limit = 24,
): Promise<SearchResult> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "all") params.set(key, value);
  });
  params.set("page", String(page));
  params.set("limit", String(limit));

  const { data, error } = await supabase.functions.invoke(`carapis-search?${params.toString()}`, {
    method: "GET",
  });

  if (error) throw error;
  const obj = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  if ("error" in obj) throw new Error(String(obj.error));

  const items = Array.isArray(obj.results) ? (obj.results as Record<string, unknown>[]) : [];

  return {
    listings: items.map(normalizeListing),
    count: toNumber(obj.count),
    page: toNumber(obj.page) ?? page,
    pages: toNumber(obj.pages),
    hasNext: obj.has_next === true,
    unavailable: obj.unavailable === true,
  };
};

export const SOURCE_LABELS: Record<string, string> = {
  encar: "Encar",
};

export const formatEur = (value?: number) =>
  value === undefined
    ? "—"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);

export const formatApproxEur = (value?: number) => (value === undefined ? "—" : `~${formatEur(value)}`);

export const formatMileage = (mileage?: number) =>
  mileage === undefined ? "—" : `${new Intl.NumberFormat("en-US").format(mileage)} km`;
