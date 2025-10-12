// hooks/useOrders.ts
"use client";

import { useEffect, useMemo } from "react";
import { useOrdersSlice } from "@/stores/orderStore";
import { useAuthStore } from "@/stores/authStore";

type UseOrdersOpts = {
  pollMs?: number | null; // null = ไม่ polling
  // filter แบบแยกฝั่ง (ถ้าไม่ส่ง = ไม่กรอง)
  purchaseStatus?: string | null;
  saleStatus?: string | null;
};

export function useOrders(opts: UseOrdersOpts = { pollMs: null }) {
  const {
    purchaseOrders,
    saleOrders,
    loading,
    error,
    fetchMyPurchaseOrders,
    fetchMySaleOrders,
    markMessagesSeen,
    updateOrderStatusLocal,
    acceptOrder,
  } = useOrdersSlice((s) => ({
    purchaseOrders: s.purchaseOrders,
    saleOrders: s.saleOrders,
    loading: s.loading,
    error: s.error,
    fetchMyPurchaseOrders: s.fetchMyPurchaseOrders,
    fetchMySaleOrders: s.fetchMySaleOrders,
    markMessagesSeen: s.markMessagesSeen,
    updateOrderStatusLocal: s.updateOrderStatusLocal,
    acceptOrder: s.acceptOrder,
  }));

  const isReady = useAuthStore((s) => s.isReady);

  // โหลดครั้งแรก / เมื่อ auth พร้อม
  useEffect(() => {
    if (!isReady) return;
    const ac = new AbortController();
    fetchMyPurchaseOrders(ac.signal);
    fetchMySaleOrders(ac.signal);
    return () => ac.abort();
  }, [isReady]);

  // กรองผลลัพธ์ตามสถานะ (ถ้ามี)
  const filteredPurchases = useMemo(() => {
    if (!opts.purchaseStatus) return purchaseOrders;
    const t = opts.purchaseStatus.toLowerCase();
    return purchaseOrders.filter((o) => o.status.toLowerCase() === t);
  }, [purchaseOrders, opts.purchaseStatus]);

  const filteredSales = useMemo(() => {
    if (!opts.saleStatus) return saleOrders;
    const t = opts.saleStatus.toLowerCase();
    return saleOrders.filter((o) => o.status.toLowerCase() === t);
  }, [saleOrders, opts.saleStatus]);

  return {
    // lists
    purchases: filteredPurchases,
    sales: filteredSales,

    // ui
    loading,
    error,

    // helpers
    markMessagesSeen,
    updateOrderStatusLocal,
    acceptOrder,
  };
}
