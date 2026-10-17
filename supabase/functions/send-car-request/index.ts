import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { requestSchema } from "./request.ts";
import { escapeEmailHtml, emailSendResult, requestSubject } from "../_shared/carRequestEmail.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const db = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
const json = (body: unknown, status: number) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    if (isRateLimited(ip)) return json({ error: "Too many requests. Please try again later." }, 429);
    let body: unknown;
    try { body = await req.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }
    const validation = requestSchema.safeParse(body);
    if (!validation.success) return json({ error: validation.error.flatten().fieldErrors }, 400);
    const data = validation.data;
    const { data: saved, error: saveError } = await db.from("car_request_submissions").insert({
      name: data.name, phone: data.phone, email: data.email || null, model: data.model, request_data: data,
    }).select("id").single();
    if (saveError || !saved) {
      console.error("Car request storage failed", saveError?.code);
      return json({ error: "Unable to save inquiry. Please call 0898252434." }, 500);
    }
    const row = (label: string, value: string | number | null | undefined) => `<tr><th align="left">${escapeEmailHtml(label)}</th><td>${escapeEmailHtml(value === null || value === undefined || value === "" ? "—" : String(value))}</td></tr>`;
    const listing = data.listing;
    const listingHtml = listing ? `<h2>Обява</h2><table>
      ${row("Автомобил", listing.title)}
      ${row("Пробег (км)", listing.mileage)}
      ${row("Encar ID", listing.encarId)}
      ${row("Encar URL", listing.encarUrl)}
      ${row("Обява в Key4U", listing.siteUrl)}
      ${row("Цена в Корея", listing.priceKrw === null ? "Цена при запитване" : listing.priceKrw.toLocaleString("bg-BG") + " ₩")}
      ${row("Прогнозна цена до България", listing.estimatedTotalEur === null ? "Цена при запитване" : "~" + Math.round(listing.estimatedTotalEur).toLocaleString("bg-BG") + " €")}
    </table>` : "";
    const html = `${listingHtml}<h2>Нова заявка за автомобил</h2><table>
      ${row("Име", data.name)}${row("Телефон", data.phone)}${row("Имейл", data.email)}
      ${row("Модел", data.model)}${row("Година", data.year)}${row("Цвят", data.color)}
      ${row("Екстри/Пакет", data.trim)}${row("Съобщение", data.additional)}</table>`;
    const response = await resend.emails.send({
      from: "Key4U <onboarding@resend.dev>", to: ["key4u.import@gmail.com"],
      subject: requestSubject(data.model, listing), html,
      ...(data.email ? { reply_to: data.email } : {}),
    });
    const result = emailSendResult(response);
    const emailId = "emailId" in result.body ? result.body.emailId : null;
    await db.from("car_request_submissions").update({ email_status: result.status === 200 ? "sent" : "failed", email_id: emailId }).eq("id", saved.id);
    if (result.status !== 200) console.error("Resend send failed:", result.body);
    else console.log(`Car request email sent: ${emailId}`);
    return json(result.body, result.status);
  } catch (error) {
    console.error("Car request processing failed:", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "Unable to process your request. Please call 0898252434." }, 500);
  }
};
serve(handler);
