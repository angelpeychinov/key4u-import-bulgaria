// TEMPORARY diagnostic — delete after use.
// deno-lint-ignore-file no-explicit-any
import { HEADERS, makeClient } from "../_shared/encarHttp.ts";

async function probe(url: string, client: any, headers?: Record<string, string>) {
  try {
    const r = await fetch(url, { client, headers } as any);
    const h: Record<string, string> = {};
    r.headers.forEach((v, k) => (h[k] = v));
    const body = await r.text();
    return { url, status: r.status, headers: h, body: body.slice(0, 500) };
  } catch (e) {
    return { url, error: String((e as Error)?.message ?? e) };
  }
}

Deno.serve(async () => {
  const raw = Deno.env.get("ENCAR_PROXY_URL");
  if (!raw) return Response.json({ error: "ENCAR_PROXY_URL not set" });
  let info: any;
  try {
    const u = new URL(raw);
    info = { protocol: u.protocol, host: u.hostname, port: u.port, username_len: decodeURIComponent(u.username).length, password_len: decodeURIComponent(u.password).length };
  } catch (e) { return Response.json({ parse_error: String(e) }); }

  const q = "(And.Hidden.N._.CarType.Y.)";
  const u3 = `https://api.encar.com/search/car/list/general?count=true&q=${q}&sr=%7CModifiedDate%7C0%7C1`;
  const u4 = `https://api.encar.com/search/car/list/general?count=true&q=${encodeURIComponent(q)}&sr=%7CModifiedDate%7C0%7C1`;
  const u5 = "https://api.encar.com/search/car/list/premium?count=true&q=(And.(And.Hidden.N._.(C.CarType.N._.Manufacturer.BMW.))_.AdType.B.)&sr=%7CModifiedDate%7C0%7C1";

  const out: any = { proxy: info, basicAuth_client: {}, inline_url_client: {} };
  let c: any;
  try { c = makeClient(raw); } catch (e) { out.basicAuth_client.create_error = String(e); }
  if (c) {
    out.basicAuth_client["1_ipify"] = await probe("https://api.ipify.org?format=json", c);
    out.basicAuth_client["2_ip_api_http"] = await probe("http://ip-api.com/json", c);
    out.basicAuth_client["3_encar_raw"] = await probe(u3, c, HEADERS);
    out.basicAuth_client["4_encar_encoded"] = await probe(u4, c, HEADERS);
    out.basicAuth_client["5_encar_premium"] = await probe(u5, c, HEADERS);
    out.basicAuth_client["6_encar_no_headers"] = await probe(u3, c);
  }
  let c2: any;
  try { c2 = (Deno as any).createHttpClient({ proxy: { url: raw } }); } catch (e) { out.inline_url_client.create_error = String(e); }
  if (c2) {
    out.inline_url_client["1_ipify"] = await probe("https://api.ipify.org?format=json", c2);
    out.inline_url_client["3_encar_raw"] = await probe(u3, c2, HEADERS);
  }
  const s = JSON.stringify(out, null, 2);
  // never leak credentials
  let safe = s;
  try { const u = new URL(raw); for (const v of [u.username, u.password, decodeURIComponent(u.username), decodeURIComponent(u.password)]) if (v) safe = safe.split(v).join("***"); } catch { /* */ }
  return new Response(safe, { headers: { "Content-Type": "application/json" } });
});
