-- Pending: apply through the migration tool when catalog connections recover.
CREATE INDEX IF NOT EXISTS encar_standalone_model_lookup_idx ON public.encar_listings (brand_name, model_name);
CREATE OR REPLACE FUNCTION public.encar_model_base_with_known(_model text, _brand text, _known text[]) RETURNS text LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $$
DECLARE name text; previous text; brand_pattern text; candidate text; canonical text; words text[]; i integer;
BEGIN
 name := btrim(regexp_replace(regexp_replace(coalesce(_model,''), '\([^)]*\)', ' ', 'g'), '\s+', ' ', 'g'));
 brand_pattern := regexp_replace(coalesce(_brand,''), '([.\\+*?\[\]^$(){}=!<>|:\-])', '\\\1', 'g');
 previous := NULL;
 WHILE previous IS DISTINCT FROM name LOOP
  previous := name;
  name := regexp_replace(name, '^(The New|All New|New|The|All)\s+', '', 'i');
  IF brand_pattern <> '' THEN name := regexp_replace(name, '^' || brand_pattern || '\s+', '', 'i'); END IF;
 END LOOP;
 previous := NULL;
 WHILE previous IS DISTINCT FROM name LOOP
  previous := name;
  name := regexp_replace(name, '\s+(\d+(st|nd|rd|th)\s+Gen|Gen\s+\d+|Facelift)$', '', 'i');
  name := regexp_replace(name, '\s+[A-Z0-9]{2,4}$', '');
 END LOOP;
 name := coalesce(nullif(btrim(name),''),btrim(_model));
 IF lower(btrim(_brand))='hyundai' AND lower(name)='grand starex' THEN name := 'Starex'; END IF;
 IF NOT EXISTS (SELECT 1 FROM unnest(coalesce(_known,ARRAY[]::text[])) v WHERE lower(btrim(v))=lower(name)) THEN
  candidate := regexp_replace(name, '^[A-Z]{2}\s+', '');
  SELECT btrim(v) INTO canonical FROM unnest(coalesce(_known,ARRAY[]::text[])) v WHERE lower(btrim(v))=lower(candidate) LIMIT 1;
  IF candidate IS DISTINCT FROM name AND canonical IS NOT NULL THEN name := canonical;
  ELSE
   words := string_to_array(name,' ');
   IF cardinality(words)>1 THEN
    FOR i IN REVERSE cardinality(words)-1..1 LOOP
     candidate := array_to_string(words[1:i],' ');
     SELECT btrim(v) INTO canonical FROM unnest(coalesce(_known,ARRAY[]::text[])) v WHERE lower(btrim(v))=lower(candidate) LIMIT 1;
     IF canonical IS NOT NULL THEN name := canonical; EXIT; END IF;
    END LOOP;
   END IF;
  END IF;
 END IF;
 RETURN nullif(name,'');
END; $$;
REVOKE ALL ON FUNCTION public.encar_model_base_with_known(text,text,text[]) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.encar_model_base_with_known(text,text,text[]) TO service_role;
CREATE OR REPLACE FUNCTION public.encar_standalone_model_names(_brand text, _candidates text[]) RETURNS text[] LANGUAGE sql STABLE SET search_path=public AS $$
 SELECT coalesce(array_agg(candidate ORDER BY candidate),ARRAY[]::text[]) FROM (SELECT DISTINCT unnest(_candidates) candidate) c WHERE EXISTS (SELECT 1 FROM public.encar_listings l WHERE l.brand_name=_brand AND l.model_name=c.candidate)
$$;
REVOKE ALL ON FUNCTION public.encar_standalone_model_names(text,text[]) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.encar_standalone_model_names(text,text[]) TO service_role;
CREATE OR REPLACE FUNCTION public.encar_model_base(_model text, _brand text DEFAULT '') RETURNS text LANGUAGE plpgsql STABLE SET search_path=public AS $$
DECLARE name text; words text[]; candidates text[]; i integer;
BEGIN
 name := public.encar_model_base_with_known(_model,_brand,ARRAY[]::text[]);
 IF name IS NULL THEN RETURN NULL; END IF;
 words := string_to_array(name,' ');
 IF cardinality(words)<2 THEN RETURN name; END IF;
 candidates := ARRAY[name,regexp_replace(name,'^[A-Z]{2}\s+','')];
 FOR i IN 1..cardinality(words)-1 LOOP candidates := array_append(candidates,array_to_string(words[1:i],' ')); END LOOP;
 RETURN public.encar_model_base_with_known(_model,_brand,public.encar_standalone_model_names(_brand,candidates));
END; $$;
CREATE OR REPLACE FUNCTION public.encar_model_base_slug(_model text, _brand text DEFAULT '') RETURNS text LANGUAGE sql STABLE SET search_path=public AS $$ SELECT nullif(trim(both '-' from regexp_replace(lower(public.encar_model_base(_model,_brand)), '[^a-z0-9]+', '-', 'g')), '') $$;
CREATE OR REPLACE FUNCTION public.encar_set_base_model() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN NEW.model_base:=public.encar_model_base(NEW.model_name,NEW.brand_name); NEW.model_base_slug:=nullif(trim(both '-' from regexp_replace(lower(NEW.model_base),'[^a-z0-9]+','-','g')),''); RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION public.encar_correct_base_models(_after uuid DEFAULT NULL, _limit integer DEFAULT 100) RETURNS jsonb LANGUAGE plpgsql SET search_path=public SET plan_cache_mode=force_custom_plan AS $$
DECLARE r record; name text; processed integer:=0; changed integer:=0; last_id uuid;
BEGIN
 FOR r IN SELECT id,model_name,brand_name,model_base FROM public.encar_listings WHERE (_after IS NULL OR id>_after) AND model_name IS NOT NULL ORDER BY id LIMIT least(greatest(_limit,1),500) LOOP
  processed:=processed+1; last_id:=r.id; name:=public.encar_model_base(r.model_name,r.brand_name);
  IF name IS DISTINCT FROM r.model_base THEN
   UPDATE public.encar_listings SET model_base=name,model_base_slug=nullif(trim(both '-' from regexp_replace(lower(name),'[^a-z0-9]+','-','g')),'') WHERE id=r.id AND model_name=r.model_name AND brand_name IS NOT DISTINCT FROM r.brand_name;
   changed:=changed+1;
  END IF;
 END LOOP;
 RETURN jsonb_build_object('processed',processed,'updated',changed,'after',last_id,'done',processed=0);
END; $$;
REVOKE ALL ON FUNCTION public.encar_correct_base_models(uuid,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.encar_correct_base_models(uuid,integer) TO service_role;