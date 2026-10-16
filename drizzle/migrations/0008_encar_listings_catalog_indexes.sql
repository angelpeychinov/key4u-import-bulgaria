CREATE INDEX IF NOT EXISTS idx_el_status_last_seen ON public.encar_listings (status, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_el_status_brand_model ON public.encar_listings (status, brand_slug, model_slug);
CREATE INDEX IF NOT EXISTS idx_el_status_year ON public.encar_listings (status, year);
CREATE INDEX IF NOT EXISTS idx_el_status_mileage ON public.encar_listings (status, mileage);
CREATE INDEX IF NOT EXISTS idx_el_status_price ON public.encar_listings (status, price_original);
CREATE INDEX IF NOT EXISTS idx_el_status_fuel ON public.encar_listings (status, fuel_type);
CREATE INDEX IF NOT EXISTS idx_el_active_no_accident ON public.encar_listings (has_accident) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_el_status_brand_name ON public.encar_listings (status, brand_slug, brand_name);
CREATE INDEX IF NOT EXISTS idx_el_active_models ON public.encar_listings (brand_slug, model_slug, model_name) WHERE status = 'active';