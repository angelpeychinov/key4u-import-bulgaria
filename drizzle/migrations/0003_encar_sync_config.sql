CREATE TABLE public.encar_sync_config (key text PRIMARY KEY, value text NOT NULL);
GRANT ALL ON public.encar_sync_config TO service_role;
ALTER TABLE public.encar_sync_config ENABLE ROW LEVEL SECURITY;