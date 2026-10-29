# Roadmap

- [x] Privacy policy and consent: exact BG copy in both languages, footer/banner/sitemap links, shared required consent UI, nullable server-generated consent_at without backfill. At 390px both forms blocked unchecked and accepted one real marked test each (HTTP 200, sent, timestamps verified); 13 tests passed, build OK. Website not published. Server accepts legacy omitted consent with null timestamp so unchanged published forms keep working until publication.

- [x] Stability task (2026-10-23, NOT published, cron schedules untouched): (1a) full crawl only Sunday 03:00–05:59 Sofia, ≥6 days apart, resumable batched windows; (1b) content_hash column (light migration, no backfill) + skip-unchanged upserts with skinny touches, price history only on real change — 5 new tests; (1c) facets 4.5s race → cached default fallback, deployed; (1d) catalog auto-retries once after 3s then shows friendly block (Опитай пак / Viber / 0898 25 24 34); (2) native selects in mobile sheet (year/price/mileage/sort), useHistoryLayer back-gesture handling that preserves filter URLs, verified 390px touch + back flows (BMW filter survived sheet close: 15 073 results); (3) SITE_URL=https://key4u.bg, text-only share with exact approved BG text verified on a real listing, photo-proxy deployed but unused. encar-sync/listings-ingest/listings-facets deployed; 144 tests pass; build OK. Functions deployed ≠ site published.

- [x] Focused listing share fix: all share controls use SITE_URL + clean listing path; JPEG prepared before tap through deployed host-restricted photo-proxy (CDN CORS confirmed), with text/menu fallbacks. Real listing at 390px exercised with instrumented native APIs: JPEG bytes/name/type, unsupported/missing/failed photo, text failure, Viber/Facebook/copy URLs; desktop menu checked, 12 tests pass, build OK. Actual Viber app receipt cannot be tested here. Existing share endpoint left deployed and unused; website not published.

- [x] Part 2 UI: listing pages/legacy redirect, retained list filters/sort/loaded results and exact scroll, galleries/swipe/pinch, sticky contacts, native/fallback sharing, six similar cars, mobile card swipe/load-more, single filter heading. Real 390px + desktop flows verified; 94 tests pass. No publishing/database maintenance.
- [ ] Part 2 rich previews: share endpoint deployed and tested (crawler 200 with OG body and 300s cache, browser 302 to requested published origin), but managed gateway rewrites HTML to text/plain. BLOCKED: requires HTML-capable public hosting/SSR proxy for real rich cards; native Viber/Facebook apps not directly testable here. New listing routes are preview-only until owner publishes.

- [ ] Part 1 model-base addendum: shared helper and 35 tests pass for leading codes, conditional subnames and Hyundai Starex. BLOCKED: database migration timed out; pending SQL in .lovable/pending-model-base-addendum.sql must be applied, then wire indexed standalone lookups into shared upsert, add protected correction action, deploy affected functions, correct existing rows and include new mappings in final report. Nothing published or deployed.

- [x] Part 1 addendum: dynamic-height mobile sheet with anchored header/results button and one touch-scroll area; 390px native touch emulation reaches both boundaries, background stays at scrollY=0, screenshots checked; desktop sticky/independent scrolling unchanged. Real-data sections remain unavailable during the existing catalog outage. Not published.

- [ ] Part 1 catalog: code/schema implemented; 34 filter tests pass, desktop/mobile screen layout checked. BLOCKED by Cloud pooler outage: complete base-model backfill (last confirmed 81,991/210,477), refresh counts, top-60 mappings/suspicious report, real touch multi-select/priced-only/Back/scroll end-to-end checks. Do not publish. Maintenance requires healthy database connections; nothing continues after this turn.

- [x] All catalog dropdowns and numeric suggestions share white scoped panels, field-width alignment and 4px gaps; numeric panels have no pointer and show spaced price/mileage labels with units and plain years; desktop/mobile browser measurements and screenshots verified, presets/validation/internal scrolling checked, 8 filter tests pass; not published.

- [x] FindCar "Откъде да търсим?" chips (Канада/САЩ/Южна Корея multi, Без значение exclusive default); sent as `origin` array, server-validated, email row "Откъде: …" near the top; send-car-request deployed; 6 new validation tests; browser-verified; not published.

- [x] Inquiry fixes: Resend errors return 500 and successful ids are logged; inline listing form, validated attached car and working deep link; submissions persist server-only; deployed and exactly one real browser test accepted (200, email id 01a1494d-547d-7a90-82d7-f01074dc6bb8), database row verified then test row removed; 11 tests pass; desktop/mobile checked; not published.

- [x] Contact email standardised to key4u.import@gmail.com via shared CONTACT_EMAIL constant in src/lib/contact.ts; SEO.tsx/Contact/Footer/ListingDialog import it; index.html schema + public/llms.txt literals corrected; 2 tests guard the constant and ban old spellings; live Contact, footer and car dialog show the correct address; not published.


- [x] Multi-select brands and qualified models: grouped desktop/mobile checkbox dropdowns and clear actions, qualified URL/chips, shared per-brand selection semantics, array facets RPC with grouped-cache path; search/facets deployed; 17 tests passed; real BMW+Audi and BMW X5+Audi verified (search/facet counts both 5,445), dependent removal and compact mobile labels verified; not published.

- [x] Temporary expensive-car pricing: max_priced_krw configured at 100M; shared cutoff and EUR filter ceiling; 14 tests passed; search/facets deployed; real 860M car shows on-request in card/dialog with checklist, 50M car retains ~39,220 EUR; original KRW sorting preserved; not published.

- [x] Encar sync: treat Price 9999 and 99999 (만원) as "price on request" → price_original NULL via shared priceKrwOr helper; 25 tests pass, encar-sync + encar-body-map deployed; 22 stale placeholder rows nulled via the maintenance action; not published.

- [x] Korea dialog price box redesign: itemized euro breakdown removed, always-visible box with "Прогнозна цена", "Цена в Корея" in ₩, "Включено в цената" checklist and optional insurance; on-request variant keeps its block plus the checklist; verified in browser; not published.

- [x] Finish Encar body backfill: 188,534 / 188,555 active (100.0%); 21 left are Encar "기타" (other) models. Not published.
- [x] Unstick DB: 6h autovacuum ANALYZE cleared by restart; raw_data/photos statistics set to 0; key columns analyzed; search/facets < 2 s; incremental sync succeeds again.

- [x] Review monitoring findings: timeout evidence stale (current search/facets succeed); empty saved search fixed and verified through save/remove-last-car flow, tests passed, server deployed.

- [x] Prevent Hangul in detail body/color writes and facet responses/cache; both functions deployed, 36 tests passed, default/BMW responses and cache verified clean; not published.

- [x] Make Korea facets fast with a default/grouped cache, single-source scan, 10-minute scheduled refresh, and resilient brand/model fallback; live checks: default 0.52s, BMW 0.72s, brands/models visible; not published.

- [x] Korea hero: photo background (user-uploaded car image, CDN asset) — done
- [x] Korea hero: 25% taller section — done
- [x] Homepage: transparent header with white content over the photo, restoring the existing header on scroll.
- [x] Korea page (/car-search) restored — live in header, route, sitemap, llms.txt, robots.txt (2026-10-16).
- [ ] Delivered cars page (/delivered) paused — hidden from header, route, sitemap, llms.txt. Restore when ready; needs real delivered cars + photos.
