import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Gauge, Calendar, Fuel, MapPin, Heart, Car } from "lucide-react";
import { Listing, formatMileage, formatApproxEur, formatEur, regionBg, fuelBg, transmissionBg, encarImg } from "@/lib/listings";
import { useFavorites } from "@/hooks/useFavorites";

interface Props {
  listing: Listing;
  onOpen: (listing: Listing) => void;
  priority?: boolean;
}

const MAX_PHOTOS = 5;

export const ListingListCard = ({ listing, onOpen, priority = false }: Props) => {
  const photos = listing.photos.slice(0, MAX_PHOTOS);
  const [photoIdx, setPhotoIdx] = useState(0);
  const { has, toggle } = useFavorites();
  const saved = has(listing.encarId);

  const photo = photos[photoIdx] ?? listing.thumb;
  const transmission = listing.specs["Скоростна кутия"];
  const fuel = listing.specs["Гориво"];

  const flip = (dir: 1 | -1) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIdx((i) => (i + dir + photos.length) % photos.length);
  };

  // Preload neighbours so flipping feels instant
  useEffect(() => {
    if (photos.length < 2) return;
    [photoIdx - 1, photoIdx + 1].forEach((i) => {
      const src = encarImg(photos[(i + photos.length) % photos.length], 640);
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [photoIdx, photos]);

  return (
    <Card
      className="group flex cursor-pointer flex-col overflow-hidden border-border/60 shadow-card transition-smooth hover:shadow-elegant sm:flex-row"
      onClick={() => onOpen(listing)}
    >
      {/* Photo flipper */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted sm:aspect-auto sm:h-auto sm:w-64 md:w-72">
        {photo ? (
          <img
            src={encarImg(photo, 640)}
            alt={`${listing.title} снимка`}
            loading={priority ? "eager" : "lazy"}
            {...({ fetchpriority: priority ? "high" : "auto" } as Record<string, string>)}
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full min-h-40 w-full items-center justify-center text-muted-foreground">
            <Car className="h-10 w-10" />
          </div>
        )}
        {photos.length > 1 && (
          <>
            <button
              aria-label="Предишна снимка"
              onClick={flip(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Следваща снимка"
              onClick={flip(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
              {photoIdx + 1}/{photos.length}
            </span>
          </>
        )}
        <button
          aria-label={saved ? "Премахни от запазени" : "Запази"}
          onClick={(e) => {
            e.stopPropagation();
            if (listing.encarId) toggle(listing.encarId);
          }}
          className="absolute left-2 top-2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : ""}`} />
        </button>
      </div>

      {/* Facts */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {listing.isNew && <Badge className="bg-primary text-primary-foreground">Ново</Badge>}
          {listing.priceDrop && <Badge variant="secondary">Намалена цена</Badge>}
          {listing.hasAccident === false && (
            <Badge variant="outline" className="border-primary/40 text-primary">Без катастрофи</Badge>
          )}
        </div>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">{listing.title}</h3>
        <div className="mt-auto grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 shrink-0" />{listing.year ?? "—"} г.</span>
          <span className="flex items-center gap-1.5"><Gauge className="h-4 w-4 shrink-0" />{formatMileage(listing.mileage)}</span>
          <span className="flex items-center gap-1.5"><Fuel className="h-4 w-4 shrink-0" />{fuel ?? fuelBg(undefined)}{transmission ? ` · ${transmission}` : ""}</span>
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 shrink-0" />{regionBg(listing.location)}</span>
        </div>
      </div>

      {/* Price */}
      <div className="flex shrink-0 flex-col justify-center gap-1 border-t border-border/60 p-4 sm:w-52 sm:border-l sm:border-t-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Цена до България</p>
        {listing.importPrice ? (
          <>
            <p className="text-xl font-bold text-[#183e32]">{formatApproxEur(listing.importPrice.total)}</p>
            <p className="text-xs text-muted-foreground">Автомобил: {formatEur(listing.importPrice.price)}</p>
          </>
        ) : (
          <p className="text-xl font-bold text-[#183e32]">Цена при запитване</p>
        )}
        <Button
          size="sm"
          className="mt-2 bg-[#183e32] text-white hover:bg-[#183e32]/90"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(listing);
          }}
        >
          Виж детайли
        </Button>
      </div>
    </Card>
  );
};
