import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingDetails, fetchListingDetails } from "@/lib/listingDetails";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Mail, Phone } from "lucide-react";
import { Listing, SOURCE_LABELS, formatMileage, formatEur, formatApproxEur, encarImg } from "@/lib/listings";
import { PhotoLightbox } from "@/components/carsearch/PhotoLightbox";

interface Props {
  listing: Listing | null;
  onClose: () => void;
}

export const ListingDialog = ({ listing, onClose }: Props) => {
  const [insurance, setInsurance] = useState(false);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);

  const ip = listing?.importPrice;
  const insuranceAmount = ip ? ip.price * 0.022 : 0;
  const total = ip ? ip.total + (insurance ? insuranceAmount : 0) : undefined;
  const [details, setDetails] = useState<ListingDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    setDetails(null);
    setActivePhoto(0);
    const id = listing?.encarId;
    if (!id) return;
    let cancelled = false;
    setDetailsLoading(true);
    fetchListingDetails(id)
      .then((d) => { if (!cancelled) setDetails(d); })
      .catch(() => { if (!cancelled) setDetails(null); })
      .finally(() => { if (!cancelled) setDetailsLoading(false); });
    return () => { cancelled = true; };
  }, [listing?.encarId]);

  const gallery = details?.photos.length ? details.photos : listing?.photos.slice(0, 12) ?? [];
  const current = Math.min(activePhoto, Math.max(gallery.length - 1, 0));

  // Preload neighbours of the active photo
  useEffect(() => {
    if (gallery.length < 2) return;
    [current - 1, current + 1].forEach((i) => {
      const src = encarImg(gallery[(i + gallery.length) % gallery.length], 1000);
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [current, gallery]);


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
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setZoomIndex(current)}
                    aria-label={`Уголеми снимка ${current + 1}`}
                    className="group relative block w-full overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <img
                      src={encarImg(gallery[current], 1000)}
                      alt={`${listing.title} снимка ${current + 1}`}
                      loading="eager"
                      {...({ fetchpriority: "high" } as Record<string, string>)}
                      decoding="async"
                      className="aspect-[4/3] w-full cursor-zoom-in object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                      {current + 1}/{gallery.length}
                    </span>
                  </button>
                  {gallery.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {gallery.map((photo, i) => (
                        <button
                          key={`${photo}-${i}`}
                          type="button"
                          onClick={() => setActivePhoto(i)}
                          aria-label={`Снимка ${i + 1}`}
                          aria-current={i === current}
                          className={`shrink-0 overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${
                            i === current ? "ring-2 ring-[#183e32]" : "opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={encarImg(photo, 240)}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="aspect-[4/3] w-20 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
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
                      <dt className="text-xs tracking-wide text-muted-foreground">{label}</dt>
                      <dd className="font-medium text-foreground">{value}</dd>
                    </div>
                  ))}
              </dl>

              {detailsLoading && (
                <div className="space-y-3" aria-label="Зареждане на детайли">
                  <Skeleton className="h-5 w-32" />
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                  </div>
                </div>
              )}

              {!detailsLoading && details && (
                <div className="space-y-5">
                  {details.specs.length > 0 && (
                    <section>
                      <h3 className="mb-3 text-lg font-semibold text-foreground">Детайли</h3>
                      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                        {details.specs.map(([label, value]) => (
                          <div key={label} className="rounded-lg bg-muted/60 p-3">
                            <dt className="text-xs tracking-wide text-muted-foreground">{label}</dt>
                            <dd className="font-medium text-foreground">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  )}
                  {details.history.length > 0 && (
                    <section>
                      <h3 className="mb-3 text-lg font-semibold text-foreground">История</h3>
                      <dl className="divide-y divide-border rounded-lg border border-border text-sm">
                        {details.history.map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between gap-4 px-4 py-2.5">
                            <dt className="text-muted-foreground">{label}</dt>
                            <dd className="font-medium text-foreground">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  )}
                  {details.equipment.length > 0 && (
                    <section>
                      <h3 className="mb-3 text-lg font-semibold text-foreground">Оборудване</h3>
                      <div className="flex flex-wrap gap-2">
                        {details.equipment.map((o) => <Badge key={o} variant="secondary">{o}</Badge>)}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {ip && (
                <div
                  className="rounded-2xl border border-[#183e32]/15 bg-white p-6 shadow-card"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <h3 className="text-lg font-semibold text-[#183e32]">Цена до България</h3>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#183e32]/70">Цена до Ротердам</span>
                      <span className="font-semibold text-[#183e32]">{formatEur(ip.price)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#183e32]/70">Транспорт до България + мито и ДДС</span>
                      <span className="font-semibold text-[#183e32]">{formatEur(ip.transport)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#183e32]/70">Комисионна и обработка</span>
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
                    Виж оригиналната обява в Encar <ExternalLink className="ml-2 h-4 w-4" />
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
