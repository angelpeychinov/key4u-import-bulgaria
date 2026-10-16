import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, RotateCcw, Search } from "lucide-react";
import {
  Facets, SearchFilters, fuelBg, transmissionBg, bodyBg, regionBg,
} from "@/lib/listings";

const PINNED_BRANDS = [
  "mercedes-benz", "bmw", "audi", "volvo", "volkswagen", "toyota",
  "hyundai", "kia", "mazda", "porsche", "lexus",
];

const PRICE_PRESETS = [10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000, 150000, 200000, 300000, 500000];
const MILEAGE_PRESETS = [30000, 60000, 100000, 150000, 200000];
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - 2009 }, (_, i) => currentYear - i);

interface Props {
  filters: SearchFilters;
  facets: Facets | null;
  onChange: (next: SearchFilters) => void;
  onReset: () => void;
}

const Section = ({
  title, children, defaultOpen = true,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b border-border/60 py-3">
      <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-semibold text-foreground">
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

export const FilterSidebar = ({ filters, facets, onChange, onReset }: Props) => {
  const [brandQuery, setBrandQuery] = useState("");
  const set = (patch: Partial<SearchFilters>) => onChange({ ...filters, ...patch });

  const brands = useMemo(() => {
    const list = facets?.brands ?? [];
    const q = brandQuery.trim().toLowerCase();
    const filtered = q ? list.filter((b) => b.name.toLowerCase().includes(q)) : list;
    if (q) return filtered;
    const pinned = PINNED_BRANDS
      .map((slug) => filtered.find((b) => b.slug.toLowerCase() === slug))
      .filter((b): b is NonNullable<typeof b> => !!b);
    const rest = filtered.filter((b) => !PINNED_BRANDS.includes(b.slug.toLowerCase()));
    return [...pinned, ...rest];
  }, [facets, brandQuery]);

  const models = facets?.models ?? [];
  const showTransmission = (facets?.transmissions.length ?? 0) > 1;
  const showBody = (facets?.body_types.length ?? 0) > 1;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-base font-bold text-foreground">Филтри</h2>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
          <RotateCcw className="mr-1 h-3.5 w-3.5" /> Изчисти
        </Button>
      </div>

      <Section title="Марка">
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={brandQuery}
            onChange={(e) => setBrandQuery(e.target.value)}
            placeholder="Търси марка…"
            className="pl-8 h-9"
          />
        </div>
        <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
          {brands.map((b) => (
            <label key={b.slug} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted">
              <Checkbox
                checked={filters.brand === b.slug}
                onCheckedChange={(checked) =>
                  set({ brand: checked ? b.slug : "", model: "" })
                }
              />
              <span className="flex-1 truncate text-foreground">{b.name}</span>
              <span className="text-xs text-muted-foreground">{b.count.toLocaleString("bg-BG")}</span>
            </label>
          ))}
          {brands.length === 0 && <p className="px-1 text-sm text-muted-foreground">Няма марки по тези критерии.</p>}
        </div>
      </Section>

      <Section title="Модел">
        {!filters.brand ? (
          <p className="text-sm text-muted-foreground">Първо изберете марка.</p>
        ) : (
          <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
            {models.map((m) => (
              <label key={m.slug} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted">
                <Checkbox
                  checked={filters.model === m.slug}
                  onCheckedChange={(checked) => set({ model: checked ? m.slug : "" })}
                />
                <span className="flex-1 truncate text-foreground">{m.name}</span>
                <span className="text-xs text-muted-foreground">{m.count.toLocaleString("bg-BG")}</span>
              </label>
            ))}
            {models.length === 0 && <p className="px-1 text-sm text-muted-foreground">Няма модели по тези критерии.</p>}
          </div>
        )}
      </Section>

      <Section title="Цена до България (€)">
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
          <select
            value={filters.year_from ?? ""}
            onChange={(e) => set({ year_from: e.target.value })}
            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">От</option>
            {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <span className="text-muted-foreground">–</span>
          <select
            value={filters.year_to ?? ""}
            onChange={(e) => set({ year_to: e.target.value })}
            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">До</option>
            {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </Section>

      <Section title="Пробег (км)">
        <div className="flex items-center gap-2">
          <PresetOrInput
            value={filters.mileage_min ?? ""}
            placeholder="От"
            presets={MILEAGE_PRESETS}
            onChange={(v) => set({ mileage_min: v })}
          />
          <span className="text-muted-foreground">–</span>
          <PresetOrInput
            value={filters.mileage_max ?? ""}
            placeholder="До"
            presets={MILEAGE_PRESETS}
            onChange={(v) => set({ mileage_max: v })}
          />
        </div>
      </Section>

      <Section title="Гориво">
        <div className="space-y-1">
          {(facets?.fuels ?? []).map((f) => (
            <label key={f.value} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted">
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
              <label key={tr.value} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted">
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
              <label key={b.value} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted">
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

      <Section title="Регион в Корея" defaultOpen={false}>
        <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
          {(facets?.regions ?? []).map((r) => (
            <label key={r.value} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted">
              <Checkbox
                checked={inList(filters.region, r.value)}
                onCheckedChange={() => set({ region: toggleInList(filters.region, r.value) })}
              />
              <span className="flex-1 text-foreground">{regionBg(r.value)}</span>
              <span className="text-xs text-muted-foreground">{r.count.toLocaleString("bg-BG")}</span>
            </label>
          ))}
        </div>
      </Section>

      <div className="flex items-center justify-between py-4">
        <span className="text-sm font-semibold text-foreground">Само без катастрофи</span>
        <Switch
          checked={filters.no_accident === true}
          onCheckedChange={(checked) => set({ no_accident: checked })}
        />
      </div>
    </div>
  );
};

const PresetOrInput = ({
  value, placeholder, presets, onChange,
}: { value: string; placeholder: string; presets: number[]; onChange: (v: string) => void }) => (
  <div className="w-full">
    <Input
      value={value}
      inputMode="numeric"
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
      className="h-9"
      list={`presets-${placeholder}`}
    />
    <datalist id={`presets-${placeholder}`}>
      {presets.map((p) => <option key={p} value={p} />)}
    </datalist>
  </div>
);
