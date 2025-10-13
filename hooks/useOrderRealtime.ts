// Frontend/hooks/useOrderRealtime.ts
"use client";

import { useEffect, useRef } from "react";
import { subscribeSSE } from "@/app/services/sse";
import { useOrderStore } from "@/stores/orderStore";
import { useUserStore } from "@/stores/userStore";

export function useOrderRealtime(orderId?: string) {
  const fetchOrderById = useOrderStore((s) => s.fetchOrderById);
  const fetchWallet = useUserStore((s) => s.fetchWallet);
  const connectedRef = useRef(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!orderId) return;
    if (connectedRef.current) return; // กันเปิดซ้ำจาก StrictMode/HMR
    connectedRef.current = true;

    const refetch = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchOrderById(orderId).catch(() => {});
        fetchWallet().catch(() => {});
      }, 200);
    };

    const off = subscribeSSE(`order:${orderId}`, {
      onOrderUpdate: (p) => {
        // (เผื่อไว้) เช็คว่า event นี้ตรง orderId เราไหม
        if (!p?.orderId || p.orderId === orderId) refetch();
      },
    });

    return () => {
      connectedRef.current = false;
      off();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [orderId, fetchOrderById]);
}
