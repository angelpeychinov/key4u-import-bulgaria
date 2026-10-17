import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingDetails, fetchListingDetails } from "@/lib/listingDetails";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ExternalLink, Mail, Phone } from "lucide-react";
import { Listing, SOURCE_LABELS, formatMileage, formatEur, formatApproxEur, formatKrw, encarImg } from "@/lib/listings";
import { PhotoLightbox } from "@/components/carsearch/PhotoLightbox";
import { ListingInquiryForm } from "./ListingInquiryForm";
import { useLanguage } from "@/contexts/LanguageContext";

const INCLUDED_IN_PRICE = [
  "Покупка и проверка на колата в Корея",
  "Транспорт до Ротердам",
  "Транспорт до България",
  "Мито и ДДС",
  "Комисионна Key4U",
];

interface Props {
  listing: Listing | null;
  onClose: () => void;
}

export const ListingDialog = ({ listing, onClose }: Props) => {
  const { t } = useLanguage();
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [insurance, setInsurance] = useState(false);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);

  const ip = listing?.importPrice;
  const insuranceAmount = ip ? ip.price * 0.022 : 0;
  const total = ip ? ip.total + (insurance ? insuranceAmount : 0) : undefined;
  const [details, setDetails] = useState<ListingDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    setInquiryOpen(false);
    setInsurance(false);
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

  const keySpecs: [string, string | undefined][] = listing
    ? [
        ["Година", listing.year?.toString()],
        ["Пробег", listing.mileage !== undefined ? formatMileage(listing.mileage) : undefined],
        ["Гориво", listing.specs["Гориво"]],
        ["Скорости", listing.specs["Скоростна кутия"]],
        ["Двигател", listing.engineCc ? `${listing.engineCc.toLocaleString("bg-BG")} cm³` : undefined],
        ["Щети", listing.specs["Щети"]],
      ]
    : [];

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
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        {listing && (
          <>
            <div className="grid gap-6 md:grid-cols-5">
              {/* Left: gallery */}
              <div className="space-y-2 md:col-span-3">
                {gallery.length > 0 && (
                  <>
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
                        className="aspect-[4/3] max-h-[55vh] w-full cursor-zoom-in object-cover transition-transform duration-300 group-hover:scale-[1.02] md:max-h-[420px]"
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
                  </>
                )}
              </div>

              {/* Right: title, key specs, price */}
              <div className="space-y-4 md:col-span-2">
                <DialogTitle className="pr-8 text-left text-xl">{listing.title}</DialogTitle>

                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {keySpecs
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div key={label} className="rounded-lg bg-muted/60 p-2.5">
                        <dt className="text-xs tracking-wide text-muted-foreground">{label}</dt>
                        <dd className="font-medium text-foreground">{value}</dd>
                      </div>
                    ))}
                </dl>

                {ip && (
                  <div
                    className="rounded-2xl border border-[#183e32]/15 bg-white p-5 shadow-card"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <h3 className="text-base font-semibold text-[#183e32]">Цена до България</h3>

                    <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                      <span className="text-sm uppercase tracking-wide text-[#183e32]/70">Прогнозна цена:</span>
                      <span className="text-3xl font-bold leading-none text-[#183e32]">
                        {formatApproxEur(total)}
                      </span>
                    </div>

                    {listing.priceKrw !== undefined && (
                      <p className="mt-2 text-xs text-[#183e32]/60">
                        Цена в Корея: {formatKrw(listing.priceKrw)}
                      </p>
                    )}

                    <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-[#c9a227] to-transparent" />

                    <p className="text-sm font-semibold text-[#183e32]">Включено в цената:</p>
                    <ul className="mt-2 space-y-1.5">
                      {INCLUDED_IN_PRICE.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-[#183e32]/80">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 text-sm">
                      <span className="flex items-center gap-2 text-[#183e32]/70">
                        <Checkbox
                          checked={insurance}
                          onCheckedChange={(v) => setInsurance(v === true)}
                          className="border-[#183e32]/40 data-[state=checked]:border-[#183e32] data-[state=checked]:bg-[#183e32]"
                        />
                        Застраховка (по избор)
                      </span>
                      <span className="font-semibold text-[#183e32]">+{formatEur(insuranceAmount)}</span>
                    </label>

                    <div className="mt-5 flex flex-col gap-3">
                      <Button asChild className="flex-1 bg-[#183e32] text-white hover:bg-[#183e32]/90">
                        <a href="tel:+359898252434">
                          <Phone className="mr-2 h-4 w-4" /> Обади се
                        </a>
                      </Button>
                      <Button
                        onClick={() => setInquiryOpen((open) => !open)}
                        variant="outline"
                        className="flex-1 border-[#183e32] text-[#183e32] hover:bg-[#183e32]/5"
                      >
                        <Mail className="mr-2 h-4 w-4" /> {t("inquiry.send")}
                      </Button>
                    </div>

                    {inquiryOpen && <ListingInquiryForm listing={listing} total={total} onClose={() => setInquiryOpen(false)} />}

                    <p className="mt-4 text-xs leading-relaxed text-[#183e32]/60">
                      * Сумата е ориентировъчна. Крайната цена може да варира според митническата оценка и валутния курс
                      към датата на плащане.
                    </p>
                  </div>
                )}

                {!ip && (
                  <div
                    className="rounded-2xl border border-[#183e32]/15 bg-white p-5 shadow-card"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <h3 className="text-base font-semibold text-[#183e32]">Цена до България</h3>
                    <p className="mt-3 text-2xl font-bold leading-none text-[#183e32]">Цена при запитване</p>
                    <p className="mt-2 text-sm text-[#183e32]/70">
                      Свържи се с нас и ще ти изготвим точна оферта с всички разходи до България.
                    </p>
                    <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-[#c9a227] to-transparent" />

                    <p className="text-sm font-semibold text-[#183e32]">Включено в цената:</p>
                    <ul className="mt-2 space-y-1.5">
                      {INCLUDED_IN_PRICE.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-[#183e32]/80">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 flex flex-col gap-3">
                      <Button asChild className="flex-1 bg-[#183e32] text-white hover:bg-[#183e32]/90">
                        <a href="tel:+359898252434">
                          <Phone className="mr-2 h-4 w-4" /> Обади се
                        </a>
                      </Button>
                      <Button
                        onClick={() => setInquiryOpen((open) => !open)}
                        variant="outline"
                        className="flex-1 border-[#183e32] text-[#183e32] hover:bg-[#183e32]/5"
                      >
                        <Mail className="mr-2 h-4 w-4" /> {t("inquiry.send")}
                      </Button>
                    </div>
                    {inquiryOpen && <ListingInquiryForm listing={listing} onClose={() => setInquiryOpen(false)} />}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                {listing.source && (
                  <Badge variant="secondary">{SOURCE_LABELS[listing.source] ?? listing.source}</Badge>
                )}
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                {[
                  ["Марка", listing.brand],
                  ["Модел", listing.model],
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
