"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, AlertTriangle, CheckCircle, XCircle, Clock, Eye, MessageSquare } from "lucide-react"

interface DisputeOrder {
  id: string
  itemName: string
  price: string
  buyer: string
  seller: string
  status: "pending" | "investigating" | "resolved" | "escalated"
  priority: "low" | "medium" | "high"
  createdAt: Date
  description: string
  evidenceCount: number
  messagesCount: number
}

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")

  // Mock dispute data
  const disputes: DisputeOrder[] = [
    {
      id: "ORD-2025-0001",
      itemName: "Dragon Fruit",
      price: "500$",
      buyer: "Customer123",
      seller: "ProTrader123",
      status: "pending",
      priority: "high",
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      description: "Seller didn't deliver item after payment",
      evidenceCount: 3,
      messagesCount: 12,
    },
    {
      id: "ORD-2025-0002",
      itemName: "Shadow Sword",
      price: "750$",
      buyer: "GamePlayer99",
      seller: "SwordMaster99",
      status: "investigating",
      priority: "medium",
      createdAt: new Date(Date.now() - 7200000), // 2 hours ago
      description: "Item quality not as described",
      evidenceCount: 5,
      messagesCount: 8,
    },
    {
      id: "ORD-2025-0003",
      itemName: "Golden Box",
      price: "1200$",
      buyer: "BoxLover",
      seller: "BoxCollector",
      status: "resolved",
      priority: "low",
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      description: "Payment dispute resolved",
      evidenceCount: 2,
      messagesCount: 15,
    },
  ]

  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch =
      dispute.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.seller.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || dispute.status === statusFilter
    const matchesPriority = priorityFilter === "all" || dispute.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: DisputeOrder["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
      case "investigating":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30"
      case "resolved":
        return "bg-green-500/20 text-green-500 border-green-500/30"
      case "escalated":
        return "bg-red-500/20 text-red-500 border-red-500/30"
      default:
        return "bg-muted/20 text-muted-foreground"
    }
  }

  const getPriorityColor = (priority: DisputeOrder["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-500"
      case "medium":
        return "bg-yellow-500/20 text-yellow-500"
      case "low":
        return "bg-green-500/20 text-green-500"
      default:
        return "bg-muted/20 text-muted-foreground"
    }
  }

  const getStatusIcon = (status: DisputeOrder["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "investigating":
        return <AlertTriangle className="h-4 w-4" />
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      case "escalated":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage disputes and monitor trading activities</p>
          </div>
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
            {disputes.filter((d) => d.status === "pending").length} Pending Disputes
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {disputes.filter((d) => d.status === "pending").length}
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
                  <AlertTriangle className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {disputes.filter((d) => d.status === "investigating").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Investigating</p>
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
                    {disputes.filter((d) => d.status === "resolved").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {disputes.filter((d) => d.status === "escalated").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Escalated</p>
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
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-48 bg-input border-border">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Disputes List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Dispute Cases ({filteredDisputes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDisputes.map((dispute) => (
                <div
                  key={dispute.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(dispute.status)}
                        <h3 className="font-semibold text-card-foreground">{dispute.id}</h3>
                      </div>
                      <Badge className={getStatusColor(dispute.status)}>{dispute.status.toUpperCase()}</Badge>
                      <Badge variant="secondary" className={getPriorityColor(dispute.priority)}>
                        {dispute.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="border-border hover:bg-accent bg-transparent">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" className="bg-accent hover:bg-accent/90">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Respond
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Item</p>
                      <p className="font-medium text-card-foreground">{dispute.itemName}</p>
                      <p className="text-sm text-accent">{dispute.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Parties</p>
                      <p className="text-sm text-card-foreground">
                        <span className="text-blue-500">Buyer:</span> {dispute.buyer}
                      </p>
                      <p className="text-sm text-card-foreground">
                        <span className="text-green-500">Seller:</span> {dispute.seller}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Activity</p>
                      <p className="text-sm text-card-foreground">{dispute.evidenceCount} Evidence files</p>
                      <p className="text-sm text-card-foreground">{dispute.messagesCount} Messages</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-card-foreground">{dispute.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created {dispute.createdAt.toLocaleString()}</span>
                    <span>Last updated 2 hours ago</span>
                  </div>
                </div>
              ))}

              {filteredDisputes.length === 0 && (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No disputes found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
