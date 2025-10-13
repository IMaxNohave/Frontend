// app/auth-guard.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

// กำหนดเส้นทาง public ที่เข้าได้โดยไม่ต้องล็อกอิน
const PUBLIC_ROUTES: Array<(path: string) => boolean> = [
  (p) => p === "/",
  (p) => p.startsWith("/auth/callback"),
  // ถ้าหน้า item เป็น public ก็ใส่ไว้ด้วย เช่น:
  // (p) => p.startsWith("/item/"),
];

export default function AuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const initToken = useAuthStore((s) => s.initToken);

  // บูต token ครั้งแรก
  useEffect(() => {
    initToken?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // เช็คทุกครั้งที่ path หรือ token เปลี่ยน
  useEffect(() => {
    if (!pathname) return;

    const isPublic = PUBLIC_ROUTES.some((fn) => fn(pathname));
    if (isPublic) return;

    // เส้นทาง private → ต้องมี token
    if (!token) {
      router.replace("/");
    }
  }, [pathname, token, router]);

  // sync หลายแท็บ: ถ้าอีกแท็บ logout → แท็บนี้เด้งออกด้วย
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token" && !e.newValue) {
        window.location.href = "/";
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // time-based re-check ตอนสลับแท็บกลับมา
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") {
        const current = useAuthStore.getState().token;
        if (!current) window.location.href = "/";
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return null;
}
