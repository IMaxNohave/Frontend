// app/marketplace/page.tsx
"use client"

import { MarketplaceHeader } from "@/components/marketplace-header"
import { ItemGrid } from "@/components/item-grid"
import { TagFilter } from "@/components/tag-filter"
import { useEffect, useState } from "react"

export default function MarketplacePage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")      // ✅ เพิ่ม
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/api/auth/token", { credentials: "include", cache: "no-store" })
      if (res.ok) {
        const { token } = await res.json()
        if (token) localStorage.setItem("token", token)
        setToken(localStorage.getItem("token"))
      } else {
        console.error("Failed to fetch token:", res.status)
      }
    })()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* ✅ ส่ง searchTerm + setter ลง header */}
      <MarketplaceHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <div className="container mx-auto px-4 py-6">
        <TagFilter selectedTag={selectedTag} onTagSelect={setSelectedTag} token={token} />
        {/* ✅ ส่ง searchTerm เข้า ItemGrid */}
        <ItemGrid selectedTag={selectedTag} token={token} searchTerm={searchTerm} />
      </div>
    </div>
  )
}
