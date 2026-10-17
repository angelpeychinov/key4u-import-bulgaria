# Roadmap

- [ ] Temporary expensive-car pricing: configurable cutoff, null calculated prices above limit, EUR filter exclusion, boundary tests, live card/dialog checks; deploy without publishing.

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
