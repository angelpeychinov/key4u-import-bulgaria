CREATE TABLE public.encar_facets_cache (
 key text PRIMARY KEY,
 payload jsonb NOT NULL DEFAULT '{}'::jsonb,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.encar_facets_cache TO anon, authenticated;
GRANT ALL ON public.encar_facets_cache TO service_role;
ALTER TABLE public.encar_facets_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Default facets are public" ON public.encar_facets_cache FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.encar_facets(_brand text DEFAULT NULL, _model text DEFAULT NULL, _year_from integer DEFAULT NULL, _year_to integer DEFAULT NULL, _price_min bigint DEFAULT NULL, _price_max bigint DEFAULT NULL, _mileage_min integer DEFAULT NULL, _mileage_max integer DEFAULT NULL, _fuels text[] DEFAULT NULL, _transmissions text[] DEFAULT NULL, _body_types text[] DEFAULT NULL, _regions text[] DEFAULT NULL, _no_accident boolean DEFAULT false)
RETURNS jsonb LANGUAGE sql STABLE SET search_path = public SET plan_cache_mode = force_custom_plan AS $fn$
WITH grouped AS (
 SELECT f.kind, f.value, max(f.name) AS name, count(*) AS cnt
 FROM (
  SELECT brand_slug, model_slug, brand_name, model_name, fuel_type, coalesce(transmission, 'auto') AS tr, body_type, region,
   coalesce(_brand IS NULL OR brand_slug = _brand, false) AS b,
   coalesce(_model IS NULL OR model_slug = _model, false) AS m,
   coalesce(_fuels IS NULL OR fuel_type = ANY(_fuels), false) AS fuel,
   coalesce(_transmissions IS NULL OR coalesce(transmission, 'auto') = ANY(_transmissions), false) AS trans,
   coalesce(_body_types IS NULL OR body_type = ANY(_body_types), false) AS body,
   coalesce(_regions IS NULL OR region = ANY(_regions), false) AS reg
  FROM public.encar_listings
  WHERE status = 'active'
   AND (_year_from IS NULL OR year >= _year_from)
   AND (_year_to IS NULL OR year <= _year_to)
   AND (_price_min IS NULL OR price_original >= _price_min)
   AND (_price_max IS NULL OR price_original <= _price_max)
   AND (_mileage_min IS NULL OR mileage >= _mileage_min)
   AND (_mileage_max IS NULL OR mileage <= _mileage_max)
   AND (NOT coalesce(_no_accident, false) OR has_accident = false)
 ) s
 CROSS JOIN LATERAL (VALUES
  ('total', ''::text, NULL::text, b AND m AND fuel AND trans AND body AND reg),
  ('brands', brand_slug, brand_name, fuel AND trans AND body AND reg AND brand_slug IS NOT NULL),
  ('models', model_slug, model_name, b AND fuel AND trans AND body AND reg AND model_slug IS NOT NULL),
  ('fuels', fuel_type, NULL::text, b AND m AND trans AND body AND reg AND fuel_type IS NOT NULL),
  ('transmissions', tr, NULL::text, b AND m AND fuel AND body AND reg),
  ('body_types', body_type, NULL::text, b AND m AND fuel AND trans AND reg AND body_type IS NOT NULL),
  ('regions', region, NULL::text, b AND m AND fuel AND trans AND body AND region IS NOT NULL)
 ) f(kind, value, name, keep)
 WHERE f.keep
 GROUP BY f.kind, f.value
), arrays AS (
 SELECT kind, jsonb_agg(
  CASE WHEN kind IN ('brands', 'models') THEN jsonb_build_object('slug', value, 'name', coalesce(name, value), 'count', cnt)
  ELSE jsonb_build_object('value', value, 'count', cnt) END ORDER BY cnt DESC, value
 ) AS items FROM grouped WHERE kind <> 'total' GROUP BY kind
)
SELECT jsonb_build_object(
 'total', coalesce((SELECT cnt FROM grouped WHERE kind = 'total'), 0),
 'brands', coalesce((SELECT items FROM arrays WHERE kind = 'brands'), '[]'::jsonb),
 'models', coalesce((SELECT items FROM arrays WHERE kind = 'models'), '[]'::jsonb),
 'fuels', coalesce((SELECT items FROM arrays WHERE kind = 'fuels'), '[]'::jsonb),
 'transmissions', coalesce((SELECT items FROM arrays WHERE kind = 'transmissions'), '[]'::jsonb),
 'body_types', coalesce((SELECT items FROM arrays WHERE kind = 'body_types'), '[]'::jsonb),
 'regions', coalesce((SELECT items FROM arrays WHERE kind = 'regions'), '[]'::jsonb)
);
$fn$;
ALTER FUNCTION public.encar_facets(text,text,integer,integer,bigint,bigint,integer,integer,text[],text[],text[],text[],boolean) RESET statement_timeout;

CREATE OR REPLACE FUNCTION public.encar_refresh_default_facets()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public SET statement_timeout = '120s' AS $fn$
DECLARE v jsonb;
BEGIN
 IF NOT pg_try_advisory_xact_lock(hashtext('encar_default_facets_refresh')) THEN RETURN; END IF;
 v := public.encar_facets();
 INSERT INTO public.encar_facets_cache(key, payload, updated_at) VALUES ('default', v, now())
 ON CONFLICT (key) DO UPDATE SET payload = EXCLUDED.payload, updated_at = EXCLUDED.updated_at;
END;
$fn$;
REVOKE ALL ON FUNCTION public.encar_refresh_default_facets() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.encar_refresh_default_facets() TO service_role;