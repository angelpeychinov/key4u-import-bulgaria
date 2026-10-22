import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
interface Props { photos: string[]; index: number | null; title?: string; onClose: () => void; onIndexChange: (n: number) => void }
export const PhotoLightbox = ({ photos, index, title, onClose, onIndexChange }: Props) => {
  const { t } = useLanguage();
  const start = useRef<{ x: number; y: number } | null>(null);
  const scale = useRef(1);
  const [loaded, setLoaded] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null && photos.length > 0;
  const go = useCallback((delta: number) => { if (index !== null && photos.length) onIndexChange((index + delta + photos.length) % photos.length); }, [index, photos.length, onIndexChange]);
  useEffect(() => { setLoaded(false); scale.current = 1; }, [index]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); if (e.key === 'Tab') { e.preventDefault(); closeRef.current?.focus(); } };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = overflow; window.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [open, onClose, go]);
  useEffect(() => { if (index === null) return; [index - 1, index + 1].forEach(n => { const src = photos[(n + photos.length) % photos.length]; if (src) { const img = new Image(); img.src = src; } }); }, [index, photos]);
  if (!open || index === null) return null;
  return createPortal(<div role="dialog" aria-modal="true" aria-label={t('listing.gallery')} className="photo-lightbox fixed inset-0 z-[150] flex items-center justify-center overflow-hidden"
    onTouchStart={e => { start.current = e.touches.length === 1 && scale.current <= 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null; }}
    onTouchMove={e => { if (e.touches.length > 1) start.current = null; }}
    onTouchEnd={e => { const first = start.current; start.current = null; const end = e.changedTouches[0]; if (!first || !end || scale.current > 1) return; const dx = end.clientX - first.x; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(end.clientY - first.y)) go(dx < 0 ? 1 : -1); }}>
    <TransformWrapper key={photos[index]} minScale={1} maxScale={5} onTransform={(_, state) => { scale.current = state.scale; }} doubleClick={{ mode: 'toggle' }}>
      <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
        <img src={photos[index]} alt={`${title ?? ''} ${index + 1}`} onLoad={() => setLoaded(true)} className={`max-h-[90dvh] max-w-full select-none object-contain ${loaded ? 'opacity-100' : 'opacity-0'}`} />
      </TransformComponent>
    </TransformWrapper>
    <Button ref={closeRef} size="icon" variant="secondary" className="absolute right-4 top-4 h-12 w-12" aria-label={t('listing.close')} onClick={onClose}><X /></Button>
    {photos.length > 1 && <><Button size="icon" variant="secondary" className="absolute left-2 h-12 w-12" aria-label={t('listing.prev')} onClick={() => go(-1)}><ChevronLeft /></Button><Button size="icon" variant="secondary" className="absolute right-2 h-12 w-12" aria-label={t('listing.next')} onClick={() => go(1)}><ChevronRight /></Button></>}
    <span className="photo-counter absolute bottom-5 rounded-md px-3 py-1">{index + 1}/{photos.length}</span>
  </div>, document.body);
};
