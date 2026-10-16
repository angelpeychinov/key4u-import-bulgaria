CREATE TABLE public.encar_listing_details (
  encar_id text PRIMARY KEY REFERENCES public.encar_listings(encar_id) ON DELETE CASCADE,
  vehicle jsonb,
  inspection jsonb,
  record jsonb,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  error text
);
GRANT SELECT ON public.encar_listing_details TO anon, authenticated;
GRANT ALL ON public.encar_listing_details TO service_role;
ALTER TABLE public.encar_listing_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listing details are publicly readable" ON public.encar_listing_details FOR SELECT TO anon, authenticated USING (true);