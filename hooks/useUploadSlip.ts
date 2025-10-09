"use client";

import { useRef, useState } from "react";
import {
  presignUpload,
  putFileToPresignedUrl,
} from "@/app/services/uploadItem";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/app/services/api";

type UploadSlipState =
  | "idle"
  | "presigning"
  | "uploading"
  | "verifying"
  | "done"
  | "error";

type DeposeOk = {
  success: true;
  data: { depositId: string; slipRef: string; message: string };
};
type DeposeErr = { success: false; message: string };
type DeposeResp = DeposeOk | DeposeErr;

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
      // 1) ขอ presigned URL
      const pre = await presignUpload(file, token);

      // 2) อัปโหลดจริงไป R2
      setState("uploading");
      abortRef.current = new AbortController();
      await putFileToPresignedUrl(
        pre.uploadUrl,
        file,
        abortRef.current.signal,
        (loaded, total) => setProgress(total ? loaded / total : 0)
      );

      const imageUrl = pre.imageUrl ?? pre.key;

      // 3) ส่งไปตรวจสอบ slip ที่ backend
      setState("verifying");
      const res = await api.post<DeposeResp>(
        "/v1/credits/depose", // baseURL = /api แล้ว
        { imageUrl }, // ถ้า backend รับชื่อ field = image ให้เปลี่ยนเป็น { image: imageUrl }
        { signal: abortRef.current.signal } // รองรับ cancel
      );

      const j = res.data;

      if (!j.success) {
        // เช่น { success:false, message:"Slip already used" }
        setError(j.message || "ตรวจสอบสลิปไม่สำเร็จ");
        setState("error");
        return { success: false, message: j.message || "Unknown error" };
      }

      // success true
      setMessage(j.data.message || "Deposit successful");
      setState("done");
      return { success: true, ...j.data };
    } catch (e: any) {
      // axios cancel: name === 'CanceledError' หรือ code === 'ERR_CANCELED'
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") {
        setError("Upload canceled");
      } else {
        const backendMsg = e?.response?.data?.message; // ข้อความจาก backend ถ้ามี
        setError(backendMsg || e?.message || "Upload failed");
      }
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
