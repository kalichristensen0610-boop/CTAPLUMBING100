import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

export const runtime = "nodejs";
const applicationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  phone: z.string().trim().min(7).max(30),
  position: z.enum(["Plumber", "Journeyman Plumber", "Other"]),
  message: z.string().trim().max(2000),
  website: z.string().max(0),
});
const attempts = new Map<string, { count: number; reset: number }>();

function allowed(ip: string) {
  const now = Date.now(); const item = attempts.get(ip);
  if (!item || item.reset < now) { attempts.set(ip, { count: 1, reset: now + 30 * 60_000 }); return true; }
  if (item.count >= 3) return false; item.count += 1; return true;
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  console.info(`[employment:${requestId}] endpoint_received`, {
    contentType: request.headers.get("content-type") || "none",
    contentLength: request.headers.get("content-length") || "unknown",
  });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowed(ip)) return NextResponse.json({ success: false, code: "RATE_LIMITED", message: "Too many applications were submitted. Please try again later." }, { status: 429 });
  let form: FormData;
  try { form = await request.formData(); } catch { return NextResponse.json({ success: false, code: "INVALID_FORM", message: "The application could not be read." }, { status: 400 }); }
  const parsed = applicationSchema.safeParse({ name: form.get("name"), email: form.get("email"), phone: form.get("phone"), position: form.get("position"), message: form.get("message") || "", website: form.get("website") || "" });
  if (!parsed.success) return NextResponse.json({ success: false, code: "VALIDATION_ERROR", message: "Please review the application information and try again." }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ success: true, code: "ACCEPTED", message: "Thank you. Your application has been received." });
  const resume = form.get("resume");
  if (!(resume instanceof File) || resume.size === 0) return NextResponse.json({ success: false, code: "RESUME_REQUIRED", message: "Please attach your resume." }, { status: 400 });
  const extension = resume.name.split(".").pop()?.toLowerCase();
  const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if (!extension || !["pdf", "doc", "docx"].includes(extension) || (resume.type && !allowedTypes.includes(resume.type))) return NextResponse.json({ success: false, code: "INVALID_RESUME", message: "Please upload a PDF, DOC, or DOCX resume." }, { status: 400 });
  if (resume.size > 5 * 1024 * 1024) return NextResponse.json({ success: false, code: "RESUME_TOO_LARGE", message: "The resume must be 5 MB or smaller." }, { status: 413 });
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, EMPLOYMENT_RECIPIENT, LEAD_RECIPIENT } = process.env;
  const recipient = EMPLOYMENT_RECIPIENT || LEAD_RECIPIENT;
  const cc = process.env.EMAIL_CC || "kalichristensen0610@gmail.com";
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM || !recipient) {
    if (process.env.NODE_ENV === "production") return NextResponse.json({ success: false, code: "DELIVERY_NOT_CONFIGURED", message: "Online applications are temporarily unavailable. Please email or call us instead." }, { status: 503 });
    return NextResponse.json({ success: true, code: "DEV_ACCEPTED", message: "Development mode: the application was validated successfully. Configure SMTP to deliver applications." });
  }
  try {
    const applicant = parsed.data;
    const transporter = nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT || 587), secure: SMTP_SECURE === "true", auth: { user: SMTP_USER, pass: SMTP_PASSWORD } });
    await transporter.sendMail({ from: SMTP_FROM, to: recipient, cc, replyTo: applicant.email, subject: `Employment application for ${applicant.position}`, text: [`Name: ${applicant.name}`, `Email: ${applicant.email}`, `Phone: ${applicant.phone}`, `Position: ${applicant.position}`, "", "Additional information:", applicant.message || "None provided"].join("\n"), attachments: [{ filename: resume.name, content: Buffer.from(await resume.arrayBuffer()), contentType: resume.type || undefined }] });
    console.info(`[employment:${requestId}] smtp_delivered`);
    return NextResponse.json({ success: true, code: "DELIVERED", message: "Thank you. Your application has been submitted successfully.", requestId });
  } catch (error) {
    const smtpError = error as { name?: string; message?: string; code?: string; command?: string; responseCode?: number };
    let message = smtpError?.message || "Unknown employment delivery error";
    for (const secret of [SMTP_PASSWORD, SMTP_USER]) if (secret) message = message.split(secret).join("[redacted]");
    console.error(`[employment:${requestId}] smtp_delivery_failed`, { name: smtpError?.name || "Error", code: smtpError?.code || "UNKNOWN", command: smtpError?.command, responseCode: smtpError?.responseCode, message: message.slice(0, 500) });
    return NextResponse.json({ success: false, code: "DELIVERY_FAILED", message: "We could not submit your application. Please try again or contact us directly.", requestId }, { status: 502 });
  }
}
