// stores/userStore.ts
"use client";

import { create } from "zustand";
import { api } from "@/app/services/api";
import { useAuthStore } from "@/stores/authStore";

export type MeDTO = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  user_type?: number; // 1=user, 2=admin
};

export type MyItem = {
  id: string;
  name: string;
  image: string | null;
  price: number;
  status: number;
  seller_name: string | null;
  detail: string | null;
  category: { id: string | null; name: string | null; detail: string | null };
};

export type WalletDTO = {
  balance: string;
  held: string;
  available: string;
  updatedAt?: string;
};

type UserState = {
  // flags
  isAdmin: boolean; // mock สำหรับ admin demo
  setAdmin: (v: boolean) => void;

  // me
  me: MeDTO | null;
  meLoading: boolean;
  meError: string | null;

  // wallet
  wallet: WalletDTO | null;
  walletLoading: boolean;
  walletError: string | null;

  // my items
  myItems: MyItem[];
  myItemsLoading: boolean;
  myItemsError: string | null;

  // actions
  bootstrap: () => Promise<void>; // initToken + fetch me + wallet (และ admin mock)
  fetchMe: (signal?: AbortSignal) => Promise<void>;
  fetchWallet: (signal?: AbortSignal) => Promise<void>;
  fetchMyItems: (signal?: AbortSignal) => Promise<void>;
  updateMe: (p: { name: string; email: string }) => Promise<void>;
};

export const useUserStore = create<UserState>()((set, get) => ({
  // --- flags ---
  isAdmin:
    typeof window !== "undefined"
      ? localStorage.getItem("isAdmin") === "true" ||
        localStorage.getItem("userEmail") === "admin@gmail.com"
      : false,
  setAdmin: (v) => {
    if (typeof window !== "undefined") {
      if (v) localStorage.setItem("isAdmin", "true");
      else localStorage.removeItem("isAdmin");
    }
    set({ isAdmin: v });
  },

  // --- me ---
  me: null,
  meLoading: false,
  meError: null,

  // --- wallet ---
  wallet: null,
  walletLoading: false,
  walletError: null,

  // --- my items ---
  myItems: [],
  myItemsLoading: false,
  myItemsError: null,

  // --- actions ---
  bootstrap: async () => {
    // 1) token
    const initToken = useAuthStore.getState().initToken;
    await initToken();

    // 2) ถ้าเป็น admin mock ก็หยุดที่นี่ (ไม่เรียก API จริง)
    if (get().isAdmin) {
      set({
        me: {
          id: "admin",
          name: "Admin",
          email: "admin@gmail.com",
          image: null,
          createdAt: new Date().toISOString(),
        },
        wallet: { balance: "∞", held: "0", available: "∞" },
        myItems: [],
      });
      return;
    }

    // 3) โหลด me + wallet พร้อมกัน
    await Promise.allSettled([get().fetchMe(), get().fetchWallet()]);
  },

  fetchMe: async (signal) => {
    if (get().isAdmin) return;
    set({ meLoading: true, meError: null });
    try {
      const r = await api.get<{ success: boolean; data: MeDTO }>(
        "/auth/user/me",
        { signal }
      );
      if (!r.data?.success) throw new Error("Load me failed");
      set({ me: r.data.data });
    } catch (e: any) {
      if (e?.name !== "AbortError")
        set({ meError: e?.message || "Load me failed" });
    } finally {
      set({ meLoading: false });
    }
  },

  fetchWallet: async (signal) => {
    if (get().isAdmin) return;
    set({ walletLoading: true, walletError: null });
    try {
      const r = await api.get<{ success: boolean; data: WalletDTO }>(
        "/auth/user/wallet",
        {
          signal,
        }
      );
      if (!r.data?.success) throw new Error("Load wallet failed");
      set({ wallet: r.data.data });
    } catch (e: any) {
      if (e?.name !== "AbortError")
        set({ walletError: e?.message || "Load wallet failed", wallet: null });
    } finally {
      set({ walletLoading: false });
    }
  },

  fetchMyItems: async (signal) => {
    if (get().isAdmin) return;
    set({ myItemsLoading: true, myItemsError: null });
    try {
      const r = await api.get<{ success: boolean; data: MyItem[] }>(
        "/v1/home/my-items",
        {
          params: { limit: 50 },
          signal,
        }
      );
      const list = Array.isArray(r.data?.data) ? r.data.data : [];
      set({ myItems: list });
    } catch (e: any) {
      if (e?.name !== "AbortError")
        set({ myItemsError: e?.message || "Load my items failed" });
    } finally {
      set({ myItemsLoading: false });
    }
  },

  updateMe: async (p) => {
    if (get().isAdmin) return;
    const prev = get().me;
    // optimistic patch ข้างหน้า
    if (prev) set({ me: { ...prev, name: p.name, email: p.email } });
    try {
      const r = await api.patch<{ success: boolean; data: MeDTO }>(
        "/auth/user/update",
        p
      );
      if (!r.data?.success) throw new Error("Update failed");
      set({ me: r.data.data });
    } catch (e) {
      // rollback
      if (prev) set({ me: prev });
      throw e;
    }
  },
}));
