import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const out: Record<string, unknown> = {};
  // deno-lint-ignore no-explicit-any
  const D = Deno as any;
  out.typeofCreateHttpClient = typeof D.createHttpClient;
  out.denoVersion = Deno.version;
  // deno-lint-ignore no-explicit-any
  let c: any = null;
  try {
    c = D.createHttpClient({ proxy: { url: "http://127.0.0.1:9" } });
    out.createHttpClient = "success";
  } catch (e) {
    out.createHttpClient = "error: " + (e instanceof Error ? `${e.name}: ${e.message}` : String(e));
  }
  if (c) {
    try {
      // deno-lint-ignore no-explicit-any
      const r = await fetch("https://api.ipify.org?format=json", { client: c } as any);
      out.fetchWithClient = { status: r.status, body: (await r.text()).slice(0, 300) };
    } catch (e) {
      out.fetchWithClient = "error: " + (e instanceof Error ? `${e.name}: ${e.message}` : String(e));
    }
  } else {
    out.fetchWithClient = "skipped (no client)";
  }
  return new Response(JSON.stringify(out, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
