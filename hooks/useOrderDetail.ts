"use client";

import { useEffect, useMemo } from "react";
import { useOrdersSlice, normStatus } from "@/stores/orderStore";
import { useAuthStore } from "@/stores/authStore";

type StatusKey =
  | "pending"
  | "in_trade"
  | "await_confirm"
  | "completed"
  | "cancelled"
  | "expired"
  | "disputed";

const chipOf = (s?: string) => {
  const k = normStatus(s);
  switch (k) {
    case "pending":
      return {
        label: "ESCROW_HELD",
        className: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
      };
    case "in_trade":
      return {
        label: "IN_TRADE",
        className: "bg-indigo-500/20 text-indigo-600 border-indigo-500/30",
      };
    case "await_confirm":
      return {
        label: "AWAIT_CONFIRM",
        className: "bg-amber-500/20 text-amber-600 border-amber-500/30",
      };
    case "completed":
      return {
        label: "COMPLETED",
        className: "bg-green-500/20 text-green-600 border-green-500/30",
      };
    case "cancelled":
      return {
        label: "CANCELLED",
        className: "bg-slate-500/20 text-slate-600 border-slate-500/30",
      };
    case "expired":
      return {
        label: "EXPIRED",
        className: "bg-orange-500/20 text-orange-600 border-orange-500/30",
      };
    case "disputed":
      return {
        label: "DISPUTED",
        className: "bg-red-500/20 text-red-600 border-red-500/30",
      };
    default:
      return {
        label: (s || "").toUpperCase(),
        className: "bg-muted text-muted-foreground border-border",
      };
  }
};

const fmt = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleString() : "";

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

    acceptOrder,
    confirmSeller,
    confirmBuyer,
    cancelOrder,
    disputeOrder,

    updateOrderStatusLocal,
  } = useOrdersSlice((s) => ({
    me: s.me,
    meLoaded: s.meLoaded,
    fetchMe: s.fetchMe,
    orderById: s.orderById,
    loading: s.loading,
    error: s.error,
    fetchOrderById: s.fetchOrderById,

    acceptOrder: s.acceptOrder,
    confirmSeller: s.confirmSeller,
    confirmBuyer: s.confirmBuyer,
    cancelOrder: s.cancelOrder,
    disputeOrder: s.disputeOrder,

    updateOrderStatusLocal: s.updateOrderStatusLocal,
  }));

  const isReady = useAuthStore((s) => s.isReady);

  useEffect(() => {
    if (!isReady) return;
    const c = new AbortController();
    void fetchMe();
    void fetchOrderById(orderId);
    return () => c.abort();
  }, [isReady]);

  const order = orderById[orderId] || null;

  const role: "buyer" | "seller" | "guest" = useMemo(() => {
    if (!order || !me) return "guest";
    if (order.seller?.id === me.id) return "seller";
    if (order.buyer?.id === me.id) return "buyer";
    return "guest";
  }, [order, me]);

  const k: StatusKey = normStatus(order?.status) as StatusKey;

  const timeline = useMemo(() => {
    const paidAt = order?.createdAt;
    const acceptedAt =
      (order as any)?.sellerAcceptedAt ??
      (order as any)?.sellerAcceptAt ??
      (order as any)?.seller_accepted_at;
    const sellerConfirmedAt =
      (order as any)?.sellerConfirmedAt ??
      (order as any)?.seller_confirmed_at ??
      null;
    const buyerConfirmedAt =
      (order as any)?.buyerConfirmedAt ??
      (order as any)?.buyer_confirmed_at ??
      null;
    const disputedAt = (order as any)?.disputedAt ?? null;
    const cancelledAt = (order as any)?.cancelledAt ?? null;

    const anyConfirmed = !!(sellerConfirmedAt || buyerConfirmedAt);
    const bothConfirmed = !!(sellerConfirmedAt && buyerConfirmedAt);

    const steps = [
      {
        key: "paid",
        label: "ชำระเงินแล้ว (Escrow Held)",
        completed: true,
        time: fmt(paidAt),
      },
      {
        key: "accepted",
        label: "ผู้ขายยอมรับ (เริ่มเทรด)",
        completed:
          !!acceptedAt ||
          [
            "in_trade",
            "await_confirm",
            "completed",
            "disputed",
            "expired",
            "cancelled",
          ].includes(k),
        time: fmt(acceptedAt),
      },
      {
        key: "await_confirm",
        label: "รอยืนยันครบสองฝ่าย",
        completed:
          bothConfirmed ||
          ["completed", "disputed", "expired", "cancelled"].includes(k),
        time: anyConfirmed
          ? `${fmt(sellerConfirmedAt)} / ${fmt(buyerConfirmedAt)}`
          : "",
      },
      {
        key: "completed",
        label: "เสร็จสิ้น/ปล่อยเอสโครว์",
        completed: k === "completed",
        time:
          k === "completed" ? fmt(buyerConfirmedAt || sellerConfirmedAt) : "",
      },
    ] as const;

    if (k === "disputed")
      return [
        ...steps,
        {
          key: "disputed",
          label: "มีข้อพิพาท",
          completed: true,
          time: fmt(disputedAt),
        } as any,
      ];
    if (k === "expired")
      return [
        ...steps,
        { key: "expired", label: "หมดเวลา", completed: true, time: "" } as any,
      ];
    if (k === "cancelled")
      return [
        ...steps,
        {
          key: "cancelled",
          label: "ยกเลิกแล้ว (คืนเงินถ้ามี)",
          completed: true,
          time: fmt(cancelledAt),
        } as any,
      ];
    return steps;
  }, [order, k]);

  const statusChip = useMemo(() => chipOf(order?.status), [order]);

  // เงื่อนไขปุ่ม
  const canAccept =
    role === "seller" && order?.status?.toUpperCase() === "ESCROW_HELD";
  const canConfirmSeller =
    role === "seller" &&
    ["IN_TRADE", "AWAIT_CONFIRM"].includes(
      order?.status?.toUpperCase?.() || ""
    );
  const canConfirmBuyer =
    role === "buyer" &&
    ["IN_TRADE", "AWAIT_CONFIRM"].includes(
      order?.status?.toUpperCase?.() || ""
    );
  const canCancel = ["ESCROW_HELD", "IN_TRADE", "AWAIT_CONFIRM"].includes(
    order?.status?.toUpperCase?.() || ""
  );
  const canDispute = ["IN_TRADE", "AWAIT_CONFIRM"].includes(
    order?.status?.toUpperCase?.() || ""
  );

  // actions เรียกผ่าน store
  const actions = {
    accept: () => acceptOrder(orderId),
    confirmSeller: () => confirmSeller(orderId),
    confirmBuyer: () => confirmBuyer(orderId),
    cancel: () => cancelOrder(orderId),
    dispute: () => disputeOrder(orderId, "OTHER"),
    markMessagesSeen: () => {}, // optional
  };

  return {
    me,
    meLoaded,
    order,
    loading,
    error,
    role,
    timeline,
    statusChip, // { label, className }
    guards: {
      canAccept,
      canConfirmSeller,
      canConfirmBuyer,
      canCancel,
      canDispute,
    },
    actions,
  };
}
