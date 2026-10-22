import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import { Facets, SearchFilters, SORT_OPTIONS, SortKey, formatNumber } from "@/lib/listings";
import { FilterSidebar } from "./FilterSidebar";

interface Props {
  filters: SearchFilters;
  facets: Facets | null;
  activeCount: number;
  resultCount?: number;
  onChange: (next: SearchFilters) => void;
  onReset: () => void;
  savedMode?: boolean;
  savedCount?: number;
  onToggleSaved?: () => void;
}

export const MobileFilterBar = ({ filters, facets, activeCount, resultCount, onChange, onReset, savedMode, savedCount, onToggleSaved }: Props) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-16 z-30 -mx-4 mb-4 flex items-center gap-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur-sm lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="min-h-11 flex-1">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {t("catalog.filters")}{activeCount > 0 ? ` (${activeCount})` : ""}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="catalog-filter-sheet flex w-screen max-w-none sm:max-w-none flex-col p-0" onOpenAutoFocus={e => e.preventDefault()}>
            <SheetHeader className="border-b border-border px-4 py-3">
              <SheetTitle>{t("catalog.filters")}</SheetTitle>
            </SheetHeader>
            <div className="catalog-touch-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
              <FilterSidebar filters={filters} facets={facets} onChange={onChange} onReset={onReset} savedMode={savedMode} savedCount={savedCount} onToggleSaved={onToggleSaved} />
            </div>
            <div className="catalog-safe-bottom shrink-0 border-t border-border bg-background p-3">
              <Button className="min-h-12 w-full text-base" onClick={() => setOpen(false)}>
                {t("catalog.showResults").replace("{n}", formatNumber(resultCount ?? facets?.total))}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <Select
          value={filters.sort ?? "newest"}
          onValueChange={(v) => onChange({ ...filters, sort: v as SortKey })}
        >
          <SelectTrigger className="h-11 min-w-0 flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="bottom" align="start" sideOffset={4} data-catalog-select className="catalog-dropdown-panel data-[side=bottom]:translate-y-0 data-[side=top]:translate-y-0">
            {SORT_OPTIONS.map((o) => (
              <SelectItem className="catalog-dropdown-row" key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
