// app/_client-auth-bootstrap.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";

export default function ClientAuthBootstrap() {
  const initToken = useAuthStore((s) => s.initToken);
  const token = useAuthStore((s) => s.token);
  const fetchMe = useUserStore((s) => s.fetchMe);

  useEffect(() => {
    // ทำให้ idempotent ตามที่คุยไว้ก่อนหน้า
    void initToken();
    if (token) void fetchMe();
  }, [token]);

  return null; // ไม่ต้องเรนเดอร์อะไร
}
