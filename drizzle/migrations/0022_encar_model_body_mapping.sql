CREATE TABLE public.encar_model_body (
 manufacturer text NOT NULL,
 model text NOT NULL,
 category text NOT NULL,
 body_type text NOT NULL,
 category_count bigint NOT NULL DEFAULT 0,
 PRIMARY KEY (manufacturer, model)
);
GRANT ALL ON public.encar_model_body TO service_role;
ALTER TABLE public.encar_model_body ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.encar_backfill_model_body(_limit integer DEFAULT 3000)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public SET statement_timeout = '120s' AS $$
DECLARE affected integer;
BEGIN
 IF _limit < 1 OR _limit > 10000 THEN RAISE EXCEPTION 'Invalid batch size'; END IF;
 WITH batch AS (
  SELECT l.id, m.body_type FROM public.encar_listings l
  JOIN public.encar_model_body m ON m.manufacturer = l.raw_data->>'Manufacturer' AND m.model = l.raw_data->>'Model'
  WHERE l.body_type IS NULL LIMIT _limit FOR UPDATE OF l SKIP LOCKED
 ) UPDATE public.encar_listings l SET body_type = batch.body_type FROM batch WHERE l.id = batch.id AND l.body_type IS NULL;
 GET DIAGNOSTICS affected = ROW_COUNT;
 RETURN affected;
END $$;
REVOKE ALL ON FUNCTION public.encar_backfill_model_body(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.encar_backfill_model_body(integer) TO service_role;