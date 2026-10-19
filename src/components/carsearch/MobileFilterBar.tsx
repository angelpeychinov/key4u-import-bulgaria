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
  onChange: (next: SearchFilters) => void;
  onReset: () => void;
  savedMode?: boolean;
  savedCount?: number;
  onToggleSaved?: () => void;
}

export const MobileFilterBar = ({ filters, facets, activeCount, onChange, onReset, savedMode, savedCount, onToggleSaved }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-16 z-30 -mx-4 mb-4 flex items-center gap-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur-sm lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Филтри{activeCount > 0 ? ` (${activeCount})` : ""}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-[88vw] max-w-sm flex-col p-0">
            <SheetHeader className="border-b border-border px-4 py-3">
              <SheetTitle>Филтри</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <FilterSidebar filters={filters} facets={facets} onChange={onChange} onReset={onReset} savedMode={savedMode} savedCount={savedCount} onToggleSaved={onToggleSaved} />
            </div>
            <div className="border-t border-border p-3">
              <Button className="w-full bg-[#183e32] text-white hover:bg-[#183e32]/90" onClick={() => setOpen(false)}>
                Покажи {formatNumber(facets?.total)} обяви
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <Select
          value={filters.sort ?? "newest"}
          onValueChange={(v) => onChange({ ...filters, sort: v as SortKey })}
        >
          <SelectTrigger className="h-9 flex-1">
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
