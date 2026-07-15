"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { leadSchema, type LeadInput } from "@/lib/lead-schema";
import { services } from "@/lib/content";
import { site } from "@/lib/site";
import { Button } from "@/components/ui/button";

export function LeadForm({ emergency = false, compact = false }: { emergency?: boolean; compact?: boolean }) {
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LeadInput>({ resolver: zodResolver(leadSchema), defaultValues: { urgency: emergency ? "emergency" : "non-emergency", preferredContact: "phone", website: "" } });
  async function submit(data: LeadInput) {
    setStatus(null);
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json().catch(() => ({ message: "The server returned an unreadable response." }));
      if (!response.ok) {
        console.error("Contact form request failed", { status: response.status, code: result.code || "UNKNOWN", message: result.message, requestId: result.requestId });
        throw new Error(result.message || "We could not send your request.");
      }
      setStatus({ type: "success", message: result.message }); reset();
    } catch (error) {
      console.error("Contact form submission error", { message: error instanceof Error ? error.message : "Unknown request error" });
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Please call us or try again." });
    }
  }
  const field = "mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-navy outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/20";
  const label = "block text-sm font-bold text-navy";
  const FieldError = ({ name }: { name: keyof typeof errors }) => errors[name] ? <p className="mt-1 text-sm text-emergency">{String(errors[name]?.message)}</p> : null;
  return <form onSubmit={handleSubmit(submit)} className="rounded-2xl bg-white p-6 shadow-xl sm:p-8" noValidate>
    <div className="grid gap-5 sm:grid-cols-2">
      <label className={label}>Name *<input className={field} autoComplete="name" {...register("name")} /><FieldError name="name" /></label>
      <label className={label}>Phone *<input className={field} type="tel" autoComplete="tel" {...register("phone")} /><FieldError name="phone" /></label>
      <label className={label}>Email *<input className={field} type="email" autoComplete="email" {...register("email")} /><FieldError name="email" /></label>
      <label className={label}>Service address *<input className={field} autoComplete="street-address" {...register("address")} /><FieldError name="address" /></label>
      <label className={label}>City *<input className={field} list="service-cities" autoComplete="address-level2" {...register("city")} /><datalist id="service-cities">{site.cities.map((city) => <option value={city} key={city} />)}</datalist><FieldError name="city" /></label>
      <label className={label}>Service needed *<select className={field} {...register("service")}><option value="">Select a service</option>{services.map((service) => <option value={service.name} key={service.slug}>{service.name}</option>)}</select><FieldError name="service" /></label>
      <label className={label}>Request type *<select className={field} {...register("urgency")}><option value="non-emergency">Not an emergency</option><option value="emergency">Emergency</option></select></label>
      <label className={label}>Preferred contact *<select className={field} {...register("preferredContact")}><option value="phone">Phone call</option><option value="text">Text message</option><option value="email">Email</option></select></label>
    </div>
    <label className={`${label} mt-5`}>How can we help? *<textarea className={`${field} min-h-32 py-3`} {...register("message")} /><FieldError name="message" /></label>
    <label className="sr-only" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" {...register("website")} /></label>
    {status && <div role="status" className={`mt-5 flex gap-3 rounded-lg p-4 ${status.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{status.type === "success" ? <CheckCircle2 className="shrink-0" /> : <AlertCircle className="shrink-0" />}<p>{status.message}</p></div>}
    <Button type="submit" size="lg" variant={emergency ? "emergency" : "default"} className={`${compact ? "" : "w-full"} mt-6`} disabled={isSubmitting}>{isSubmitting ? <><LoaderCircle className="animate-spin" />Sending…</> : <><Send />Request Service</>}</Button>
    <p className="mt-4 text-sm leading-6 text-slate-500">Submitting this form does not confirm an appointment. For urgent plumbing problems, call our 24/7 emergency line.</p>
  </form>;
}
