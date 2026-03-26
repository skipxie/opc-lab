import { Copy, Filter, Search, Star, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import Container from "@/components/Container";
import { PolicyDetailDrawer } from "@/components/policy/PolicyDetailDrawer";
import { PolicyFiltersPanel } from "@/components/policy/PolicyFiltersPanel";
import { PolicyList } from "@/components/policy/PolicyList";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { usePolicyMapStore } from "@/stores/usePolicyMapStore";
import { setPageMeta } from "@/utils/meta";
import { buildPolicyMapSearch, parsePolicyMapSearch } from "@/utils/policyMapUrl";

export default function PolicyMap() {
  setPageMeta({
    title: "政策地图｜按地区快速找到可用政策",
    description: "筛选你所在地区与关注方向，查看政策要点与官方链接。",
  });

  const {
    policies,
    filters,
    setFilters,
    visiblePolicies,
    selectedPolicyId,
    selectPolicy,
    favorites,
    clearFocusOnce,
  } = usePolicyMapStore();

  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const parsed = parsePolicyMapSearch(window.location.search);
    if (parsed) setFilters(parsed);
  }, [setFilters]);

  useEffect(() => {
    const focusId = new URLSearchParams(window.location.search).get("focus");
    if (!focusId) return;
    const exists = policies.some((p) => p.id === focusId);
    if (exists) {
      selectPolicy(focusId);
    }
    clearFocusOnce();
  }, [policies, selectPolicy, clearFocusOnce]);

  useEffect(() => {
    const next = buildPolicyMapSearch(filters);
    const url = `${window.location.pathname}${next}`;
    window.history.replaceState({}, "", url);
  }, [filters]);

  const selected = useMemo(() => {
    if (!selectedPolicyId) return null;
    return policies.find((p) => p.id === selectedPolicyId) ?? null;
  }, [policies, selectedPolicyId]);

  const favoritesCount = favorites.length;

  return (
    <Container className="py-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight">政策列表</div>
          <div className="mt-1 text-sm text-slate-600">筛选你所在地区与关注方向，点击查看详情并跳转到官方原文。</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={async () => {
              const link = `${window.location.origin}${window.location.pathname}${buildPolicyMapSearch(filters)}`;
              await navigator.clipboard.writeText(link);
              usePolicyMapStore.getState().toast("已复制筛选链接");
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            复制筛选链接
          </Button>
          <Button variant="secondary" onClick={() => setFiltersOpen(true)} className="md:hidden">
            <Filter className="mr-2 h-4 w-4" />
            筛选
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setFilters({
                q: "",
                region: "",
                types: [],
                audiences: [],
                updatedWithinDays: 90,
              });
            }}
          >
            <X className="mr-2 h-4 w-4" />
            清除
          </Button>
          <div className="hidden items-center gap-2 rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-slate-600 md:flex">
            <Star className="h-4 w-4 text-amber-500" />
            已收藏 {favoritesCount}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="hidden md:block">
            <PolicyFiltersPanel filters={filters} onChange={setFilters} />
          </div>

          <div className="md:hidden">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Search className="h-4 w-4 text-slate-700" />
                </div>
                <input
                  value={filters.q}
                  onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                  placeholder="搜索政策标题/关键词"
                  className="h-9 w-full rounded-lg border border-[color:var(--border)] bg-white px-3 text-sm outline-none focus:border-[color:var(--primary)]"
                />
              </div>
            </Card>
          </div>
        </div>

        <div className="md:col-span-8">
          <div className="md:h-[72vh]">
            <div className="h-full overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white">
              <PolicyList policies={visiblePolicies} selectedId={selectedPolicyId} onSelect={selectPolicy} />
            </div>
          </div>
        </div>
      </div>

      <PolicyDetailDrawer policy={selected} open={!!selected} onClose={() => selectPolicy(null)} />
      <PolicyFiltersPanel
        filters={filters}
        onChange={setFilters}
        mobileOpen={filtersOpen}
        onMobileOpenChange={setFiltersOpen}
      />
    </Container>
  );
}
