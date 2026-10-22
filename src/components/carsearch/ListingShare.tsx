import { Share2, Copy, Facebook } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { Listing, formatNumber } from '@/lib/listings';
import { listingShareUrl } from '@/lib/listingNavigation';
export function ListingShare({ listing }: { listing: Listing }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const url = listingShareUrl(listing);
  const name = [listing.brand, listing.model, listing.trim].filter(Boolean).join(' ');
  const price = listing.importPrice ? t('listing.sharePrice').replace('{n}', formatNumber(Math.round(listing.importPrice.total))) : t('listing.request');
  const text = `🚗 ${name} · ${listing.year ?? '—'}\n📍 ${formatNumber(listing.mileage)} ${t('catalog.mileageUnit')} · ${listing.specs['Гориво'] ?? '—'} · ${listing.specs['Скоростна кутия'] ?? '—'}\n💶 ${price}\n👉 ${url}`;
  return <DropdownMenu open={open} onOpenChange={setOpen}>
    <DropdownMenuTrigger asChild><Button variant="outline" className="min-h-11" onPointerDown={e => {
      e.preventDefault();
    }} onClick={async e => {
      e.preventDefault();
      if (window.innerWidth >= 768 || !navigator.share) { setOpen(!open); return; }
      try { await navigator.share({ title: listing.title, text, url }); }
      catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setOpen(true); }
    }}><Share2 className="mr-2 h-4 w-4" />{t('listing.share')}</Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem asChild><a href={`viber://forward?text=${encodeURIComponent(text)}`}>Viber</a></DropdownMenuItem>
      <DropdownMenuItem onClick={async () => { try { await navigator.clipboard.writeText(url); toast.success(t('listing.copied')); } catch { toast.error(t('listing.copyError')); } }}><Copy className="mr-2 h-4 w-4" />{t('listing.copy')}</DropdownMenuItem>
      <DropdownMenuItem asChild><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer"><Facebook className="mr-2 h-4 w-4" />Facebook</a></DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
