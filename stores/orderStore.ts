// stores/orderStore.ts
"use client";

import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { api } from "@/app/services/api";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "./userStore";

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

  // ✅ เพิ่มฟิลด์ที่เกี่ยวกับ timeline
  tradeDeadlineAt?: string | null;
  sellerAcceptedAt?: string | null;
  sellerConfirmedAt?: string | null;
  buyerConfirmedAt?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  disputedAt?: string | null;
};

/* ===== Types จาก BE (snake_case) ===== */
type ApiOrder = {
  order_id: string;
  order_status: string;
  order_created_at: string;
  order_deadline_at: string | null;
  trade_deadline_at?: string | null;
  order_quantity: number;
  price_at_purchase: string | number;
  total: string | number;
  item_id: string;
  item_name: string;
  item_image: string | null;
  seller_id: string;
  seller_name: string | null;
  buyer_id: string;
  buyer_name: string | null;
  has_new_messages?: boolean;
  // timestamps อื่น ๆ จาก BE
  seller_accepted_at?: string | null;
  seller_confirmed_at?: string | null;
  buyer_confirmed_at?: string | null;
  cancelled_at?: string | null;
  disputed_at?: string | null;
  cancelled_by?: string | null;
};

type OrdersResp = { success: boolean; data: ApiOrder[]; error?: string };
type OrderResp = { success: boolean; data: ApiOrder; error?: string };
type MeResp = { success: boolean; data: Me; error?: string };

/* ===== Normalizer: ApiOrder -> OrderRow (camelCase) ===== */
const toOrderRow = (o: ApiOrder): OrderRow => ({
  id: o.order_id,
  status: o.order_status,
  createdAt: o.order_created_at,

  deadlineAt: o.order_deadline_at ?? null, // deadline ของออเดอร์/escrow
  tradeDeadlineAt: o.trade_deadline_at ?? null, // deadline ช่วงเทรดหลัง accept

  quantity: o.order_quantity,
  price: Number(o.price_at_purchase),
  total: Number(o.total),

  item: { id: o.item_id, name: o.item_name, image: o.item_image ?? null },
  seller: { id: o.seller_id, name: o.seller_name ?? null },
  buyer: { id: o.buyer_id, name: o.buyer_name ?? null },

  // ✅ ฟิลด์สำหรับ timeline
  sellerAcceptedAt: o.seller_accepted_at ?? null,
  sellerConfirmedAt: o.seller_confirmed_at ?? null,
  buyerConfirmedAt: o.buyer_confirmed_at ?? null,
  cancelledAt: o.cancelled_at ?? null,
  cancelledBy: o.cancelled_by ?? null,
  disputedAt: o.disputed_at ?? null,
});

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
  acceptOrder: (id: string) => Promise<void>;

  confirmSeller: (id: string) => Promise<void>;
  confirmBuyer: (id: string) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  disputeOrder: (id: string, reasonCode?: string) => Promise<void>;

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
      const list = res.data.data.map(toOrderRow); // ✅ แปลงก่อน
      const map: Record<string, OrderRow> = {};
      for (const o of list) map[o.id] = o; // ✅ key = camel id
      set((s) => ({
        purchaseOrders: list,
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
      const list = res.data.data.map(toOrderRow); // ✅
      const map: Record<string, OrderRow> = {};
      for (const o of list) map[o.id] = o;
      set((s) => ({
        saleOrders: list,
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
      const row = toOrderRow(res.data.data); // ✅
      set((s) => ({ orderById: { ...s.orderById, [row.id]: row } })); // ✅ ใช้ row.id
      return row;
    } catch (e: any) {
      if (e?.name !== "AbortError")
        set({ error: e?.message || "Failed to load order" });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  acceptOrder: async (id: string) => {
    const prev = get().orderById[id];
    if (prev) get().updateOrderStatusLocal(id, "IN_TRADE"); // optimistic

    try {
      const res = await api.post<{
        success: boolean;
        data?: ApiOrder | { status?: string };
        error?: string;
      }>(`/v1/orders/${id}/accept`);
      if (!res.data?.success)
        throw new Error(res.data?.error || "Accept failed");

      // ถ้า BE คืนทั้งออเดอร์แบบ snake_case ก็ normalize ทั้งก้อน
      if (res.data.data && "order_id" in (res.data.data as any)) {
        const row = toOrderRow(res.data.data as ApiOrder);
        set((s) => ({
          orderById: { ...s.orderById, [row.id]: row },
          saleOrders: s.saleOrders.map((o) => (o.id === row.id ? row : o)),
          purchaseOrders: s.purchaseOrders.map((o) =>
            o.id === row.id ? row : o
          ),
        }));
      } else {
        // ถ้าได้มาแค่ status
        const nextStatus = (res.data?.data as any)?.status ?? "IN_TRADE";
        get().updateOrderStatusLocal(id, nextStatus);
      }
    } catch (e: any) {
      if (prev) get().updateOrderStatusLocal(id, prev.status); // rollback
      set({ error: e?.message || "Failed to accept order" });
    }
  },

  // ✅ ผู้ขายยืนยันส่ง (ถ้าผู้ซื้อเคยยืนยันแล้วจะจบเป็น COMPLETED)
  confirmSeller: async (id: string) => {
    const prev = get().orderById[id];
    try {
      const res = await api.post<{
        success: boolean;
        data?: any;
        error?: string;
      }>(`/v1/orders/${id}/confirm/seller`);
      if (!res.data?.success)
        throw new Error(res.data?.error || "Confirm failed");

      // ไม่เดา state → ดึงรายละเอียดล่าสุดมา sync
      await get().fetchOrderById(id);
      await useUserStore.getState().fetchWallet(); // update ยอดเงิน
    } catch (e: any) {
      // ไม่ต้อง rollback สถานะ (เราไม่ได้ optimistic)
      set({ error: e?.message || "Failed to confirm (seller)" });
      // ถ้าอยาก safe: รีเฟรชเพื่อแน่ใจ
      if (prev) {
        await get().fetchOrderById(id);
        await useUserStore.getState().fetchWallet(); // update ยอดเงิน
      }
    }
  },

  // ✅ ผู้ซื้อยืนยันรับ
  confirmBuyer: async (id: string) => {
    const prev = get().orderById[id];
    try {
      const res = await api.post<{
        success: boolean;
        data?: any;
        error?: string;
      }>(`/v1/orders/${id}/confirm/buyer`);
      if (!res.data?.success)
        throw new Error(res.data?.error || "Confirm failed");
      await get().fetchOrderById(id);
      await useUserStore.getState().fetchWallet(); // update ยอดเงิน
    } catch (e: any) {
      set({ error: e?.message || "Failed to confirm (buyer)" });
      if (prev) {
        await get().fetchOrderById(id);
        await useUserStore.getState().fetchWallet(); // update ยอดเงิน
      }
    }
  },

  // ✅ ยกเลิก (คืนเงินถ้ามี escrow) — ฝั่ง BE เป็นคนตัดสินว่าใครกดยกเลิกได้เมื่อไร
  cancelOrder: async (id: string) => {
    const prev = get().orderById[id];
    try {
      const res = await api.post<{
        success: boolean;
        data?: any;
        error?: string;
      }>(`/v1/orders/${id}/cancel`);
      if (!res.data?.success)
        throw new Error(res.data?.error || "Cancel failed");
      await get().fetchOrderById(id);
      await useUserStore.getState().fetchWallet(); // update ยอดเงิน
    } catch (e: any) {
      set({ error: e?.message || "Failed to cancel order" });
      if (prev) await get().fetchOrderById(id);
    }
  },

  // ✅ เปิดข้อพิพาท
  disputeOrder: async (id: string, reasonCode: string = "OTHER") => {
    const prev = get().orderById[id];
    // ทำได้ทั้ง optimistic หรือไม่; ที่นี่เลือกไม่ optimistic
    try {
      const res = await api.post<{
        success: boolean;
        data?: any;
        error?: string;
      }>(`/v1/orders/${id}/dispute`, { reason_code: reasonCode });
      if (!res.data?.success)
        throw new Error(res.data?.error || "Dispute failed");
      await get().fetchOrderById(id);
    } catch (e: any) {
      set({ error: e?.message || "Failed to dispute" });
      if (prev) await get().fetchOrderById(id);
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

export const normStatus = (s?: string) => {
  const raw = (s || "").toUpperCase();
  switch (raw) {
    case "ESCROW_HELD":
      return "pending"; // ยังไม่ accept
    case "IN_TRADE":
      return "in_trade"; // เทรดอยู่ (เพิ่ง accept)
    case "AWAIT_CONFIRM":
      return "await_confirm"; // รอ confirm ครบสองฝ่าย
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
    case "EXPIRED":
      return "expired";
    case "DISPUTED":
      return "disputed";
    default:
      return raw.toLowerCase();
  }
};
export const statusChipOf = (s?: string) => {
  // ใช้ label + className กลับไปที่ UI
  const k = normStatus(s);
  switch (k) {
    case "pending":
      return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    case "in_trade":
      return "bg-indigo-500/20 text-indigo-500 border-indigo-500/30";
    case "await_confirm":
      return "bg-amber-500/20 text-amber-500 border-amber-500/30";
    case "completed":
      return "bg-green-500/20 text-green-500 border-green-500/30";
    case "cancelled":
      return "bg-slate-500/20 text-slate-500 border-slate-500/30";
    case "expired":
      return "bg-orange-500/20 text-orange-500 border-orange-500/30";
    case "disputed":
      return "bg-red-500/20 text-red-500 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};
