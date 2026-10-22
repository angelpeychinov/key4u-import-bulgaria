import type { Listing, SearchResult } from './listings';
export { listingPath, listingIdFromSlug, closestListings } from '../../supabase/functions/_shared/listingRoute';
export const catalogSnapshots = new Map<string, { result: SearchResult; scroll: number; loadedPage: number }>();
export const listingShareUrl = (car: Listing) => `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/share?id=${encodeURIComponent(car.encarId ?? '')}`;

export function rememberCatalog(key: string, snapshot: { result: SearchResult; scroll: number; loadedPage: number }) {
  if (catalogSnapshots.size >= 8) { const oldest = catalogSnapshots.keys().next().value; if (oldest) catalogSnapshots.delete(oldest); }
  catalogSnapshots.set(key, snapshot);
}
