import { useEffect, useMemo, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import { ArrowRight, Camera, Car, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Listing, SortKey, encarImg, formatApproxEur, formatMileage, searchListings } from "@/lib/listings";

// Self-contained homepage teaser for the Korea catalog; remove by deleting its line in Home.tsx.
const BRANDS = [
  { slug: "hyundai", name: "Hyundai" },
  { slug: "kia", name: "Kia" },
  { slug: "genesis", name: "Genesis" },
  { slug: "bmw", name: "BMW" },
  { slug: "mercedes-benz", name: "Mercedes-Benz" },
  { slug: "porsche", name: "Porsche" },
];

export const KoreaCatalogSection = () => {
  const { t } = useLanguage();
  const [total, setTotal] = useState<number | null>(null);
  const [cars, setCars] = useState<Listing[]>([]);

  useEffect(() => {
    let alive = true;
    supabase.from("encar_facets_cache").select("payload").eq("key", "default").maybeSingle()
      .then(({ data }) => {
        const n = Number((data?.payload as Record<string, unknown> | undefined)?.total);
        if (alive && Number.isFinite(n) && n >= 1000) setTotal(Math.floor(n / 1000) * 1000);
      });
    searchListings({ sort: "random" as SortKey }, 1, 30)
      .then((r) => {
        if (alive) setCars(r.listings.filter((l) => l.importPrice && (l.photos[0] || l.thumb) && l.encarId));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const [api, setApi] = useState<CarouselApi>();
  const [snap, setSnap] = useState(0);
  const [snaps, setSnaps] = useState(0);
  const plugins = useMemo(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return reduce ? [] : [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })];
  }, []);
  useEffect(() => {
    if (!api) return;
    const update = () => { setSnap(api.selectedScrollSnap()); setSnaps(api.scrollSnapList().length); };
    update();
    api.on("select", update).on("reInit", update);
  }, [api]);

  const heading = total
    ? t("korea.home.heading").replace("{n}", total.toLocaleString("bg-BG").replace(/\u00a0|\s/g, " "))
    : t("korea.home.headingFallback");

  const facts = [
    { icon: Tag, text: t("korea.home.fact1"), sub: t("korea.home.fact1Sub") },
    { icon: Camera, text: t("korea.home.fact2"), sub: t("korea.home.fact2Sub") },
    { icon: Clock, text: t("korea.home.fact3"), sub: t("korea.home.fact3Sub") },
  ];

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("korea.home.eyebrow")}</p>
            <h2 className="mb-5 text-3xl font-bold leading-tight text-primary md:text-[40px]">{heading}</h2>
            <p className="mb-7 max-w-xl text-lg text-muted-foreground">{t("korea.home.text")}</p>

            <div className="mb-8 flex flex-wrap gap-2">
              {BRANDS.map((b) => (
                <Link
                  key={b.slug}
                  to={`/car-search?brand=${b.slug}`}
                  className="rounded-full border border-primary/20 bg-card px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {b.name}
                </Link>
              ))}
            </div>

            <Button asChild size="lg" className="group">
              <Link to="/car-search">
                {t("korea.home.cta")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <ul className="space-y-4">
            {facts.map(({ icon: Icon, text, sub }) => (
              <li key={text} className="flex items-center gap-5 rounded-xl border border-primary/10 bg-card p-5 shadow-card">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-lg font-bold leading-snug text-foreground">{text}</p>
                  <p className="text-sm text-muted-foreground">{sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

          {cars.length > 0 && (
            <div className="mt-14 min-w-0 md:mt-20">
              <h3 className="mb-5 text-xl font-bold text-primary">{t("korea.home.samplesTitle")}</h3>
              <Carousel setApi={setApi} plugins={plugins} opts={{ loop: true, align: "start", slidesToScroll: "auto", duration: 30 }}>
                <CarouselContent className="-ml-4">
                  {cars.map((car) => {
                    const photo = car.photos[0] ?? car.thumb;
                    return (
                      <CarouselItem key={car.encarId} className="basis-[75%] pl-4 sm:basis-1/3 lg:basis-1/4 2xl:basis-1/5">
                        <Link
                          to={`/car-search?listing=${car.encarId}`}
                          className="block h-full overflow-hidden rounded-lg border border-border/60 bg-card shadow-card transition-smooth hover:shadow-elegant"
                        >
                          <div className="aspect-[4/3] bg-muted">
                            {photo ? (
                              <img src={encarImg(photo, 640)} alt={car.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-muted-foreground"><Car className="h-8 w-8" /></div>
                            )}
                          </div>
                          <div className="space-y-1 p-3">
                            <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground">{car.title}</p>
                            <p className="text-xs text-muted-foreground">{car.year ?? "—"} · {formatMileage(car.mileage)}</p>
                            <p className="pt-1 text-[11px] uppercase tracking-wide text-muted-foreground">{t("korea.home.priceLabel")}</p>
                            <p className="text-lg font-bold text-primary">{formatApproxEur(car.importPrice?.total)}</p>
                          </div>
                        </Link>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious className="left-1 h-8 w-8 bg-card/90 xl:-left-4" />
                <CarouselNext className="right-1 h-8 w-8 bg-card/90 xl:-right-4" />
              </Carousel>
              {snaps > 1 && (
                <div className="mt-4 hidden justify-center gap-1.5 sm:flex">
                  {Array.from({ length: snaps }).map((_, i) => (
                    <button
                      key={i}
                      aria-label={`${i + 1}`}
                      onClick={() => api?.scrollTo(i)}
                      className={`h-2 rounded-full transition-all ${i === snap ? "w-5 bg-primary" : "w-2 bg-primary/25"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
      </div>
    </section>
  );
};
