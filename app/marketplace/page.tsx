"use client"

import { MarketplaceHeader } from "@/components/marketplace-header"
import { ItemGrid } from "@/components/item-grid"
import { TagFilter } from "@/components/tag-filter"
import { useEffect, useState } from "react"

export default function MarketplacePage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/api/auth/token", {
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) {
        const { token } = await res.json();
        console.log("Token:", token);
        if (token) localStorage.setItem("token", token);
      }
      else {
        console.error("Failed to fetch token:", res.status);
      }
    })();
  }, []);

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
