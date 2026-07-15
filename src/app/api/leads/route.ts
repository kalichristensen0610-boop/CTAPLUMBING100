import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { leadSchema } from "@/lib/lead-schema";

export const runtime = "nodejs";
const attempts = new Map<string, { count: number; reset: number }>();

function allowed(ip: string) {
  const now = Date.now(); const item = attempts.get(ip);
  if (!item || item.reset < now) { attempts.set(ip, { count: 1, reset: now + 10 * 60_000 }); return true; }
  if (item.count >= 5) return false; item.count += 1; return true;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowed(ip)) return NextResponse.json({ success: false, code: "RATE_LIMITED", message: "Too many requests. Please call us or try again later." }, { status: 429 });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 20_000) return NextResponse.json({ success: false, code: "TOO_LARGE", message: "The request is too large." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ success: false, code: "INVALID_JSON", message: "The request could not be read." }, { status: 400 }); }
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, code: "VALIDATION_ERROR", message: "Please review the highlighted information.", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ success: true, code: "ACCEPTED", message: "Thanks. Your request has been received." });
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, LEAD_RECIPIENT } = process.env;
  const cc = process.env.EMAIL_CC || "kalichristensen0610@gmail.com";
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM || !LEAD_RECIPIENT) {
    if (process.env.NODE_ENV === "production") return NextResponse.json({ success: false, code: "DELIVERY_NOT_CONFIGURED", message: "Online requests are temporarily unavailable. Please call us instead." }, { status: 503 });
    return NextResponse.json({ success: true, code: "DEV_ACCEPTED", message: "Development mode: validated successfully. Configure SMTP to deliver requests." });
  }
  try {
    const transporter = nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT || 587), secure: SMTP_SECURE === "true", auth: { user: SMTP_USER, pass: SMTP_PASSWORD } });
    const lead = parsed.data;
    await transporter.sendMail({ from: SMTP_FROM, to: LEAD_RECIPIENT, cc, replyTo: lead.email, subject: `${lead.urgency === "emergency" ? "URGENT: " : ""}Website request for ${lead.service}`, text: [`Name: ${lead.name}`, `Phone: ${lead.phone}`, `Email: ${lead.email}`, `Address: ${lead.address}, ${lead.city}`, `Service: ${lead.service}`, `Urgency: ${lead.urgency}`, `Preferred contact: ${lead.preferredContact}`, "", lead.message].join("\n") });
    return NextResponse.json({ success: true, code: "DELIVERED", message: "Thank you. Your request was sent, and we’ll follow up using your preferred contact method." });
  } catch { return NextResponse.json({ success: false, code: "DELIVERY_FAILED", message: "We could not send your request. Please call us or try again shortly." }, { status: 502 }); }
}
