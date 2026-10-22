import type { Listing, SearchResult } from './listings';
export { listingPath, listingIdFromSlug, closestListings } from '../../supabase/functions/_shared/listingRoute';
export const catalogSnapshots = new Map<string, { result: SearchResult; scroll: number; loadedPage: number }>();
export const listingShareUrl = (car: Listing) => `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/share?id=${encodeURIComponent(car.encarId ?? '')}`;
