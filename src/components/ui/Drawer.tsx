import { X } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

export function Drawer({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div className={cn("absolute right-0 top-0 h-full w-full max-w-[520px] bg-white shadow-xl", className)}>
        <div className="flex h-14 items-center justify-between border-b border-[color:var(--border)] px-5">
          <div className="truncate text-sm font-semibold">{title ?? ""}</div>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border)] bg-white"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="h-[calc(100%-56px)] overflow-auto">{children}</div>
      </div>
    </div>
  );
}
