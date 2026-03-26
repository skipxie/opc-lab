import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border border-[color:var(--border)] bg-white shadow-sm", className)}>{children}</div>;
}
