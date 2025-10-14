// stores/itemStore.ts
"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/app/services/api";

export type Category = { id: string; name: string; detail?: string | null };
export type Item = {
  id: string;
  name: string;
  seller_name: string | null;
  sellerId: string | null;
  detail: string | null;
  image: string | null;
  price: number;
  status: number;
  category: { id: string | null; name: string | null; detail: string | null };
  expiresAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

type ItemState = {
  // UI
  selectedTag: string | null;
  searchTerm: string;
  setSelectedTag: (tag: string | null) => void;
  setSearchTerm: (q: string) => void;

  // data
  categories: Category[];
  catMap: Record<string, string>;

  catLoading: boolean;
  catError: string | null;

  items: Item[];
  loading: boolean;
  error: string | null;

  // actions
  fetchCategories: (signal?: AbortSignal) => Promise<void>;
  fetchItems: (
    params: { categoryId?: string | null; q?: string },
    signal?: AbortSignal
  ) => Promise<void>;
  deleteItemOptimistic: (id: string) => void;
};

export const useItemStore = create<ItemState>()((set, get) => ({
  // --- UI ---
  selectedTag: null,
  searchTerm: "",
  setSelectedTag: (tag) => set({ selectedTag: tag }),
  setSearchTerm: (q) => set({ searchTerm: q }),

  // --- Data ---
  categories: [],
  catMap: {},
  catLoading: false,
  catError: null,
  items: [],

  // --- Status ---
  loading: false,
  error: null,

  // --- Actions ---

  fetchCategories: async (signal) => {
    set({ catLoading: true, catError: null });
    try {
      const res = await api.get<{
        success: boolean;
        data: Category[];
        error?: string;
      }>("/v1/home/categories", { signal });
      if (!res.data?.success) {
        throw new Error(res.data?.error || "Failed to load categories");
      }
      const list: Category[] = Array.isArray(res.data.data)
        ? res.data.data
        : [];
      const map: Record<string, string> = {};
      for (const c of list) map[c.id] = c.name;
      set({ categories: list, catMap: map });
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        set({ catError: e?.message || "Failed to load categories" });
      }
    } finally {
      set({ catLoading: false });
    }
  },

  fetchItems: async ({ categoryId, q }, signal) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{
        success: boolean;
        data: Item[];
        error?: string;
      }>("/v1/home", {
        params: {
          ...(categoryId ? { categoryId } : {}),
          ...(q ? { q } : {}),
        },
        signal,
      });

      if (!res.data?.success)
        throw new Error(res.data?.error || "failed to fetch items");

      const rows: Item[] = Array.isArray(res.data.data) ? res.data.data : [];

      // ✅ sort ใหม่สุดก่อน: ใช้ updatedAt > createdAt > expiresAt เป็นลำดับความสำคัญ
      const sorted = rows
        .map((r) => {
          const ts = r.updatedAt ?? r.createdAt ?? r.expiresAt ?? null;
          return { ...r, __sortTs: ts ? new Date(ts).getTime() : 0 };
        })
        .sort((a, b) => b.__sortTs - a.__sortTs)
        .map(({ __sortTs, ...rest }) => rest);

      set({ items: sorted });
    } catch (e: any) {
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;
      set({ error: e?.message || "failed to fetch items" });
    } finally {
      set({ loading: false });
    }
  },

  deleteItemOptimistic: (id) => {
    set((s) => ({ items: s.items.filter((it) => it.id !== id) }));
  },
}));

export const useMarketplaceSlice = <T>(selector: (s: ItemState) => T) =>
  useItemStore(useShallow(selector));
