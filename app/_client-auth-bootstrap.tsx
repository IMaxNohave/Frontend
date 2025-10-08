// app/_client-auth-bootstrap.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export default function ClientAuthBootstrap() {
  const initToken = useAuthStore((s) => s.initToken);

  useEffect(() => {
    // ทำให้ idempotent ตามที่คุยไว้ก่อนหน้า
    void initToken();
  }, [initToken]);

  return null; // ไม่ต้องเรนเดอร์อะไร
}
