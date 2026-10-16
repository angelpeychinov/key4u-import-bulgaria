import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const H = {
  accept: "text/html,application/xhtml+xml,*/*",
  "accept-language": "ko-KR,ko;q=0.9",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
};

const URLS = [
  "https://fem.encar.com/cars/detail/42606697",
  "https://www.encar.com/dc/dc_cardetailview.do?carid=42606697",
  "https://car.encar.com/list/car?page=1&search=%7B%22type%22%3A%22car%22%2C%22action%22%3A%22(And.Hidden.N._.CarType.Y.)%22%7D",
  "https://car.encar.com/",
  "https://fem.encar.com/cars/list",
  "https://m.encar.com/",
];
const NEEDLES = ["__NEXT_DATA__", "__PRELOADED_STATE__", "window.__", "SearchResults", "Mileage", "mileage", "price", "42606697"];

async function probe(u: string) {
  try {
    const r = await fetch(u, { headers: H, redirect: "follow" });
    const buf = new Uint8Array(await r.arrayBuffer());
    const ct = r.headers.get("content-type") ?? "";
    const enc = /euc-kr/i.test(ct) ? "euc-kr" : "utf-8";
    let body: string;
    try { body = new TextDecoder(enc).decode(buf); } catch { body = new TextDecoder().decode(buf); }
    const contains: Record<string, boolean> = {};
    for (const n of NEEDLES) contains[n] = body.includes(n);
    const bigScripts: string[] = [];
    for (const m of body.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
      if (m[1].length > 2000) bigScripts.push(m[1].slice(0, 400));
    }
    const urls = new Set<string>();
    for (const m of body.matchAll(/(?:https?:)?\/\/[^\s"'<>()\\]+|\/[A-Za-z0-9_\-./]*api[A-Za-z0-9_\-./?=&%]*/g)) {
      if (m[0].toLowerCase().includes("api")) urls.add(m[0]);
      if (urls.size >= 40) break;
    }
    return { url: u, finalUrl: r.url, status: r.status, contentType: ct, bodyLength: body.length, contains, bigScripts, apiUrls: [...urls] };
  } catch (e) {
    return { url: u, error: String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const res: Record<string, unknown> = {};
  for (let i = 0; i < URLS.length; i++) res[String(i + 1)] = await probe(URLS[i]);
  return new Response(JSON.stringify(res, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
