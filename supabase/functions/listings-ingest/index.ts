// listings-ingest: приема batch суров JSON от външния Python скрейпър
// и извършва upsert / mark-as-sold логиката вътре в Supabase.
//
// Защо съществува тази функция: проектът е на Lovable Cloud, което означава,
// че service_role ключът НИКОГА не е достъпен извън Edge Functions -- дори
// собственикът на проекта не може да го извади през UI. Затова скрейпърът
// (който тича извън Lovable, на локална машина или VPS) не може да пише
// директно в Supabase. Вместо това праща данните тук, а тази функция ги
// записва, използвайки вътрешния service_role достъп, който Edge Functions
// автоматично получават от Lovable Cloud runtime-а.
//
// Защита: изисква header 'x-ingest-secret', сравнен с INGEST_SECRET,
// зададен в Lovable Secrets.
//
// ⚠️ АРХИТЕКТУРНА БЕЛЕЖКА (31.08.2026): Първата версия обработваше всяка
// обява ПООТДЕЛНО (select + insert/update в цикъл) -- при няколко хиляди
// обяви (напр. пълния BMW каталог, 2500+) това отнемаше твърде дълго и
// причиняваше client-side timeout от Python скрейпъра. Вече ползваме bulk
// upsert (една SQL операция за целия chunk), а mark-as-sold логиката е
// отделена в самостоятелна "finalize" стъпка, защото трябва да се изпълни
// само ВЕДНЪЖ, след като всички chunk-ове от скрейпъра са пристигнали --
// не след всеки chunk поотделно (иначе би маркирала грешно колите от
// следващите chunk-ове като "продадени").

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { BRAND_MAP, slugify, translateListing } from "../_shared/encarMaps.ts";
import { upsertListings } from "../_shared/upsertListings.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-ingest-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface IncomingListing {
  encar_id: string;
  brand_name?: string;
  brand_slug?: string;
  model_name?: string;
  model_slug?: string;
  trim?: string;
  year?: number;
  price_original?: number;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  region?: string;
  has_accident?: boolean;
  thumb?: string;
  photos?: string[];
  listing_url?: string;
  source_code?: string;
  raw_data?: unknown;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const expectedSecret = Deno.env.get("INGEST_SECRET");
  const providedSecret = req.headers.get("x-ingest-secret");
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return json({ error: "Server misconfigured" }, 500);
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const brand: string | undefined = body.brand;
    const model: string | undefined = body.model;

    if (!brand) {
      return json({ error: "Missing brand" }, 400);
    }

    // --- FINALIZE стъпка: маркира изчезналите обяви като sold ---
    // Извиква се веднъж, СЛЕД като всички chunk-ове с обяви са изпратени.
    if (body.finalize === true) {
      const seenIds: string[] = Array.isArray(body.seen_ids) ? body.seen_ids : [];
      const seenSet = new Set(seenIds);

      // The scraper may send the brand in Korean; match the stored English slug.
      const brandEn = BRAND_MAP[brand.trim()];
      const brandSlug = brandEn ? slugify(brandEn) : brand.toLowerCase();
      let staleQuery = supabase
        .from("encar_listings")
        .select("encar_id")
        .eq("status", "active")
        .eq("brand_slug", brandSlug);
      // Several Encar brands can share one English slug (쉐보레 vs 쉐보레(GM대우)).
      // When the scraper sends the original Korean name, also match the raw Encar
      // manufacturer so finalizing one never marks the other's cars as sold.
      if (/[\u3131-\uD79D]/.test(brand)) {
        staleQuery = staleQuery.eq("raw_data->>Manufacturer", brand.trim());
      }
      if (model) {
        staleQuery = staleQuery.eq("model_slug", translateListing({ model_name: model }).model_slug ?? model.toLowerCase());
      }
      const { data: activeRows, error: staleError } = await staleQuery;

      if (staleError) {
        console.error("finalize select failed", staleError);
        return json({ error: "Finalize select failed" }, 500);
      }

      const staleIds = (activeRows ?? [])
        .map((r) => r.encar_id as string)
        .filter((id) => !seenSet.has(id));

      let markedSold = 0;
      for (const idsChunk of chunk(staleIds, 300)) {
        const { error: soldError } = await supabase
          .from("encar_listings")
          .update({ status: "sold" })
          .in("encar_id", idsChunk);
        if (!soldError) markedSold += idsChunk.length;
        else console.error("mark-sold chunk failed", soldError);
      }

      return json({ marked_sold: markedSold });
    }

    // --- Обикновена ingest стъпка: bulk upsert на един chunk обяви ---
    const rawListings: IncomingListing[] = body.listings ?? [];
    if (!Array.isArray(rawListings) || rawListings.length === 0) {
      return json({ error: "Missing listings array" }, 400);
    }

    // Shared helper: dedupes encar_id, translates, keeps price-change history,
    // sets first_seen_at only for new rows.
    try {
      const { inserted, updated } = await upsertListings(supabase, rawListings as Array<Record<string, unknown>>);
      return json({ inserted, updated });
    } catch (e) {
      console.error("bulk upsert failed", e);
      const msg = String(e instanceof Error ? e.message : e);
      return json({ error: msg.startsWith("Select") ? "Select failed" : "Upsert failed" }, 500);
    }
  } catch (err) {
    console.error("listings-ingest failed", err);
    return json({ error: "Unexpected error" }, 500);
  }
});
