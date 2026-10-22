// Shared bulk upsert for encar_listings (used by listings-ingest and encar-sync).
// - dedupes encar_id within the batch
// - sets status='active', last_seen_at=now
// - records previous_price_krw / price_changed_at when the price changed
// - sets first_seen_at only for new rows
// deno-lint-ignore-file no-explicit-any
import { translateListing } from "./encarMaps.ts";
import { modelBaseCandidates, normalizeModelBase } from "./modelBase.ts";
import { preserveBody } from "./encarModelBody.ts";

export async function upsertListings(
  supabase: any,
  rawListings: Array<Record<string, any>>,
  opts: { translate?: boolean } = {},
): Promise<{ inserted: number; updated: number }> {
  const byId = new Map<string, Record<string, any>>();
  for (const l of rawListings) {
    if (l?.encar_id) byId.set(String(l.encar_id), opts.translate === false ? l : translateListing(l));
  }
  const listings = Array.from(byId.values());
  if (listings.length === 0) return { inserted: 0, updated: 0 };
  const encarIds = listings.map((l) => String(l.encar_id));

  const knownByBrand = new Map<string, string[]>();
  const brands = [...new Set(listings.map(l => String(l.brand_name ?? "")))];
  await Promise.all(brands.map(async brand => {
    const candidates = [...new Set(listings.filter(l => String(l.brand_name ?? "") === brand).flatMap(l => modelBaseCandidates(l.model_name, brand)))];
    if (!candidates.length) return;
    const { data, error } = await supabase.from("encar_listings").select("model_name").eq("brand_name", brand).in("model_name", candidates);
    if (error) throw new Error("Standalone model lookup failed: " + error.message);
    knownByBrand.set(brand, [...new Set<string>((data ?? []).map((row: any) => row.model_name))]);
  }));

  const { data: existingRows, error: selectError } = await supabase
    .from("encar_listings")
    .select("encar_id, price_original, body_type")
    .in("encar_id", encarIds);
  if (selectError) throw new Error("Select failed: " + selectError.message);

  const oldPrice = new Map<string, number | null>(
    (existingRows ?? []).map((r: any) => [r.encar_id as string, r.price_original as number | null]),
  );

  const nowIso = new Date().toISOString();
  const oldBodies = new Map<string, unknown>((existingRows ?? []).map((r: any) => [r.encar_id, r.body_type]));
  const rows = listings.map((l) => {
    const row: Record<string, unknown> = { ...l, ...normalizeModelBase(l.model_name, l.brand_name, knownByBrand.get(String(l.brand_name ?? "")) ?? []), status: "active", last_seen_at: nowIso };
    row.body_type = preserveBody(l.body_type, oldBodies.get(String(l.encar_id)));
    delete row.first_seen_at; // never overwrite on existing rows
    const prev = oldPrice.get(String(l.encar_id));
    if (prev != null && l.price_original != null && prev !== l.price_original) {
      row.previous_price_krw = prev;
      row.price_changed_at = nowIso;
    }
    return row;
  });

  const { error: upsertError } = await supabase
    .from("encar_listings")
    .upsert(rows, { onConflict: "encar_id" });
  if (upsertError) throw new Error("Upsert failed: " + upsertError.message);

  const { error: backfillError } = await supabase
    .from("encar_listings")
    .update({ first_seen_at: nowIso })
    .is("first_seen_at", null)
    .in("encar_id", encarIds);
  if (backfillError) console.error("first_seen_at backfill failed", backfillError);

  const updated = existingRows?.length ?? 0;
  return { inserted: encarIds.length - updated, updated };
}
