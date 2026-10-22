CREATE OR REPLACE FUNCTION public.encar_backfill_base_models(_limit integer DEFAULT 500) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET statement_timeout='25s' AS $$ DECLARE affected integer:=0; r record; BEGIN
 FOR r IN SELECT id,model_name,brand_name FROM public.encar_listings WHERE model_base_slug IS NULL AND model_name IS NOT NULL ORDER BY id LIMIT least(greatest(_limit,1),3000) FOR UPDATE SKIP LOCKED LOOP
 UPDATE public.encar_listings SET model_base=public.encar_model_base(r.model_name,r.brand_name),model_base_slug=public.encar_model_base_slug(r.model_name,r.brand_name) WHERE id=r.id;
 affected:=affected+1;
 END LOOP;
 RETURN affected;
END; $$;
CREATE OR REPLACE FUNCTION public.encar_set_base_model() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN NEW.model_base:=public.encar_model_base(NEW.model_name,NEW.brand_name); NEW.model_base_slug:=public.encar_model_base_slug(NEW.model_name,NEW.brand_name); RETURN NEW; END; $$;
CREATE TRIGGER encar_set_base_model BEFORE INSERT OR UPDATE OF model_name,brand_name ON public.encar_listings FOR EACH ROW EXECUTE FUNCTION public.encar_set_base_model();