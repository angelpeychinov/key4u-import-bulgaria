CREATE TABLE public.encar_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'running',
  pages int NOT NULL DEFAULT 0,
  upserted int NOT NULL DEFAULT 0,
  marked_sold int NOT NULL DEFAULT 0,
  error text,
  windows_built boolean NOT NULL DEFAULT false,
  build_maker_idx int NOT NULL DEFAULT 0
);
CREATE TABLE public.encar_sync_windows (
  id bigserial PRIMARY KEY,
  run_id uuid NOT NULL REFERENCES public.encar_sync_runs(id) ON DELETE CASCADE,
  maker text NOT NULL,
  car_type text NOT NULL,
  price_lo int,
  price_hi int,
  total int NOT NULL DEFAULT 0,
  next_offset int NOT NULL DEFAULT 0,
  fetched int NOT NULL DEFAULT 0,
  done boolean NOT NULL DEFAULT false
);
CREATE INDEX encar_sync_windows_run_idx ON public.encar_sync_windows(run_id, done, id);
CREATE INDEX encar_sync_runs_status_idx ON public.encar_sync_runs(status, started_at DESC);
CREATE TABLE public.encar_sync_lock (
  id int PRIMARY KEY CHECK (id = 1),
  locked_until timestamptz
);
INSERT INTO public.encar_sync_lock (id, locked_until) SELECT 1, NULL WHERE NOT EXISTS (SELECT 1 FROM public.encar_sync_lock);

GRANT ALL ON public.encar_sync_runs TO service_role;
GRANT ALL ON public.encar_sync_windows TO service_role;
GRANT ALL ON public.encar_sync_lock TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.encar_sync_windows_id_seq TO service_role;

ALTER TABLE public.encar_sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encar_sync_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encar_sync_lock ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.encar_sync_try_lock(_seconds int DEFAULT 150)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n int;
BEGIN
  INSERT INTO public.encar_sync_lock (id, locked_until) VALUES (1, NULL) ON CONFLICT (id) DO NOTHING;
  UPDATE public.encar_sync_lock SET locked_until = now() + make_interval(secs => _seconds)
  WHERE id = 1 AND (locked_until IS NULL OR locked_until < now());
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n > 0;
END $$;

CREATE OR REPLACE FUNCTION public.encar_sync_release_lock()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.encar_sync_lock SET locked_until = now() WHERE id = 1;
$$;

CREATE OR REPLACE FUNCTION public.encar_sync_status()
RETURNS TABLE(id uuid, started_at timestamptz, finished_at timestamptz, status text, pages int, upserted int, marked_sold int, error text, windows_built boolean, windows int, windows_done int, sum_fetched bigint, sum_total bigint, progress_pct numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.started_at, r.finished_at, r.status, r.pages, r.upserted, r.marked_sold, r.error, r.windows_built,
    count(w.id)::int, count(w.id) FILTER (WHERE w.done)::int,
    coalesce(sum(w.fetched),0)::bigint, coalesce(sum(w.total),0)::bigint,
    CASE WHEN coalesce(sum(w.total),0) = 0 THEN NULL ELSE round(100.0 * sum(w.fetched) / sum(w.total), 1) END
  FROM (SELECT * FROM public.encar_sync_runs ORDER BY started_at DESC LIMIT 5) r
  LEFT JOIN public.encar_sync_windows w ON w.run_id = r.id
  GROUP BY r.id, r.started_at, r.finished_at, r.status, r.pages, r.upserted, r.marked_sold, r.error, r.windows_built
  ORDER BY r.started_at DESC;
$$;

REVOKE ALL ON FUNCTION public.encar_sync_try_lock(int) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.encar_sync_release_lock() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.encar_sync_status() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.encar_sync_try_lock(int) TO service_role;
GRANT EXECUTE ON FUNCTION public.encar_sync_release_lock() TO service_role;
GRANT EXECUTE ON FUNCTION public.encar_sync_status() TO service_role;