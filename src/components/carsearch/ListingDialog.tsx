import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Mail, Phone } from "lucide-react";
import { Listing, SOURCE_LABELS, formatMileage, formatEur, formatApproxEur } from "@/lib/listings";
import { PhotoLightbox } from "@/components/carsearch/PhotoLightbox";

interface Props {
  listing: Listing | null;
  onClose: () => void;
}

export const ListingDialog = ({ listing, onClose }: Props) => {
  const [insurance, setInsurance] = useState(false);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);

  const ip = listing?.importPrice;
  const insuranceAmount = ip ? ip.price * 0.022 : 0;
  const total = ip ? ip.total + (insurance ? insuranceAmount : 0) : undefined;
  const gallery = listing?.photos.slice(0, 12) ?? [];


  return (
    <Dialog
      open={!!listing}
      onOpenChange={(open) => {
        if (!open) {
          setInsurance(false);
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        {listing && (
          <>
            <DialogHeader>
              <DialogTitle className="pr-8 text-left text-xl">{listing.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {gallery.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {gallery.map((photo, i) => (
                    <button
                      key={`${photo}-${i}`}
                      type="button"
                      onClick={() => setZoomIndex(i)}
                      aria-label={`Уголеми снимка ${i + 1}`}
                      className="group relative overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <img
                        src={photo}
                        alt={`${listing.title} снимка ${i + 1}`}
                        loading="lazy"
                        className="aspect-[4/3] w-full cursor-zoom-in object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
              )}


              <div className="flex flex-wrap items-center gap-3">
                {listing.source && (
                  <Badge variant="secondary">{SOURCE_LABELS[listing.source] ?? listing.source}</Badge>
                )}
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                {[
                  ["Година", listing.year?.toString()],
                  ["Марка", listing.brand],
                  ["Модел", listing.model],
                  ["Пробег", formatMileage(listing.mileage)],
                  ["Регион", listing.location],
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

              {ip && (
                <div
                  className="rounded-2xl border border-[#183e32]/15 bg-white p-6 shadow-card"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <h3 className="text-lg font-semibold text-[#183e32]">Цена до България</h3>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#183e32]/70">Цена на автомобил</span>
                      <span className="font-semibold text-[#183e32]">{formatEur(ip.price)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#183e32]/70">Транспорт до България (вкл. мито и ДДС)</span>
                      <span className="font-semibold text-[#183e32]">{formatEur(ip.transport)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#183e32]/70">Разходи по закупуване и разтоварване</span>
                      <span className="font-semibold text-[#183e32]">{formatEur(ip.handling)}</span>
                    </div>

                    <label className="flex cursor-pointer items-center justify-between gap-4">
                      <span className="flex items-center gap-2 text-[#183e32]/70">
                        <Checkbox
                          checked={insurance}
                          onCheckedChange={(v) => setInsurance(v === true)}
                          className="border-[#183e32]/40 data-[state=checked]:border-[#183e32] data-[state=checked]:bg-[#183e32]"
                        />
                        Застраховка (2.2%)
                      </span>
                      <span className="font-semibold text-[#183e32]">
                        {insurance ? formatEur(insuranceAmount) : "—"}
                      </span>
                    </label>
                  </div>

                  <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-[#c9a227] to-transparent" />

                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <span className="text-sm uppercase tracking-wide text-[#183e32]/70">Прогнозна цена</span>
                    <span className="text-[40px] font-bold leading-none text-[#183e32]">
                      {formatApproxEur(total)}
                    </span>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button asChild className="flex-1 bg-[#183e32] text-white hover:bg-[#183e32]/90">
                      <a href="tel:+359898252434">
                        <Phone className="mr-2 h-4 w-4" /> Обади се
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 border-[#183e32] text-[#183e32] hover:bg-[#183e32]/5"
                    >
                      <a href="mailto:key4u.import@gmail.com?subject=Запитване%20за%20внос%20на%20автомобил">
                        <Mail className="mr-2 h-4 w-4" /> Изпрати запитване
                      </a>
                    </Button>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-[#183e32]/60">
                    * Сумата е ориентировъчна. Крайната цена може да варира според митническата оценка и валутния курс
                    към датата на плащане.
                  </p>
                </div>
              )}

              {listing.url && (
                <Button asChild variant="ghost" className="w-full sm:w-auto">
                  <a href={listing.url} target="_blank" rel="noopener noreferrer">
                    Виж оригиналната обява <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>

            <PhotoLightbox
              photos={gallery}
              index={zoomIndex}
              title={listing.title}
              onClose={() => setZoomIndex(null)}
              onIndexChange={setZoomIndex}
            />
          </>
        )}
      </DialogContent>
    </Dialog>

  );
};
