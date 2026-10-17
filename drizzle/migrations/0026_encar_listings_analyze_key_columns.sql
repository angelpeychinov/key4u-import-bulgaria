SET LOCAL statement_timeout = '300s';
ANALYZE public.encar_listings (status, brand_slug, model_slug, price_original, year, mileage, body_type, fuel_type, region, last_seen_at, has_accident);