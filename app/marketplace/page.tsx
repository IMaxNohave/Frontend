"use client"

import { MarketplaceHeader } from "@/components/marketplace-header"
import { ItemGrid } from "@/components/item-grid"
import { TagFilter } from "@/components/tag-filter"
import { useState } from "react"

export default function MarketplacePage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <div className="container mx-auto px-4 py-6">
        <TagFilter selectedTag={selectedTag} onTagSelect={setSelectedTag} />
        <ItemGrid selectedTag={selectedTag} />
      </div>
    </div>
  )
}
