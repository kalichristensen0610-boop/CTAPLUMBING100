"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { nav, phoneHref, site } from "@/lib/site";
import { Button } from "@/components/ui/button";

export function Header() {
  const [open, setOpen] = useState(false);
  return <>
    <div className="bg-navy text-sm text-white"><div className="container flex items-center justify-between gap-4 py-2"><p>24/7 Emergency Plumbing • Treasure Valley</p><a className="hidden font-semibold text-copper-light sm:block" href={phoneHref}><Phone className="mr-2 inline size-4" />{site.phone}</a></div></div>
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="container flex h-24 items-center justify-between gap-4">
      <Link href="/" className="flex items-center" aria-label="CTA Plumbing 100 home"><Image src="/images/logo-source.webp" alt="CTA Plumbing 100" width={76} height={76} priority className="size-[76px] rounded-lg" /></Link>
      <nav className="hidden items-center gap-5 xl:flex" aria-label="Main navigation">{nav.map((item) => <Link className="text-sm font-semibold text-slate-700 hover:text-copper-dark" href={item.href} key={item.href}>{item.label}</Link>)}<Button variant="emergency" asChild><Link href="/emergency-plumbing">Emergency Plumbing</Link></Button></nav>
      <div className="flex items-center gap-2 xl:hidden"><Button variant="emergency" size="icon" asChild><a href={phoneHref} aria-label={`Call ${site.name}`}><Phone /></a></Button><Button variant="outline" size="icon" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label="Toggle navigation">{open ? <X /> : <Menu />}</Button></div>
    </div>
    {open && <nav id="mobile-menu" className="border-t bg-white px-4 pb-5 xl:hidden" aria-label="Mobile navigation">{nav.map((item) => <Link onClick={() => setOpen(false)} className="block border-b py-4 font-semibold text-navy" href={item.href} key={item.href}>{item.label}</Link>)}<Button className="mt-4 w-full" variant="emergency" asChild><Link onClick={() => setOpen(false)} href="/emergency-plumbing">Emergency Plumbing</Link></Button></nav>}
    </header>
  </>;
}
