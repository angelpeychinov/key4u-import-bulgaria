import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { encarImg } from '@/lib/listings';
import { useLanguage } from '@/contexts/LanguageContext';
export function ListingGallery({ photos, title, onZoom }: { photos: string[]; title: string; onZoom: (n: number) => void }) {
  const { t } = useLanguage();
  const [ref, api] = useEmblaCarousel({ loop: true });
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!api) return;
    const update = () => setIndex(api.selectedScrollSnap());
    api.on('select', update).on('reInit', update); update();
    return () => { api.off('select', update).off('reInit', update); };
  }, [api]);
  useEffect(() => {
    [index - 1, index + 1].forEach(n => { const src = encarImg(photos[(n + photos.length) % photos.length], 1000); if (src) { const image = new Image(); image.src = src; } });
  }, [photos, index]);
  return <div className="min-w-0 space-y-2">
    <div className="relative overflow-hidden rounded-lg bg-muted">
      <div ref={ref} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {photos.map((photo, i) => <Button key={`${photo}-${i}`} variant="ghost" className="block h-auto min-w-0 flex-[0_0_100%] rounded-none p-0" onClick={() => { if (api?.clickAllowed()) onZoom(i); }} aria-label={`${t('listing.zoom')} ${i + 1}`}>
            <img src={encarImg(photo, 1000)} alt={`${title} ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} className="aspect-[4/3] max-h-[55vh] w-full object-cover md:max-h-[420px]" />
          </Button>)}
        </div>
      </div>
      {photos.length > 1 && <><Button size="icon" variant="secondary" className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 md:flex" aria-label={t('listing.prev')} onClick={() => api?.scrollPrev()}><ChevronLeft /></Button><Button size="icon" variant="secondary" className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 md:flex" aria-label={t('listing.next')} onClick={() => api?.scrollNext()}><ChevronRight /></Button></>}
      <span className="photo-counter absolute bottom-3 right-3 rounded-md px-3 py-1 text-sm">{index + 1}/{photos.length}</span>
    </div>
    <div className="flex gap-2 overflow-x-auto overscroll-contain pb-1">
      {photos.map((p, i) => <Button key={`${p}-${i}`} variant="ghost" className={`h-auto w-20 shrink-0 overflow-hidden rounded-md p-0 ${i === index ? 'ring-2 ring-primary' : 'opacity-70'}`} aria-label={`${t('listing.gallery')} ${i + 1}`} aria-current={i === index} onClick={() => api?.scrollTo(i)}><img src={encarImg(p, 240)} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" /></Button>)}
    </div>
  </div>;
}
