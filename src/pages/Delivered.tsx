import { useState } from "react";
import { Link } from "react-router-dom";
import { Images, MapPin, Gauge, Fuel, CalendarCheck } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { PhotoLightbox } from "@/components/carsearch/PhotoLightbox";
import { deliveredCars, type DeliveredCar } from "@/data/deliveredCars";

const eur = (n: number) => new Intl.NumberFormat("bg-BG", { maximumFractionDigits: 0 }).format(n) + " €";

export default function Delivered() {
  const [active, setActive] = useState<DeliveredCar | null>(null);
  const [index, setIndex] = useState<number | null>(null);

  const open = (car: DeliveredCar) => { setActive(car); setIndex(0); };

  return (
    <main className="flex-1 bg-background">
      <SEO
        title="Внесени автомобили — доставени в България"
        description="Вижте автомобили, които Key4U вече внесе и достави в България от Канада, САЩ и Южна Корея — година, произход и крайна цена."
        canonicalUrl="https://key4u.bg/delivered"
      />

      <section className="container mx-auto px-4 pt-20 pb-10 md:pt-24">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Реални доставки</p>
        <h1 className="mt-3 text-4xl font-bold text-foreground md:text-5xl">Внесени автомобили</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Автомобили, които вече карат своите нови собственици в България. Натиснете снимката, за да видите галерията.
        </p>
      </section>

      <section className="container mx-auto grid gap-6 px-4 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {deliveredCars.map((car) => (
          <article key={car.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
            <button onClick={() => open(car)} className="relative block aspect-[4/3] w-full overflow-hidden" aria-label={`Галерия: ${car.title}`}>
              <img src={car.photos[0]} alt={`${car.title} ${car.year}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
                Доставен
              </span>
              <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-foreground/70 px-3 py-1 text-xs text-background backdrop-blur">
                <Images className="h-3.5 w-3.5" /> {car.photos.length}
              </span>
            </button>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold leading-snug text-card-foreground">{car.title}</h2>
                <span className="shrink-0 rounded-md bg-secondary px-2 py-0.5 text-sm font-medium text-secondary-foreground">{car.year}</span>
              </div>
              <div className="mb-4 mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{car.origin}</span>
                {car.mileageKm != null && <span className="flex items-center gap-1"><Gauge className="h-4 w-4" />{car.mileageKm.toLocaleString("bg-BG")} км</span>}
                {car.fuel && <span className="flex items-center gap-1"><Fuel className="h-4 w-4" />{car.fuel}</span>}
                {car.deliveredOn && <span className="flex items-center gap-1"><CalendarCheck className="h-4 w-4" />{car.deliveredOn}</span>}
              </div>
              <div className="mt-auto flex items-end justify-between border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Цена в България</span>
                <span className="text-xl font-bold text-primary">{eur(car.priceEur)}</span>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="container mx-auto px-4 pb-24 text-center">
        <h2 className="text-2xl font-semibold text-foreground">Искате и вие такъв автомобил?</h2>
        <Button asChild size="lg" className="mt-6"><Link to="/find-car">Намери моя автомобил</Link></Button>
      </section>

      <PhotoLightbox
        photos={active?.photos ?? []}
        index={index}
        title={active ? `${active.title} ${active.year}` : undefined}
        onClose={() => setIndex(null)}
        onIndexChange={setIndex}
      />
    </main>
  );
}
