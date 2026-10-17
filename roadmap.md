# Roadmap

- [ ] Align and restyle all catalog dropdowns and numeric suggestions; verify desktop/mobile; do not publish.

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
