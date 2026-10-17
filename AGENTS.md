# Architecture rules

- Navigation owns route-aware scroll appearance and uses the global photo-header style only at the homepage top; other pages and expanded menus retain the solid header for legibility.- Encar data enters encar_listings only through the shared _shared/upsertListings.ts helper (used by listings-ingest and encar-sync), so price-history and first_seen_at rules stay identical.
- encar-sync sends all *.encar.com requests through ENCAR_PROXY_URL, because Encar blocks cloud server IPs.
- Default and categorical catalog facets use a scheduled grouped database cache; numeric filters scan one source, with taxonomy fallback to preserve choices under sync load.
- Encar detail normalization and response facet sanitization share a tested text-safety helper; a database trigger sanitizes every facet-cache write to protect cached fallback reads.
- Search distinguishes absent saved IDs from an explicit empty scope; empty saved searches return locally and the server rejects empty ID scopes to avoid exposing the full catalog as favorites.
- Encar model/category bodies are resolved through the protected model mapping table cached per sync invocation; shared upserts preserve existing non-null bodies so detail classifications are never lost.
- Body-category mapping uses Encar-provided facet expressions and size-bounded grouped queries to preserve punctuation and avoid rejected URLs; backfill updates only null classifications through indexed batches.
- encar_listings raw_data/photos have planner statistics disabled (SET STATISTICS 0), because analyzing those large JSON columns stalled autovacuum for hours and timed out the catalog.
