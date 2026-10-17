import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import koreaHero from "@/assets/korea-hero.jpg.asset.json";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Heart } from "lucide-react";
import { toast } from "sonner";
import {
  Facets, Listing, SearchFilters, SortKey, SORT_OPTIONS,
  searchListings, fetchFacets, formatNumber, catalogSelection, removeCatalogBrand,
  fuelBg, transmissionBg, bodyBg, regionBg, formatEur, formatMileage,
} from "@/lib/listings";
import { ListingListCard } from "@/components/carsearch/ListingListCard";
import { ListingDialog } from "@/components/carsearch/ListingDialog";
import { FilterSidebar } from "@/components/carsearch/FilterSidebar";
import { MobileFilterBar } from "@/components/carsearch/MobileFilterBar";
import { PaginationBar } from "@/components/carsearch/PaginationBar";
import { useFavorites } from "@/hooks/useFavorites";

const PAGE_SIZE = 20;

const emptyFilters: SearchFilters = {
  brand: "", model: "", year_from: "", year_to: "", price_from: "", price_to: "",
  mileage_min: "", mileage_max: "", fuel_type: "", transmission: "", body_type: "",
  region: "", no_accident: false, sort: "newest",
};

const FILTER_KEYS = Object.keys(emptyFilters) as (keyof SearchFilters)[];

const filtersFromParams = (params: URLSearchParams): SearchFilters => {
  const next: SearchFilters = { ...emptyFilters };
  for (const key of FILTER_KEYS) {
    const value = params.get(key);
    if (value === null) continue;
    if (key === "no_accident") next.no_accident = value === "1" || value === "true";
    else (next as Record<string, unknown>)[key] = value.slice(0, key === "brand" || key === "model" ? 22000 : 120);
  }
  const selection = catalogSelection(next.brand, next.model);
  next.brand = selection.brands.join(",");
  next.model = selection.models.join(",");
  return next;
};

const filtersToParams = (filters: SearchFilters): URLSearchParams => {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = filters[key];
    if (key === "no_accident") {
      if (value === true) params.set(key, "1");
    } else if (key === "sort") {
      if (value && value !== "newest") params.set(key, String(value));
    } else if (typeof value === "string" && value.trim()) params.set(key, value.trim());
  }
  return params;
};

interface Chip {
  key: string;
  label: string;
  clear: (f: SearchFilters) => SearchFilters;
}

const buildChips = (filters: SearchFilters, facets: Facets | null): Chip[] => {
  const chips: Chip[] = [];
  const selection = catalogSelection(filters.brand, filters.model);
  for (const brand of selection.brands) {
    const name = facets?.brands.find((b) => b.slug === brand)?.name ?? brand;
    chips.push({ key: `brand:${brand}`, label: name, clear: (f) => ({ ...f, ...removeCatalogBrand(f.brand, f.model, brand) }) });
  }
  for (const model of selection.models) {
    const brand = model.split(":")[0];
    const brandName = facets?.brands.find((b) => b.slug === brand)?.name ?? brand;
    const name = facets?.models.find((m) => m.slug === model)?.name ?? model.split(":")[1];
    chips.push({ key: `model:${model}`, label: `${brandName}: ${name}`, clear: (f) => ({ ...f, model: catalogSelection(f.brand, f.model).models.filter((m) => m !== model).join(",") }) });
  }
  if (filters.price_from || filters.price_to) {
    const label = filters.price_from && filters.price_to
      ? `${formatEur(Number(filters.price_from))} – ${formatEur(Number(filters.price_to))}`
      : filters.price_from ? `от ${formatEur(Number(filters.price_from))}` : `до ${formatEur(Number(filters.price_to))}`;
    chips.push({ key: "price", label, clear: (f) => ({ ...f, price_from: "", price_to: "" }) });
  }
  if (filters.year_from || filters.year_to) {
    chips.push({
      key: "year",
      label: `Година: ${filters.year_from || "…"} – ${filters.year_to || "…"}`,
      clear: (f) => ({ ...f, year_from: "", year_to: "" }),
    });
  }
  if (filters.mileage_min || filters.mileage_max) {
    chips.push({
      key: "mileage",
      label: `Пробег: ${filters.mileage_min ? formatMileage(Number(filters.mileage_min)) : "…"} – ${filters.mileage_max ? formatMileage(Number(filters.mileage_max)) : "…"}`,
      clear: (f) => ({ ...f, mileage_min: "", mileage_max: "" }),
    });
  }
  for (const v of filters.fuel_type?.split(",").filter(Boolean) ?? []) {
    chips.push({ key: `fuel:${v}`, label: fuelBg(v), clear: (f) => ({ ...f, fuel_type: f.fuel_type?.split(",").filter((x) => x && x !== v).join(",") ?? "" }) });
  }
  for (const v of filters.transmission?.split(",").filter(Boolean) ?? []) {
    chips.push({ key: `tr:${v}`, label: transmissionBg(v), clear: (f) => ({ ...f, transmission: f.transmission?.split(",").filter((x) => x && x !== v).join(",") ?? "" }) });
  }
  for (const v of filters.body_type?.split(",").filter(Boolean) ?? []) {
    chips.push({ key: `body:${v}`, label: bodyBg(v), clear: (f) => ({ ...f, body_type: f.body_type?.split(",").filter((x) => x && x !== v).join(",") ?? "" }) });
  }
  for (const v of filters.region?.split(",").filter(Boolean) ?? []) {
    chips.push({ key: `region:${v}`, label: regionBg(v), clear: (f) => ({ ...f, region: f.region?.split(",").filter((x) => x && x !== v).join(",") ?? "" }) });
  }
  if (filters.no_accident) {
    chips.push({ key: "no_accident", label: "Без катастрофи", clear: (f) => ({ ...f, no_accident: false }) });
  }
  return chips;
};

export default function CarSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters>(() => filtersFromParams(searchParams));
  const [page, setPage] = useState(() => Math.max(1, Number(searchParams.get("page")) || 1));
  const [listings, setListings] = useState<Listing[]>([]);
  const [count, setCount] = useState<number>(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const resultsTop = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);
  const facetRequestId = useRef(0);
  const { ids: favoriteIds } = useFavorites();

  const savedMode = searchParams.get("saved") === "1";

  const effectiveFilters = useMemo<SearchFilters>(() => {
    if (!savedMode) return filters;
    return { ...emptyFilters, ids: favoriteIds.join(","), sort: filters.sort };
  }, [savedMode, filters, favoriteIds]);

  const runSearch = async (active: SearchFilters, targetPage: number) => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const result = await searchListings(active, targetPage, PAGE_SIZE);
      if (id !== requestId.current) return;
      setListings(result.listings);
      setCount(result.count ?? 0);
      setPages(result.pages ?? 0);
      setUnavailable(!!result.unavailable);
      if (result.unavailable) toast.error("Каталогът е временно недостъпен.");
    } catch (err) {
      if (id !== requestId.current) return;
      console.error(err);
      toast.error("Обявите не можаха да бъдат заредени. Опитайте отново.");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };

  const runFacets = async (active: SearchFilters) => {
    const id = ++facetRequestId.current;
    const next = await fetchFacets(active);
    if (next && id === facetRequestId.current) setFacets(next);
  };

  // Debounced search + facets whenever filters change.
  useEffect(() => {
    setPage(1);
    const timer = window.setTimeout(() => {
      const params = filtersToParams(filters);
      if (savedMode) params.set("saved", "1");
      setSearchParams(params, { replace: true });
      runSearch(effectiveFilters, 1);
      runFacets(effectiveFilters);
    }, 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, savedMode, favoriteIds]);

  const goToPage = (next: number) => {
    setPage(next);
    runSearch(effectiveFilters, next);
    resultsTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetFilters = () => setFilters({ ...emptyFilters });

  const chips = useMemo(() => buildChips(filters, facets), [filters, facets]);
  const shownCount = savedMode || facets?.fallback ? count : facets?.total ?? count;

  return (
    <main className="flex-1 bg-background">
      <SEO
        title="Внос на автомобили от Южна Корея — каталог Encar"
        description="Разгледай автомобили от Южна Корея (Encar) с изчислена крайна цена до България — транспорт, мито и ДДС включени. Филтрирай по марка, модел, година и пробег."
        canonicalUrl="https://key4u.bg/car-search"
      />

      <section className="relative overflow-hidden border-b border-border pb-16 pt-28 md:pb-24 md:pt-40">
        <div
          className="absolute inset-0 bg-cover bg-[position:70%_25%] md:bg-[position:100%_25%]"
          style={{ backgroundImage: `url(${koreaHero.url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        <div className="container relative mx-auto px-4">
          <h1 className="text-3xl font-bold text-white md:text-4xl">Южна Корея</h1>
          <p className="mt-2 max-w-2xl text-white/80">
            Актуални обяви от каталога на Encar с прогнозна цена до България.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6" ref={resultsTop}>
        <MobileFilterBar
          filters={filters}
          facets={facets}
          activeCount={chips.length}
          onChange={setFilters}
          onReset={resetFilters}
        />

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-72 shrink-0 self-start overflow-y-auto overscroll-contain pr-2 lg:block">
            <FilterSidebar filters={filters} facets={facets} onChange={setFilters} onReset={resetFilters} />
          </aside>

          {/* Results */}
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {savedMode ? (
                  <span className="flex items-center gap-1.5">
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    Запазени автомобили: {formatNumber(shownCount)}
                  </span>
                ) : (
                  <>Намерени <span className="font-semibold text-foreground">{formatNumber(shownCount)}</span> автомобила</>
                )}
              </p>
              <div className="hidden lg:block">
                <Select
                  value={filters.sort ?? "newest"}
                  onValueChange={(v) => setFilters({ ...filters, sort: v as SortKey })}
                >
                  <SelectTrigger className="h-9 w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {chips.length > 0 && !savedMode && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <Button variant="outline" size="sm"
                    key={chip.key}
                    onClick={() => setFilters(chip.clear(filters))}
                    className="flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground transition-colors hover:bg-accent"
                  >
                    {chip.label}
                    <X className="h-3 w-3" />
                  </Button>
                ))}
                <Button variant="link" size="sm" onClick={resetFilters} className="text-xs font-medium text-primary hover:underline">
                  Изчисти всички
                </Button>
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 w-full rounded-xl" />
                ))}
              </div>
            ) : listings.length > 0 ? (
              <>
                <div className="space-y-4">
                  {listings.map((listing, i) => (
                    <ListingListCard key={listing.encarId ?? listing.id} listing={listing} onOpen={setSelected} priority={i < 2} />
                  ))}
                </div>
                <PaginationBar page={page} pages={pages} onPage={goToPage} />
              </>
            ) : (
              <div className="mt-10 flex flex-col items-center gap-3 text-center">
                <p className="text-muted-foreground">
                  {unavailable
                    ? "Каталогът е временно недостъпен. Моля, опитайте по-късно."
                    : savedMode
                      ? "Нямате запазени автомобили. Отбележете сърчице на обява, за да я добавите тук."
                      : "Няма намерени обяви по избраните критерии."}
                </p>
                {!savedMode && !unavailable && (
                  <Button variant="outline" onClick={resetFilters}>Изчисти филтрите</Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ListingDialog listing={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
