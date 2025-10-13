// app/services/api.ts
import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const API_URL = "/api";

export const api = axios.create({
  baseURL: API_URL,
  // ถ้า backend ใช้ cookie httpOnly ควบคู่ ให้เปิดด้วย (ไม่มีผลเสีย)
  withCredentials: true,
});

// ---- Request: แนบ token จาก Zustand ----
api.interceptors.request.use((config) => {
  // NOTE: อย่าเรียก useAuthStore() แบบ hook ที่นี่นะ ใช้ getState() เท่านั้น
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Response: ดัก 401/403 แล้วเคลียร์ + เด้งกลับหน้า login ----
let isRedirecting = false;

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;

    if ((status === 401 || status === 403) && !isRedirecting) {
      isRedirecting = true;

      try {
        // ล้างข้อมูล auth ใน store/localStorage ให้เกลี้ยง
        useAuthStore.getState().signOut?.();
      } catch {}

      // redirect ออกทันที (อย่าใช้ router ที่นี่ เพราะอยู่นอก react tree)
      setTimeout(() => {
        window.location.href = "/";
      }, 0);
    }

    // เผื่อ network error ที่ไม่มี status
    return Promise.reject(error);
  }
);
