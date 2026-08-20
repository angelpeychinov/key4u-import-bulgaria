import { supabase } from "@/integrations/supabase/client";

export type CarSource = "encar" | "auto1" | "openlane";

export interface Listing {
  id: string;
  title: string;
  brand?: string;
  model?: string;
  year?: number;
  price?: number;
  currency?: string;
  mileage?: number;
  location?: string;
  source?: string;
  photos: string[];
  url?: string;
  specs: Record<string, string>;
}

export interface SearchFilters {
  source?: string;
  brand?: string;
  model?: string;
  year_from?: string;
  year_to?: string;
  price_from?: string;
  price_to?: string;
  mileage_max?: string;
}

const pick = (obj: Record<string, unknown>, keys: string[]): unknown => {
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
};

const toNumber = (v: unknown): number | undefined => {
  const n = typeof v === "string" ? Number(v.replace(/[^\d.]/g, "")) : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const collectPhotos = (raw: Record<string, unknown>): string[] => {
  const candidates = [
    raw.photos,
    raw.images,
    raw.image_urls,
    raw.pictures,
    (raw.media as Record<string, unknown> | undefined)?.photos,
  ];
  for (const c of candidates) {
    if (Array.isArray(c) && c.length) {
      return c
        .map((item) =>
          typeof item === "string"
            ? item
            : ((item as Record<string, unknown>)?.url as string) ??
              ((item as Record<string, unknown>)?.image as string) ??
              ((item as Record<string, unknown>)?.src as string),
        )
        .filter((u): u is string => typeof u === "string" && u.length > 0);
    }
  }
  const single = pick(raw, ["photo", "image", "thumbnail", "main_photo", "image_url"]);
  return typeof single === "string" ? [single] : [];
};

const SPEC_KEYS = [
  "fuel",
  "fuel_type",
  "transmission",
  "gearbox",
  "body_type",
  "body",
  "engine",
  "engine_volume",
  "engine_size",
  "power",
  "horsepower",
  "color",
  "drive",
  "drive_type",
  "vin",
  "condition",
  "seats",
  "doors",
  "registration_date",
];

export const normalizeListing = (raw: Record<string, unknown>, index: number): Listing => {
  const brand = pick(raw, ["brand", "make", "manufacturer", "brand_name"]) as string | undefined;
  const model = pick(raw, ["model", "model_name"]) as string | undefined;
  const year = toNumber(pick(raw, ["year", "production_year", "model_year"]));
  const title =
    (pick(raw, ["title", "name", "full_name"]) as string | undefined) ??
    [year, brand, model].filter(Boolean).join(" ") ??
    "Listing";

  const specs: Record<string, string> = {};
  for (const key of SPEC_KEYS) {
    const v = raw[key];
    if (v !== undefined && v !== null && v !== "" && typeof v !== "object") {
      specs[key.replace(/_/g, " ")] = String(v);
    }
  }

  return {
    id: String(pick(raw, ["id", "listing_id", "uuid", "vin", "url"]) ?? `listing-${index}`),
    title: title || "Listing",
    brand,
    model,
    year,
    price: toNumber(pick(raw, ["price", "price_eur", "price_usd", "amount", "final_price"])),
    currency: (pick(raw, ["currency", "price_currency"]) as string | undefined) ?? "EUR",
    mileage: toNumber(pick(raw, ["mileage", "odometer", "km", "mileage_km"])),
    location: pick(raw, ["location", "city", "country", "region", "location_name"]) as string | undefined,
    source: (pick(raw, ["source", "provider", "site", "marketplace"]) as string | undefined)?.toLowerCase(),
    photos: collectPhotos(raw),
    url: pick(raw, ["url", "link", "source_url", "original_url", "detail_url"]) as string | undefined,
    specs,
  };
};

export const extractItems = (data: unknown): Record<string, unknown>[] => {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["results", "data", "items", "listings"]) {
      const v = obj[key];
      if (Array.isArray(v)) return v as Record<string, unknown>[];
      if (v && typeof v === "object" && Array.isArray((v as Record<string, unknown>).results)) {
        return (v as Record<string, unknown>).results as Record<string, unknown>[];
      }
    }
  }
  return [];
};

export const searchListings = async (
  filters: SearchFilters,
  page: number,
  limit = 24,
): Promise<{ listings: Listing[]; total?: number; unavailable?: boolean }> => {
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

  const items = extractItems(data);
  const totalRaw = toNumber(pick(obj, ["count", "total", "total_count", "totalResults"]));

  return { listings: items.map(normalizeListing), total: totalRaw, unavailable: obj.unavailable === true };
};


export const SOURCE_LABELS: Record<string, string> = {
  encar: "Encar",
  auto1: "AUTO1",
  openlane: "OpenLane.ca",
};

export const formatPrice = (price?: number, currency = "EUR") =>
  price === undefined
    ? "—"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "EUR", maximumFractionDigits: 0 }).format(
        price,
      );

export const formatMileage = (mileage?: number) =>
  mileage === undefined ? "—" : `${new Intl.NumberFormat("en-US").format(mileage)} km`;
