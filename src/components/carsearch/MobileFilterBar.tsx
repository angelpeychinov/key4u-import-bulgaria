import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Facets, SearchFilters, SORT_OPTIONS, SortKey, formatNumber } from "@/lib/listings";
import { FilterSidebar } from "./FilterSidebar";
import { useHistoryLayer } from "@/hooks/useHistoryLayer";

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
  // Phone/browser Back closes the sheet and returns to the listings.
  useHistoryLayer(open, () => setOpen(false));

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
          <SheetContent side="left" className="catalog-filter-sheet flex h-[100dvh] w-screen max-w-none sm:max-w-none flex-col gap-0 overflow-hidden p-0" onOpenAutoFocus={e => e.preventDefault()}>
            <SheetHeader className="shrink-0 border-b border-border bg-background px-4 py-3">
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

        {/* Native select: iOS shows its own picker wheel, no portalled list to scroll-lock. */}
        <div className="relative min-w-0 flex-1">
          <select
            aria-label={t("catalog.sort")}
            value={filters.sort ?? "newest"}
            onChange={(e) => onChange({ ...filters, sort: e.target.value as SortKey })}
            className="h-11 w-full appearance-none truncate rounded-md border border-input bg-background px-3 pr-8 text-base text-foreground"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-3.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </>
  );
};
