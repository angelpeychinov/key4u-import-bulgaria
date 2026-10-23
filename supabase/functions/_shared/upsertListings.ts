// Shared bulk upsert for encar_listings (used by listings-ingest and encar-sync).
// - dedupes encar_id within the batch
// - skips rows whose displayed content is unchanged (content_hash), so crawls
//   no longer re-write ~161k full rows (incl. raw_data/photos JSONB) every run
// - unchanged rows get at most a skinny touch (content_hash backfill and/or a
//   last_seen_at bump when it is older than SEEN_BUMP_MS) — never a full rewrite
// - records previous_price_krw / price_changed_at only on a real price change
// - sets first_seen_at only for new rows
// deno-lint-ignore-file no-explicit-any
import { translateListing } from "./encarMaps.ts";
import { normalizeModelBase } from "./modelBase.ts";
import { preserveBody } from "./encarModelBody.ts";

// Re-bump last_seen_at at most every 6 h per row: incremental sync re-sees the
// same rows every run, and full-run mark-sold only needs a weekly refresh.
const SEEN_BUMP_MS = 6 * 3600_000;

// Fields a visitor can see or sort/filter by. raw_data and derived columns
// (model_base*, timestamps) are deliberately excluded.
const HASH_FIELDS = [
  "brand_name", "model_name", "trim", "year", "price_original", "mileage",
  "fuel_type", "transmission", "body_type", "color", "region", "engine_cc",
  "thumb", "photos", "listing_url", "source_code",
] as const;

// cyrb53 — fast 53-bit string hash; per-listing change detection, not security.
export const contentHash = (row: Record<string, any>): string => {
  const str = JSON.stringify(HASH_FIELDS.map((f) => row[f] ?? null));
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
};

const EXISTING_COLS =
  "encar_id, price_original, body_type, content_hash, last_seen_at, " +
  HASH_FIELDS.join(", ");

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function upsertListings(
  supabase: any,
  rawListings: Array<Record<string, any>>,
  opts: { translate?: boolean } = {},
): Promise<{ inserted: number; updated: number; skipped: number }> {
  const byId = new Map<string, Record<string, any>>();
  for (const l of rawListings) {
    if (l?.encar_id) byId.set(String(l.encar_id), opts.translate === false ? l : translateListing(l));
  }
  const listings = Array.from(byId.values());
  if (listings.length === 0) return { inserted: 0, updated: 0, skipped: 0 };
  const encarIds = listings.map((l) => String(l.encar_id));

  const { data: existingRows, error: selectError } = await supabase
    .from("encar_listings")
    .select(EXISTING_COLS)
    .in("encar_id", encarIds);
  if (selectError) throw new Error("Select failed: " + selectError.message);

  const existing = new Map<string, Record<string, any>>(
    (existingRows ?? []).map((r: any) => [String(r.encar_id), r]),
  );

  const nowIso = new Date().toISOString();
  const nowMs = Date.now();
  const rows: Record<string, unknown>[] = [];
  const touches: Record<string, unknown>[] = [];
  let skipped = 0;

  for (const l of listings) {
    const id = String(l.encar_id);
    const ex = existing.get(id);
    const row: Record<string, unknown> = {
      ...l,
      ...normalizeModelBase(l.model_name, l.brand_name),
      status: "active",
      last_seen_at: nowIso,
    };
    row.body_type = preserveBody(l.body_type, ex?.body_type);
    delete row.first_seen_at; // never overwrite on existing rows
    const hash = contentHash(row);
    row.content_hash = hash;

    if (!ex) {
      rows.push(row);
      continue;
    }

    // Rows predating content_hash: derive the hash from their current columns
    // instead of re-writing the whole row once.
    const knownHash = typeof ex.content_hash === "string" && ex.content_hash
      ? ex.content_hash
      : contentHash(ex);

    if (knownHash === hash) {
      skipped++;
      const touch: Record<string, unknown> = { encar_id: id };
      if (!ex.content_hash) touch.content_hash = hash;
      const seenMs = ex.last_seen_at ? Date.parse(ex.last_seen_at) : 0;
      if (!seenMs || nowMs - seenMs > SEEN_BUMP_MS) touch.last_seen_at = nowIso;
      if ("content_hash" in touch || "last_seen_at" in touch) touches.push(touch);
      continue;
    }

    const prev = ex.price_original as number | null;
    if (prev != null && l.price_original != null && prev !== l.price_original) {
      row.previous_price_krw = prev;
      row.price_changed_at = nowIso;
    }
    rows.push(row);
  }

  if (rows.length) {
    const { error: upsertError } = await supabase
      .from("encar_listings")
      .upsert(rows, { onConflict: "encar_id" });
    if (upsertError) throw new Error("Upsert failed: " + upsertError.message);
  }

  // Skinny touches: only encar_id + content_hash/last_seen_at, no JSON columns.
  for (const part of chunk(touches, 500)) {
    const { error } = await supabase
      .from("encar_listings")
      .upsert(part, { onConflict: "encar_id" });
    if (error) console.error("touch upsert failed", error);
  }

  if (rows.length) {
    const { error: backfillError } = await supabase
      .from("encar_listings")
      .update({ first_seen_at: nowIso })
      .is("first_seen_at", null)
      .in("encar_id", encarIds);
    if (backfillError) console.error("first_seen_at backfill failed", backfillError);
  }

  const inserted = encarIds.length - existing.size;
  return { inserted, updated: rows.length - inserted, skipped };
}
