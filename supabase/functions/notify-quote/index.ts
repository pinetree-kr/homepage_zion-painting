
// supabase/functions/admin-notify/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import "https://deno.land/x/dotenv/load.ts";


Deno.serve(async (req) => {
  const payload = await req.json();
  const { subject, name, email, message, id } = payload;

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
  const FROM_EMAIL = Deno.env.get("FROM_EMAIL")!;
  const TO_EMAIL = Deno.env.get("TO_EMAIL")!;

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY is not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `[문의 접수] ${subject}`,
      html: `
        <p>새로운 문의가 접수되었습니다.</p>
        <p><b>이름:</b> ${name}</p>
        <p><b>이메일:</b> ${email}</p>
        <p><b>내용:</b><br/>${message.replace(/\n/g, "<br/>")}</p>
        <p><small>문의 ID: ${id}</small></p>
      `,
    }),
  });

  if (!res.ok) {
    console.error("Resend error", await res.text());
    return new Response("Failed to send email", { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
