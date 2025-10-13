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
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  isReady: false,
  _initting: false,
  _initPromise: null,

  setToken: (t) => set({ token: t }),

  initToken: async () => {
    const { isReady, _initPromise } = get();

    // ถ้า init เสร็จแล้ว ไม่ต้องทำอะไร
    if (isReady) return;

    // ถ้ามีตัวที่เริ่ม init ไปแล้ว ให้รอตัวเดิม
    if (_initPromise) return _initPromise;

    const p = (async () => {
      try {
        set({ _initting: true });
        const res = await fetch("/api/api/auth/token", {
          credentials: "include",
          cache: "no-store",
        });
        if (res.ok) {
          const { token } = await res.json();
          if (token) {
            localStorage.setItem("token", token);
            set({ token });
          } else {
            set({ token: localStorage.getItem("token") });
          }
        } else {
          set({ token: localStorage.getItem("token") });
        }
      } catch {
        set({ token: localStorage.getItem("token") });
      } finally {
        // mark เสร็จ + เคลียร์ promise
        set({ isReady: true, _initting: false, _initPromise: null });
      }
    })();

    set({ _initPromise: p });
    return p;
  },
}));
