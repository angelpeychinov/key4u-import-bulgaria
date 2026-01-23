import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: CarRequestData = await req.json();
    
    console.log("Received car request:", data);

    // Build email HTML
    const emailHtml = `
      <h2>Нова заявка за автомобил</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Име:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Имейл:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.email}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Телефон:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.phone}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Модел:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.model}</td>
        </tr>
        ${data.year ? `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Година:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.year}</td>
        </tr>
        ` : ''}
        ${data.color ? `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Цвят:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.color}</td>
        </tr>
        ` : ''}
        ${data.trim ? `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Екстри/Пакет:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.trim}</td>
        </tr>
        ` : ''}
        ${data.additional ? `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f5f5f5;"><strong>Допълнителна информация:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${data.additional}</td>
        </tr>
        ` : ''}
      </table>
    `;

    const emailResponse = await resend.emails.send({
      from: "Key4U <onboarding@resend.dev>",
      to: ["key4u.import@gmail.com"],
      subject: `Нова заявка за автомобил: ${data.model}`,
      html: emailHtml,
      reply_to: data.email,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-car-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
