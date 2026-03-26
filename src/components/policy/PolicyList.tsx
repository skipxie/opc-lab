import { ExternalLink, Star } from "lucide-react";

import { Policy } from "@/types/policy";
import { cn } from "@/lib/utils";
import { usePolicyMapStore } from "@/stores/usePolicyMapStore";
import { formatDateYmd } from "@/utils/date";

export function PolicyList({
  policies,
  selectedId,
  onSelect,
}: {
  policies: Policy[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const favorites = usePolicyMapStore((s) => s.favorites);
  const toggleFavorite = usePolicyMapStore((s) => s.toggleFavorite);

  return (
    <div className="h-full">
      <div className="sticky top-0 z-10 border-b border-[color:var(--border)] bg-white px-4 py-3">
        <div className="text-sm font-semibold">结果（{policies.length}）</div>
        <div className="mt-1 text-xs text-slate-500">点击列表项可联动地图与详情抽屉</div>
      </div>
      <div className="max-h-[72vh] overflow-auto">
        {policies.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-600">没有匹配结果，换个筛选试试</div>
        ) : (
          <div className="divide-y divide-[color:var(--border)]">
            {policies.map((p) => {
              const active = selectedId === p.id;
              const fav = favorites.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => onSelect(p.id)}
                  className={cn(
                    "w-full px-4 py-4 text-left transition hover:bg-slate-50",
                    active && "bg-slate-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">{p.title}</div>
                      <div className="mt-1 text-xs text-slate-600">
                        {p.regionName} · {p.policyType}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {p.deadline ? (
                        <div className="rounded-full bg-rose-50 px-2 py-1 text-[11px] text-rose-700">
                          截止 {formatDateYmd(p.deadline)}
                        </div>
                      ) : (
                        <div className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">长期</div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(p.id);
                        }}
                        className={cn(
                          "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--border)] bg-white",
                          fav && "border-amber-200 bg-amber-50"
                        )}
                        aria-label="Favorite"
                      >
                        <Star className={cn("h-4 w-4", fav ? "fill-amber-400 text-amber-500" : "text-slate-500")} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 text-sm leading-relaxed text-slate-600">{p.summary}</div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <div>更新：{formatDateYmd(p.updatedAt)}</div>
                    {p.officialUrl ? (
                      <a
                        href={p.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[color:var(--primary)] hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        官方原文 <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
