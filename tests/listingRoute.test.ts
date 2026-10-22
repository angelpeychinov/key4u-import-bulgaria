import { expect, test } from 'bun:test';
import { listingPath, listingIdFromSlug, validListingId, closestListings, similarYearBounds } from '../supabase/functions/_shared/listingRoute';
import { shareHtml } from '../supabase/functions/_shared/shareHtml';
test('listing slug uses brand base model year and final Encar ID', () => {
  expect(listingPath({ brand: 'Hyundai', modelBase: 'Palisade', year: 2022, encarId: '42939237' })).toBe('/kola/hyundai-palisade-2022-42939237');
  expect(listingIdFromSlug('hyundai-palisade-2022-42939237')).toBe('42939237');
});
test('share endpoint IDs accept digits only', () => { expect(validListingId('42939237')).toBe(true); expect(validListingId('42939237<script>')).toBe(false); expect(validListingId('')).toBe(false); });
test('similar candidates exclude current car and prioritize closest price', () => {
  expect(closestListings([{encarId:'1',priceKrw:50},{encarId:'2',priceKrw:45},{encarId:'3',priceKrw:90}], {encarId:'1',priceKrw:50})).toEqual([{encarId:'2',priceKrw:45},{encarId:'3',priceKrw:90}]);
});
test('share destination uses requested published origin and no user supplied origin', () => {
  const html = shareHtml({brand:'Hyundai',modelBase:'Palisade',year:2022,encarId:'42939237'}, 'https://example.test/share?id=42939237');
  expect(html.includes('https://key4u-import-bulgaria.lovable.app/kola/hyundai-palisade-2022-42939237')).toBe(true);
});

test("similar listing years are exactly current year plus/minus two", () => { expect(similarYearBounds(2022)).toEqual({ from: 2020, to: 2024 }); });
