import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingDetails, fetchListingDetails } from "@/lib/listingDetails";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ExternalLink, Mail, Phone } from "lucide-react";
import { Listing, SOURCE_LABELS, formatMileage, formatEur, formatApproxEur, formatKrw, encarImg } from "@/lib/listings";
import { CONTACT_PHONE } from "@/lib/contact";
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

const ViberIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817.57 12.933.488 18.776 6.12 20.36h.003l-.004 2.416s-.037.977.61 1.177c.777.242 1.234-.5 1.98-1.302.407-.44.972-1.084 1.397-1.58 3.85.326 6.812-.416 7.15-.525.776-.252 5.176-.816 5.892-6.657.74-6.02-.36-9.83-2.34-11.546-.596-.55-3.006-2.3-8.375-2.323 0 0-.395-.025-1.037-.017zm.058 1.693c.545-.004.88.017.88.017 4.542.02 6.717 1.388 7.222 1.846 1.675 1.435 2.53 4.868 1.906 9.897v.002c-.604 4.878-4.174 5.184-4.832 5.395-.28.09-2.882.737-6.153.524 0 0-2.436 2.94-3.197 3.704-.12.12-.26.167-.352.144-.13-.033-.166-.188-.165-.414l.02-4.018c-4.762-1.32-4.485-6.292-4.43-8.895.054-2.604.543-4.738 1.996-6.173 1.96-1.773 5.474-2.018 7.11-2.03zm.38 2.602c-.167 0-.303.135-.304.302 0 .167.133.303.3.305 1.624.01 2.946.537 4.028 1.592 1.073 1.046 1.62 2.468 1.633 4.334.002.167.14.3.307.3.166-.002.3-.138.3-.304-.014-1.984-.618-3.596-1.816-4.764-1.19-1.16-2.692-1.753-4.447-1.765zm-3.96.695c-.19-.032-.4.005-.616.117l-.01.002c-.43.247-.816.562-1.146.932-.002.004-.006.004-.008.008-.267.323-.42.638-.46.948-.008.046-.01.093-.007.14 0 .136.022.27.065.4l.013.01c.135.48.473 1.276 1.205 2.604.42.768.903 1.5 1.446 2.186.27.344.56.673.87.984l.132.132c.31.308.64.6.984.87.686.543 1.418 1.027 2.186 1.447 1.328.733 2.126 1.07 2.604 1.206l.01.014c.13.042.265.064.402.063.046.002.092 0 .138-.008.31-.036.627-.19.948-.46.004 0 .003-.002.008-.005.37-.33.683-.72.93-1.148l.003-.01c.225-.432.15-.842-.18-1.12-.004 0-.698-.58-1.037-.83-.36-.255-.73-.492-1.113-.71-.51-.285-1.032-.106-1.248.174l-.447.564c-.23.283-.657.246-.657.246-3.12-.796-3.955-3.955-3.955-3.955s-.037-.426.248-.656l.563-.448c.277-.215.456-.737.17-1.248-.217-.383-.454-.756-.71-1.115-.25-.34-.826-1.033-.83-1.035-.137-.165-.31-.265-.502-.297zm4.49.88c-.158.002-.29.124-.3.282-.01.167.115.312.282.324 1.16.085 2.017.466 2.645 1.15.63.688.93 1.524.906 2.57-.002.168.13.306.3.31.166.003.305-.13.31-.297.025-1.175-.334-2.193-1.067-2.994-.74-.81-1.777-1.253-3.05-1.346h-.024zm.463 1.63c-.16.002-.29.127-.3.287-.008.167.12.31.288.32.523.028.875.175 1.113.422.24.245.388.62.416 1.164.01.167.15.295.318.287.167-.008.295-.15.287-.317-.03-.644-.215-1.178-.58-1.557-.367-.378-.893-.574-1.52-.607h-.018z" />
  </svg>
);

const ContactButtons = ({ title, siteUrl, onInquiry }: { title: string; siteUrl: string; onInquiry: () => void }) => {
  const { t } = useLanguage();
  const draft = t("inquiry.viberMessage").replace("{title}", title).replace("{link}", siteUrl);
  return (
    <div className="mt-5 flex flex-col gap-3">
      <Button asChild className="bg-[#183e32] text-white hover:bg-[#183e32]/90">
        <a href={`tel:${CONTACT_PHONE}`}>
          <Phone className="mr-2 h-4 w-4" /> Обади се
        </a>
      </Button>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          onClick={onInquiry}
          variant="outline"
          className="h-auto min-w-0 whitespace-normal border-[#183e32] px-2 py-2 text-center text-[#183e32] hover:bg-[#183e32]/5"
        >
          <Mail className="mr-2 h-4 w-4 shrink-0" /> {t("inquiry.send")}
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-auto min-w-0 whitespace-normal border-[#7360F2] px-2 py-2 text-center text-[#7360F2] hover:bg-[#7360F2]/5"
        >
          <a href={`viber://chat?number=${encodeURIComponent(CONTACT_PHONE)}&draft=${encodeURIComponent(draft)}`}>
            <ViberIcon className="mr-2 h-4 w-4 shrink-0" /> {t("inquiry.viber")}
          </a>
        </Button>
      </div>
    </div>
  );
};

interface Props {
  listing: Listing | null;
  onClose: () => void;
}

export const ListingDialog = ({ listing, onClose }: Props) => {
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

  const inquiryTitle = listing
    ? [listing.brand, listing.model, listing.trim, listing.year].filter(Boolean).join(" ") || listing.title
    : "";
  const siteUrl = listing?.encarId
    ? `https://key4u.bg/car-search?listing=${encodeURIComponent(listing.encarId)}`
    : "https://key4u.bg/car-search";

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
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto overflow-x-hidden">
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

                    <ContactButtons title={inquiryTitle} siteUrl={siteUrl} onInquiry={() => setInquiryOpen((open) => !open)} />

                    {inquiryOpen && <ListingInquiryForm listing={listing} total={total} onClose={() => setInquiryOpen(false)} />}

                    <p className="mt-4 text-xs leading-relaxed text-[#183e32]/60">
                      * Сумата е ориентировъчна. Крайната цена може да варира според тарифите на корабните линии от Корея
                      до Европа към момента на натоварване и валутния курс към датата на плащане.
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

                    <ContactButtons title={inquiryTitle} siteUrl={siteUrl} onInquiry={() => setInquiryOpen((open) => !open)} />
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
