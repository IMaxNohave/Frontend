"use client"

import { MarketplaceHeader } from "@/components/marketplace-header"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, Eye, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function OrdersPage() {
  const router = useRouter()

  const orders = [
    {
      id: "ORD-2025-0001",
      item: "Dragon Fruit",
      price: "500$",
      status: "pending",
      seller: "ProTrader123",
      createdAt: "2025-01-14",
      hasNewMessages: true,
      image: "/placeholder-se2ao.png",
    },
    {
      id: "ORD-2025-0002",
      item: "Shadow Sword",
      price: "750$",
      status: "ready",
      seller: "SwordMaster99",
      createdAt: "2025-01-13",
      hasNewMessages: false,
      image: "/placeholder-opw43.png",
    },
    {
      id: "ORD-2025-0003",
      item: "Golden Box",
      price: "1200$",
      status: "completed",
      seller: "BoxCollector",
      createdAt: "2025-01-12",
      hasNewMessages: false,
      image: "/placeholder-of0v7.png",
    },
    {
      id: "ORD-2025-0004",
      item: "Ice Fruit",
      price: "300$",
      status: "disputed",
      seller: "FruitDealer",
      createdAt: "2025-01-11",
      hasNewMessages: true,
      image: "/placeholder-rjxxe.png",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "ready":
        return <CheckCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "disputed":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "ready":
        return "bg-green-500"
      case "completed":
        return "bg-blue-500"
      case "disputed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <div className="container mx-auto px-4 py-6">
        <BreadcrumbNav
          items={[
            { label: "Marketplace", href: "/marketplace" },
            { label: "My Orders", href: "/orders" },
          ]}
        />

        <div className="mb-6 mt-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track your purchases and communicate with sellers</p>
        </div>

        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="bg-card border-border hover:border-accent transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={order.image || "/placeholder.svg"}
                      alt={order.item}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{order.item}</h3>
                        <p className="text-sm text-muted-foreground">by {order.seller}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent text-lg">{order.price}</p>
                        <p className="text-xs text-muted-foreground">{order.createdAt}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {order.id}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`} />
                          <Badge variant="secondary" className="text-xs capitalize">
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status}</span>
                          </Badge>
                        </div>
                        {order.hasNewMessages && (
                          <Badge variant="destructive" className="text-xs">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            New Messages
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/order/${order.id}`)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button variant="default" size="sm" onClick={() => router.push(`/order/${order.id}#chat`)}>
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No orders found</p>
            <p className="text-muted-foreground text-sm mt-2">Start shopping to see your orders here</p>
            <Button className="mt-4" onClick={() => router.push("/marketplace")}>
              Browse Items
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
