"use client";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import type { FAQ } from "@/lib/content";

export function FAQList({ items }: { items: FAQ[] }) {
  return <Accordion.Root type="single" collapsible className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5">
    {items.map((item, index) => <Accordion.Item key={item.question} value={`item-${index}`}>
      <Accordion.Header><Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left font-bold text-navy"><span>{item.question}</span><ChevronDown className="size-5 shrink-0 text-copper transition-transform group-data-[state=open]:rotate-180" /></Accordion.Trigger></Accordion.Header>
      <Accordion.Content className="overflow-hidden pb-5 leading-7 text-slate-600 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">{item.answer}</Accordion.Content>
    </Accordion.Item>)}
  </Accordion.Root>;
}
