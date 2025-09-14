"use client"

import { Search, Menu, User, Plus, Home, ShoppingBag, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { NavigationMenu } from "@/components/navigation-menu"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function MarketplaceHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const activeOrders = [
    {
      id: "ORD-2025-0001",
      item: "Dragon Fruit",
      status: "pending",
      hasNewMessages: true,
      seller: "ProTrader123",
    },
    {
      id: "ORD-2025-0002",
      item: "Shadow Sword",
      status: "ready",
      hasNewMessages: false,
      seller: "SwordMaster99",
    },
    {
      id: "ORD-2025-0003",
      item: "Golden Box",
      status: "completed",
      hasNewMessages: false,
      seller: "BoxCollector",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "ready":
        return "bg-green-500"
      case "completed":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <>
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-card-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.push("/marketplace")}
                className="text-card-foreground hover:bg-accent hover:text-accent-foreground font-bold text-lg"
              >
                <Home className="h-5 w-5 mr-2" />
                Ro Trade
              </Button>
            </div>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Search items..." className="pl-10 bg-input border-border text-foreground" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-accent font-bold text-lg">1000R$</span>
              <Button
                size="icon"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => router.push("/add-money")}
              >
                <Plus className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-card-foreground hover:bg-accent hover:text-accent-foreground relative"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {activeOrders.some((order) => order.hasNewMessages) && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>My Orders</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {activeOrders.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No active orders</div>
                  ) : (
                    activeOrders.map((order) => (
                      <DropdownMenuItem
                        key={order.id}
                        className="p-3 cursor-pointer"
                        onClick={() => router.push(`/order/${order.id}`)}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(order.status)}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">{order.item}</p>
                              {order.hasNewMessages && (
                                <MessageCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">by {order.seller}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {order.id}
                              </Badge>
                              <Badge variant="secondary" className="text-xs capitalize">
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center justify-center" onClick={() => router.push("/orders")}>
                    View All Orders
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="text-card-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => router.push("/profile")}
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <NavigationMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}
