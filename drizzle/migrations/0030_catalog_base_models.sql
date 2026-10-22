ALTER TABLE public.encar_listings ADD COLUMN IF NOT EXISTS model_base text, ADD COLUMN IF NOT EXISTS model_base_slug text;
CREATE OR REPLACE FUNCTION public.encar_model_base(_model text, _brand text DEFAULT '') RETURNS text LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $$
DECLARE name text; previous text; brand_pattern text;
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
 RETURN nullif(coalesce(nullif(btrim(name),''),btrim(_model)), '');
END; $$;
CREATE OR REPLACE FUNCTION public.encar_model_base_slug(_model text, _brand text DEFAULT '') RETURNS text LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT nullif(trim(both '-' from regexp_replace(lower(public.encar_model_base(_model,_brand)), '[^a-z0-9]+', '-', 'g')), '') $$;
GRANT EXECUTE ON FUNCTION public.encar_model_base(text,text), public.encar_model_base_slug(text,text) TO service_role;
CREATE INDEX IF NOT EXISTS encar_active_base_model_idx ON public.encar_listings (brand_slug,model_base_slug,last_seen_at DESC,encar_id DESC) WHERE status='active';
CREATE INDEX IF NOT EXISTS encar_base_backfill_idx ON public.encar_listings (id) WHERE model_base_slug IS NULL AND model_name IS NOT NULL;
COMMENT ON COLUMN public.encar_listings.model_slug IS 'Legacy generation-specific slug retained for original listings and older clients; current catalog filters use model_base_slug.';
CREATE OR REPLACE FUNCTION public.encar_base_models(_brand text) RETURNS TABLE(name text,slug text) LANGUAGE sql STABLE SET search_path=public AS $$ SELECT max(model_base),model_base_slug FROM public.encar_listings WHERE status='active' AND brand_slug=_brand AND model_base_slug IS NOT NULL GROUP BY model_base_slug ORDER BY max(model_base) $$;
GRANT EXECUTE ON FUNCTION public.encar_base_models(text) TO anon,authenticated,service_role;