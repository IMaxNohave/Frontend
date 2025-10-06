"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

export type Category = { id: string; name: string; detail?: string | null };
export type Item = {
  id: string;
  name: string;
  seller_name: string | null;
  detail: string | null;
  image: string | null;
  price: number;
  status: number;
  category: { id: string | null; name: string | null; detail: string | null };
};

type ItemState = {
  // UI state
  selectedTag: string | null; // categoryId
  searchTerm: string;
  setSelectedTag: (tag: string | null) => void;
  setSearchTerm: (q: string) => void;

  // auth
  token: string | null;
  setToken: (t: string | null) => void;
  initToken: () => Promise<void>;

  // data
  categories: Category[];
  catMap: Record<string, string>;
  items: Item[];

  // status
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

  // --- Auth ---
  token: null,
  setToken: (t) => set({ token: t }),
  initToken: async () => {
    try {
      const res = await fetch("/api/api/auth/token", {
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) {
        const { token } = await res.json();
        if (token) {
          localStorage.setItem("token", token);
          set({ token });
        } else {
          set({ token: localStorage.getItem("token") });
        }
      } else {
        // fallback: ลองดึงจาก localStorage
        set({ token: localStorage.getItem("token") });
      }
    } catch {
      set({ token: localStorage.getItem("token") });
    }
  },

  // --- Data ---
  categories: [],
  catMap: {},
  items: [],

  // --- Status ---
  loading: false,
  error: null,

  // --- Actions ---
  fetchCategories: async (signal) => {
    const token = get().token || localStorage.getItem("token");
    try {
      const r = await fetch("/api/v1/home/categories", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
        signal,
      });
      const j = await r.json();
      const list: Category[] = Array.isArray(j?.data) ? j.data : [];
      const map: Record<string, string> = {};
      for (const c of list) map[c.id] = c.name;
      set({ categories: list, catMap: map });
    } catch (e) {
      // ไม่ถือเป็น fatal error ของหน้า
      // คุณจะ log เพิ่มเติมก็ได้
    }
  },

  fetchItems: async ({ categoryId, q }, signal) => {
    const token = get().token || localStorage.getItem("token");

    const params = new URLSearchParams();
    if (categoryId) params.set("categoryId", categoryId);
    if (q) params.set("q", q);

    set({ loading: true, error: null });
    try {
      const r = await fetch(`/api/v1/home?${params.toString()}`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
        signal,
      });
      const txt = await r.text();
      const json = JSON.parse(txt || "{}");
      if (!r.ok || json?.success === false) {
        throw new Error(json?.error || `${r.status} ${r.statusText}`);
      }
      const rows: Item[] = json.data || [];
      set({ items: rows });
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      set({ error: e?.message || "failed to fetch items" });
    } finally {
      set({ loading: false });
    }
  },

  deleteItemOptimistic: (id) => {
    set((s) => ({ items: s.items.filter((it) => it.id !== id) }));
    // TODO: คุณสามารถยิง DELETE API ที่นี่ แล้ว rollback ถ้าพัง
  },
}));

// ตัวช่วยเลือกเฉพาะฟิลด์ (ลด re-render)
export const useMarketplaceSlice = <T>(selector: (s: ItemState) => T) =>
  useItemStore(useShallow(selector));
