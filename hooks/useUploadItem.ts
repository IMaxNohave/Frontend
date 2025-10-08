// hooks/useUploadItem.ts
"use client";

import { useRef, useState } from "react";
import {
  createItem,
  presignUpload,
  putFileToPresignedUrl,
} from "@/app/services/uploadItem";
import { useItemStore } from "@/stores/itemStore";
import { useAuthStore } from "@/stores/authStore";

type UploadState =
  | "idle"
  | "presigning"
  | "uploading"
  | "creating"
  | "done"
  | "error";

export function useUploadItem() {
  const token = useAuthStore.getState().token;
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0); // 0..1 (note: fetch PUT ไม่มีจริง ถ้าต้องมีใช้ XHR)
  const abortRef = useRef<AbortController | null>(null);

  const cancel = () => {
    abortRef.current?.abort();
  };

  const uploadAndCreate = async (
    file: File,
    form: {
      name: string;
      description: string;
      price: number;
      categoryId: string;
      tag?: string;
    }
  ) => {
    setError(null);
    setProgress(0);
    setState("presigning");

    try {
      // 1) presign
      const pre = await presignUpload(file, token);

      // 2) upload (รองรับ cancel)
      setState("uploading");
      abortRef.current = new AbortController();
      await putFileToPresignedUrl(
        pre.uploadUrl,
        file,
        abortRef.current.signal,
        (loaded, total) => {
          setProgress(total ? loaded / total : 0);
        }
      );

      const imageForDb = pre.imageUrl ?? pre.key;

      // 3) create item
      setState("creating");
      await createItem(
        {
          image: imageForDb,
          name: form.name,
          description: form.description,
          price: form.price,
          category: form.categoryId,
          tag: form.tag,
        },
        token
      );

      setState("done");
      return { imageUrl: imageForDb };
    } catch (e: any) {
      if (e?.name === "AbortError") {
        setError("Upload canceled");
      } else {
        setError(e?.message || "Upload failed");
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
    progress,

    // helpers
    isIdle: state === "idle",
    isPresigning: state === "presigning",
    isUploading: state === "uploading",
    isCreating: state === "creating",
    isDone: state === "done",
    isError: state === "error",

    // actions
    uploadAndCreate,
    cancel,
  };
}
