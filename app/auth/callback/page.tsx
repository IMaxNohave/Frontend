// app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { useAuthStore } from "@/stores/authStore";

// ปลอดภัยกับ base64url และกัน error
function decodeJwt<T = any>(token: string): T | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const ctrl = new AbortController();

    (async () => {
      // 1) ดึง token ให้พร้อมก่อน (จะไปโหลดจาก cookie httpOnly → token endpoint แล้วเก็บใน localStorage)
      const initToken = useAuthStore.getState().initToken;
      if (initToken) await initToken();

      // 2) อ่าน token จาก store/LS แล้ว decode payload → ตัดสินใจทางไปทันที
      let token = useAuthStore.getState().token || null;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }

      // ถ้าไม่มี token → กลับหน้า login
      if (!token) {
        router.replace("/login");
        return;
      }

      type Payload = {
        user_type?: number;
        exp?: number;
      };

      const payload = decodeJwt<Payload>(token);

      // token เสีย/อ่านไม่ได้ → login
      if (!payload) {
        router.replace("/login");
        return;
      }

      // ถ้า token หมดอายุ → login
      if (payload.exp && Date.now() / 1000 >= payload.exp) {
        router.replace("/login");
        return;
      }

      // 3) ตัดสินใจปลายทางจาก payload (เร็ว ไม่ต้องรอ DB)
      const isAdminFromJwt = Number(payload.user_type) === 2;
      router.replace(isAdminFromJwt ? "/admin" : "/marketplace");

      // 4) ยิง /auth/user/me แบบ “เบื้องหลัง” เพื่อ sync Zustand ให้ครบ
      //    (ถ้าอยากกัน flash role mismatch ให้เช็คแล้ว redirect ซ้ำถ้าค่าไม่ตรง)
    //   try {
    //     const res = await fetch("/api/auth/user/me", {
    //       credentials: "include",
    //       signal: ctrl.signal,
    //     });

    //     if (res.ok) {
    //       const json = await res.json();
    //       const me = json?.data;
    //       if (me) {
    //         // อัปเดต global state จริง
    //         useUserStore.getState().setFromMe(me);

    //         // (ออปชัน) ถ้าบังเอิญ role จาก DB ไม่ตรงกับ JWT ให้ปรับเส้นทางอีกครั้ง
    //         const isAdminFromDb = Number(me.user_type) === 2;
    //         if (isAdminFromDb !== isAdminFromJwt) {
    //           router.replace(isAdminFromDb ? "/admin" : "/marketplace");
    //         }
    //       }
    //     }
    //   } catch {
    //     // เงียบ ๆ ไป: ไม่รบกวน UX เพราะเราตัดสินใจจาก JWT ไปแล้ว
    //   }
    })();

    return () => ctrl.abort();
  }, [router]);

  return <p>Signing you in…</p>;
}
