import { create } from "zustand";

import { samplePolicies } from "@/data/samplePolicies";
import { Policy } from "@/types/policy";
import { safeLocalStorage } from "@/utils/storage";

export type PolicyMapFilters = {
  q: string;
  region: string;
  types: string[];
  audiences: string[];
  updatedWithinDays: number;
};

type State = {
  policies: Policy[];
  filters: PolicyMapFilters;
  setFilters: (next: PolicyMapFilters) => void;
  selectedPolicyId: string | null;
  selectPolicy: (id: string | null) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  visiblePolicies: Policy[];
  toastMessage: string | null;
  toast: (message: string) => void;
  clearToast: () => void;
  clearFocusOnce: () => void;
};

const favoritesKey = "opc_policy_favorites";

function computeVisible(policies: Policy[], filters: PolicyMapFilters) {
  const q = filters.q.trim().toLowerCase();
  const region = filters.region.trim().toLowerCase();
  const now = Date.now();
  const maxAgeMs = filters.updatedWithinDays * 24 * 60 * 60 * 1000;
  return policies
    .filter((p) => {
      if (!q) return true;
      const hay = `${p.title} ${p.summary} ${p.requirements ?? ""} ${p.materials ?? ""}`.toLowerCase();
      return hay.includes(q);
    })
    .filter((p) => {
      if (!region) return true;
      return p.regionName.toLowerCase().includes(region);
    })
    .filter((p) => {
      if (filters.types.length === 0) return true;
      return filters.types.includes(p.policyType);
    })
    .filter((p) => {
      if (filters.audiences.length === 0) return true;
      const a = (p.targetAudience ?? "").toLowerCase();
      return filters.audiences.some((x) => a.includes(x.toLowerCase()));
    })
    .filter((p) => {
      const ts = new Date(p.updatedAt).getTime();
      return now - ts <= maxAgeMs;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export const usePolicyMapStore = create<State>((set, get) => {
  const favorites = safeLocalStorage.getJson<string[]>(favoritesKey) ?? [];
  const initialFilters: PolicyMapFilters = {
    q: "",
    region: "",
    types: [],
    audiences: [],
    updatedWithinDays: 90,
  };

  return {
    policies: samplePolicies,
    filters: initialFilters,
    setFilters: (next) => set({ filters: next, visiblePolicies: computeVisible(get().policies, next) }),
    selectedPolicyId: null,
    selectPolicy: (id) => set({ selectedPolicyId: id }),
    favorites,
    toggleFavorite: (id) => {
      const current = get().favorites;
      const next = current.includes(id) ? current.filter((x) => x !== id) : [id, ...current];
      safeLocalStorage.setJson(favoritesKey, next);
      set({ favorites: next });
    },
    visiblePolicies: computeVisible(samplePolicies, initialFilters),
    toastMessage: null,
    toast: (message) => set({ toastMessage: message }),
    clearToast: () => set({ toastMessage: null }),
    clearFocusOnce: () => {
      const url = new URL(window.location.href);
      if (!url.searchParams.get("focus")) return;
      url.searchParams.delete("focus");
      window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    },
  };
});
