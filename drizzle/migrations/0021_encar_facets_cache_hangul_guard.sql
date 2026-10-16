CREATE OR REPLACE FUNCTION public.encar_sanitize_facets_payload(_payload jsonb, _grouped boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $fn$
DECLARE result jsonb := '{}'::jsonb; k text; v jsonb; cleaned jsonb;
BEGIN
 IF _grouped THEN
  SELECT coalesce(jsonb_agg((SELECT jsonb_object_agg(e.key, CASE WHEN jsonb_typeof(e.value)='string' AND (e.value #>> '{}') ~ '[가-힣]' THEN 'null'::jsonb ELSE e.value END) FROM jsonb_each(item) e)), '[]'::jsonb)
  INTO cleaned FROM jsonb_array_elements(_payload) item;
  RETURN cleaned;
 END IF;
 FOR k,v IN SELECT key,value FROM jsonb_each(_payload) LOOP
  IF jsonb_typeof(v)='array' THEN
   SELECT coalesce(jsonb_agg(item), '[]'::jsonb) INTO cleaned FROM jsonb_array_elements(v) item
   WHERE NOT (coalesce(item->>'value','') ~ '[가-힣]' OR coalesce(item->>'slug','') ~ '[가-힣]' OR coalesce(item->>'name','') ~ '[가-힣]' OR (jsonb_typeof(item)='string' AND (item #>> '{}') ~ '[가-힣]'));
   result := result || jsonb_build_object(k,cleaned);
  ELSE result := result || jsonb_build_object(k,v);
  END IF;
 END LOOP;
 RETURN result;
END;
$fn$;
CREATE OR REPLACE FUNCTION public.encar_facets_cache_sanitize_trigger()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $fn$
BEGIN
 NEW.payload := public.encar_sanitize_facets_payload(NEW.payload, NEW.key='categorical_groups');
 RETURN NEW;
END;
$fn$;
CREATE TRIGGER encar_facets_cache_no_hangul BEFORE INSERT OR UPDATE OF payload ON public.encar_facets_cache FOR EACH ROW EXECUTE FUNCTION public.encar_facets_cache_sanitize_trigger();