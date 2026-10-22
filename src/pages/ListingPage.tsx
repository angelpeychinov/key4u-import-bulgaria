import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Phone } from 'lucide-react';
import { ListingContent, ViberIcon } from '@/components/carsearch/ListingDialog';
import { ListingShare } from '@/components/carsearch/ListingShare';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { Listing, searchListings, formatNumber, encarImg } from '@/lib/listings';
import { listingIdFromSlug, listingPath } from '@/lib/listingNavigation';
import { CONTACT_PHONE } from '@/lib/contact';
export default function ListingPage() {
  const { slug = '' } = useParams();
  const id = listingIdFromSlug(slug);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const initial = location.state?.listing as Listing | undefined;
  const [listing, setListing] = useState<Listing | null>(initial?.encarId === id ? initial : null);
  const [loading, setLoading] = useState(true);
  const [similar, setSimilar] = useState<Listing[]>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    window.scrollTo({ top: 0, behavior: 'instant' });
    setLoading(true); setFailed(false); setSimilar([]);
    setListing(initial?.encarId === id ? initial : null);
    if (!id) { setLoading(false); return; }
    searchListings({ ids: id }, 1, 1).then(result => {
      if (!alive) return;
      if (result.unavailable) { setFailed(true); return; }
      const car = result.listings[0] ?? null; setListing(car);
      if (car && listingPath(car) !== location.pathname) navigate(listingPath(car), { replace: true, state: location.state });
    }).catch(() => { if (alive) setFailed(true); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);
  useEffect(() => {
    if (!listing?.encarId) return;
    let alive = true;
    searchListings({ similar_to: listing.encarId }, 1, 6).then(r => { if (alive) setSimilar(r.listings); }).catch(() => {});
    return () => { alive = false; };
  }, [listing?.encarId]);
  const back = () => { if (location.state?.fromCatalog) navigate(-1); else navigate('/car-search'); };
  const name = listing ? [listing.brand, listing.model].filter(Boolean).join(' ') : '';
  const price = listing?.importPrice ? `~${formatNumber(Math.round(listing.importPrice.total))} €` : t('listing.request');
  const title = t('listing.seo').replace('{name}', name).replace('{year}', String(listing?.year ?? '')).replace('{price}', price);
  const canonical = `https://key4u.bg${listing ? listingPath(listing) : location.pathname}`;
  const description = listing ? `${name} ${listing.year ?? ''} · ${formatNumber(listing.mileage)} ${t('catalog.mileageUnit')} · ${listing.specs['Гориво'] ?? ''} · ${price}. ${t('listing.sharePrice').replace('~{n} €', '')}` : t('listing.unavailable');
  const draft = t('inquiry.viberMessage').replace('{title}', listing?.title ?? '').replace('{link}', canonical);
  return <main className="listing-bottom-space min-w-0 flex-1 bg-background pt-20">
    <Helmet><title>{listing ? title : t('listing.loading')}</title><meta name="description" content={description} /><link rel="canonical" href={canonical} /><meta property="og:title" content={title} /><meta property="og:description" content={description} /><meta property="og:url" content={canonical} /><meta property="og:type" content="website" /><meta name="robots" content={failed || (!loading && !listing) ? 'noindex, follow' : 'index, follow'} /></Helmet>
    <div className="container mx-auto px-4">
      <div className="mb-5 flex items-center justify-between gap-2"><Button variant="ghost" className="min-h-11 min-w-0 whitespace-normal px-0 text-left" onClick={back}><ArrowLeft className="mr-2 h-4 w-4 shrink-0" />{t('listing.back')}</Button>{listing && <ListingShare listing={listing} />}</div>
      {!listing && loading ? <div className="grid gap-6 md:grid-cols-2"><Skeleton className="aspect-[4/3]" /><Skeleton className="h-96" /></div> : listing ? <ListingContent key={listing.encarId} listing={listing} /> : <div className="py-20"><p className="mb-4">{t('listing.unavailable')}</p><Button onClick={() => window.location.reload()}>{t('listing.loading')}</Button></div>}
      {similar.length > 0 && <section className="mt-12 border-t border-border pt-8"><h2 className="mb-5 text-xl font-bold">{t('listing.similar')}</h2><div className="-mx-4 flex gap-4 overflow-x-auto overscroll-contain px-4 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {similar.map(car => <Link key={car.encarId} to={listingPath(car)} className="w-64 shrink-0 overflow-hidden rounded-lg border border-border bg-card md:w-auto"><img src={encarImg(car.photos[0] ?? car.thumb, 640)} alt={car.title} loading="lazy" className="aspect-[4/3] w-full object-cover" /><div className="space-y-2 p-3"><h3 className="line-clamp-2 font-semibold">{car.title}</h3><p className="text-sm text-muted-foreground">{car.year} · {formatNumber(car.mileage)} {t('catalog.mileageUnit')}</p><p className="font-bold text-primary">{car.importPrice ? `~${formatNumber(Math.round(car.importPrice.total))} €` : t('listing.request')}</p></div></Link>)}
      </div></section>}
    </div>
    {listing && <div className="catalog-safe-bottom fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-3 border-t border-border bg-background p-3 md:hidden"><Button asChild className="min-h-12"><a href={`tel:${CONTACT_PHONE}`}><Phone className="mr-2 h-5 w-5" />{t('listing.call')}</a></Button><Button asChild variant="outline" className="contact-viber min-h-12"><a href={`viber://chat?number=${encodeURIComponent(CONTACT_PHONE)}&draft=${encodeURIComponent(draft)}`}><ViberIcon className="mr-2 h-5 w-5" />Viber</a></Button></div>}
  </main>;
}
