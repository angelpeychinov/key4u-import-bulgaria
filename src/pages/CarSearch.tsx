import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Listing, SearchFilters, searchListings } from "@/lib/carapis";
import { ListingCard } from "@/components/carsearch/ListingCard";
import { ListingDialog } from "@/components/carsearch/ListingDialog";

const PAGE_SIZE = 24;

const emptyFilters: SearchFilters = {
  source: "all",
  brand: "",
  model: "",
  year_from: "",
  year_to: "",
  price_from: "",
  price_to: "",
  mileage_max: "",
};

export default function CarSearch() {
  const [filters, setFilters] = useState<SearchFilters>(emptyFilters);
  const [listings, setListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<Listing | null>(null);

  const set = (key: keyof SearchFilters) => (value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const [unavailable, setUnavailable] = useState(false);

  const [pages, setPages] = useState<number | undefined>(undefined);

  const runSearch = async (nextPage: number, append: boolean) => {
    setLoading(true);
    try {
      const { listings: results, unavailable: down, hasNext, page: current, pages: totalPages } =
        await searchListings(filters, nextPage, PAGE_SIZE);
      setListings((prev) => (append ? [...prev, ...results] : results));
      setPage(current ?? nextPage);
      setPages(totalPages);
      setHasMore(hasNext);
      setUnavailable(!!down);
      setSearched(true);
      if (down) toast.error("The listings provider is temporarily unavailable.");
    } catch (err) {
      console.error(err);
      toast.error("Could not load listings. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="flex-1 bg-background">
      <SEO
        title="Car Search — Encar, AUTO1 & OpenLane"
        description="Search live car listings from Encar, AUTO1 and OpenLane.ca. Filter by brand, model, year, price and mileage."
      />

      <section className="border-b border-border bg-secondary/50 py-10 md:py-14">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Car Search</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Browse live listings from Encar, AUTO1 and OpenLane.ca in one place.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Card className="p-4 md:p-6">
          <form
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault();
              runSearch(1, false);
            }}
          >
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={filters.source} onValueChange={set("source")}>
                <SelectTrigger>
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  <SelectItem value="encar">Encar</SelectItem>
                  <SelectItem value="auto1">AUTO1</SelectItem>
                  <SelectItem value="openlane">OpenLane.ca</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" placeholder="BMW" value={filters.brand} onChange={(e) => set("brand")(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" placeholder="X5" value={filters.model} onChange={(e) => set("model")(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Year range</Label>
              <div className="flex gap-2">
                <Input
                  inputMode="numeric"
                  placeholder="From"
                  value={filters.year_from}
                  onChange={(e) => set("year_from")(e.target.value)}
                />
                <Input
                  inputMode="numeric"
                  placeholder="To"
                  value={filters.year_to}
                  onChange={(e) => set("year_to")(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Price range</Label>
              <div className="flex gap-2">
                <Input
                  inputMode="numeric"
                  placeholder="From"
                  value={filters.price_from}
                  onChange={(e) => set("price_from")(e.target.value)}
                />
                <Input
                  inputMode="numeric"
                  placeholder="To"
                  value={filters.price_to}
                  onChange={(e) => set("price_to")(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage">Max mileage (km)</Label>
              <Input
                id="mileage"
                inputMode="numeric"
                placeholder="150000"
                value={filters.mileage_max}
                onChange={(e) => set("mileage_max")(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2 sm:col-span-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFilters(emptyFilters)}
                disabled={loading}
              >
                Reset
              </Button>
            </div>
          </form>
        </Card>

        {listings.length > 0 && (
          <>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing, i) => (
                <ListingCard key={`${listing.id}-${i}`} listing={listing} onOpen={setSelected} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button variant="outline" size="lg" onClick={() => runSearch(page + 1, true)} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Load more
                </Button>
              </div>
            )}
          </>
        )}

        {searched && !loading && listings.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">
            {unavailable
              ? "The listings provider is temporarily unavailable. Please try again later."
              : "No listings matched your filters."}
          </p>
        )}

      </div>

      <ListingDialog listing={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
