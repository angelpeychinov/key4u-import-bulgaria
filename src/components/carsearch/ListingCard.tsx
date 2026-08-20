import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gauge, MapPin, Car } from "lucide-react";
import { Listing, SOURCE_LABELS, formatMileage, formatPrice } from "@/lib/carapis";

interface Props {
  listing: Listing;
  onOpen: (listing: Listing) => void;
}

export const ListingCard = ({ listing, onOpen }: Props) => {
  const photo = listing.photos[0];

  return (
    <Card
      className="group overflow-hidden border-border/60 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant cursor-pointer flex flex-col"
      onClick={() => onOpen(listing)}
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {photo ? (
          <img
            src={photo}
            alt={`${listing.title} photo`}
            loading="lazy"
            className="h-full w-full object-cover transition-smooth group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Car className="h-10 w-10" />
          </div>
        )}
        {listing.source && (
          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
            {SOURCE_LABELS[listing.source] ?? listing.source}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">{listing.title}</h3>
        <p className="text-xl font-bold text-primary">{formatPrice(listing.price, listing.currency)}</p>

        <div className="mt-auto space-y-1 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Gauge className="h-4 w-4 shrink-0" />
            {formatMileage(listing.mileage)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            {listing.location ?? "—"}
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(listing);
          }}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
};
