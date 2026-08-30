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
// зададен в Lovable Secrets. Без това всеки в интернет би могъл да пише
// произволни данни в таблицата.

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
    const listings: IncomingListing[] = body.listings ?? [];

    if (!brand || !Array.isArray(listings)) {
      return json({ error: "Missing brand or listings array" }, 400);
    }

    let inserted = 0;
    let updated = 0;
    const seenIds = new Set<string>();

    for (const listing of listings) {
      if (!listing.encar_id) continue;
      seenIds.add(listing.encar_id);

      const { data: existing, error: selectError } = await supabase
        .from("encar_listings")
        .select("id, price_original")
        .eq("encar_id", listing.encar_id)
        .maybeSingle();

      if (selectError) {
        console.error("select failed", listing.encar_id, selectError);
        continue;
      }

      const row: Record<string, unknown> = {
        ...listing,
        status: "active",
        last_seen_at: new Date().toISOString(),
      };

      if (existing) {
        const oldPrice = existing.price_original as number | null;
        if (oldPrice && listing.price_original && oldPrice !== listing.price_original) {
          row.previous_price_krw = oldPrice;
          row.price_changed_at = new Date().toISOString();
        }
        const { error: updateError } = await supabase
          .from("encar_listings")
          .update(row)
          .eq("encar_id", listing.encar_id);
        if (updateError) {
          console.error("update failed", listing.encar_id, updateError);
          continue;
        }
        updated++;
      } else {
        row.first_seen_at = new Date().toISOString();
        const { error: insertError } = await supabase.from("encar_listings").insert(row);
        if (insertError) {
          console.error("insert failed", listing.encar_id, insertError);
          continue;
        }
        inserted++;
      }
    }

    // Марк-ай изчезналите обяви (бяха active за тази марка/модел, но не бяха
    // в текущия batch) като sold.
    let markedSold = 0;
    let staleQuery = supabase
      .from("encar_listings")
      .select("encar_id")
      .eq("status", "active")
      .eq("brand_slug", brand.toLowerCase());
    if (model) {
      staleQuery = staleQuery.eq("model_slug", model.toLowerCase());
    }
    const { data: activeRows, error: staleError } = await staleQuery;

    if (!staleError && activeRows) {
      const staleIds = activeRows
        .map((r) => r.encar_id as string)
        .filter((id) => !seenIds.has(id));
      if (staleIds.length > 0) {
        const { error: soldError } = await supabase
          .from("encar_listings")
          .update({ status: "sold" })
          .in("encar_id", staleIds);
        if (!soldError) markedSold = staleIds.length;
      }
    }

    return json({ inserted, updated, marked_sold: markedSold, total_seen: seenIds.size });
  } catch (err) {
    console.error("listings-ingest failed", err);
    return json({ error: "Unexpected error" }, 500);
  }
});
