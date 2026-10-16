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
  encarId?: string;
  url?: string;
  specs: Record<string, string>;
  importPrice?: ImportPrice;
  hasAccident?: boolean;
  priceDrop?: boolean;
  isNew?: boolean;
}

export type SortKey = "newest" | "price_asc" | "price_desc" | "mileage_asc" | "year_desc" | "year_asc";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Най-нови" },
  { value: "price_asc", label: "Цена: ниска → висока" },
  { value: "price_desc", label: "Цена: висока → ниска" },
  { value: "mileage_asc", label: "Пробег: най-нисък" },
  { value: "year_desc", label: "Година: най-нова" },
  { value: "year_asc", label: "Година: най-стара" },
];

export interface SearchFilters {
  brand?: string;
  model?: string;
  year_from?: string;
  year_to?: string;
  price_from?: string;
  price_to?: string;
  mileage_min?: string;
  mileage_max?: string;
  fuel_type?: string; // comma-separated multi-select
  transmission?: string; // comma-separated multi-select
  body_type?: string; // comma-separated multi-select
  region?: string; // comma-separated multi-select
  no_accident?: boolean;
  sort?: SortKey;
  ids?: string; // comma-separated encar ids (saved cars)
}

export interface TaxonomyItem {
  name: string;
  slug: string;
}

export interface SearchResult {
  listings: Listing[];
  count?: number;
  page: number;
  pages?: number;
  hasNext: boolean;
  unavailable?: boolean;
}

export interface FacetCount {
  value: string;
  count: number;
}

export interface FacetNamed {
  slug: string;
  name: string;
  count: number;
}

export interface Facets {
  total: number;
  brands: FacetNamed[];
  models: FacetNamed[];
  fuels: FacetCount[];
  transmissions: FacetCount[];
  body_types: FacetCount[];
  regions: FacetCount[];
}

const toNumber = (v: unknown): number | undefined => {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "string" ? Number(v.replace(/[^\d.]/g, "")) : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const MEDIA_BASE = "";

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

export const FUEL_BG: Record<string, string> = {
  gasoline: "Бензин", diesel: "Дизел", hybrid: "Хибрид", electric: "Електрически", lpg: "Газ (LPG)",
  "gasoline+lpg": "Бензин/газ", hydrogen: "Водород", cng: "Метан", other: "Друго",
};
export const TRANSMISSION_BG: Record<string, string> = { auto: "Автоматична", manual: "Ръчна", cvt: "Вариатор (CVT)", semi_auto: "Полуавтоматична" };
export const BODY_BG: Record<string, string> = {
  sedan: "Седан", hatchback: "Хечбек", coupe: "Купе", convertible: "Кабриолет", suv: "SUV",
  wagon: "Комби", pickup: "Пикап", van: "Ван", minivan: "Миниван", other: "Друго",
};
export const REGION_BG: Record<string, string> = {
  seoul: "Сеул", busan: "Пусан", daegu: "Тегу", incheon: "Инчон", gwangju: "Куанджу",
  daejeon: "Деджон", ulsan: "Улсан", sejong: "Седжонг", gyeonggi: "Кьонги", gangwon: "Кануън",
  chungbuk: "Сев. Чхунчхон", chungnam: "Юж. Чхунчхон", jeonbuk: "Сев. Джола", jeonnam: "Юж. Джола",
  gyeongbuk: "Сев. Кьонсан", gyeongnam: "Юж. Кьонсан", jeju: "Джеджу",
};

export const fuelBg = (v?: string) => (v ? FUEL_BG[v.toLowerCase()] ?? v : "—");
export const transmissionBg = (v?: string) => (v ? TRANSMISSION_BG[v.toLowerCase()] ?? v : "—");
export const bodyBg = (v?: string) => (v ? BODY_BG[v.toLowerCase()] ?? v : "—");
export const regionBg = (v?: string) => (v ? REGION_BG[v.toLowerCase()] ?? v : "—");

const SPEC_KEYS: [string, string, Record<string, string>?][] = [
  ["fuel_type", "Гориво", FUEL_BG],
  ["transmission", "Скоростна кутия", TRANSMISSION_BG],
  ["body_type", "Тип каросерия", BODY_BG],
  ["color", "Цвят"],
  ["trim", "Ниво на оборудване"],
];

const NEW_DAYS = 7;

export const normalizeListing = (raw: Record<string, unknown>, index: number): Listing => {
  const brand = (raw.brand_name as string | undefined) ?? undefined;
  const model = (raw.model_name as string | undefined) ?? undefined;
  const trim = (raw.trim as string | undefined) ?? undefined;
  const year = toNumber(raw.year);

  const title = [year, brand, model, trim].filter(Boolean).join(" ") || "Listing";

  const specs: Record<string, string> = {};
  for (const [key, label, map] of SPEC_KEYS) {
    const v = raw[key];
    if (map && typeof v === "string" && v) { specs[label] = map[v.toLowerCase()] ?? v; continue; }
    if (v !== undefined && v !== null && v !== "" && typeof v !== "object") {
      specs[label] = String(v);
    }
  }
  if (typeof raw.has_accident === "boolean") {
    specs["Щети"] = raw.has_accident ? "Да" : "Не";
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

  const krw = toNumber(raw.price_original);
  const prevKrw = toNumber(raw.previous_price_krw);
  const firstSeen = typeof raw.first_seen_at === "string" ? Date.parse(raw.first_seen_at) : NaN;

  return {
    id: String(raw.id ?? `listing-${index}`),
    encarId: raw.encar_id != null ? String(raw.encar_id) : undefined,
    title,
    brand,
    model,
    trim,
    year,
    price: toNumber(raw.price_eur),
    currency: "EUR",
    mileage: toNumber(raw.mileage),
    location: (raw.region as string | undefined) ?? undefined,
    source: (raw.source_code as string | undefined)?.toLowerCase(),
    thumb,
    photos: photos.length ? photos : thumb ? [thumb] : [],
    url: (raw.listing_url as string | undefined) ?? undefined,
    specs,
    importPrice,
    hasAccident: typeof raw.has_accident === "boolean" ? raw.has_accident : undefined,
    priceDrop: krw !== undefined && prevKrw !== undefined && prevKrw > krw,
    isNew: Number.isFinite(firstSeen) && Date.now() - firstSeen < NEW_DAYS * 24 * 60 * 60 * 1000,
  };
};

const filtersToParams = (filters: SearchFilters): URLSearchParams => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (key === "no_accident") {
      if (value === true) params.set("has_accident", "false");
      return;
    }
    if (typeof value === "string" && value && value !== "all") params.set(key, value);
  });
  return params;
};

export const searchListings = async (
  filters: SearchFilters,
  page: number,
  limit = 20,
): Promise<SearchResult> => {
  const params = filtersToParams(filters);
  params.set("page", String(page));
  params.set("limit", String(limit));

  const { data, error } = await supabase.functions.invoke(`listings-search?${params.toString()}`, {
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

export const fetchFacets = async (filters: SearchFilters): Promise<Facets | null> => {
  const params = filtersToParams(filters);
  params.delete("sort");
  params.delete("ids");

  const { data, error } = await supabase.functions.invoke(`listings-facets?${params.toString()}`, {
    method: "GET",
  });
  if (error) return null;
  const obj = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  if (obj.unavailable) return null;

  const named = (v: unknown): FacetNamed[] =>
    Array.isArray(v)
      ? (v as Record<string, unknown>[])
          .map((i) => ({ slug: String(i.slug ?? ""), name: String(i.name ?? ""), count: toNumber(i.count) ?? 0 }))
          .filter((i) => i.slug)
      : [];
  const counts = (v: unknown): FacetCount[] =>
    Array.isArray(v)
      ? (v as Record<string, unknown>[])
          .map((i) => ({ value: String(i.value ?? ""), count: toNumber(i.count) ?? 0 }))
          .filter((i) => i.value)
      : [];

  return {
    total: toNumber(obj.total) ?? 0,
    brands: named(obj.brands),
    models: named(obj.models),
    fuels: counts(obj.fuels),
    transmissions: counts(obj.transmissions),
    body_types: counts(obj.body_types),
    regions: counts(obj.regions),
  };
};

export const SOURCE_LABELS: Record<string, string> = {
  encar: "Encar",
};

const eurFormatter = new Intl.NumberFormat("bg-BG", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const numFormatter = new Intl.NumberFormat("bg-BG");

export const formatEur = (value?: number) => (value === undefined ? "—" : eurFormatter.format(value));

export const formatApproxEur = (value?: number) => (value === undefined ? "—" : `~${formatEur(value)}`);

export const formatNumber = (value?: number) => (value === undefined ? "—" : numFormatter.format(value));

export const formatMileage = (mileage?: number) =>
  mileage === undefined ? "—" : `${numFormatter.format(mileage)} km`;

export const fetchTaxonomy = async (
  kind: "brands" | "models",
  brandSlug?: string,
): Promise<TaxonomyItem[]> => {
  const params = new URLSearchParams({ kind });
  if (kind === "models") {
    if (!brandSlug) return [];
    params.set("brand", brandSlug);
  }

  const { data, error } = await supabase.functions.invoke(`listings-taxonomy?${params.toString()}`, {
    method: "GET",
  });
  if (error) throw error;

  const obj = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  const items = Array.isArray(obj.results) ? (obj.results as Record<string, unknown>[]) : [];
  return items
    .map((item) => ({ name: String(item.name ?? ""), slug: String(item.slug ?? "") }))
    .filter((item) => item.name && item.slug);
};
