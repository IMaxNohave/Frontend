// hooks/useOrdersListRealtime.ts
"use client";
import { useEffect, useRef } from "react";
import { subscribeSSE } from "@/app/services/sse";
import { useOrderStore } from "@/stores/orderStore";

export function useOrdersListRealtime(userId?: string | null) {
  const connectedRef = useRef(false);

  // แยก debounce ต่อฝั่ง (กันชนกัน)
  const purchaseDebRef = useRef<NodeJS.Timeout | null>(null);
  const salesDebRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPurchases = useOrderStore((s) => s.fetchMyPurchaseOrders);
  const fetchSales = useOrderStore((s) => s.fetchMySaleOrders);

  useEffect(() => {
    if (!userId) return;
    if (connectedRef.current) return; // กันเปิดซ้ำบน dev/StrictMode
    connectedRef.current = true;

    const topic = `user:${userId}`;

    const bumpPurchases = () => {
      if (purchaseDebRef.current) clearTimeout(purchaseDebRef.current);
      purchaseDebRef.current = setTimeout(() => {
        fetchPurchases().catch(() => {});
      }, 300);
    };

    const bumpSales = () => {
      if (salesDebRef.current) clearTimeout(salesDebRef.current);
      salesDebRef.current = setTimeout(() => {
        fetchSales().catch(() => {});
      }, 300);
    };

    const unsubscribe = subscribeSSE(topic, {
      onReady: () => {},
      onPing: () => {},
      onOrderUpdate: (p: any /* หรือ OrderUpdatePayload */) => {
        // ✅ ใช้ side ตัดสินใจว่าจะรีเฟชลิสต์ไหน
        if (p?.side === "buyer") bumpPurchases();
        else if (p?.side === "seller") bumpSales();
        else {
          // fallback: ถ้า BE ยังไม่ส่ง side มาก็รีทั้งคู่
          bumpPurchases();
          bumpSales();
        }
      },
      onError: () => {},
    });

    return () => {
      connectedRef.current = false;
      unsubscribe();
      if (purchaseDebRef.current) clearTimeout(purchaseDebRef.current);
      if (salesDebRef.current) clearTimeout(salesDebRef.current);
    };
  }, [userId, fetchPurchases, fetchSales]);
}
