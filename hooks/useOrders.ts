// hooks/useOrders.ts
"use client";

import { useEffect, useMemo } from "react";
import { useOrdersSlice } from "@/stores/orderStore";
import { useOrderStore } from "@/stores/orderStore";
import { useAuthStore } from "@/stores/authStore";

type UseOrdersOpts = {
  // จะเปิด polling ก็ได้ เช่น ทุก 20s
  pollMs?: number | null;
};

export function useOrders(opts: UseOrdersOpts = { pollMs: null }) {
  const {
    orders,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    fetchMyOrders,
    markMessagesSeen,
    updateOrderStatusLocal,
  } = useOrdersSlice((s) => ({
    orders: s.orders,
    loading: s.loading,
    error: s.error,
    statusFilter: s.statusFilter,
    setStatusFilter: s.setStatusFilter,
    fetchMyOrders: s.fetchMyOrders,
    markMessagesSeen: s.markMessagesSeen,
    updateOrderStatusLocal: s.updateOrderStatusLocal,
  }));

  const isReady = useAuthStore((s) => s.isReady);
  // const initToken = useAuthStore((s) => s.initToken);

  // 2) load orders (on mount + whenever token changes)
  useEffect(() => {
    if (!isReady) return;
    const controller = new AbortController();
    fetchMyOrders(controller.signal);
  }, [isReady]);

  // // 3) optional polling
  // useEffect(() => {
  //   if (!token || !opts.pollMs || !isReady) return;
  //   const interval = setInterval(() => {
  //     const controller = new AbortController();
  //     fetchMyOrders(controller.signal);
  //     // ไม่จำเป็นต้อง abort interval fetch ก่อนหน้าถ้าเสร็จเร็ว
  //   }, opts.pollMs);
  //   return () => clearInterval(interval);
  // }, [token, opts.pollMs, isReady]);

  // 4) client-side filter (ถ้าต้องการ)
  const visibleOrders = useMemo(() => {
    if (!statusFilter) return orders;
    return orders.filter(
      (o) => o.status.toLowerCase() === statusFilter.toLowerCase()
    );
  }, [orders, statusFilter]);

  return {
    // data
    orders: visibleOrders,
    loading,
    error,

    // filters
    statusFilter,
    setStatusFilter,

    // actions (optimistic helpers)
    markMessagesSeen,
    updateOrderStatusLocal,
  };
}
