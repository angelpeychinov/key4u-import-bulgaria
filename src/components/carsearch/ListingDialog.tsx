import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Listing, SOURCE_LABELS, formatMileage, formatPrice } from "@/lib/carapis";

interface Props {
  listing: Listing | null;
  onClose: () => void;
}

export const ListingDialog = ({ listing, onClose }: Props) => (
  <Dialog open={!!listing} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
      {listing && (
        <>
          <DialogHeader>
            <DialogTitle className="pr-8 text-left text-xl">{listing.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {listing.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {listing.photos.slice(0, 12).map((photo, i) => (
                  <img
                    key={`${photo}-${i}`}
                    src={photo}
                    alt={`${listing.title} photo ${i + 1}`}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-2xl font-bold text-primary">{formatPrice(listing.price, listing.currency)}</span>
              {listing.source && (
                <Badge variant="secondary">{SOURCE_LABELS[listing.source] ?? listing.source}</Badge>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {[
                ["Year", listing.year?.toString()],
                ["Brand", listing.brand],
                ["Model", listing.model],
                ["Mileage", formatMileage(listing.mileage)],
                ["Location", listing.location],
                ...Object.entries(listing.specs),
              ]
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label as string} className="rounded-lg bg-muted/60 p-3">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                    <dd className="font-medium capitalize text-foreground">{value}</dd>
                  </div>
                ))}
            </dl>

            {listing.url && (
              <Button asChild className="w-full sm:w-auto">
                <a href={listing.url} target="_blank" rel="noopener noreferrer">
                  Open original listing <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </>
      )}
    </DialogContent>
  </Dialog>
);
