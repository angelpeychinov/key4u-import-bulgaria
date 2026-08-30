-- Shared updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =========================
-- encar_listings
-- =========================
CREATE TABLE public.encar_listings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  encar_id text NOT NULL UNIQUE,
  brand_name text,
  brand_slug text,
  model_name text,
  model_slug text,
  trim text,
  year integer,
  price_original bigint,
  mileage integer,
  fuel_type text,
  transmission text,
  body_type text,
  color text,
  region text,
  has_accident boolean,
  engine_cc integer,
  thumb text,
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  listing_url text,
  source_code text NOT NULL DEFAULT 'encar',
  raw_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active',
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  price_changed_at timestamptz,
  previous_price_krw bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.encar_listings TO anon;
GRANT SELECT ON public.encar_listings TO authenticated;
GRANT ALL ON public.encar_listings TO service_role;

ALTER TABLE public.encar_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active listings are publicly readable"
ON public.encar_listings FOR SELECT
USING (status = 'active');

CREATE INDEX idx_encar_listings_status ON public.encar_listings (status);
CREATE INDEX idx_encar_listings_brand_slug ON public.encar_listings (brand_slug);
CREATE INDEX idx_encar_listings_model_slug ON public.encar_listings (model_slug);
CREATE INDEX idx_encar_listings_year ON public.encar_listings (year);
CREATE INDEX idx_encar_listings_price_original ON public.encar_listings (price_original);

CREATE TRIGGER update_encar_listings_updated_at
BEFORE UPDATE ON public.encar_listings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- subscribers
-- =========================
CREATE TABLE public.subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  email text NOT NULL,
  full_name text,
  phone text,
  criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_subscribers_email_lower ON public.subscribers (lower(email));
CREATE INDEX idx_subscribers_user_id ON public.subscribers (user_id);
CREATE INDEX idx_subscribers_is_active ON public.subscribers (is_active);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscribers TO authenticated;
GRANT ALL ON public.subscribers TO service_role;

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
ON public.subscribers FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscription"
ON public.subscribers FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.subscribers FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscription"
ON public.subscribers FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- notification_queue
-- =========================
CREATE TABLE public.notification_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id uuid NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES public.encar_listings(id) ON DELETE CASCADE,
  notification_type text NOT NULL DEFAULT 'new_listing',
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_queue_status ON public.notification_queue (status);
CREATE INDEX idx_notification_queue_subscriber_id ON public.notification_queue (subscriber_id);
CREATE INDEX idx_notification_queue_scheduled_for ON public.notification_queue (scheduled_for);

GRANT ALL ON public.notification_queue TO service_role;

ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_notification_queue_updated_at
BEFORE UPDATE ON public.notification_queue
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();