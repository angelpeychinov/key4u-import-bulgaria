CREATE OR REPLACE FUNCTION public.encar_facets(_brand text DEFAULT NULL, _model text DEFAULT NULL, _year_from integer DEFAULT NULL, _year_to integer DEFAULT NULL, _price_min bigint DEFAULT NULL, _price_max bigint DEFAULT NULL, _mileage_min integer DEFAULT NULL, _mileage_max integer DEFAULT NULL, _fuels text[] DEFAULT NULL, _transmissions text[] DEFAULT NULL, _body_types text[] DEFAULT NULL, _regions text[] DEFAULT NULL, _no_accident boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql STABLE SET search_path = public SET plan_cache_mode = force_custom_plan AS $fn$
DECLARE cached_groups jsonb; result jsonb;
BEGIN
 IF _year_from IS NULL AND _year_to IS NULL AND _price_min IS NULL AND _price_max IS NULL AND _mileage_min IS NULL AND _mileage_max IS NULL AND NOT coalesce(_no_accident,false) THEN
  SELECT payload INTO cached_groups FROM public.encar_facets_cache WHERE key = 'categorical_groups';
 END IF;
WITH source AS MATERIALIZED (
 SELECT brand_slug,model_slug,brand_name,model_name,fuel_type,transmission,body_type,region,n
 FROM jsonb_to_recordset(coalesce(cached_groups,'[]'::jsonb)) AS c(brand_slug text,model_slug text,brand_name text,model_name text,fuel_type text,transmission text,body_type text,region text,n bigint)
 UNION ALL
 SELECT brand_slug,model_slug,brand_name,model_name,fuel_type,transmission,body_type,region,1::bigint
 FROM public.encar_listings
 WHERE cached_groups IS NULL AND status='active'
 AND (_year_from IS NULL OR year >= _year_from) AND (_year_to IS NULL OR year <= _year_to)
 AND (_price_min IS NULL OR price_original >= _price_min) AND (_price_max IS NULL OR price_original <= _price_max)
 AND (_mileage_min IS NULL OR mileage >= _mileage_min) AND (_mileage_max IS NULL OR mileage <= _mileage_max)
 AND (NOT coalesce(_no_accident,false) OR has_accident=false)
), grouped AS (
 SELECT f.kind, f.value, max(f.name) AS name, sum(s.n) AS cnt
 FROM (
  SELECT brand_slug, model_slug, brand_name, model_name, fuel_type, coalesce(transmission, 'auto') AS tr, body_type, region,
   coalesce(_brand IS NULL OR brand_slug = _brand, false) AS b,
   coalesce(_model IS NULL OR model_slug = _model, false) AS m,
   coalesce(_fuels IS NULL OR fuel_type = ANY(_fuels), false) AS fuel,
   coalesce(_transmissions IS NULL OR coalesce(transmission, 'auto') = ANY(_transmissions), false) AS trans,
   coalesce(_body_types IS NULL OR body_type = ANY(_body_types), false) AS body,
   coalesce(_regions IS NULL OR region = ANY(_regions), false) AS reg,
   n FROM source
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
 WHERE f.keep GROUP BY f.kind, f.value
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
) INTO result;
RETURN result;
END;
$fn$;
CREATE OR REPLACE FUNCTION public.encar_refresh_default_facets()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public SET statement_timeout = '120s' AS $fn$
DECLARE v jsonb;
BEGIN
 IF NOT pg_try_advisory_xact_lock(hashtext('encar_default_facets_refresh')) THEN RETURN; END IF;
 SELECT jsonb_agg(to_jsonb(c)) INTO v FROM (
  SELECT brand_slug,model_slug,max(brand_name) AS brand_name,max(model_name) AS model_name,fuel_type,coalesce(transmission,'auto') AS transmission,body_type,region,count(*) AS n
  FROM public.encar_listings WHERE status='active'
  GROUP BY brand_slug,model_slug,fuel_type,coalesce(transmission,'auto'),body_type,region
 ) c;
 INSERT INTO public.encar_facets_cache(key,payload,updated_at) VALUES ('categorical_groups',coalesce(v,'[]'::jsonb),now())
 ON CONFLICT(key) DO UPDATE SET payload=EXCLUDED.payload,updated_at=EXCLUDED.updated_at;
 v := public.encar_facets();
 INSERT INTO public.encar_facets_cache(key,payload,updated_at) VALUES ('default',v,now())
 ON CONFLICT(key) DO UPDATE SET payload=EXCLUDED.payload,updated_at=EXCLUDED.updated_at;
END;
$fn$;
GRANT EXECUTE ON FUNCTION public.encar_refresh_default_facets() TO postgres;