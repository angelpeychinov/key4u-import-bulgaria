import { useEffect, useId, useMemo, useState } from "react";
import { isCompleteYearInput, normalizeYearInput, yearPresets } from "@/lib/yearFilter";
import { MobileFacetPicker } from "./MobileFacetPicker";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PopoverAnchor } from "@radix-ui/react-popover";
import { useLanguage } from "@/contexts/LanguageContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Check, ChevronDown, Heart, RotateCcw, Search } from "lucide-react";
import {
  Facets, SearchFilters, fuelBg, transmissionBg, bodyBg, catalogSelection, removeCatalogBrand, selectionValues,
} from "@/lib/listings";

const PINNED_BRANDS = [
  "mercedes-benz", "bmw", "audi", "volvo", "volkswagen", "toyota",
  "hyundai", "kia", "mazda", "porsche", "lexus",
];

const PRICE_PRESETS = [10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000, 150000, 200000, 300000, 500000];
const MILEAGE_PRESETS = [30000, 60000, 100000, 150000, 200000];
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = yearPresets(currentYear);

interface Props {
  filters: SearchFilters;
  facets: Facets | null;
  onChange: (next: SearchFilters) => void;
  onReset: () => void;
  savedMode?: boolean;
  savedCount?: number;
  onToggleSaved?: () => void;
}

const Section = ({
  title, children, defaultOpen = false,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b border-border/60 py-3">
      <CollapsibleTrigger className="min-h-11 md:min-h-0 flex w-full items-center justify-between text-sm font-semibold text-foreground">
        {title}
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">{children}</CollapsibleContent>
    </Collapsible>
  );
};

const toggleInList = (csv: string | undefined, value: string): string => {
  const items = csv ? csv.split(",").filter(Boolean) : [];
  const next = items.includes(value) ? items.filter((i) => i !== value) : [...items, value];
  return next.join(",");
};

const inList = (csv: string | undefined, value: string) => !!csv?.split(",").includes(value);

export const FilterSidebar = ({ filters, facets, onChange, onReset, savedMode = false, savedCount = 0, onToggleSaved }: Props) => {
  const { t } = useLanguage();
  const set = (patch: Partial<SearchFilters>) => onChange({ ...filters, ...patch });

  const brands = useMemo(() => {
    const list = facets?.brands ?? [];
    const filtered = list;
    const pinned = PINNED_BRANDS
      .map((slug) => filtered.find((b) => b.slug.toLowerCase() === slug))
      .filter((b): b is NonNullable<typeof b> => !!b);
    const rest = filtered.filter((b) => !PINNED_BRANDS.includes(b.slug.toLowerCase()));
    return [...pinned, ...rest];
  }, [facets]);

  const selection = catalogSelection(filters.brand, filters.model);
  const models = (facets?.models ?? []).filter((m) => selection.brands.includes(m.slug.split(":")[0]))
    .map((m) => ({ ...m, group: brands.find((b) => b.slug === m.slug.split(":")[0])?.name ?? m.slug.split(":")[0] }))
    .sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
  const showTransmission = (facets?.transmissions.length ?? 0) > 1;
  const showBody = (facets?.body_types.length ?? 0) > 1;

  return (
    <div className="catalog-filter-controls flex flex-col">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-base font-bold text-foreground">Филтри</h2>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
          <RotateCcw className="mr-1 h-3.5 w-3.5" /> Изчисти
        </Button>
      </div>
      {onToggleSaved && (
        <Button
          variant={savedMode ? "default" : "outline"}
          className="mb-2 w-full justify-center"
          aria-pressed={savedMode}
          onClick={onToggleSaved}
        >
          {savedMode ? (
            <><ArrowLeft className="mr-2 h-4 w-4" /> Всички обяви</>
          ) : (
            <><Heart className={`mr-2 h-4 w-4 ${savedCount > 0 ? "fill-destructive text-destructive" : ""}`} /> Запазени ({savedCount})</>
          )}
        </Button>
      )}

      <div className="space-y-3 border-b border-border/60 py-3">
        <FacetDropdown
          title={t("catalog.brand")}
          placeholder={t("catalog.allBrands")}
          searchPlaceholder={t("catalog.searchBrands")}
          emptyLabel={t("catalog.noBrands")}
          options={brands}
          value={filters.brand ?? ""}
          onChange={(brand) => {
            const removed = selection.brands.filter((b) => !selectionValues(brand).includes(b));
            const next = removed.reduce((next, b) => removeCatalogBrand(next.brand, next.model, b), { brand: filters.brand ?? "", model: filters.model ?? "" });
            set({ brand, model: next.model });
          }}
        />
        <FacetDropdown
          title={t("catalog.model")}
          placeholder={filters.brand ? t("catalog.allModels") : t("catalog.chooseBrand")}
          searchPlaceholder={t("catalog.searchModels")}
          emptyLabel={t("catalog.noModels")}
          options={models}
          value={selection.models.join(",")}
          disabled={!filters.brand}
          onChange={(model) => set({ model })}
        />
      </div>

      <label className="flex min-h-12 items-center justify-between gap-3 border-b border-border py-3 text-sm"><span>{t("catalog.hideRequest")}</span><Switch checked={filters.priced_only === "1"} onCheckedChange={checked => set({ priced_only: checked ? "1" : "" })} /></label>

      <Section title={t("catalog.price")}>
        <div className="flex items-center gap-2">
          <PresetOrInput
            value={filters.price_from ?? ""}
            placeholder="От"
            presets={PRICE_PRESETS}
            onChange={(v) => set({ price_from: v })}
          />
          <span className="text-muted-foreground">–</span>
          <PresetOrInput
            value={filters.price_to ?? ""}
            placeholder="До"
            presets={PRICE_PRESETS}
            onChange={(v) => set({ price_to: v })}
          />
        </div>
      </Section>

      <Section title="Година">
        <div className="flex items-center gap-2">
          <PresetOrInput
            value={filters.year_from ?? ""}
            placeholder="От"
            presets={YEAR_OPTIONS}
            yearOnly
            onChange={(v) => set({ year_from: v })}
          />
          <span className="text-muted-foreground">–</span>
          <PresetOrInput
            value={filters.year_to ?? ""}
            placeholder="До"
            presets={YEAR_OPTIONS}
            yearOnly
            onChange={(v) => set({ year_to: v })}
          />
        </div>
      </Section>

      <Section title="Пробег (км)">
        <div className="flex items-center gap-2">
          <PresetOrInput
            value={filters.mileage_min ?? ""}
            placeholder="От"
            presets={MILEAGE_PRESETS}
            mileage
            onChange={(v) => set({ mileage_min: v })}
          />
          <span className="text-muted-foreground">–</span>
          <PresetOrInput
            value={filters.mileage_max ?? ""}
            placeholder="До"
            presets={MILEAGE_PRESETS}
            mileage
            onChange={(v) => set({ mileage_max: v })}
          />
        </div>
      </Section>

      <Section title="Гориво">
        <div className="space-y-1">
          {(facets?.fuels ?? []).map((f) => (
            <label key={f.value} className="flex cursor-pointer items-center gap-2 rounded-md min-h-11 px-1 py-1 text-sm hover:bg-muted">
              <Checkbox
                checked={inList(filters.fuel_type, f.value)}
                onCheckedChange={() => set({ fuel_type: toggleInList(filters.fuel_type, f.value) })}
              />
              <span className="flex-1 text-foreground">{fuelBg(f.value)}</span>
              <span className="text-xs text-muted-foreground">{f.count.toLocaleString("bg-BG")}</span>
            </label>
          ))}
        </div>
      </Section>

      {showTransmission && (
        <Section title="Скоростна кутия">
          <div className="space-y-1">
            {(facets?.transmissions ?? []).map((tr) => (
              <label key={tr.value} className="flex cursor-pointer items-center gap-2 rounded-md min-h-11 px-1 py-1 text-sm hover:bg-muted">
                <Checkbox
                  checked={inList(filters.transmission, tr.value)}
                  onCheckedChange={() => set({ transmission: toggleInList(filters.transmission, tr.value) })}
                />
                <span className="flex-1 text-foreground">{transmissionBg(tr.value)}</span>
                <span className="text-xs text-muted-foreground">{tr.count.toLocaleString("bg-BG")}</span>
              </label>
            ))}
          </div>
        </Section>
      )}

      {showBody && (
        <Section title="Тип каросерия">
          <div className="space-y-1">
            {(facets?.body_types ?? []).map((b) => (
              <label key={b.value} className="flex cursor-pointer items-center gap-2 rounded-md min-h-11 px-1 py-1 text-sm hover:bg-muted">
                <Checkbox
                  checked={inList(filters.body_type, b.value)}
                  onCheckedChange={() => set({ body_type: toggleInList(filters.body_type, b.value) })}
                />
                <span className="flex-1 text-foreground">{bodyBg(b.value)}</span>
                <span className="text-xs text-muted-foreground">{b.count.toLocaleString("bg-BG")}</span>
              </label>
            ))}
          </div>
        </Section>
      )}


    </div>
  );
};

const FacetDropdown = ({ title, placeholder, searchPlaceholder, emptyLabel, options, value, disabled, onChange }: {
  title: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  options: { slug: string; name: string; count?: number; group?: string }[];
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { language, t } = useLanguage();
  const labelId = useId();
  const selectedValues = selectionValues(value);
  const names = selectedValues.map((v) => options.find((option) => option.slug === v)?.name ?? v.split(":").pop() ?? v);
  const selected = names.length > 2 ? `${names[0]} + ${names.length - 1}` : names.join(", ");
  const filtered = options.filter((option) => option.name.toLowerCase().includes(query.trim().toLowerCase()));

  if (isMobile) return <div className="space-y-2"><div className="text-sm font-semibold">{title}</div><Button variant="outline" disabled={disabled} aria-label={`${title}: ${selected || placeholder}`} className="min-h-11 w-full justify-between font-normal" onClick={() => setOpen(true)}><span className="truncate">{selected || placeholder}</span><ChevronDown className="ml-2 h-4 w-4 shrink-0" /></Button>{open && !disabled && <MobileFacetPicker title={title} options={options} value={value} searchPlaceholder={searchPlaceholder} emptyLabel={emptyLabel} onChange={onChange} onClose={() => setOpen(false)} />}</div>;

  return (
    <div className="space-y-2">
      <div id={labelId} className="text-sm font-semibold text-foreground">{title}</div>
      <Popover open={open && !disabled} onOpenChange={(next) => { setOpen(next); setQuery(""); }}>
        <PopoverTrigger asChild>
          <Button variant="outline" disabled={disabled} aria-label={`${title}: ${selected || placeholder}`} className="h-9 w-full justify-between border-input bg-background px-3 text-sm font-normal">
            <span className="truncate">{selected || placeholder}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" sideOffset={4} align="start" aria-labelledby={labelId} className="catalog-dropdown-panel flex w-[var(--radix-popover-trigger-width)] flex-col overflow-hidden p-2">
          <div className="relative mb-2 shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="h-9 pl-8" />
          </div>
          <div className="min-h-0 max-h-64 space-y-1 overflow-y-auto overscroll-contain pr-1">
            {filtered.map((option, index) => (
              <div key={option.slug}>
              {option.group && option.group !== filtered[index - 1]?.group && <div className="border-b border-border px-1 py-2 text-xs font-semibold text-muted-foreground">{option.group}</div>}
              <label data-selected={selectedValues.includes(option.slug)} className="catalog-dropdown-row flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm">
                <Checkbox aria-label={option.group ? `${option.group}: ${option.name}` : option.name} checked={selectedValues.includes(option.slug)} onCheckedChange={() => { onChange(toggleInList(value, option.slug)); }} />
                <span className="min-w-0 flex-1 truncate">{option.name}</span>
                {option.count !== undefined && <span className="text-xs text-muted-foreground">{option.count.toLocaleString(language === "bg" ? "bg-BG" : "en-GB")}</span>}
              </label>
              </div>
            ))}
            {filtered.length === 0 && <p className="px-1 text-sm text-muted-foreground">{emptyLabel}</p>}
          </div>
          {isMobile ? (
            <div className="sticky bottom-0 -mx-2 -mb-2 mt-2 flex shrink-0 items-center gap-2 border-t border-border bg-popover px-2 py-2">
              <Button variant="ghost" size="sm" className="shrink-0 text-muted-foreground" disabled={!value} onClick={() => onChange("")}>{t("catalog.clear")}</Button>
              <Button size="sm" className="ml-auto flex-1 justify-center" onClick={() => setOpen(false)}>{t("catalog.done")}</Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" className="mt-2 shrink-0 border-t border-border text-muted-foreground" disabled={!value} onClick={() => onChange("")}>{t("catalog.clear")}</Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

const PresetOrInput = ({
  value, placeholder, presets, onChange, yearOnly = false, mileage = false,
}: { value: string; placeholder: string; presets: number[]; onChange: (v: string) => void; yearOnly?: boolean; mileage?: boolean }) => {
  const { t } = useLanguage();
  const presetLabel = (preset: number) => yearOnly ? String(preset) : `${String(preset).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${mileage ? t("catalog.mileageUnit") : "€"}`;
  const listId = useId();
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => setDraft(value), [value]);

  const choose = (preset: number) => {
    const next = String(preset);
    setDraft(next);
    onChange(next);
    setOpen(false);
  };

  return (
  <Popover open={open} onOpenChange={setOpen}>
  <PopoverAnchor asChild>
  <div className="relative min-w-0 w-full">
    <Input
      value={draft}
      inputMode="numeric"
      placeholder={placeholder}
      role="combobox"
      aria-expanded={open}
      aria-controls={listId}
      aria-autocomplete="list"
      aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
      onFocus={() => setOpen(true)}
      onClick={() => setOpen(true)}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          setOpen(true);
          const nextIndex = Math.max(0, Math.min(presets.length - 1, activeIndex + (event.key === "ArrowDown" ? 1 : -1)));
          setActiveIndex(nextIndex);
          requestAnimationFrame(() => {
            const option = document.getElementById(`${listId}-${nextIndex}`);
            const panel = option?.closest(".catalog-dropdown-panel");
            if (option && panel) {
              if (option.offsetTop < panel.scrollTop) panel.scrollTop = option.offsetTop;
              else if (option.offsetTop + option.offsetHeight > panel.scrollTop + panel.clientHeight) panel.scrollTop = option.offsetTop + option.offsetHeight - panel.clientHeight;
            }
          });
        } else if (event.key === "Enter" && open) {
          event.preventDefault();
          choose(presets[activeIndex]);
        } else if (event.key === "Escape" || event.key === "Tab") {
          setOpen(false);
        }
      }}
      maxLength={yearOnly ? 4 : undefined}
      onChange={(e) => {
        const next = yearOnly ? normalizeYearInput(e.target.value) : e.target.value.replace(/[^\d]/g, "");
        setDraft(next);
        if (!yearOnly || isCompleteYearInput(next)) onChange(next);
      }}
      onBlur={() => {
        if (yearOnly && !isCompleteYearInput(draft)) setDraft(value);
      }}
      className="h-11 text-base md:h-9 md:text-sm pr-7"
    />
    <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
  </div>
  </PopoverAnchor>
  <PopoverContent data-catalog-presets side="bottom" sideOffset={4} align="start" onOpenAutoFocus={(event) => event.preventDefault()} onCloseAutoFocus={(event) => event.preventDefault()} className="catalog-dropdown-panel w-[var(--radix-popover-trigger-width)] overflow-y-auto overscroll-contain p-1">
    <div id={listId} role="listbox">
      {presets.map((preset, index) => (
        <Button key={preset} id={`${listId}-${index}`} role="option" aria-selected={String(preset) === draft} data-selected={String(preset) === draft} variant="ghost" onMouseDown={(event) => event.preventDefault()} onClick={() => choose(preset)} className="catalog-dropdown-row h-11 md:h-8 w-full justify-between px-2 text-sm font-normal">
          <span className="whitespace-nowrap">{presetLabel(preset)}</span>{String(preset) === draft && <Check className="h-3.5 w-3.5 shrink-0" />}
        </Button>
      ))}
    </div>
  </PopoverContent>
  </Popover>
  );
};
