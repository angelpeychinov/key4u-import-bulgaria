import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Server-side validation
function validateRequest(data: unknown): { valid: boolean; error?: string; parsed?: CarRequestData } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: "Invalid request body" };
  }
  const d = data as Record<string, unknown>;
  
  const name = typeof d.name === 'string' ? d.name.trim() : '';
  const email = typeof d.email === 'string' ? d.email.trim() : '';
  const phone = typeof d.phone === 'string' ? d.phone.trim() : '';
  const model = typeof d.model === 'string' ? d.model.trim() : '';
  const year = typeof d.year === 'string' ? d.year.trim() : '';
  const color = typeof d.color === 'string' ? d.color.trim() : '';
  const trim = typeof d.trim === 'string' ? d.trim.trim() : '';
  const additional = typeof d.additional === 'string' ? d.additional.trim() : '';

  if (!name || name.length > 100) return { valid: false, error: "Invalid name" };
  if (!email || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { valid: false, error: "Invalid email" };
  if (!phone || phone.length > 20) return { valid: false, error: "Invalid phone" };
  if (!model || model.length > 100) return { valid: false, error: "Invalid model" };
  if (year.length > 4) return { valid: false, error: "Invalid year" };
  if (color.length > 50) return { valid: false, error: "Invalid color" };
  if (trim.length > 100) return { valid: false, error: "Invalid trim" };
  if (additional.length > 1000) return { valid: false, error: "Invalid additional info" };

  return { valid: true, parsed: { name, email, phone, model, year, color, trim, additional } };
}

interface CarRequestData {
  name: string;
  email: string;
  phone: string;
  model: string;
  year?: string;
  color?: string;
  trim?: string;
  additional?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body = await req.json();
    const validation = validateRequest(body);
    if (!validation.valid || !validation.parsed) {
      return new Response(
        JSON.stringify({ error: validation.error || "Invalid request data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const data = validation.parsed;

    // Build email HTML with escaped values
    const emailHtml = `
      <h2>Нова заявка за автомобил</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Име:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(data.name)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Имейл:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(data.email)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Телефон:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(data.phone)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Модел:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(data.model)}</td>
        </tr>
        ${data.year ? `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Година:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(data.year)}</td>
        </tr>
        ` : ''}
        ${data.color ? `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Цвят:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(data.color)}</td>
        </tr>
        ` : ''}
        ${data.trim ? `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Екстри/Пакет:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(data.trim)}</td>
        </tr>
        ` : ''}
        ${data.additional ? `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Допълнителна информация:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(data.additional)}</td>
        </tr>
        ` : ''}
      </table>
    `;

    const emailResponse = await resend.emails.send({
      from: "Key4U <onboarding@resend.dev>",
      to: ["key4u.import@gmail.com"],
      subject: `Нова заявка за автомобил: ${escapeHtml(data.model)}`,
      html: emailHtml,
      reply_to: data.email,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-car-request function:", error);
    return new Response(
      JSON.stringify({ error: "Unable to process your request. Please try again later." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
