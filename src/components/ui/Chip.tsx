import { cn } from "@/lib/utils";

export function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition",
        active
          ? "border-[color:var(--primary)] bg-blue-50 text-[color:var(--primary)]"
          : "border-[color:var(--border)] bg-white text-slate-700 hover:bg-slate-50"
      )}
      type="button"
    >
      {label}
    </button>
  );
}

