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
- Share HTML fetches one listing through listings-search, keeping preview pricing identical; the managed gateway rewrites HTML to text/plain, so browsers use an HTTP redirect and reliable rich previews require HTML-capable hosting.
- similar_to uses bounded brand/base/year price-neighbour queries without schema changes.
- Embla handles gallery swipes and react-zoom-pan-pinch handles fullscreen zoom; modal body locking isolates photo gestures.
- Catalog backfill and base-cache refresh run only through service-role RPCs and the secret-protected catalog-maintenance function; never expose maintenance credentials or grant public write access.

- Catalog year, price, and mileage fields share PresetOrInput with unique suggestion lists; year validation stays in a tested helper so desktop and mobile apply identical complete-year rules.
- Catalog filter popovers, portaled numeric presets and sort selects share the scoped catalog-dropdown-panel style; trigger-width positioning keeps desktop/mobile aligned without altering the global popover theme.

- Search and facets share the pricing-limit helper for calculated-price eligibility and EUR-filter ceilings, so configurable limits never diverge while original-price sorting remains unchanged.

- Navigation owns route-aware scroll appearance and uses the global photo-header style only at the homepage top; other pages and expanded menus retain the solid header for legibility.
- Encar data enters encar_listings only through _shared/upsertListings.ts (listings-ingest + encar-sync); unchanged rows are skipped via content_hash (cyrb53 over displayed fields) with at most a skinny touch (hash backfill and/or last_seen_at bump older than 6 h); price history only on real price change.
- encar-sync uses ENCAR_PROXY_URL (Encar blocks cloud IPs); full crawls start only Sunday 03:00–05:59 Sofia, ≥6 days apart, resuming via persisted windows in small batches. Cron schedules are owner-managed — do not change them.
- Default/categorical facets use a scheduled grouped cache; filtered facet requests race a 4.5 s timeout and fall back to the cached default payload; the catalog UI retries a failed search once after 3 s, then shows the friendly update block (Viber/phone).
- Encar detail normalization and facet sanitization share a tested text-safety helper; a trigger sanitizes every facet-cache write.
- Search distinguishes absent saved IDs from an explicit empty scope; empty saved searches return locally and the server rejects empty ID scopes to avoid exposing the full catalog as favorites.
- Encar model/category bodies are resolved through the protected model mapping table cached per sync invocation; shared upserts preserve existing non-null bodies so detail classifications are never lost.
- Body-category mapping uses Encar facet expressions and size-bounded grouped queries; backfill updates only null classifications through indexed batches.
- encar_listings raw_data/photos have planner statistics disabled (SET STATISTICS 0): analyzing them stalled autovacuum for hours and timed out the catalog.
- Mobile filter sheet presets and sort are native <select> (iOS wheel; portalled lists can't touch-scroll under scroll lock); desktop keeps popover/Radix. Sheet and MobileFacetPicker are useHistoryLayer history layers: Back closes only the top layer and never reverts filter URL changes.
- Listing sharing is text-only navigator.share({ text }) with the approved Bulgarian text from buildListingShareText (link inside text, no url field, no photo file); SITE_URL is the single share-destination source. photo-proxy stays deployed but unused.
- Customer contact details (email, Viber invite link) come from the shared constants in src/lib/contact.ts; static files that cannot import them (index.html structured data, public/llms.txt) must repeat the same literal value, and a test guards against stale spellings.

- Inquiry forms share PrivacyConsent and require affirmative consent; the server records its own consent_at only when true. Omitted consent remains accepted for unchanged live forms until website publication.

- Import totals and oversize classification live in the shared importPricing helper, with one exported brand/model list; search, random samples and similar listings use the same calculation to prevent pricing drift.
