import { PolicyMapFilters } from "@/stores/usePolicyMapStore";

export function buildPolicyMapSearch(filters: PolicyMapFilters) {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.region.trim()) params.set("region", filters.region.trim());
  if (filters.types.length) params.set("types", filters.types.join(","));
  if (filters.audiences.length) params.set("audiences", filters.audiences.join(","));
  if (filters.updatedWithinDays !== 90) params.set("days", String(filters.updatedWithinDays));
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function parsePolicyMapSearch(search: string): PolicyMapFilters | null {
  const params = new URLSearchParams(search);
  if ([...params.keys()].length === 0) return null;
  const q = params.get("q") ?? "";
  const region = params.get("region") ?? "";
  const types = (params.get("types") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const audiences = (params.get("audiences") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const daysRaw = params.get("days");
  const days = daysRaw ? Number(daysRaw) : 90;
  return {
    q,
    region,
    types,
    audiences,
    updatedWithinDays: Number.isFinite(days) && days > 0 ? days : 90,
  };
}

