"use client";

import { useEffect, useMemo } from "react";
import { useItemStore, useMarketplaceSlice } from "@/stores/itemStore";
import { useAuthStore } from "@/stores/authStore";

export function useMarketplace() {
  // ===== store slices (reactive) =====
  const {
    selectedTag,
    searchTerm,
    categories,
    catMap,
    items,
    loading,
    error,
    setSelectedTag,
    setSearchTerm,
    fetchCategories,
    fetchItems,
    deleteItemOptimistic,
  } = useMarketplaceSlice((s) => ({
    selectedTag: s.selectedTag,
    searchTerm: s.searchTerm,
    categories: s.categories,
    catMap: s.catMap,
    items: s.items,
    loading: s.loading,
    error: s.error,
    setSelectedTag: s.setSelectedTag,
    setSearchTerm: s.setSearchTerm,
    fetchCategories: s.fetchCategories,
    fetchItems: s.fetchItems,
    deleteItemOptimistic: s.deleteItemOptimistic,
  }));

  // 2) โหลด categories หลังจาก init เสร็จ (จะมี/ไม่มี token ก็ได้)
  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal);
    return () => controller.abort();
  }, []);

  // 3) โหลด items เมื่อ init เสร็จ + เมื่อ tag/search เปลี่ยน
  useEffect(() => {
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
  }, []);

  // 4) ฟิลเตอร์ฝั่ง client
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
