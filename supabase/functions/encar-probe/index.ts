import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const H = {
  accept: "application/json, text/javascript, */*; q=0.01",
  origin: "https://www.encar.com",
  referer: "https://www.encar.com/",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
};
const SR = "%7CModifiedDate%7C0%7C2";
const url = (ep: string, q: string, sr = SR, extra = "") =>
  `https://api.encar.com/search/car/list/${ep}?count=true&q=${encodeURIComponent(q)}&sr=${sr}${extra}`;

async function probe(u: string, fullChars = 0) {
  try {
    const r = await fetch(u, { headers: H });
    const text = await r.text();
    const out: Record<string, unknown> = { url: u, status: r.status };
    try {
      const j = JSON.parse(text);
      out.Count = j?.Count ?? null;
      out.numSearchResults = Array.isArray(j?.SearchResults) ? j.SearchResults.length : null;
      out.firstKeys = j?.SearchResults?.[0] ? Object.keys(j.SearchResults[0]) : null;
      out.firstId = j?.SearchResults?.[0]?.Id ?? null;
      if (fullChars) out.body = text.slice(0, fullChars);
    } catch {
      out.bodyNotJson = text.slice(0, fullChars || 300);
    }
    return out;
  } catch (e) {
    return { url: u, error: String(e) };
  }
}

async function raw(u: string, n: number) {
  try {
    const r = await fetch(u, { headers: H });
    return { url: u, status: r.status, body: (await r.text()).slice(0, n) };
  } catch (e) {
    return { url: u, error: String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const bmw = "(And.Hidden.N._.(C.CarType.N._.Manufacturer.BMW.))";
  const hy = "(And.Hidden.N._.(C.CarType.Y._.Manufacturer.현대.))";
  const res: Record<string, unknown> = {};
  res["1"] = await probe(url("premium", "(And.(And.Hidden.N._.(C.CarType.N._.Manufacturer.BMW.))_.AdType.B.)"));
  res["2"] = await probe(url("general", bmw));
  res["3"] = await probe(url("general", hy));
  res["4"] = await probe(url("general", "(And.Hidden.N._.(C.CarType.Y._.Manufacturer.기아.))"));
  res["5"] = await probe(url("general", "(And.Hidden.N._.(C.CarType.Y._.Manufacturer.현대._.Price.range(1000..1999).))"));
  res["6"] = await probe(url("general", "(And.Hidden.N._.CarType.Y.)"));
  res["7"] = await probe(url("general", "(And.Hidden.N._.CarType.N.)"));
  res["8"] = await probe(url("general", bmw, "%7CModifiedDate%7C9990%7C20"));
  res["9"] = await probe(url("general", hy, SR, "&inav=%7CMetadata%7CSort"), 3000);
  const id = (res["2"] as any)?.firstId;
  if (id) {
    res["10"] = await raw(`https://api.encar.com/v1/readside/vehicle/${id}`, 3000);
    res["11"] = await raw(`https://api.encar.com/v1/readside/inspection/vehicle/${id}`, 1500);
  } else {
    res["10"] = res["11"] = { error: "no id from test 2" };
  }
  return new Response(JSON.stringify(res, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
