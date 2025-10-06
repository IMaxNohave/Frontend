"use client";

import { useEffect, useMemo } from "react";
import { useItemStore, useMarketplaceSlice } from "@/stores/itemStore";

export function useMarketplace() {
  // เลือกเฉพาะ slice ที่ต้องใช้ (ลด re-render)
  const {
    selectedTag,
    searchTerm,
    token,
    categories,
    catMap,
    items,
    loading,
    error,
    setSelectedTag,
    setSearchTerm,
    initToken,
    fetchCategories,
    fetchItems,
    deleteItemOptimistic,
  } = useMarketplaceSlice((s) => ({
    selectedTag: s.selectedTag,
    searchTerm: s.searchTerm,
    token: s.token,
    categories: s.categories,
    catMap: s.catMap,
    items: s.items,
    loading: s.loading,
    error: s.error,
    setSelectedTag: s.setSelectedTag,
    setSearchTerm: s.setSearchTerm,
    initToken: s.initToken,
    fetchCategories: s.fetchCategories,
    fetchItems: s.fetchItems,
    deleteItemOptimistic: s.deleteItemOptimistic,
  }));

  // 1) init token ครั้งแรก
  useEffect(() => {
    initToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) โหลด categories เมื่อมี token
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    fetchCategories(controller.signal);
    return () => controller.abort();
  }, [token, fetchCategories]);

  // 3) โหลด items ด้วย debounce + abort เมื่อ tag/search/token เปลี่ยน
  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    const t = setTimeout(() => {
      fetchItems(
        { categoryId: selectedTag ?? undefined, q: searchTerm || undefined },
        controller.signal
      );
    }, 250);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [token, selectedTag, searchTerm, fetchItems]);

  // 4) ฟิลเตอร์ฝั่ง client (ตอบสนองไว แม้ระหว่างรอ API)
  const visibleItems = useMemo(() => {
    let list = items;
    if (selectedTag)
      list = list.filter((it) => it.category?.id === selectedTag);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          (it.detail ?? "").toLowerCase().includes(q) ||
          (it.seller_name ?? "").toLowerCase().includes(q) ||
          (it.category?.name ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, selectedTag, searchTerm]);

  const selectedCategoryName = useMemo(
    () => (selectedTag ? catMap[selectedTag] ?? selectedTag : null),
    [selectedTag, catMap]
  );

  return {
    // state
    token,
    selectedTag,
    searchTerm,
    categories,
    catMap,
    items,
    visibleItems,
    selectedCategoryName,
    loading,
    error,

    // setters
    setSelectedTag,
    setSearchTerm,

    // actions
    deleteItemOptimistic,
  };
}
