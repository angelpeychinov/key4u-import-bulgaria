create index if not exists encar_listings_facet_cover_idx
  on public.encar_listings (brand_slug, model_slug, model_name, brand_name, fuel_type, transmission, body_type, region, year, price_original, mileage, has_accident)
  where status = 'active';