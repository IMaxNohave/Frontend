// hooks/useOrderDetail.ts
"use client";

import { useEffect, useMemo } from "react";
import {
  useOrdersSlice,
  useOrderStore,
  normStatus,
  statusChipOf,
} from "@/stores/orderStore";

import { useAuthStore } from "@/stores/authStore";

export function useOrderDetail(
  orderId: string,
  opts?: { pollMs?: number | null }
) {
  const {
    me,
    meLoaded,
    fetchMe,
    orderById,
    loading,
    error,
    fetchOrderById,
    markReady,
    raiseDispute,
    markMessagesSeen,
  } = useOrdersSlice((s) => ({
    me: s.me,
    meLoaded: s.meLoaded,
    fetchMe: s.fetchMe,
    orderById: s.orderById,
    loading: s.loading,
    error: s.error,
    fetchOrderById: s.fetchOrderById,
    markReady: s.markReady,
    raiseDispute: s.raiseDispute,
    markMessagesSeen: s.markMessagesSeen,
  }));

  const isReady = useAuthStore((s) => s.isReady);

  // useEffect(() => {
  //   if (!isReady) return;
  //   const c = new AbortController();
  //   void fetchMe(c.signal);
  //   return () => c.abort();
  // }, [isReady]);

  // 2) load order detail
  useEffect(() => {
    if (!isReady) return;
    const c = new AbortController();
    void fetchOrderById(orderId, c.signal);
    return () => c.abort();
  }, [isReady, orderId]);

  // 3) optional polling
  // useEffect(() => {
  //   if (!isReady) return;
  //   if (!opts?.pollMs) return;
  //   const itv = setInterval(() => {
  //     void fetchOrderById(orderId);
  //   }, opts.pollMs);
  //   return () => clearInterval(itv);
  // }, [orderId,isReady]);

  const order = orderById[orderId] || null;

  const role: "buyer" | "seller" | "guest" = useMemo(() => {
    if (!order || !me) return "guest";
    if (order.seller?.id === me.id) return "seller";
    if (order.buyer?.id === me.id) return "buyer";
    return "guest";
  }, [order, me]);

  // timeline แบบเดิม
  const timeline = useMemo(() => {
    const s = normStatus(order?.status);
    const created = order?.createdAt
      ? new Date(order.createdAt).toLocaleString()
      : "";
    const base = [
      {
        key: "paid",
        label: "ชำระเงินแล้ว (Escrow Held)",
        completed: true,
        time: created,
      },
      {
        key: "waiting_seller_ready",
        label: "ผู้ขายพร้อม",
        completed: s === "ready" || s === "completed",
        time: "",
      },
      {
        key: "in_progress",
        label: "เทรดในเกม",
        completed: s === "completed",
        time: "",
      },
      {
        key: "completed",
        label: "สิ้นสุดแล้ว/ส่ง",
        completed: s === "completed",
        time: "",
      },
    ] as const;
    return s === "disputed"
      ? [
          ...base,
          {
            key: "disputed",
            label: "มีข้อพิพาท",
            completed: true,
            time: "",
          } as any,
        ]
      : base;
  }, [order]);

  const statusChip = useMemo(() => statusChipOf(order?.status), [order]);

  return {
    me,
    meLoaded,
    order,
    loading,
    error,
    role,
    timeline,
    statusChip,
    actions: {
      markReady: () => markReady(orderId),
      raiseDispute: () => raiseDispute(orderId),
      markMessagesSeen: () => markMessagesSeen(orderId),
    },
  };
}
