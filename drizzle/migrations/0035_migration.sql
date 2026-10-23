-- Light, non-blocking: add a content hash column so sync upserts can skip
-- unchanged rows instead of re-writing ~161k full rows (raw_data/photos JSONB)
-- on every crawl. No backfill: NULL means "unknown" and is derived lazily at
-- upsert time from the row's current columns, then stored on first sighting.
ALTER TABLE public.encar_listings ADD COLUMN IF NOT EXISTS content_hash text;