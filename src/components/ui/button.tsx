import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper disabled:pointer-events-none disabled:opacity-50", { variants: { variant: { default: "bg-copper px-5 py-3 text-navy hover:bg-copper-light", navy: "bg-navy px-5 py-3 text-white hover:bg-navy-light", outline: "border border-slate-300 bg-white px-5 py-3 text-navy hover:border-copper", emergency: "bg-emergency px-5 py-3 text-white shadow-lg hover:bg-red-700" }, size: { default: "min-h-11", lg: "min-h-13 px-7 text-base", icon: "size-11 p-0" } }, defaultVariants: { variant: "default", size: "default" } });

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) { const Comp = asChild ? Slot : "button"; return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />; }
export { buttonVariants };
