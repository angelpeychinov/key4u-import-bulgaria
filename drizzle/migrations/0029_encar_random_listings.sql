CREATE OR REPLACE FUNCTION public.encar_random_listings(_n integer DEFAULT 24)
RETURNS SETOF public.encar_listings
LANGUAGE sql VOLATILE
SET search_path TO 'public'
SET statement_timeout TO '5s'
AS $$
  SELECT * FROM public.encar_listings TABLESAMPLE SYSTEM (1)
  WHERE status='active' AND price_original BETWEEN 5000000 AND 100000000
    AND jsonb_array_length(photos) > 0
  ORDER BY random()
  LIMIT least(greatest(coalesce(_n,24),1),48);
$$;
GRANT EXECUTE ON FUNCTION public.encar_random_listings(integer) TO anon, authenticated, service_role;