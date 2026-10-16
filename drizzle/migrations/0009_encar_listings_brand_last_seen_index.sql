CREATE INDEX IF NOT EXISTS idx_el_active_brand_last_seen ON public.encar_listings (brand_slug, last_seen_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_el_active_brand_model_last_seen ON public.encar_listings (brand_slug, model_slug, last_seen_at DESC) WHERE status = 'active';
ANALYZE public.encar_listings;