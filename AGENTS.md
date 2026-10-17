# Architecture rules

- Car inquiries validate and persist server-side before emailing; a returned Resend error fails the request and only a returned email ID confirms acceptance, preventing false success.
- Listing inquiries use a dedicated inline form and attach a canonical catalog deep link; CarSearch resolves listing IDs independently of current filters so emailed links open the intended car.

- The desktop catalog aside is the sticky, viewport-height scroll container and aligns at flex-start, preventing stretched parents from delaying filter scrolling; overscroll containment isolates wheel gestures from the results page.

- Brand and model controls share a portaled multi-select FacetDropdown; qualified brand:model keys and a shared selection helper preserve per-brand restrictions and dependent removal across desktop, mobile, URLs, chips, and server queries.

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
