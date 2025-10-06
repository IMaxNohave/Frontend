"use client";

import { MarketplaceHeader } from "@/components/marketplace-header";
import { ItemGrid } from "@/components/item-grid";
import { TagFilter } from "@/components/tag-filter";
import { useMarketplace } from "@/hooks/useMarketplace";

export default function MarketplacePage() {
  const {
    token,
    selectedTag,
    setSelectedTag,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    visibleItems,
    selectedCategoryName,
    deleteItemOptimistic,
  } = useMarketplace();

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <div className="container mx-auto px-4 py-6">
        <TagFilter
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
          token={token}
        />

        {/* ปรับ ItemGrid ให้รับ props ตรง ๆ จาก hook */}
        <ItemGrid
          items={visibleItems}
          loading={loading}
          err={error}
          selectedCategoryName={selectedCategoryName}
          onDeleteItem={(id) => deleteItemOptimistic(id)}
        />
      </div>
    </div>
  );
}
