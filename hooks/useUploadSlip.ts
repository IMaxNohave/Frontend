"use client";

import { useRef, useState } from "react";
import {
  presignUpload,
  putFileToPresignedUrl,
} from "@/app/services/uploadItem";
import { useAuthStore } from "@/stores/authStore";

type UploadSlipState =
  | "idle"
  | "presigning"
  | "uploading"
  | "verifying"
  | "done"
  | "error";

export function useUploadSlip() {
  const token = useAuthStore.getState().token;
  const [state, setState] = useState<UploadSlipState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const abortRef = useRef<AbortController | null>(null);

  const cancel = () => abortRef.current?.abort();

  const uploadAndVerify = async (file: File) => {
    setError(null);
    setMessage(null);
    setProgress(0);
    setState("presigning");

    try {
      // 1️⃣ ขอ presigned URL
      const pre = await presignUpload(file, token);

      // 2️⃣ อัปโหลดจริงไป R2
      setState("uploading");
      abortRef.current = new AbortController();
      await putFileToPresignedUrl(
        pre.uploadUrl,
        file,
        abortRef.current.signal,
        (loaded, total) => setProgress(total ? loaded / total : 0)
      );

      const imageUrl = pre.imageUrl ?? pre.key;

      // 3️⃣ ส่งไปตรวจสอบ slip ที่ backend
      setState("verifying");
      const r = await fetch(`/api/v1/credits/depose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ imageUrl }),
      });

      const j = await r.json();

      // ⚠️ เคส Error จาก Backend (เช่น Slip already used)
      if (!r.ok || !j?.success) {
        setError(j?.message || "ตรวจสอบสลิปไม่สำเร็จ");
        setState("error");
        return { success: false, message: j?.message || "Unknown error" };
      }

      // ✅ เคสสำเร็จ
      setMessage(j.data?.message || "Deposit successful");
      setState("done");
      return { success: true, ...j.data };
    } catch (e: any) {
      if (e.name === "AbortError") setError("Upload canceled");
      else setError(e.message || "Upload failed");
      setState("error");
      throw e;
    } finally {
      abortRef.current = null;
    }
  };

  return {
    // state
    state,
    error,
    message,
    progress,

    // helpers
    isIdle: state === "idle",
    isPresigning: state === "presigning",
    isUploading: state === "uploading",
    isVerifying: state === "verifying",
    isDone: state === "done",
    isError: state === "error",

    // actions
    uploadAndVerify,
    cancel,
  };
}
