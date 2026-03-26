import { cn } from "@/lib/utils";

import type { ButtonHTMLAttributes, ReactElement } from "react";
import { cloneElement, isValidElement } from "react";

type Variant = "primary" | "secondary" | "secondaryDark" | "ghost";

export function Button({
  asChild,
  variant = "secondary",
  className,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: Variant;
}) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition active:translate-y-[1px]",
    variant === "primary" && "bg-[color:var(--primary)] text-white hover:brightness-95 disabled:opacity-50",
    variant === "secondary" &&
      "border border-[color:var(--border)] bg-white text-slate-800 hover:bg-slate-50 disabled:opacity-50",
    variant === "secondaryDark" && "border border-white/15 bg-white/5 text-white hover:bg-white/10 disabled:opacity-50",
    variant === "ghost" && "bg-transparent px-0 text-[color:var(--primary)] hover:underline",
    disabled && "pointer-events-none",
    className
  );

  if (asChild) {
    const child = props.children as unknown;
    if (!isValidElement(child)) return null;
    const el = child as ReactElement<{ className?: string; onClick?: unknown }>;
    return cloneElement(el, { className: cn(el.props.className, classes) });
  }

  return <button className={classes} disabled={disabled} {...props} />;
}
