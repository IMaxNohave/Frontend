"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react"

export function TransactionHistory() {
  const purchases = [
    {
      id: 1,
      item: "Dragon Fruit",
      price: "500R$",
      seller: "ProTrader123",
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: 2,
      item: "Shadow Sword",
      price: "750R$",
      seller: "SwordMaster99",
      date: "2024-01-14",
      status: "completed",
    },
    {
      id: 3,
      item: "Ice Fruit",
      price: "300R$",
      seller: "FruitDealer",
      date: "2024-01-13",
      status: "pending",
    },
  ]

  const sales = [
    {
      id: 1,
      item: "Lightning Staff",
      price: "900R$",
      buyer: "MagicCollector",
      date: "2024-01-16",
      status: "completed",
    },
    {
      id: 2,
      item: "Golden Box",
      price: "1200R$",
      buyer: "BoxHunter",
      date: "2024-01-12",
      status: "completed",
    },
  ]

  const pending = [
    {
      id: 1,
      item: "Mystery Box",
      price: "450R$",
      type: "sell",
      user: "BoxCollector",
      date: "2024-01-17",
      status: "pending",
    },
    {
      id: 2,
      item: "Fire Fruit",
      price: "600R$",
      type: "buy",
      user: "FruitMaster",
      date: "2024-01-16",
      status: "pending",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Transaction History</h1>
        <p className="text-muted-foreground">Track your buying and selling activity</p>
      </div>

      <Tabs defaultValue="purchases" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-card">
          <TabsTrigger
            value="purchases"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Purchases
          </TabsTrigger>
          <TabsTrigger
            value="sales"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Sales
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Pending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
                <ArrowDownLeft className="h-5 w-5 text-red-400" />
                Purchase History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-card-foreground">{purchase.item}</h3>
                    <p className="text-sm text-muted-foreground">from {purchase.seller}</p>
                    <p className="text-xs text-muted-foreground">{purchase.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">{purchase.price}</p>
                    <Badge
                      variant={purchase.status === "completed" ? "default" : "secondary"}
                      className={
                        purchase.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }
                    >
                      {purchase.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-green-400" />
                Sales History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-card-foreground">{sale.item}</h3>
                    <p className="text-sm text-muted-foreground">to {sale.buyer}</p>
                    <p className="text-xs text-muted-foreground">{sale.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">+{sale.price}</p>
                    <Badge className="bg-green-500/20 text-green-400">completed</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-400" />
                Pending Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pending.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-card-foreground">{transaction.item}</h3>
                    <p className="text-sm text-muted-foreground">
                      {transaction.type === "buy" ? "from" : "to"} {transaction.user}
                    </p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-bold text-accent">
                      {transaction.type === "buy" ? "-" : "+"}
                      {transaction.price}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Confirm
                      </Button>
                      <Button size="sm" variant="outline" className="border-border text-card-foreground bg-transparent">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
