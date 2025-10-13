// app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Loader2, ChevronRight } from "lucide-react";

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
      // 1) init token จาก httpOnly cookie → state/localStorage
      const initToken = useAuthStore.getState().initToken;
      if (initToken) await initToken();

      // 2) อ่าน token แล้วตัดสินใจทางไป
      let token = useAuthStore.getState().token || null;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }

      if (!token) {
        router.replace("/");
        return;
      }

      type Payload = {
        user_type?: number;
        exp?: number;
      };

      const payload = decodeJwt<Payload>(token);

      if (!payload) {
        router.replace("/");
        return;
      }

      if (payload.exp && Date.now() / 1000 >= payload.exp) {
        router.replace("/");
        return;
      }

      const isAdminFromJwt = Number(payload.user_type) === 2;
      router.replace(isAdminFromJwt ? "/admin" : "/marketplace");

      // (ออปชัน) ยิง /auth/user/me เบื้องหลังได้ตามที่คอมเมนต์ไว้
    })();

    return () => ctrl.abort();
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header แสดงว่ากำลัง redirect */}
        <div className="mb-4 text-center">
          <p className="inline-flex items-center gap-2 text-sm tracking-wide text-muted-foreground">
            Redirecting
            <ChevronRight className="h-4 w-4 animate-pulse" />
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>

            <h1 className="text-xl font-semibold text-card-foreground">
              Signing you in…
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Checking your session and sending you to the right place.
            </p>
          </div>

          {/* Progress bar แบบวิ่ง */}
          <div className="h-1 w-full bg-muted/60 overflow-hidden">
            <div className="h-full w-1/3 animate-[loading_1.2s_ease-in-out_infinite] bg-primary" />
          </div>

          <div className="px-6 py-4 text-center">
            <p className="text-xs text-muted-foreground">
              If nothing happens, you can{" "}
              <a
                href="/"
                className="font-medium text-primary underline underline-offset-4"
              >
                go back to sign in
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* animation keyframes */}
      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(50%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}
