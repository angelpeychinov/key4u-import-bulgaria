# Architecture rules

- Navigation owns route-aware scroll appearance and uses the global photo-header style only at the homepage top; other pages and expanded menus retain the solid header for legibility.- Encar data enters encar_listings only through the shared _shared/upsertListings.ts helper (used by listings-ingest and encar-sync), so price-history and first_seen_at rules stay identical.
- encar-sync sends all *.encar.com requests through ENCAR_PROXY_URL, because Encar blocks cloud server IPs.
- Default catalog facets are read from a scheduled database cache; filtered facets use a single-source aggregation and taxonomy fallback, so sync load cannot erase brand/model choices.
