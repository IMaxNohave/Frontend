// stores/authStore.ts
"use client";
import { create } from "zustand";

type AuthState = {
  token: string | null;
  isReady: boolean;
  // private guards
  _initting: boolean;
  _initPromise: Promise<void> | null;

  initToken: () => Promise<void>;
  setToken: (t: string | null) => void;

  // 👇 เพิ่มให้ interceptor/ที่อื่นเรียกได้
  signOut: () => void;
};

// ปลอดภัยกับ base64url + อ่าน exp จาก JWT
function getJwtExp(token?: string | null): number | null {
  if (!token) return null;
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
    const obj = JSON.parse(json);
    return typeof obj?.exp === "number" ? obj.exp : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  isReady: false,
  _initting: false,
  _initPromise: null,

  // ✅ เขียน/ลบ localStorage ให้ด้วยเสมอ
  setToken: (t) => {
    if (typeof window !== "undefined") {
      if (t) localStorage.setItem("token", t);
      else localStorage.removeItem("token");
    }
    set({ token: t });
  },

  // ✅ ให้ทุกที่เรียกเคลียร์ session ได้สั้น ๆ
  signOut: () => {
    const current = get().token;
    try {
      // (ออปชัน) ยิง signout backend ถ้าต้องการ invalid cookie/server session
      // ไม่ block UI; ทำแบบ fire-and-forget
      if (current) {
        fetch("/api/auth/signout", { method: "POST", credentials: "include" }).catch(() => {});
      }
    } catch {}
    get().setToken(null);
  },

  initToken: async () => {
    const { isReady, _initPromise } = get();

    if (isReady) return;
    if (_initPromise) return _initPromise;

    const p = (async () => {
      try {
        set({ _initting: true });

        // 1) พยายามดึงจาก endpoint httpOnly → localStorage fallback
        const res = await fetch("/api/api/auth/token", {
          credentials: "include",
          cache: "no-store",
        });

        if (res.ok) {
          const { token } = await res.json().catch(() => ({ token: null as string | null }));
          const fromLS = typeof window !== "undefined" ? localStorage.getItem("token") : null;

          // เลือกอันที่ "สดกว่า" และยังไม่หมดอายุ
          const pick = token ?? fromLS;
          const exp = getJwtExp(pick);
          const nowSec = Math.floor(Date.now() / 1000);

          if (pick && exp && exp > nowSec) {
            get().setToken(pick);
          } else {
            get().setToken(null);
          }
        } else {
          // 2) endpoint ใช้ไม่ได้ → fallback localStorage
          const fromLS = typeof window !== "undefined" ? localStorage.getItem("token") : null;
          const exp = getJwtExp(fromLS);
          const nowSec = Math.floor(Date.now() / 1000);
          if (fromLS && exp && exp > nowSec) {
            set({ token: fromLS });
          } else {
            set({ token: null });
          }
        }
      } catch {
        // 3) network fail → fallback localStorage
        const fromLS = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const exp = getJwtExp(fromLS);
        const nowSec = Math.floor(Date.now() / 1000);
        if (fromLS && exp && exp > nowSec) {
          set({ token: fromLS });
        } else {
          set({ token: null });
        }
      } finally {
        set({ isReady: true, _initting: false, _initPromise: null });
      }
    })();

    set({ _initPromise: p });
    return p;
  },
}));
