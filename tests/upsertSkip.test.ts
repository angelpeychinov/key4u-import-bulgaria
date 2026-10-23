import { expect, test } from 'bun:test';
import { contentHash, upsertListings } from '../supabase/functions/_shared/upsertListings';

// Minimal supabase stub: records upsert batches, serves `existing` on select.
const makeSupabase = (existing: Record<string, unknown>[]) => {
  const calls = { upserts: [] as Record<string, unknown>[][] };
  const client = {
    from: () => ({
      select: () => ({ in: () => Promise.resolve({ data: existing, error: null }) }),
      upsert: (rows: Record<string, unknown>[]) => { calls.upserts.push(rows); return Promise.resolve({ error: null }); },
      update: () => ({ is: () => ({ in: () => Promise.resolve({ error: null }) }) }),
    }),
  };
  return { client, calls };
};

const row = { encar_id: '1', brand_name: 'BMW', model_name: 'X5', year: 2020, price_original: 30000000, mileage: 50000, photos: ['a.jpg'] };
const stored = (extra: Record<string, unknown> = {}) => ({
  ...row, body_type: 'suv', last_seen_at: new Date().toISOString(), ...extra,
});

test('unchanged rows are skipped — no full-row upsert, only a skinny touch', async () => {
  const ex = stored();
  ex.content_hash = contentHash({ ...ex });
  const { client, calls } = makeSupabase([ex]);
  const res = await upsertListings(client, [row], { translate: false });
  expect(res).toEqual({ inserted: 0, updated: 0, skipped: 1 });
  // No upsert at all: hash known and last_seen_at is fresh.
  expect(calls.upserts).toEqual([]);
});

test('unchanged row with stale last_seen_at gets a skinny touch, not a rewrite', async () => {
  const ex = stored({ last_seen_at: new Date(Date.now() - 24 * 3600e3).toISOString() });
  ex.content_hash = contentHash({ ...ex });
  const { client, calls } = makeSupabase([ex]);
  await upsertListings(client, [row], { translate: false });
  expect(calls.upserts.length).toBe(1);
  expect(Object.keys(calls.upserts[0][0]).sort()).toEqual(['encar_id', 'last_seen_at']);
});

test('legacy row without content_hash is not rewritten; hash is stored via touch', async () => {
  const { client, calls } = makeSupabase([stored()]);
  const res = await upsertListings(client, [row], { translate: false });
  expect(res.skipped).toBe(1);
  expect(calls.upserts.length).toBe(1);
  const touch = calls.upserts[0][0];
  expect(touch.encar_id).toBe('1');
  expect(typeof touch.content_hash).toBe('string');
  expect(touch.price_original).toBeUndefined();
});

test('a real price change rewrites the row and records price history', async () => {
  const ex = stored();
  ex.content_hash = contentHash({ ...ex });
  const { client, calls } = makeSupabase([ex]);
  const res = await upsertListings(client, [{ ...row, price_original: 28000000 }], { translate: false });
  expect(res.updated).toBe(1);
  const written = calls.upserts[0][0];
  expect(written.previous_price_krw).toBe(30000000);
  expect(written.price_changed_at).toBeTruthy();
  expect(written.content_hash).toBeTruthy();
});

test('new rows are inserted with a content hash', async () => {
  const { client, calls } = makeSupabase([]);
  const res = await upsertListings(client, [row], { translate: false });
  expect(res).toEqual({ inserted: 1, updated: 0, skipped: 0 });
  expect(calls.upserts[0][0].content_hash).toBeTruthy();
});
