"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  Package,
  DollarSign,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { MarketplaceHeader } from "@/components/marketplace-header"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"

interface Order {
  id: string
  itemName: string
  price: string
  buyer: string
  seller: string
  status: "pending" | "confirmed" | "completed" | "disputed" | "cancelled"
  createdAt: Date
  description: string
}

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const router = useRouter()

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin")
    if (!isAdmin) {
      router.push("/")
      return
    }
  }, [router])

  const allOrders: Order[] = [
    {
      id: "ORD-2025-0001",
      itemName: "Dragon Fruit",
      price: "500R$",
      buyer: "Customer123",
      seller: "ProTrader123",
      status: "disputed",
      createdAt: new Date(Date.now() - 3600000),
      description: "Seller didn't deliver item after payment",
    },
    {
      id: "ORD-2025-0002",
      itemName: "Shadow Sword",
      price: "750R$",
      buyer: "GamePlayer99",
      seller: "SwordMaster99",
      status: "completed",
      createdAt: new Date(Date.now() - 7200000),
      description: "Successful trade completed",
    },
    {
      id: "ORD-2025-0003",
      itemName: "Golden Box",
      price: "1200R$",
      buyer: "BoxLover",
      seller: "BoxCollector",
      status: "pending",
      createdAt: new Date(Date.now() - 86400000),
      description: "Waiting for seller confirmation",
    },
    {
      id: "ORD-2025-0004",
      itemName: "Magic Wand",
      price: "300R$",
      buyer: "WizardFan",
      seller: "MagicDealer",
      status: "confirmed",
      createdAt: new Date(Date.now() - 172800000),
      description: "Order confirmed, awaiting delivery",
    },
    {
      id: "ORD-2025-0005",
      itemName: "Fire Sword",
      price: "900R$",
      buyer: "WarriorKing",
      seller: "WeaponMaster",
      status: "cancelled",
      createdAt: new Date(Date.now() - 259200000),
      description: "Cancelled by buyer",
    },
  ]

  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.seller.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
      case "confirmed":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30"
      case "completed":
        return "bg-green-500/20 text-green-500 border-green-500/30"
      case "disputed":
        return "bg-red-500/20 text-red-500 border-red-500/30"
      case "cancelled":
        return "bg-gray-500/20 text-gray-500 border-gray-500/30"
      default:
        return "bg-muted/20 text-muted-foreground"
    }
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <Package className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "disputed":
        return <AlertTriangle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />

      <div className="container mx-auto px-4 py-6">
        <BreadcrumbNav
          items={[
            { label: "Marketplace", href: "/marketplace" },
            { label: "Admin Dashboard", href: "/admin" },
          ]}
        />

        <div className="max-w-7xl mx-auto space-y-6 mt-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Monitor all trading activities and manage orders</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  localStorage.removeItem("isAdmin")
                  router.push("/")
                }}
                variant="destructive"
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">
                      {allOrders.filter((o) => o.status === "pending").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Package className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">
                      {allOrders.filter((o) => o.status === "confirmed").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Confirmed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">
                      {allOrders.filter((o) => o.status === "completed").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">
                      {allOrders.filter((o) => o.status === "disputed").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Disputed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <DollarSign className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">{allOrders.length}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by Order ID, item name, buyer, or seller..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-input border-border"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48 bg-input border-border">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">All Orders ({filteredOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <h3 className="font-semibold text-card-foreground">{order.id}</h3>
                        </div>
                        <Badge className={getStatusColor(order.status)}>{order.status.toUpperCase()}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="border-border hover:bg-accent bg-transparent">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {order.status === "disputed" && (
                          <Button size="sm" className="bg-accent hover:bg-accent/90">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Manage Dispute
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Item</p>
                        <p className="font-medium text-card-foreground">{order.itemName}</p>
                        <p className="text-sm text-accent">{order.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Parties</p>
                        <p className="text-sm text-card-foreground">
                          <span className="text-blue-500">Buyer:</span> {order.buyer}
                        </p>
                        <p className="text-sm text-card-foreground">
                          <span className="text-green-500">Seller:</span> {order.seller}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-sm text-card-foreground">{order.createdAt.toLocaleDateString()}</p>
                        <p className="text-sm text-card-foreground">{order.createdAt.toLocaleTimeString()}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p className="text-sm text-card-foreground">{order.description}</p>
                    </div>
                  </div>
                ))}

                {filteredOrders.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No orders found matching your criteria</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
