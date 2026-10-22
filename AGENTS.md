# Architecture rules

- LanguageContext preserves its context identity in Vite hot data so mounted providers and refreshed consumers cannot diverge during preview updates; the missing-provider guard remains strict.

- Car inquiries validate and persist server-side before emailing; a returned Resend error fails the request and only a returned email ID confirms acceptance, preventing false success.
- Listing inquiries use a dedicated inline form with canonical /kola links; validation accepts these and legacy /car-search links so previously sent emails remain usable.

- The desktop catalog aside is the sticky, viewport-height scroll container and aligns at flex-start, preventing stretched parents from delaying filter scrolling; overscroll containment isolates wheel gestures from the results page.
- The mobile filter sheet uses a dynamic-viewport-height clipped flex shell with nonshrinking header/footer and one native-touch middle scroll container, keeping controls reachable without scrolling the locked background.

- Brand/model controls use desktop FacetDropdowns and in-sheet full-screen MobileFacetPicker below 768px; keeping touch scroll inside the sheet avoids modal scroll-lock interference, while qualified brand:model keys preserve dependent selections.
- Catalog base models use the shared modelBase normalizer plus equivalent database functions/write guard; model_scope=base selects additive RPCs/caches and model_base_slug while legacy clients and original listing titles retain generation-specific names.
- Conditional model-name shortening requires exact standalone-name evidence scoped to the same brand; use indexed candidate lookups rather than catalog-wide scans, and correct already-filled rows through cursor-bounded protected maintenance after rule updates.
- Listing pages parse the final Encar ID through shared listingRoute helpers; catalog navigation records loaded results and scroll in bounded in-memory snapshots so Back restores the list without re-fetching.
- Share HTML fetches one listing through listings-search, keeping preview pricing identical; similar_to uses bounded brand/base/year price-neighbour queries without schema changes.
- Embla handles gallery swipes and react-zoom-pan-pinch handles fullscreen zoom; modal body locking isolates photo gestures.
- Catalog backfill and base-cache refresh run only through service-role RPCs and the secret-protected catalog-maintenance function; never expose maintenance credentials or grant public write access.

- Catalog year, price, and mileage fields share PresetOrInput with unique suggestion lists; year validation stays in a tested helper so desktop and mobile apply identical complete-year rules.
- Catalog filter popovers, portaled numeric presets and sort selects share the scoped catalog-dropdown-panel style; trigger-width positioning keeps desktop/mobile aligned without altering the global popover theme.

- Search and facets share the pricing-limit helper for calculated-price eligibility and EUR-filter ceilings, so configurable limits never diverge while original-price sorting remains unchanged.

- Navigation owns route-aware scroll appearance and uses the global photo-header style only at the homepage top; other pages and expanded menus retain the solid header for legibility.- Encar data enters encar_listings only through the shared _shared/upsertListings.ts helper (used by listings-ingest and encar-sync), so price-history and first_seen_at rules stay identical.
- encar-sync sends all *.encar.com requests through ENCAR_PROXY_URL, because Encar blocks cloud server IPs.
- Default and categorical catalog facets use a scheduled grouped database cache; numeric filters scan one source, with taxonomy fallback to preserve choices under sync load.
- Encar detail normalization and response facet sanitization share a tested text-safety helper; a database trigger sanitizes every facet-cache write to protect cached fallback reads.
- Search distinguishes absent saved IDs from an explicit empty scope; empty saved searches return locally and the server rejects empty ID scopes to avoid exposing the full catalog as favorites.
- Encar model/category bodies are resolved through the protected model mapping table cached per sync invocation; shared upserts preserve existing non-null bodies so detail classifications are never lost.
- Body-category mapping uses Encar-provided facet expressions and size-bounded grouped queries to preserve punctuation and avoid rejected URLs; backfill updates only null classifications through indexed batches.
- encar_listings raw_data/photos have planner statistics disabled (SET STATISTICS 0), because analyzing those large JSON columns stalled autovacuum for hours and timed out the catalog.
- Customer contact details (email, Viber invite link) come from the shared constants in src/lib/contact.ts; static files that cannot import them (index.html structured data, public/llms.txt) must repeat the same literal value, and a test guards against stale spellings.
