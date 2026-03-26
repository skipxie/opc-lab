import { useMemo } from "react";

import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Drawer } from "@/components/ui/Drawer";
import { PolicyMapFilters } from "@/stores/usePolicyMapStore";

const typeOptions = ["补贴", "税务", "场地", "人才", "融资", "其他"];
const audienceOptions = ["个体户", "一人公司", "初创团队", "科技型企业"];

export function PolicyFiltersPanel({
  filters,
  onChange,
  mobileOpen,
  onMobileOpenChange,
}: {
  filters: PolicyMapFilters;
  onChange: (next: PolicyMapFilters) => void;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}) {
  const content = useMemo(() => {
    const toggle = (key: "types" | "audiences", value: string) => {
      const list = filters[key];
      const next = list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
      onChange({ ...filters, [key]: next });
    };

    return (
      <div className="grid gap-4">
        <Card className="p-4">
          <div className="text-sm font-semibold">搜索</div>
          <input
            value={filters.q}
            onChange={(e) => onChange({ ...filters, q: e.target.value })}
            placeholder="搜索政策标题/关键词"
            className="mt-3 h-10 w-full rounded-lg border border-[color:var(--border)] bg-white px-3 text-sm outline-none focus:border-[color:var(--primary)]"
          />
        </Card>

        <Card className="p-4">
          <div className="text-sm font-semibold">地区</div>
          <input
            value={filters.region}
            onChange={(e) => onChange({ ...filters, region: e.target.value })}
            placeholder="例如：上海 / 杭州 / 深圳"
            className="mt-3 h-10 w-full rounded-lg border border-[color:var(--border)] bg-white px-3 text-sm outline-none focus:border-[color:var(--primary)]"
          />
          <div className="mt-3 text-xs text-slate-500">先做文本筛选；后续可接入省市下拉与地理编码。</div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-semibold">类型</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {typeOptions.map((t) => (
              <Chip key={t} label={t} active={filters.types.includes(t)} onClick={() => toggle("types", t)} />
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-semibold">适用人群</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {audienceOptions.map((t) => (
              <Chip key={t} label={t} active={filters.audiences.includes(t)} onClick={() => toggle("audiences", t)} />
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">更新时间</div>
            <div className="text-xs text-slate-600">最近 {filters.updatedWithinDays} 天</div>
          </div>
          <input
            type="range"
            min={7}
            max={180}
            step={1}
            value={filters.updatedWithinDays}
            onChange={(e) => onChange({ ...filters, updatedWithinDays: Number(e.target.value) })}
            className="mt-3 w-full"
          />
        </Card>
      </div>
    );
  }, [filters, onChange]);

  if (mobileOpen != null && onMobileOpenChange) {
    return (
      <Drawer open={mobileOpen} onClose={() => onMobileOpenChange(false)} title="筛选">
        <div className="p-4">{content}</div>
      </Drawer>
    );
  }

  return content;
}

