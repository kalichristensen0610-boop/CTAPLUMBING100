import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { leadSchema } from "@/lib/lead-schema";

export const runtime = "nodejs";
const attempts = new Map<string, { count: number; reset: number }>();
const defaultOrigins = [
  "https://ctaplumbing100.com",
  "https://www.ctaplumbing100.com",
  "https://darkslategray-snake-394369.hostingersite.com",
];

function allowed(ip: string) {
  const now = Date.now();
  const item = attempts.get(ip);
  if (!item || item.reset < now) {
    attempts.set(ip, { count: 1, reset: now + 10 * 60_000 });
    return true;
  }
  if (item.count >= 5) return false;
  item.count += 1;
  return true;
}

function env(name: string) {
  const value = process.env[name]?.trim();
  if (!value) return undefined;
  const quoted = (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
  return quoted ? value.slice(1, -1).trim() : value;
}

function allowedOrigins() {
  const configured = env("ALLOWED_ORIGINS")?.split(",").map((value) => value.trim()).filter(Boolean) ?? [];
  const siteUrl = env("NEXT_PUBLIC_SITE_URL");
  return new Set([...defaultOrigins, ...configured, ...(siteUrl ? [siteUrl] : [])].map((value) => value.replace(/\/$/, "")));
}

function safeSmtpError(error: unknown, password?: string, username?: string) {
  const smtpError = error as { name?: string; message?: string; code?: string; command?: string; responseCode?: number };
  let message = smtpError?.message || "Unknown SMTP error";
  for (const secret of [password, username]) {
    if (secret) message = message.split(secret).join("[redacted]");
  }
  return {
    name: smtpError?.name || "Error",
    code: smtpError?.code || "UNKNOWN",
    command: smtpError?.command,
    responseCode: smtpError?.responseCode,
    message: message.slice(0, 500),
  };
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  const origin = request.headers.get("origin")?.replace(/\/$/, "");
  console.info(`[leads:${requestId}] endpoint_received`, {
    method: request.method,
    origin: origin || "none",
    contentType: request.headers.get("content-type") || "none",
  });
  if (origin && !allowedOrigins().has(origin)) {
    console.warn(`[leads:${requestId}] origin_rejected`, { origin });
    return NextResponse.json({ success: false, code: "ORIGIN_REJECTED", message: "This request is not allowed.", requestId }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowed(ip)) return NextResponse.json({ success: false, code: "RATE_LIMITED", message: "Too many requests. Please call us or try again later.", requestId }, { status: 429 });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 20_000) return NextResponse.json({ success: false, code: "TOO_LARGE", message: "The request is too large.", requestId }, { status: 413 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, code: "INVALID_JSON", message: "The request could not be read.", requestId }, { status: 400 });
  }
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, code: "VALIDATION_ERROR", message: "Please review the highlighted information.", errors: parsed.error.flatten().fieldErrors, requestId }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ success: true, code: "ACCEPTED", message: "Thanks. Your request has been received.", requestId });

  const host = env("SMTP_HOST");
  const user = env("SMTP_USER");
  // Gmail app passwords are often displayed in groups; Gmail expects them without spaces.
  const password = env("SMTP_PASSWORD")?.replace(/\s+/g, "");
  const from = env("SMTP_FROM");
  const recipient = env("LEAD_RECIPIENT");
  const cc = env("EMAIL_CC") || "kalichristensen0610@gmail.com";
  const missing = [
    ["SMTP_HOST", host], ["SMTP_USER", user], ["SMTP_PASSWORD", password],
    ["SMTP_FROM", from], ["LEAD_RECIPIENT", recipient],
  ].filter(([, value]) => !value).map(([name]) => name);

  if (missing.length) {
    console.error(`[leads:${requestId}] smtp_configuration_missing`, { missing });
    if (process.env.NODE_ENV === "production") return NextResponse.json({ success: false, code: "DELIVERY_NOT_CONFIGURED", message: "Online requests are temporarily unavailable. Please call us instead.", requestId }, { status: 503 });
    return NextResponse.json({ success: true, code: "DEV_ACCEPTED", message: "Development mode: validated successfully. Configure SMTP to deliver requests.", requestId });
  }

  const configuredPort = Number(env("SMTP_PORT") || "465");
  const port = Number.isInteger(configuredPort) ? configuredPort : 465;
  const secureSetting = env("SMTP_SECURE")?.toLowerCase();
  const secure = port === 465 ? true : secureSetting === "true";
  console.info(`[leads:${requestId}] smtp_attempt`, { provider: host === "smtp.gmail.com" ? "gmail" : "custom", port, secure, origin: origin || "none" });

  try {
    const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass: password } });
    await transporter.verify();
    console.info(`[leads:${requestId}] smtp_authenticated`, { provider: host === "smtp.gmail.com" ? "gmail" : "custom" });
    const lead = parsed.data;
    await transporter.sendMail({
      from,
      to: recipient,
      cc,
      replyTo: lead.email,
      subject: `${lead.urgency === "emergency" ? "URGENT: " : ""}Website request for ${lead.service}`,
      text: [`Name: ${lead.name}`, `Phone: ${lead.phone}`, `Email: ${lead.email}`, `Address: ${lead.address}, ${lead.city}`, `Service: ${lead.service}`, `Urgency: ${lead.urgency}`, `Preferred contact: ${lead.preferredContact}`, "", lead.message].join("\n"),
    });
    console.info(`[leads:${requestId}] smtp_delivered`);
    return NextResponse.json({ success: true, code: "DELIVERED", message: "Thank you. Your request was sent, and we’ll follow up using your preferred contact method.", requestId });
  } catch (error) {
    const diagnostic = safeSmtpError(error, password, user);
    const event = diagnostic.code === "EAUTH" ? "smtp_authentication_failed" : ["ECONNECTION", "ETIMEDOUT", "ESOCKET"].includes(diagnostic.code) ? "smtp_connection_failed" : "smtp_delivery_failed";
    console.error(`[leads:${requestId}] ${event}`, diagnostic);
    return NextResponse.json({ success: false, code: "DELIVERY_FAILED", message: "We could not send your request. Please call us or try again shortly.", requestId }, { status: 502 });
  }
}
