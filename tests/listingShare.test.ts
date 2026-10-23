import { expect, test } from 'bun:test';
import { listingShareUrl } from '../src/lib/listingNavigation';
import { nativeListingShare } from '../src/lib/nativeListingShare';
import { buildListingShareText } from '../src/lib/listingShareText';
import { allowedPhotoUrl } from '../supabase/functions/photo-proxy/url';
import { formatNumber, type Listing } from '../src/lib/listings';

const car: Listing = {
  id: '1', brand: 'BMW', model: 'X5 (G05)', modelBase: 'X5', year: 2011, encarId: '42462707',
  title: 'BMW X5', photos: [], specs: { 'Гориво': 'Дизел', 'Скоростна кутия': 'Автоматична' },
  mileage: 112340, importPrice: { price: 9000, transport: 2200, handling: 1050, total: 12250 },
};
const url = 'https://key4u.bg/kola/bmw-x5-2011-42462707';

test('sharing uses the clean published listing URL on key4u.bg', () => {
  expect(listingShareUrl(car)).toBe(url);
});

test('share text matches the approved format with price and short transmission', () => {
  expect(buildListingShareText(car)).toBe(
    `🇰🇷 BMW X5 2011 от Южна Корея\n${formatNumber(112340)} км · Дизел · Автоматик\n💶 ~${formatNumber(12250)} € до България, с всичко включено\n\n📞 За повече информация – 0898 25 24 34\n${url}`,
  );
});

test('price-on-request listings use the request line', () => {
  const text = buildListingShareText({ ...car, importPrice: undefined });
  expect(text).toContain('💶 Цена при запитване');
  expect(text).not.toContain('€ до България');
});

test('missing specs are skipped instead of printing placeholders', () => {
  const text = buildListingShareText({ ...car, mileage: undefined, specs: {} });
  expect(text).toBe(`🇰🇷 BMW X5 2011 от Южна Корея\n💶 ~${formatNumber(12250)} € до България, с всичко включено\n\n📞 За повече информация – 0898 25 24 34\n${url}`);
  expect(text).not.toContain('—');
});

test('manual gearbox shares as Ръчна', () => {
  const text = buildListingShareText({ ...car, specs: { 'Скоростна кутия': 'Ръчна' } });
  expect(text).toContain('· Ръчна');
});

test('native share sends text only — no url field, no files', async () => {
  const calls: ShareData[] = [];
  expect(await nativeListingShare({ share: async d => { calls.push(d); } }, { text: 'hello\nhttps://key4u.bg/kola/x' })).toBe(true);
  expect(calls).toEqual([{ text: 'hello\nhttps://key4u.bg/kola/x' }]);
});

test('missing native share opens the fallback menu', async () => {
  expect(await nativeListingShare({}, { text: 'x' })).toBe(false);
});

test('share failure opens the fallback menu, cancellation does not', async () => {
  expect(await nativeListingShare({ share: async () => { throw new Error('Unavailable'); } }, { text: 'x' })).toBe(false);
  expect(await nativeListingShare({ share: async () => { throw new DOMException('Cancelled', 'AbortError'); } }, { text: 'x' })).toBe(true);
});

test('photo proxy only allows HTTPS ci.encar.com without credentials or alternate ports', () => {
  expect(allowedPhotoUrl('https://ci.encar.com/carpicture/a.jpg')?.hostname).toBe('ci.encar.com');
  for (const u of ['http://ci.encar.com/a.jpg', 'https://ci.encar.com.evil.test/a.jpg', 'https://example.test/a.jpg', 'https://ci.encar.com@127.0.0.1/a', 'https://user:pass@ci.encar.com/a', 'https://ci.encar.com:8443/a', 'file:///a', '']) expect(allowedPhotoUrl(u)).toBeNull();
});
