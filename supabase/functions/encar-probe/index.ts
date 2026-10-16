import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const H = {
  accept: "application/json, text/javascript, */*; q=0.01",
  origin: "https://www.encar.com",
  referer: "https://www.encar.com/",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
};

const TESTS: [string, boolean][] = [
  ["https://api.ipify.org?format=json", false],
  ["https://httpbin.org/get", false],
  ["https://www.encar.com/", false],
  ["https://api.encar.com/search/car/list/general?count=true&q=" + encodeURIComponent("(And.Hidden.N._.CarType.Y.)") + "&sr=%7CModifiedDate%7C0%7C1", true],
  ["https://fem.encar.com/", false],
  ["https://www.google.com/", false],
];

async function probe(u: string, withHeaders: boolean) {
  try {
    const r = await fetch(u, withHeaders ? { headers: H } : undefined);
    const body = (await r.text()).slice(0, 300);
    return { url: u, status: r.status, headers: Object.fromEntries(r.headers.entries()), body };
  } catch (e) {
    return { url: u, error: String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const res: Record<string, unknown> = {};
  for (let i = 0; i < TESTS.length; i++) res[String(i + 1)] = await probe(TESTS[i][0], TESTS[i][1]);
  return new Response(JSON.stringify(res, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
