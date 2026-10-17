CREATE TABLE public.car_request_submissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 created_at timestamptz NOT NULL DEFAULT now(),
 name text NOT NULL,
 phone text NOT NULL,
 email text,
 model text NOT NULL,
 request_data jsonb NOT NULL,
 email_id text,
 email_status text NOT NULL DEFAULT 'pending'
);
GRANT ALL ON public.car_request_submissions TO service_role;
ALTER TABLE public.car_request_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_only_car_requests ON public.car_request_submissions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX car_request_submissions_created_idx ON public.car_request_submissions (created_at DESC);