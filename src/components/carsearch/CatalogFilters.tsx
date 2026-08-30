import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { SearchFilters, TaxonomyItem, fetchTaxonomy } from "@/lib/listings";

const BRAND_GREEN = "#183e32";

// Brands pinned at the top of the dropdown, in this exact order (matched by slug).
const PINNED_BRAND_SLUGS = [
  "mercedes-benz",
  "bmw",
  "audi",
  "volvo",
  "volkswagen",
  "toyota",
  "hyundai",
  "kia",
  "mazda",
  "porsche",
  "lexus",
];

// Fallback Encar brand slugs (the upstream /brands/ endpoint is rate limited and noisy).
const BRAND_OPTIONS: [string, string][] = [
  ["hyundai", "Hyundai"],
  ["kia", "Kia"],
  ["genesis", "Genesis"],
  ["chevrolet", "Chevrolet"],
  ["ssangyong", "SsangYong / KG Mobility"],
  ["renault", "Renault"],
  ["bmw", "BMW"],
  ["mercedes-benz", "Mercedes-Benz"],
  ["audi", "Audi"],
  ["volkswagen", "Volkswagen"],
  ["volvo", "Volvo"],
  ["porsche", "Porsche"],
  ["mini", "MINI"],
  ["land-rover", "Land Rover"],
  ["jaguar", "Jaguar"],
  ["lexus", "Lexus"],
  ["toyota", "Toyota"],
  ["honda", "Honda"],
  ["nissan", "Nissan"],
  ["infiniti", "Infiniti"],
  ["mazda", "Mazda"],
  ["ford", "Ford"],
  ["jeep", "Jeep"],
  ["cadillac", "Cadillac"],
  ["lincoln", "Lincoln"],
  ["chrysler", "Chrysler"],
  ["dodge", "Dodge"],
  ["tesla", "Tesla"],
  ["peugeot", "Peugeot"],
  ["citroen", "Citroen"],
  ["fiat", "Fiat"],
  ["maserati", "Maserati"],
  ["bentley", "Bentley"],
  ["ferrari", "Ferrari"],
  ["lamborghini", "Lamborghini"],
  ["rolls-royce", "Rolls-Royce"],
];

const FUEL_OPTIONS: [string, string][] = [
  ["gasoline", "Бензин"],
  ["diesel", "Дизел"],
  ["hybrid", "Хибрид"],
  ["plug_hybrid", "Плъг-ин хибрид"],
  ["electric", "Електрически"],
  ["hydrogen", "Водород"],
  ["cng", "Метан (CNG)"],
  ["lpg", "Газ (LPG)"],
  ["other", "Друго"],
];

const TRANSMISSION_OPTIONS: [string, string][] = [
  ["manual", "Ръчна"],
  ["auto", "Автоматична"],
  ["cvt", "CVT"],
  ["semi_auto", "Полуавтоматична"],
  ["dct", "DCT"],
  ["other", "Друго"],
];

const BODY_OPTIONS: [string, string][] = [
  ["sedan", "Седан"],
  ["hatchback", "Хечбек"],
  ["coupe", "Купе"],
  ["convertible", "Кабриолет"],
  ["suv", "SUV"],
  ["wagon", "Комби"],
  ["pickup", "Пикап"],
  ["van", "Ван"],
  ["minivan", "Миниван"],
  ["crossover", "Кросоувър"],
  ["truck", "Камион"],
  ["bus", "Автобус"],
  ["other", "Друго"],
];

interface Props {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onApply: () => void;
  onReset: () => void;
  loading?: boolean;
}

const FALLBACK_BRANDS: TaxonomyItem[] = BRAND_OPTIONS.map(([slug, name]) => ({ slug, name }));

// Pinned brands first (in the configured order), then everything else alphabetically.
const orderBrands = (items: TaxonomyItem[]) => {
  const bySlug = new Map(items.map((b) => [b.slug.toLowerCase(), b]));
  const pinned = PINNED_BRAND_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (b): b is TaxonomyItem => Boolean(b),
  );
  const pinnedSlugs = new Set(pinned.map((b) => b.slug.toLowerCase()));
  const rest = items
    .filter((b) => !pinnedSlugs.has(b.slug.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
  return { pinned, rest };
};

export function CatalogFilters({ filters, onChange, onApply, onReset, loading }: Props) {
  const [open, setOpen] = useState(false);
  const [brands, setBrands] = useState<TaxonomyItem[]>(FALLBACK_BRANDS);
  const [models, setModels] = useState<TaxonomyItem[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    let active = true;
    fetchTaxonomy("brands")
      .then((items) => {
        if (!active || items.length === 0) return;
        // Merge upstream brands with the curated fallback so pinned brands are always present.
        const merged = new Map(items.map((b) => [b.slug.toLowerCase(), b]));
        for (const b of FALLBACK_BRANDS) {
          if (!merged.has(b.slug.toLowerCase())) merged.set(b.slug.toLowerCase(), b);
        }
        setBrands([...merged.values()]);
      })
      .catch((err) => console.error(err));
    return () => {
      active = false;
    };
  }, []);

  const { pinned: pinnedBrands, rest: otherBrands } = orderBrands(brands);

  useEffect(() => {
    let active = true;
    if (!filters.brand) {
      setModels([]);
      return;
    }
    setLoadingModels(true);
    fetchTaxonomy("models", filters.brand)
      .then((items) => active && setModels(items))
      .catch((err) => console.error(err))
      .finally(() => active && setLoadingModels(false));
    return () => {
      active = false;
    };
  }, [filters.brand]);

  const set = (key: keyof SearchFilters, value: string | boolean) =>
    onChange({ ...filters, [key]: value });

  const selectValue = (value?: string) => (value ? value : "all");

  return (
    <Card className="overflow-hidden p-4 md:p-6">
      <div className="flex items-center justify-between gap-3 md:hidden">
        <p className="flex items-center gap-2 font-semibold" style={{ color: BRAND_GREEN }}>
          <SlidersHorizontal className="h-4 w-4" />
          Филтри
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? "Скрий" : "Покажи"}
        </Button>
      </div>

      <form
        className={`${open ? "mt-4 grid" : "hidden"} grid-cols-1 gap-4 sm:grid-cols-2 md:mt-0 md:grid lg:grid-cols-4`}
        onSubmit={(e) => {
          e.preventDefault();
          setOpen(false);
          onApply();
        }}
      >
        <div className="space-y-2">
          <Label>Марка</Label>
          <Select
            value={selectValue(filters.brand)}
            onValueChange={(value) =>
              onChange({ ...filters, brand: value === "all" ? "" : value, model: "" })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Всички марки" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">Всички марки</SelectItem>
              {pinnedBrands.map((brand) => (
                <SelectItem key={brand.slug} value={brand.slug}>
                  {brand.name}
                </SelectItem>
              ))}
              {pinnedBrands.length > 0 && otherBrands.length > 0 && (
                <div className="my-1 h-px bg-border" role="separator" />
              )}
              {otherBrands.map((brand) => (
                <SelectItem key={brand.slug} value={brand.slug}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Модел</Label>
          {filters.brand && !loadingModels && models.length === 0 ? (
            <Input
              placeholder="Напр. sportage"
              aria-label="Модел"
              value={filters.model ?? ""}
              onChange={(e) => set("model", e.target.value)}
            />
          ) : (
            <Select
              value={selectValue(filters.model)}
              onValueChange={(value) => set("model", value === "all" ? "" : value)}
              disabled={!filters.brand || loadingModels}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !filters.brand
                      ? "Изберете марка"
                      : loadingModels
                        ? "Зареждане..."
                        : "Всички модели"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all">Всички модели</SelectItem>
                {models.map((model) => (
                  <SelectItem key={model.slug} value={model.slug}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label>Година</Label>
          <div className="flex gap-2">
            <Input
              inputMode="numeric"
              placeholder="От"
              aria-label="Година от"
              value={filters.year_from ?? ""}
              onChange={(e) => set("year_from", e.target.value)}
            />
            <Input
              inputMode="numeric"
              placeholder="До"
              aria-label="Година до"
              value={filters.year_to ?? ""}
              onChange={(e) => set("year_to", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mileage">Пробег до (км)</Label>
          <Input
            id="mileage"
            inputMode="numeric"
            placeholder="150000"
            value={filters.mileage_max ?? ""}
            onChange={(e) => set("mileage_max", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Цена до (USD)</Label>
          <Input
            id="price"
            inputMode="numeric"
            placeholder="30000"
            value={filters.price_to ?? ""}
            onChange={(e) => set("price_to", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Филтрира по каталожна цена в USD</p>
        </div>

        <div className="space-y-2">
          <Label>Гориво</Label>
          <Select
            value={selectValue(filters.fuel_type)}
            onValueChange={(value) => set("fuel_type", value === "all" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Всички" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички</SelectItem>
              {FUEL_OPTIONS.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Скоростна кутия</Label>
          <Select
            value={selectValue(filters.transmission)}
            onValueChange={(value) => set("transmission", value === "all" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Всички" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички</SelectItem>
              {TRANSMISSION_OPTIONS.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Тип купе</Label>
          <Select
            value={selectValue(filters.body_type)}
            onValueChange={(value) => set("body_type", value === "all" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Всички" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">Всички</SelectItem>
              {BODY_OPTIONS.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
          <Checkbox
            id="no-accident"
            checked={!!filters.no_accident}
            onCheckedChange={(checked) => set("no_accident", checked === true)}
          />
          <Label htmlFor="no-accident" className="cursor-pointer">
            Без ПТП
          </Label>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row lg:col-span-3 lg:justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="text-white hover:opacity-90 sm:min-w-[180px]"
            style={{ backgroundColor: BRAND_GREEN }}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Приложи филтри
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={loading}
            style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Изчисти филтри
          </Button>
        </div>
      </form>
    </Card>
  );
}
