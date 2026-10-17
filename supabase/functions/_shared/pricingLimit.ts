export const FALLBACK_MAX_PRICED_KRW = 100_000_000;

export const resolveMaxPricedKrw = (value: number | undefined): number =>
  value !== undefined && Number.isFinite(value) && value > 0
    ? value
    : FALLBACK_MAX_PRICED_KRW;

export const hasCalculatedPrice = (krw: number, maxPricedKrw: number): boolean =>
  Number.isFinite(krw) && krw > 0 && krw <= maxPricedKrw;

// Only EUR-filtered searches have a ceiling; unfiltered price sorts remain intact.
export const filteredPriceMax = (
  priceFrom: number | undefined,
  priceTo: number | undefined,
  convertedMax: number | null,
  maxPricedKrw: number,
): number | null =>
  priceFrom !== undefined || priceTo !== undefined
    ? Math.min(convertedMax ?? maxPricedKrw, maxPricedKrw)
    : null;