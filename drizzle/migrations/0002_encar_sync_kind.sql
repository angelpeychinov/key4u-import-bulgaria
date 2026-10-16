ALTER TABLE public.encar_sync_runs ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'full';
CREATE INDEX IF NOT EXISTS encar_sync_runs_kind_idx ON public.encar_sync_runs(kind, status, started_at DESC);
DROP FUNCTION IF EXISTS public.encar_sync_status();
CREATE FUNCTION public.encar_sync_status()
RETURNS TABLE(id uuid, kind text, started_at timestamptz, finished_at timestamptz, status text, pages int, upserted int, marked_sold int, error text, windows_built boolean, windows int, windows_done int, sum_fetched bigint, sum_total bigint, progress_pct numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.kind, r.started_at, r.finished_at, r.status, r.pages, r.upserted, r.marked_sold, r.error, r.windows_built,
    count(w.id)::int, count(w.id) FILTER (WHERE w.done)::int,
    coalesce(sum(w.fetched),0)::bigint, coalesce(sum(w.total),0)::bigint,
    CASE WHEN coalesce(sum(w.total),0) = 0 THEN NULL ELSE round(100.0 * sum(w.fetched) / sum(w.total), 1) END
  FROM (SELECT * FROM public.encar_sync_runs ORDER BY started_at DESC LIMIT 5) r
  LEFT JOIN public.encar_sync_windows w ON w.run_id = r.id
  GROUP BY r.id, r.kind, r.started_at, r.finished_at, r.status, r.pages, r.upserted, r.marked_sold, r.error, r.windows_built
  ORDER BY r.started_at DESC;
$$;
REVOKE ALL ON FUNCTION public.encar_sync_status() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.encar_sync_status() TO service_role;