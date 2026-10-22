import { expect, test } from 'bun:test';
import { listingShareUrl } from '../src/lib/listingNavigation';
import { nativeListingShare } from '../src/lib/nativeListingShare';
import { allowedPhotoUrl } from '../supabase/functions/photo-proxy/url';

const data = { title: 'BMW X5', text: 'Photo and price\n👉 https://key4u-import-bulgaria.lovable.app/kola/bmw-x5-2011-42462707', url: 'https://key4u-import-bulgaria.lovable.app/kola/bmw-x5-2011-42462707' };
const file = new File(['jpeg'], 'bmw-x5-2011-42462707.jpg', { type: 'image/jpeg' });

test('sharing uses the clean published listing URL', () => {
  expect(listingShareUrl({ id: '1', brand: 'BMW', modelBase: 'X5', year: 2011, encarId: '42462707', title: 'BMW X5', photos: [], specs: {} })).toBe(data.url);
});
test('native sharing prefers JPEG file, title and linked text without a duplicate URL', async () => {
  const calls: ShareData[] = [];
  expect(await nativeListingShare({ canShare: d => d?.files?.[0] === file, share: async d => { calls.push(d); } }, data, file)).toBe(true);
  expect(calls).toEqual([{ files: [file], title: data.title, text: data.text }]);
});
test('unsupported files share text and clean link', async () => {
  const calls: ShareData[] = [];
  await nativeListingShare({ canShare: () => false, share: async d => { calls.push(d); } }, data, file);
  expect(calls).toEqual([data]);
});
test('file failure falls back to text then menu when both fail', async () => {
  const calls: ShareData[] = [];
  expect(await nativeListingShare({ canShare: () => true, share: async d => { calls.push(d); throw new Error('Unavailable'); } }, data, file)).toBe(false);
  expect(calls).toEqual([{ files: [file], title: data.title, text: data.text }, data]);
});
test('missing photo shares text and link', async () => {
  const calls: ShareData[] = [];
  await nativeListingShare({ canShare: () => true, share: async d => { calls.push(d); } }, data);
  expect(calls).toEqual([data]);
});
test('user cancellation does not reopen another share flow', async () => {
  let calls = 0;
  expect(await nativeListingShare({ canShare: () => true, share: async () => { calls++; throw new DOMException('Cancelled', 'AbortError'); } }, data, file)).toBe(true);
  expect(calls).toBe(1);
});
test('photo proxy only allows HTTPS ci.encar.com without credentials or alternate ports', () => {
  expect(allowedPhotoUrl('https://ci.encar.com/carpicture/a.jpg')?.hostname).toBe('ci.encar.com');
  for (const url of ['http://ci.encar.com/a.jpg', 'https://ci.encar.com.evil.test/a.jpg', 'https://example.test/a.jpg', 'https://ci.encar.com@127.0.0.1/a', 'https://user:pass@ci.encar.com/a', 'https://ci.encar.com:8443/a', 'file:///a', '']) expect(allowedPhotoUrl(url)).toBeNull();
});