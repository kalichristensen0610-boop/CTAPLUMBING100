import Link from "next/link";
import Image from "next/image";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { emailHref, nav, phoneHref, site } from "@/lib/site";
import { services } from "@/lib/content";

export function Footer() { return <footer className="bg-navy text-slate-300"><div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
  <div><Image src="/images/logo-source.webp" alt="CTA Plumbing 100" width={112} height={112} className="rounded-xl" /><p className="mt-4 leading-7">Dependable residential and commercial plumbing support across Nampa and the Treasure Valley.</p></div>
  <div><h2 className="footer-title">Explore</h2>{nav.map((item) => <Link className="footer-link" href={item.href} key={item.href}>{item.label}</Link>)}</div>
  <div><h2 className="footer-title">Popular Services</h2>{services.slice(0, 5).map((service) => <Link className="footer-link" href={`/services/${service.slug}`} key={service.slug}>{service.name}</Link>)}</div>
  <div><h2 className="footer-title">Contact</h2><a className="footer-contact" href={phoneHref}><Phone />{site.phone}</a><a className="footer-contact" href={emailHref}><Mail />{site.email}</a><p className="footer-contact"><Clock />{site.hours}<br />{site.emergencyHours}</p><p className="footer-contact"><MapPin />{site.area}</p></div>
  </div><div className="border-t border-white/10"><div className="container grid gap-4 py-6 text-sm lg:grid-cols-[1fr_auto] lg:items-center"><div><p>© 2026 CTA Plumbing 100. All Rights Reserved.</p><p className="mt-1">Site developed by Christensen &amp; Co. Agency</p></div><nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal and website information"><Link className="hover:text-copper-light" href="/sitemap">Sitemap</Link><Link className="hover:text-copper-light" href="/privacy-policy">Privacy Policy</Link><Link className="hover:text-copper-light" href="/terms-and-conditions">Terms and Conditions</Link></nav></div></div></footer> }
