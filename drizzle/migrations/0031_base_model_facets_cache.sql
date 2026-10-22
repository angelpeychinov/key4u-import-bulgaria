CREATE OR REPLACE FUNCTION public.encar_base_facets(_brands text[], _models text[], _year_from integer DEFAULT NULL, _year_to integer DEFAULT NULL, _price_min bigint DEFAULT NULL, _price_max bigint DEFAULT NULL, _mileage_min integer DEFAULT NULL, _mileage_max integer DEFAULT NULL, _fuels text[] DEFAULT NULL, _transmissions text[] DEFAULT NULL, _body_types text[] DEFAULT NULL, _regions text[] DEFAULT NULL, _no_accident boolean DEFAULT false) RETURNS jsonb LANGUAGE plpgsql STABLE SET search_path=public SET plan_cache_mode=force_custom_plan AS $$
DECLARE cached_groups jsonb; result jsonb; restricted_brands text[];
BEGIN
 SELECT array_agg(DISTINCT split_part(v,':',1)) INTO restricted_brands FROM unnest(_models) v;
 IF _year_from IS NULL AND _year_to IS NULL AND _price_min IS NULL AND _price_max IS NULL AND _mileage_min IS NULL AND _mileage_max IS NULL AND NOT coalesce(_no_accident,false) THEN SELECT payload INTO cached_groups FROM public.encar_facets_cache WHERE key='base_categorical_groups'; END IF;
 WITH source AS MATERIALIZED (
 SELECT brand_slug,model_slug,brand_name,model_name,fuel_type,transmission,body_type,region,n FROM jsonb_to_recordset(coalesce(cached_groups,'[]'::jsonb)) AS c(brand_slug text,model_slug text,brand_name text,model_name text,fuel_type text,transmission text,body_type text,region text,n bigint)
 UNION ALL SELECT brand_slug,model_base_slug,brand_name,model_base,fuel_type,transmission,body_type,region,1::bigint FROM public.encar_listings WHERE cached_groups IS NULL AND status='active' AND (_year_from IS NULL OR year>=_year_from) AND (_year_to IS NULL OR year<=_year_to) AND (_price_min IS NULL OR price_original>=_price_min) AND (_price_max IS NULL OR price_original<=_price_max) AND (_mileage_min IS NULL OR mileage>=_mileage_min) AND (_mileage_max IS NULL OR mileage<=_mileage_max) AND (NOT coalesce(_no_accident,false) OR has_accident=false)
 ), grouped AS (
 SELECT f.kind,f.value,max(f.name) name,sum(s.n) cnt FROM (
 SELECT *,coalesce(transmission,'auto') tr,coalesce(coalesce(cardinality(_brands),0)=0 OR brand_slug=ANY(_brands),false) b,coalesce(restricted_brands IS NULL OR NOT(brand_slug=ANY(restricted_brands)) OR (brand_slug||':'||model_slug)=ANY(_models),false) m,coalesce(_fuels IS NULL OR fuel_type=ANY(_fuels),false) fuel,coalesce(_transmissions IS NULL OR coalesce(transmission,'auto')=ANY(_transmissions),false) trans,coalesce(_body_types IS NULL OR body_type=ANY(_body_types),false) body FROM source
 ) s CROSS JOIN LATERAL (VALUES
 ('total',''::text,NULL::text,b AND m AND fuel AND trans AND body),('brands',brand_slug,brand_name,fuel AND trans AND body AND brand_slug IS NOT NULL),('models',brand_slug||':'||model_slug,model_name,b AND fuel AND trans AND body AND model_slug IS NOT NULL AND brand_slug IS NOT NULL),('fuels',fuel_type,NULL::text,b AND m AND trans AND body AND fuel_type IS NOT NULL),('transmissions',tr,NULL::text,b AND m AND fuel AND body),('body_types',body_type,NULL::text,b AND m AND fuel AND trans AND body_type IS NOT NULL)
 ) f(kind,value,name,keep) WHERE f.keep GROUP BY f.kind,f.value
 ), arrays AS (SELECT kind,jsonb_agg(CASE WHEN kind IN('brands','models') THEN jsonb_build_object('slug',value,'name',coalesce(name,value),'count',cnt) ELSE jsonb_build_object('value',value,'count',cnt) END ORDER BY cnt DESC,value) items FROM grouped WHERE kind<>'total' GROUP BY kind)
 SELECT jsonb_build_object('total',coalesce((SELECT cnt FROM grouped WHERE kind='total'),0),'brands',coalesce((SELECT items FROM arrays WHERE kind='brands'),'[]'::jsonb),'models',coalesce((SELECT items FROM arrays WHERE kind='models'),'[]'::jsonb),'fuels',coalesce((SELECT items FROM arrays WHERE kind='fuels'),'[]'::jsonb),'transmissions',coalesce((SELECT items FROM arrays WHERE kind='transmissions'),'[]'::jsonb),'body_types',coalesce((SELECT items FROM arrays WHERE kind='body_types'),'[]'::jsonb),'regions','[]'::jsonb) INTO result;
 RETURN result;
END; $$;
GRANT EXECUTE ON FUNCTION public.encar_base_facets(text[],text[],integer,integer,bigint,bigint,integer,integer,text[],text[],text[],text[],boolean) TO anon,authenticated,service_role;
CREATE OR REPLACE FUNCTION public.encar_backfill_base_models(_limit integer DEFAULT 500) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET statement_timeout='25s' AS $$ DECLARE affected integer; BEGIN
 WITH batch AS(SELECT id FROM public.encar_listings WHERE model_base_slug IS NULL AND model_name IS NOT NULL ORDER BY id LIMIT least(greatest(_limit,1),3000) FOR UPDATE SKIP LOCKED) UPDATE public.encar_listings l SET model_base=public.encar_model_base(l.model_name,l.brand_name),model_base_slug=public.encar_model_base_slug(l.model_name,l.brand_name) FROM batch WHERE l.id=batch.id;
 GET DIAGNOSTICS affected=ROW_COUNT; RETURN affected; END; $$;
REVOKE ALL ON FUNCTION public.encar_backfill_base_models(integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.encar_backfill_base_models(integer) TO service_role;
CREATE OR REPLACE FUNCTION public.encar_refresh_base_facets() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET statement_timeout='120s' AS $$ DECLARE v jsonb; BEGIN
 IF NOT pg_try_advisory_xact_lock(hashtext('encar_base_facets_refresh')) THEN RETURN; END IF;
 SELECT jsonb_agg(to_jsonb(c)) INTO v FROM(SELECT brand_slug,model_base_slug model_slug,max(brand_name) brand_name,max(model_base) model_name,fuel_type,coalesce(transmission,'auto') transmission,body_type,region,count(*) n FROM public.encar_listings WHERE status='active' GROUP BY brand_slug,model_base_slug,fuel_type,coalesce(transmission,'auto'),body_type,region)c;
 INSERT INTO public.encar_facets_cache(key,payload,updated_at) VALUES('base_categorical_groups',coalesce(v,'[]'::jsonb),now()) ON CONFLICT(key) DO UPDATE SET payload=EXCLUDED.payload,updated_at=EXCLUDED.updated_at;
 v:=public.encar_base_facets(NULL::text[],NULL::text[]);
 INSERT INTO public.encar_facets_cache(key,payload,updated_at) VALUES('base_default',v,now()) ON CONFLICT(key) DO UPDATE SET payload=EXCLUDED.payload,updated_at=EXCLUDED.updated_at;
 END; $$;
REVOKE ALL ON FUNCTION public.encar_refresh_base_facets() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.encar_refresh_base_facets() TO service_role,postgres;
CREATE OR REPLACE FUNCTION public.encar_refresh_base_cache_trigger() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NEW.key='categorical_groups' THEN PERFORM public.encar_refresh_base_facets(); END IF; RETURN NEW; END; $$;
CREATE TRIGGER encar_refresh_base_cache AFTER INSERT OR UPDATE OF payload ON public.encar_facets_cache FOR EACH ROW EXECUTE FUNCTION public.encar_refresh_base_cache_trigger();