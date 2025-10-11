// stores/orderStore.ts
"use client";

import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { api } from "@/app/services/api";
import { useAuthStore } from "@/stores/authStore";

/* ===== Types ===== */
export type Me = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};
export type OrderRow = {
  id: string;
  status: string;
  createdAt: string;
  deadlineAt: string | null;
  quantity: number;
  price: number;
  total: number;
  item: { id: string; name: string; image: string | null };
  seller: { id: string; name: string | null };
  buyer: { id: string; name: string | null };
  hasNewMessages?: boolean;
};

type OrdersResp = { success: boolean; data: OrderRow[]; error?: string };
type OrderResp = { success: boolean; data: OrderRow; error?: string };
type MeResp = { success: boolean; data: Me; error?: string };

/* ===== State ===== */
type OrdersState = {
  // me
  me: Me | null;
  meLoaded: boolean;
  fetchMe: (signal?: AbortSignal) => Promise<void>;

  // collections
  purchaseOrders: OrderRow[];
  saleOrders: OrderRow[];
  orderById: Record<string, OrderRow>;

  // ui/status
  loading: boolean;
  error: string | null;

  // filters
  statusFilter: string | null;
  setStatusFilter: (s: string | null) => void;

  // actions
  fetchMyPurchaseOrders: (signal?: AbortSignal) => Promise<void>;
  fetchMySaleOrders: (signal?: AbortSignal) => Promise<void>;
  fetchOrderById: (
    id: string,
    signal?: AbortSignal
  ) => Promise<OrderRow | null>;

  // optimistic helpers
  markMessagesSeen: (id: string) => void;
  updateOrderStatusLocal: (id: string, next: string) => void;

  // mutations
  markReady: (id: string) => Promise<void>;
  raiseDispute: (id: string) => Promise<void>;
};

export const useOrderStore = create<OrdersState>()((set, get) => ({
  /* --- me --- */
  me: null,
  meLoaded: false,
  fetchMe: async (signal) => {
    set({ meLoaded: false });
    try {
      const res = await api.get<MeResp>("/auth/user/me", { signal });
      if (res.data?.success) set({ me: res.data.data });
    } finally {
      set({ meLoaded: true });
    }
  },

  /* --- data --- */
  purchaseOrders: [],
  saleOrders: [],
  orderById: {},

  /* --- ui --- */
  loading: false,
  error: null,

  /* --- filters --- */
  statusFilter: null,
  setStatusFilter: (s) => set({ statusFilter: s }),

  /* --- actions --- */
  fetchMyPurchaseOrders: async (signal) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<OrdersResp>("/v1/orders/my?limit=50", {
        signal,
      });
      if (!res.data?.success)
        throw new Error(res.data?.error || "Failed to load orders");
      const list = res.data.data;
      const map: Record<string, OrderRow> = {};
      for (const o of list) map[o.id] = o;
      set((s) => ({
        purchaseOrders: list, // ✅ ใส่ที่คีย์นี้
        orderById: { ...s.orderById, ...map },
      }));
    } catch (e: any) {
      if (e?.name !== "AbortError")
        set({ error: e?.message || "Failed to load orders" });
    } finally {
      set({ loading: false });
    }
  },

  fetchMySaleOrders: async (signal) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<OrdersResp>("/v1/orders/sold?limit=50", {
        signal,
      });
      if (!res.data?.success)
        throw new Error(res.data?.error || "Failed to load orders");
      const list = res.data.data;
      const map: Record<string, OrderRow> = {};
      for (const o of list) map[o.id] = o;
      set((s) => ({
        saleOrders: list, // ✅ ใส่ที่คีย์นี้
        orderById: { ...s.orderById, ...map },
      }));
    } catch (e: any) {
      if (e?.name !== "AbortError")
        set({ error: e?.message || "Failed to load orders" });
    } finally {
      set({ loading: false });
    }
  },

  fetchOrderById: async (id, signal) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<OrderResp>(`/v1/orders/${id}`, { signal });
      if (!res.data?.success)
        throw new Error(res.data?.error || "Failed to load order");
      const row = res.data.data;
      set((s) => ({ orderById: { ...s.orderById, [id]: row } }));
      return row;
    } catch (e: any) {
      if (e?.name !== "AbortError")
        set({ error: e?.message || "Failed to load order" });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  markMessagesSeen: (id) =>
    set((s) => ({
      orderById: {
        ...s.orderById,
        [id]: s.orderById[id]
          ? { ...s.orderById[id], hasNewMessages: false }
          : s.orderById[id],
      },
      purchaseOrders: s.purchaseOrders.map((o) =>
        o.id === id ? { ...o, hasNewMessages: false } : o
      ),
      saleOrders: s.saleOrders.map((o) =>
        o.id === id ? { ...o, hasNewMessages: false } : o
      ),
    })),

  updateOrderStatusLocal: (id, next) =>
    set((s) => ({
      orderById: {
        ...s.orderById,
        [id]: s.orderById[id]
          ? { ...s.orderById[id], status: next }
          : s.orderById[id],
      },
      purchaseOrders: s.purchaseOrders.map((o) =>
        o.id === id ? { ...o, status: next } : o
      ),
      saleOrders: s.saleOrders.map((o) =>
        o.id === id ? { ...o, status: next } : o
      ),
    })),

  markReady: async (id) => {
    const prev = get().orderById[id];
    get().updateOrderStatusLocal(id, "READY");
    try {
      const res = await api.patch<{ success: boolean; error?: string }>(
        `/v1/orders/${id}/ready`
      );
      if (!res.data?.success)
        throw new Error(res.data?.error || "Update failed");
    } catch (e) {
      if (prev) get().updateOrderStatusLocal(id, prev.status);
      set({ error: (e as any)?.message || "Failed to set READY" });
    }
  },

  raiseDispute: async (id) => {
    const prev = get().orderById[id];
    get().updateOrderStatusLocal(id, "DISPUTED");
    try {
      const res = await api.post<{ success: boolean; error?: string }>(
        `/v1/orders/${id}/dispute`
      );
      if (!res.data?.success)
        throw new Error(res.data?.error || "Dispute failed");
    } catch (e) {
      if (prev) get().updateOrderStatusLocal(id, prev.status);
      set({ error: (e as any)?.message || "Failed to dispute" });
    }
  },
}));

export const useOrdersSlice = <T>(selector: (s: OrdersState) => T) =>
  useOrderStore(useShallow(selector));

export const normStatus = (s?: string) => s?.toLowerCase?.() ?? "pending";
export const statusChipOf = (s?: string) => {
  const ss = normStatus(s || "");
  switch (ss) {
    case "pending":
      return {
        label: "PENDING",
        className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      };
    case "ready":
      return {
        label: "READY",
        className: "bg-green-500/20 text-green-500 border-green-500/30",
      };
    case "completed":
      return {
        label: "COMPLETED",
        className: "bg-blue-500/20 text-blue-500 border-blue-500/30",
      };
    case "disputed":
      return {
        label: "DISPUTED",
        className: "bg-red-500/20 text-red-500 border-red-500/30",
      };
    default:
      return {
        label: ss.toUpperCase(),
        className: "bg-muted text-muted-foreground border-border",
      };
  }
};
