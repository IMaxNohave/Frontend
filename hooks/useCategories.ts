// hooks/useCategories.ts
"use client";

import { useEffect } from "react";
import { useItemStore } from "@/stores/itemStore";
import { useAuthStore } from "@/stores/authStore";

export function useCategories() {
  const categories = useItemStore((s) => s.categories);
  const catMap = useItemStore((s) => s.catMap);
  const loading = useItemStore((s) => s.loading); // ถ้าอยากแยก flag ให้ทำ catLoading แยกใน store
  const error = useItemStore((s) => s.error); // เช่นเดียวกัน
  const fetchCategories = useItemStore((s) => s.fetchCategories);

  const token = useAuthStore.getState().token;
  // const initToken = useAuthStore((s) => s.initToken);

  // useEffect(() => {
  //   initToken();
  // }, [initToken]);
  useEffect(() => {
    if (!token) return;
    const c = new AbortController();
    fetchCategories(c.signal);
    return () => c.abort();
  }, [token, fetchCategories]);

  return { categories, catMap, loading, error };
}
