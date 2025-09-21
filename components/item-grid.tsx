"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { PurchaseConfirmationDialog } from "./purchase-confirmation-dialog"

interface ItemGridProps {
  selectedTag: string | null
}

export function ItemGrid({ selectedTag }: ItemGridProps) {
  const router = useRouter()
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const currentUserEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null
  const isAdmin = currentUserEmail === "admin@gmail.com"

  const items = [
    {
      id: 1,
      name: "Dragon Fruit",
      price: "500$",
      category: "BloxFruit",
      image: "/placeholder-se2ao.png",
      seller: "ProTrader123",
      sellerEmail: "protrader@example.com", // Add seller email for ownership check
    },
    {
      id: 2,
      name: "Shadow Sword",
      price: "750$",
      category: "Bloxmesh",
      image: "/placeholder-opw43.png",
      seller: "SwordMaster99",
      sellerEmail: "swordmaster@example.com",
    },
    {
      id: 3,
      name: "Golden Box",
      price: "1200$",
      category: "Bloxbox",
      image: "/placeholder-of0v7.png",
      seller: "BoxCollector",
      sellerEmail: "boxcollector@example.com",
    },
    {
      id: 4,
      name: "Ice Fruit",
      price: "300$",
      category: "BloxFruit",
      image: "/placeholder-rjxxe.png",
      seller: "FruitDealer",
      sellerEmail: "fruitdealer@example.com",
    },
    {
      id: 5,
      name: "Lightning Staff",
      price: "900$",
      category: "Bloxmesh",
      image: "/placeholder-mzkhc.png",
      seller: "MagicUser88",
      sellerEmail: "magicuser@example.com",
    },
    {
      id: 6,
      name: "Mystery Box",
      price: "450$",
      category: "Bloxbox",
      image: "/placeholder-m1f53.png",
      seller: "BoxHunter",
      sellerEmail: "boxhunter@example.com",
    },
  ]

  const filteredItems = selectedTag ? items.filter((item) => item.category === selectedTag) : items

  const handleBuyClick = (item: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedItem(item)
    setShowConfirmDialog(true)
  }

  const handleDeleteItem = (item: any, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      alert("Item deleted successfully!")
      // In real app, this would call an API to delete the item
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const isOwner = currentUserEmail === item.sellerEmail
          const canEditDelete = isAdmin || isOwner

          return (
            <Card
              key={item.id}
              className="bg-card border-border hover:border-accent transition-colors cursor-pointer group"
              onClick={() => router.push(`/item/${item.id}`)}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-card-foreground font-semibold">{item.name}</h3>
                    <Badge variant="secondary" className="bg-accent/20 text-accent text-xs">
                      #{item.category}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">by {item.seller}</p>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-accent">{item.price}</span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={(e) => handleBuyClick(item, e)}
                      >
                        Buy Now
                      </Button>
                      {canEditDelete && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
                          onClick={(e) => handleDeleteItem(item, e)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No items found for #{selectedTag}</p>
          <p className="text-muted-foreground text-sm mt-2">Try selecting a different tag or browse all items</p>
        </div>
      )}

      {selectedItem && (
        <PurchaseConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          item={selectedItem}
        />
      )}
    </>
  )
}
