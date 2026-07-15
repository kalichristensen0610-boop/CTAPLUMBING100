"use client";

import { FormEvent, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, Send, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = { type: "success" | "error"; message: string } | null;

export function EmploymentForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const resume = data.get("resume");
    if (!(resume instanceof File) || resume.size === 0) {
      setStatus({ type: "error", message: "Please attach your resume." }); return;
    }
    const extension = resume.name.split(".").pop()?.toLowerCase();
    if (!extension || !["pdf", "doc", "docx"].includes(extension)) {
      setStatus({ type: "error", message: "Please upload a PDF, DOC, or DOCX resume." }); return;
    }
    if (resume.size > 5 * 1024 * 1024) {
      setStatus({ type: "error", message: "The resume must be 5 MB or smaller." }); return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/employment", { method: "POST", body: data });
      const responseText = await response.text();
      let result: { message?: string; code?: string; requestId?: string };
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { message: response.ok ? "The server returned an unreadable response." : `The application server returned an error (${response.status}). Please try again.` };
      }
      if (!response.ok) console.error("Employment form request failed", { status: response.status, code: result.code || "NON_JSON_RESPONSE", message: result.message, requestId: result.requestId });
      if (!response.ok) throw new Error(result.message || "We could not submit your application.");
      setStatus({ type: "success", message: result.message || "Thank you. Your application has been submitted successfully." });
      formRef.current?.reset();
    } catch (error) {
      console.error("Employment form submission error", { message: error instanceof Error ? error.message : "Unknown request error" });
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Please try again or contact us directly." });
    } finally { setSubmitting(false); }
  }

  const field = "mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-navy outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/20";
  const label = "block text-sm font-bold text-navy";
  return <form ref={formRef} onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
    <div className="grid gap-5 sm:grid-cols-2">
      <label className={label}>Full name *<input name="name" className={field} autoComplete="name" minLength={2} maxLength={100} required /></label>
      <label className={label}>Email address *<input name="email" className={field} type="email" autoComplete="email" maxLength={150} required /></label>
      <label className={label}>Phone number *<input name="phone" className={field} type="tel" autoComplete="tel" minLength={7} maxLength={30} required /></label>
      <label className={label}>Position applying for *<select name="position" className={field} required><option value="">Select a position</option><option>Plumber</option><option>Journeyman Plumber</option><option>Other</option></select></label>
    </div>
    <label className={`${label} mt-5`}>Resume *<span className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center"><Upload className="mb-2 text-copper-dark" /><span>Upload PDF, DOC, or DOCX</span><span className="mt-1 text-xs font-normal text-slate-500">Maximum file size is 5 MB</span><input name="resume" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="mt-3 max-w-full text-sm" required /></span></label>
    <label className={`${label} mt-5`}>Message or additional information<textarea name="message" className={`${field} min-h-32 py-3`} maxLength={2000} /></label>
    <label className="sr-only" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    {status && <div role="status" className={`mt-5 flex gap-3 rounded-lg p-4 ${status.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{status.type === "success" ? <CheckCircle2 className="shrink-0" /> : <AlertCircle className="shrink-0" />}<p>{status.message}</p></div>}
    <Button type="submit" size="lg" className="mt-6 w-full" disabled={submitting}>{submitting ? <><LoaderCircle className="animate-spin" />Submitting…</> : <><Send />Submit Application</>}</Button>
    <p className="mt-4 text-sm leading-6 text-slate-500">Submitting an application does not guarantee employment or an interview.</p>
  </form>;
}
