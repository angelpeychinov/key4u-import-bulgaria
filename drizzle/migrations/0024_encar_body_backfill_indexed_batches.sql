CREATE OR REPLACE FUNCTION public.encar_backfill_model_body(_limit integer DEFAULT 3000)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public SET statement_timeout = '120s' AS $$
DECLARE affected integer := 0; changed integer; r record;
BEGIN
 IF _limit < 1 OR _limit > 10000 THEN RAISE EXCEPTION 'Invalid batch size'; END IF;
 FOR r IN SELECT l.id,m.body_type FROM public.encar_model_body m JOIN public.encar_listings l ON m.manufacturer=l.raw_data->>'Manufacturer' AND m.model=l.raw_data->>'Model' WHERE l.body_type IS NULL LIMIT _limit FOR UPDATE OF l SKIP LOCKED LOOP
  UPDATE public.encar_listings SET body_type=r.body_type WHERE id=r.id AND body_type IS NULL;
  GET DIAGNOSTICS changed = ROW_COUNT; affected := affected + changed;
 END LOOP;
 RETURN affected;
END $$;
REVOKE ALL ON FUNCTION public.encar_backfill_model_body(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.encar_backfill_model_body(integer) TO service_role;