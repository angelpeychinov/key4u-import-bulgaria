export const slugToken = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export function listingPath(car: { brand?: string; modelBase?: string; model?: string; year?: number; encarId?: string }) {
  return `/kola/${[slugToken(car.brand || "car"), slugToken(car.modelBase || car.model || "listing"), car.year || "unknown", car.encarId].filter(Boolean).join("-")}`;
}
export const listingIdFromSlug = (slug: string) => slug.match(/-(\d{1,20})$/)?.[1] ?? null;
export const validListingId = (id: string) => /^\d{1,20}$/.test(id);
export function closestListings<T extends { encarId?: string; priceKrw?: number }>(cars: T[], current: T, limit = 6) {
  return cars.filter(c => c.encarId !== current.encarId).sort((a, b) => {
    if (current.priceKrw === undefined) return 0;
    return Math.abs((a.priceKrw ?? Infinity) - current.priceKrw) - Math.abs((b.priceKrw ?? Infinity) - current.priceKrw);
  }).slice(0, limit);
}
