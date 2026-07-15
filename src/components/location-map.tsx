import { ExternalLink, MapPin } from "lucide-react";
import { fullAddress, mapEmbedSrc, mapHref } from "@/lib/site";

export function LocationMap({ compact = false }: { compact?: boolean }) {
  return <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
    <iframe
      title="CTA Plumbing 100 location in Nampa, Idaho"
      src={mapEmbedSrc}
      width="100%"
      height={compact ? 340 : 460}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="block border-0"
      allowFullScreen
    />
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-3 font-semibold text-navy"><MapPin className="mt-0.5 size-5 shrink-0 text-copper-dark" /><span>{fullAddress}</span></p>
      <a href={mapHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-bold text-copper-dark hover:text-navy">Open in Google Maps <ExternalLink className="size-4" /></a>
    </div>
  </div>;
}
