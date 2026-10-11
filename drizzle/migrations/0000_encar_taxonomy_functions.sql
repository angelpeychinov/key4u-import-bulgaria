CREATE OR REPLACE FUNCTION public.encar_brands()
RETURNS TABLE(name text, slug text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT DISTINCT ON (brand_slug) brand_name, brand_slug
  FROM public.encar_listings
  WHERE status = 'active' AND brand_name IS NOT NULL AND brand_slug IS NOT NULL
  ORDER BY brand_slug, brand_name;
$$;

CREATE OR REPLACE FUNCTION public.encar_models(_brand text)
RETURNS TABLE(name text, slug text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT DISTINCT ON (model_slug) model_name, model_slug
  FROM public.encar_listings
  WHERE status = 'active' AND brand_slug = _brand AND model_name IS NOT NULL AND model_slug IS NOT NULL
  ORDER BY model_slug, model_name;
$$;

GRANT EXECUTE ON FUNCTION public.encar_brands() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.encar_models(text) TO anon, authenticated, service_role;