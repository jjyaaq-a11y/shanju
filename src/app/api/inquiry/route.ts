import { NextResponse } from "next/server";
import { z } from "zod";
import nodemailer from "nodemailer";

const inquiryPayloadSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  countryCode: z.string().min(1),
  phone: z.string().min(1),
  travelers: z.number().min(1).max(10),
  departureDate: z.string().min(1),
  preferences: z.array(z.string()).optional().default([]),
  specialRequirements: z.string().optional().default(""),
  nationality: z.string().optional().default(""),
  budgetPerPerson: z.string().optional().default(""),
  howFound: z.string().optional().default(""),
  additionalMessage: z.string().optional().default(""),
  routeName: z.string().optional().default(""),
  daysCount: z.number().int().positive().optional(),
  locale: z.enum(["zh", "en"]).optional().default("zh"),
});

type InquiryPayload = z.infer<typeof inquiryPayloadSchema>;

function renderText(payload: InquiryPayload): string {
  const lines = [
    "New Route Inquiry",
    "",
    `Route: ${payload.routeName || "-"}`,
    `Days: ${payload.daysCount ?? "-"}`,
    `Name: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.countryCode} ${payload.phone}`,
    `Travelers: ${payload.travelers}`,
    `Departure Date: ${payload.departureDate}`,
    `Nationality: ${payload.nationality || "-"}`,
    `Budget Per Person: ${payload.budgetPerPerson || "-"}`,
    `How Found Us: ${payload.howFound || "-"}`,
    `Preferences: ${(payload.preferences ?? []).join(", ") || "-"}`,
    `Special Requirements: ${payload.specialRequirements || "-"}`,
    `Additional Message: ${payload.additionalMessage || "-"}`,
    `Locale: ${payload.locale}`,
    `Submitted At: ${new Date().toISOString()}`,
  ];
  return lines.join("\n");
}

function renderHtml(payload: InquiryPayload): string {
  const escape = (s: string) =>
    s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");

  const item = (k: string, v: string) => `<p><strong>${escape(k)}:</strong> ${escape(v)}</p>`;
  return `
    <h2>New Route Inquiry</h2>
    ${item("Route", payload.routeName || "-")}
    ${item("Days", String(payload.daysCount ?? "-"))}
    ${item("Name", payload.fullName)}
    ${item("Email", payload.email)}
    ${item("Phone", `${payload.countryCode} ${payload.phone}`)}
    ${item("Travelers", String(payload.travelers))}
    ${item("Departure Date", payload.departureDate)}
    ${item("Nationality", payload.nationality || "-")}
    ${item("Budget Per Person", payload.budgetPerPerson || "-")}
    ${item("How Found Us", payload.howFound || "-")}
    ${item("Preferences", (payload.preferences ?? []).join(", ") || "-")}
    ${item("Special Requirements", payload.specialRequirements || "-")}
    ${item("Additional Message", payload.additionalMessage || "-")}
    ${item("Locale", payload.locale)}
    ${item("Submitted At", new Date().toISOString())}
  `;
}

async function sendEmail(payload: InquiryPayload) {
  const host = process.env.INQUIRY_SMTP_HOST;
  const port = Number(process.env.INQUIRY_SMTP_PORT || "587");
  const user = process.env.INQUIRY_SMTP_USER;
  const pass = process.env.INQUIRY_SMTP_PASS;
  const from = process.env.INQUIRY_EMAIL_FROM;
  const to = process.env.INQUIRY_EMAIL_TO;

  if (!host || !user || !pass || !from || !to) {
    throw new Error("Missing SMTP env config for inquiry email");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject: `[Inquiry] ${payload.routeName || "Route"} - ${payload.fullName}`,
    text: renderText(payload),
    html: renderHtml(payload),
    replyTo: payload.email,
  });
}

async function sendTelegram(payload: InquiryPayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    throw new Error("Missing Telegram env config");
  }

  const text = [
    "New Route Inquiry",
    `Route: ${payload.routeName || "-"}`,
    `Days: ${payload.daysCount ?? "-"}`,
    `Name: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.countryCode} ${payload.phone}`,
    `Travelers: ${payload.travelers}`,
    `Departure: ${payload.departureDate}`,
    `Nationality: ${payload.nationality || "-"}`,
    `Budget: ${payload.budgetPerPerson || "-"}`,
    `Preferences: ${(payload.preferences ?? []).join(", ") || "-"}`,
    `Special: ${payload.specialRequirements || "-"}`,
    `Message: ${payload.additionalMessage || "-"}`,
  ].join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram send failed: ${res.status} ${body}`);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = inquiryPayloadSchema.parse(body);

    await Promise.all([sendEmail(payload), sendTelegram(payload)]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[inquiry] submit failed", error);
    return NextResponse.json({ ok: false, error: "Submit failed" }, { status: 500 });
  }
}
