# Part 2 — Listing pages and sharing

1. Replace listing popups with individual `/kola/:slug` pages, redirect old links, and preserve catalog filters, loaded pages and scroll on Back.
2. Reuse the existing details/price/inquiry layout; add swipe galleries, zoomable fullscreen photos and mobile fixed call/Viber actions.
3. Add native sharing plus Viber/copy/Facebook alternatives, with public cached HTML previews through the `share` function.
4. Add six similar cars, mobile card-photo swiping and Load more; remove card regions and the duplicate mobile filter heading.
5. Test real listings at 390px and desktop, check previews and report one working share link. Do not publish, restart or backfill.

## Technical details
- Shared slug/share helpers keep frontend and preview URLs consistent. Canonicals use key4u.bg; share redirects use the explicitly requested published Lovable domain.
- Similar cars reuse listings-search with indexed brand/base/year restrictions and bounded nearest-price queries, without schema changes.
- Keep per-page Helmet metadata; social crawlers receive static metadata from the share function.
- Deploy only the changed functions for testing; website publication remains untouched.
