"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function BuySellSection() {
  const buyOffers = [
    { id: 1, item: "Dragon Fruit", price: "450R$", buyer: "ItemHunter22" },
    { id: 2, item: "Shadow Sword", price: "700R$", buyer: "WeaponCollector" },
    { id: 3, item: "Golden Box", price: "1100R$", buyer: "TreasureSeeker" },
  ]

  const sellOffers = [
    { id: 1, item: "Ice Fruit", price: "320R$", seller: "FruitMaster" },
    { id: 2, item: "Lightning Staff", price: "850R$", seller: "MagicDealer" },
    { id: 3, item: "Mystery Box", price: "400R$", seller: "BoxTrader99" },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Buy & Sell Hub</h1>
        <p className="text-muted-foreground">Find the best deals or list your items</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Buy Offers */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-400">Buy</Badge>
              Active Buy Offers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {buyOffers.map((offer) => (
              <div key={offer.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-medium text-card-foreground">{offer.item}</h3>
                  <p className="text-sm text-muted-foreground">by {offer.buyer}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent">{offer.price}</p>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    Sell
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sell Offers */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
              <Badge className="bg-blue-500/20 text-blue-400">Sell</Badge>
              Active Sell Offers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sellOffers.map((offer) => (
              <div key={offer.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-medium text-card-foreground">{offer.item}</h3>
                  <p className="text-sm text-muted-foreground">by {offer.seller}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent">{offer.price}</p>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Buy
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
