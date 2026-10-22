import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { allowedPhotoUrl } from './url.ts';

// Public, read-only image relay; the fixed host and rejected redirects prevent SSRF.
Deno.serve(async req => {
  const headers = { ...corsHeaders, 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405, headers });
  const url = allowedPhotoUrl(new URL(req.url).searchParams.get('url') ?? '');
  if (!url) return new Response('Only HTTPS ci.encar.com photos are allowed', { status: 400, headers });
  try {
    const upstream = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(10000) });
    const type = upstream.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
    const maxBytes = 10 * 1024 * 1024;
    if (!upstream.ok || !type || !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(type) || Number(upstream.headers.get('content-length')) > maxBytes) {
      await upstream.body?.cancel();
      return new Response('Photo unavailable', { status: 502, headers });
    }
    const reader = upstream.body?.getReader();
    if (!reader) return new Response('Photo unavailable', { status: 502, headers });
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); return new Response('Photo too large', { status: 502, headers }); }
      chunks.push(value);
    }
    if (!size) return new Response('Photo unavailable', { status: 502, headers });
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return new Response(bytes, { headers: { ...headers, 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'public, max-age=86400' } });
  } catch {
    return new Response('Photo temporarily unavailable', { status: 502, headers });
  }
});