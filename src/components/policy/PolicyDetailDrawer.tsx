import { Copy, ExternalLink, Star } from "lucide-react";

import { Drawer } from "@/components/ui/Drawer";
import { Policy } from "@/types/policy";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { usePolicyMapStore } from "@/stores/usePolicyMapStore";
import { formatDateYmd } from "@/utils/date";

export function PolicyDetailDrawer({
  policy,
  open,
  onClose,
}: {
  policy: Policy | null;
  open: boolean;
  onClose: () => void;
}) {
  const favorites = usePolicyMapStore((s) => s.favorites);
  const toggleFavorite = usePolicyMapStore((s) => s.toggleFavorite);
  const toast = usePolicyMapStore((s) => s.toast);

  if (!open) return null;

  const fav = policy ? favorites.includes(policy.id) : false;

  return (
    <Drawer open={open} onClose={onClose} title={policy?.title ?? ""}>
      {policy ? (
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Chip label={policy.regionName} active />
            <Chip label={policy.policyType} active />
            {policy.tags.map((t) => (
              <Chip key={t} label={t} />
            ))}
          </div>

          <div className="mt-4 grid gap-2 rounded-2xl border border-[color:var(--border)] bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="text-slate-600">更新时间</div>
              <div className="font-medium text-slate-900">{formatDateYmd(policy.updatedAt)}</div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="text-slate-600">截止时间</div>
              <div className="font-medium text-slate-900">{policy.deadline ? formatDateYmd(policy.deadline) : "长期有效"}</div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="text-slate-600">适用人群</div>
              <div className="font-medium text-slate-900">{policy.targetAudience || "-"}</div>
            </div>
          </div>

          <div className="mt-5 text-sm font-semibold">要点摘要</div>
          <div className="mt-2 text-sm leading-relaxed text-slate-600">{policy.summary}</div>

          {policy.requirements ? (
            <>
              <div className="mt-5 text-sm font-semibold">适用条件</div>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{policy.requirements}</div>
            </>
          ) : null}

          {policy.materials ? (
            <>
              <div className="mt-5 text-sm font-semibold">材料清单</div>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{policy.materials}</div>
            </>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={async () => {
                const text = `${policy.title}\n${policy.regionName} · ${policy.policyType}\n${policy.summary}\n${policy.officialUrl || ""}`;
                await navigator.clipboard.writeText(text);
                toast("已复制摘要");
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              复制摘要
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                toggleFavorite(policy.id);
                toast(fav ? "已取消收藏" : "已收藏");
              }}
            >
              <Star className={fav ? "mr-2 h-4 w-4 fill-amber-400 text-amber-500" : "mr-2 h-4 w-4 text-slate-600"} />
              {fav ? "已收藏" : "收藏"}
            </Button>
            {policy.officialUrl ? (
              <Button asChild variant="primary">
                <a href={policy.officialUrl} target="_blank" rel="noreferrer">
                  打开官方原文 <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ) : null}
          </div>

          <div className="mt-6 text-xs text-slate-500">以官方原文为准；信息仅供参考。</div>
        </div>
      ) : null}
    </Drawer>
  );
}

