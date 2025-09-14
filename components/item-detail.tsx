"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Share2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface ItemDetailProps {
  itemId: string
}

export function ItemDetail({ itemId }: ItemDetailProps) {
  const router = useRouter()

  // Mock item data - in real app this would come from API
  const item = {
    id: itemId,
    name: "Dragon Fruit",
    price: "500R$",
    category: "BloxFruit",
    image: "/placeholder-engvj.png",
    seller: "ProTrader123",
    description:
      "Rare Dragon Fruit with special fire abilities. Perfect for combat and exploration. This item is in excellent condition and comes with all original powers intact.",
    rarity: "Legendary",
    condition: "Excellent",
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 text-card-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Marketplace
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Section */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
              <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                <Heart className="h-4 w-4 mr-2" />
                Favorite
              </Button>
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{item.name}</h1>
              <Badge variant="secondary" className="bg-accent/20 text-accent">
                #{item.category}
              </Badge>
            </div>
            <p className="text-muted-foreground">Sold by {item.seller}</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold text-accent">{item.price}</span>
            <Badge className="bg-primary/20 text-primary">{item.rarity}</Badge>
          </div>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <h3 className="font-semibold text-card-foreground mb-2">Item Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condition:</span>
                  <span className="text-card-foreground">{item.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rarity:</span>
                  <span className="text-card-foreground">{item.rarity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="text-card-foreground">{item.category}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="font-semibold text-foreground mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{item.description}</p>
          </div>

          <div className="space-y-3">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3">
              Buy Now - {item.price}
            </Button>
            <Button
              variant="outline"
              className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
            >
              Make Offer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
