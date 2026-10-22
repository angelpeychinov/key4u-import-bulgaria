import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { validListingId } from '../_shared/listingRoute.ts';
import { shareHtml } from '../_shared/shareHtml.ts';
Deno.serve(async req => {
  const headers = { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405, headers });
  const id = new URL(req.url).searchParams.get('id') ?? '';
  if (!validListingId(id)) return new Response('Invalid listing ID', { status: 400, headers });
  try {
    const origin = Deno.env.get('SUPABASE_URL');
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    if (!origin || !anon) throw new Error('Configuration unavailable');
    const response = await fetch(`${origin}/functions/v1/listings-search?ids=${id}&limit=1&model_scope=base`, { headers: { apikey: anon, Authorization: `Bearer ${anon}` }, signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error('Search unavailable');
    const body = await response.json();
    if (body.unavailable || body.error) throw new Error('Search unavailable');
    const row = body.results?.[0];
    if (!row) return new Response('Listing not found', { status: 404, headers });
    const photos = (Array.isArray(row.photos) ? row.photos : []).map((p: unknown) => typeof p === 'string' ? p : (p as { url?: string })?.url).filter((p: unknown) => typeof p === 'string');
    const fuels: Record<string, string> = { gasoline: 'Бензин', diesel: 'Дизел', hybrid: 'Хибрид', electric: 'Електрически', lpg: 'Газ (LPG)', 'gasoline+lpg': 'Бензин/газ', hydrogen: 'Водород' };
    const html = shareHtml({ brand: row.brand_name, model: row.model_name, modelBase: row.model_base, trim: row.trim, year: row.year, encarId: String(row.encar_id), mileage: row.mileage, photos: photos.length ? photos : [row.thumb].filter(Boolean), specs: { 'Гориво': fuels[row.fuel_type] ?? row.fuel_type ?? '—' }, importPrice: row.import_price ?? undefined }, `${origin}/functions/v1/share?id=${id}`);
    return new Response(html, { headers: { ...headers, 'Cache-Control': 'public, max-age=300' } });
  } catch (error) {
    console.error('Share lookup failed', error instanceof Error ? error.message : 'Unknown error');
    return new Response('Listing temporarily unavailable', { status: 503, headers: { ...headers, 'Cache-Control': 'no-store' } });
  }
});
