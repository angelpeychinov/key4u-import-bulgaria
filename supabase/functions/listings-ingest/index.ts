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

      let staleQuery = supabase
        .from("encar_listings")
        .select("encar_id")
        .eq("status", "active")
        .eq("brand_slug", brand.toLowerCase());
      if (model) {
        staleQuery = staleQuery.eq("model_slug", model.toLowerCase());
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
    const listings: IncomingListing[] = body.listings ?? [];
    if (!Array.isArray(listings) || listings.length === 0) {
      return json({ error: "Missing listings array" }, 400);
    }

    const encarIds = listings.map((l) => l.encar_id).filter(Boolean);

    // Една SELECT заявка за целия chunk, вместо по една на обява.
    const { data: existingRows, error: selectError } = await supabase
      .from("encar_listings")
      .select("encar_id, price_original")
      .in("encar_id", encarIds);

    if (selectError) {
      console.error("bulk select failed", selectError);
      return json({ error: "Select failed" }, 500);
    }

    const oldPriceByEncarId = new Map<string, number | null>(
      (existingRows ?? []).map((r) => [r.encar_id as string, r.price_original as number | null]),
    );

    const nowIso = new Date().toISOString();
    const rows = listings.map((listing) => {
      const row: Record<string, unknown> = {
        ...listing,
        status: "active",
        last_seen_at: nowIso,
      };
      const oldPrice = oldPriceByEncarId.get(listing.encar_id);
      if (oldPrice != null && listing.price_original != null && oldPrice !== listing.price_original) {
        row.previous_price_krw = oldPrice;
        row.price_changed_at = nowIso;
      }
      // Съзнателно НЕ включваме first_seen_at тук -- upsert би презаписал
      // съществуващата стойност за вече наличните редове. Backfill-ваме я
      // отделно по-долу, само за редовете, при които тя е NULL.
      return row;
    });

    const { error: upsertError } = await supabase
      .from("encar_listings")
      .upsert(rows, { onConflict: "encar_id" });

    if (upsertError) {
      console.error("bulk upsert failed", upsertError);
      return json({ error: "Upsert failed" }, 500);
    }

    // Backfill на first_seen_at само за истински новите редове.
    const { error: backfillError } = await supabase
      .from("encar_listings")
      .update({ first_seen_at: nowIso })
      .is("first_seen_at", null)
      .in("encar_id", encarIds);
    if (backfillError) {
      console.error("first_seen_at backfill failed", backfillError);
      // не е фатално -- редовете вече са записани, само first_seen_at ще е NULL
    }

    const updated = existingRows?.length ?? 0;
    const inserted = encarIds.length - updated;

    return json({ inserted, updated });
  } catch (err) {
    console.error("listings-ingest failed", err);
    return json({ error: "Unexpected error" }, 500);
  }
});
