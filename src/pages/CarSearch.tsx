import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Listing, SearchFilters, searchListings } from "@/lib/carapis";
import { ListingCard } from "@/components/carsearch/ListingCard";
import { ListingDialog } from "@/components/carsearch/ListingDialog";

const PAGE_SIZE = 24;

const emptyFilters: SearchFilters = {
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
  const [unavailable, setUnavailable] = useState(false);
  const [pages, setPages] = useState<number | undefined>(undefined);

  const set = (key: keyof SearchFilters) => (value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

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
      if (down) toast.error("Каталогът е временно недостъпен.");
    } catch (err) {
      console.error(err);
      toast.error("Обявите не можаха да бъдат заредени. Опитайте отново.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 bg-background">
      <SEO
        title="Корея — каталог автомобили от Encar | Key4U"
        description="Разгледай автомобили от Корея (Encar) с изчислена цена до България. Филтрирай по марка, модел, година, цена и пробег."
      />

      <section className="border-b border-border bg-secondary/50 py-10 md:py-14">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Корея</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Актуални обяви от каталога на Encar с прогнозна цена до България.
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
              <Label htmlFor="brand">Марка</Label>
              <Input id="brand" placeholder="BMW" value={filters.brand} onChange={(e) => set("brand")(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Модел</Label>
              <Input id="model" placeholder="X5" value={filters.model} onChange={(e) => set("model")(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Година</Label>
              <div className="flex gap-2">
                <Input
                  inputMode="numeric"
                  placeholder="От"
                  value={filters.year_from}
                  onChange={(e) => set("year_from")(e.target.value)}
                />
                <Input
                  inputMode="numeric"
                  placeholder="До"
                  value={filters.year_to}
                  onChange={(e) => set("year_to")(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Цена</Label>
              <div className="flex gap-2">
                <Input
                  inputMode="numeric"
                  placeholder="От"
                  value={filters.price_from}
                  onChange={(e) => set("price_from")(e.target.value)}
                />
                <Input
                  inputMode="numeric"
                  placeholder="До"
                  value={filters.price_to}
                  onChange={(e) => set("price_to")(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage">Макс. пробег (км)</Label>
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
                Търси
              </Button>
              <Button type="button" variant="outline" onClick={() => setFilters(emptyFilters)} disabled={loading}>
                Изчисти
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

            <div className="mt-8 flex flex-col items-center gap-3">
              {pages ? (
                <p className="text-sm text-muted-foreground">
                  Страница {page} от {pages}
                </p>
              ) : null}
              {hasMore && (
                <Button variant="outline" size="lg" onClick={() => runSearch(page + 1, true)} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Зареди още
                </Button>
              )}
            </div>
          </>
        )}

        {searched && !loading && listings.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">
            {unavailable
              ? "Каталогът е временно недостъпен. Моля, опитайте по-късно."
              : "Няма намерени обяви по избраните критерии."}
          </p>
        )}
      </div>

      <ListingDialog listing={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
