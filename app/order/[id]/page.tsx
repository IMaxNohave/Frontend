"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TradingChat } from "@/components/trading-chat"
import { EvidenceUpload } from "@/components/evidence-upload"
import { MarketplaceHeader } from "@/components/marketplace-header"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"

export default function OrderPage() {
  const params = useParams()
  const orderId = params.id as string
  const [userRole, setUserRole] = useState<"buyer" | "seller">("buyer") // This would come from auth
  const currentUserId = "user123" // This would come from auth

  // Mock order data - would come from database
  const orderData = {
    id: orderId,
    itemName: "Grass",
    itemImage: "/placeholder-se2ao.png",
    price: "500$",
    status: "waiting_seller_ready",
    buyer: "Customer123",
    seller: "BallChon",
    timeline: [
      { status: "paid", time: "7/9/2568 21:10:22", completed: true },
      { status: "waiting_seller_ready", time: "รอ 08:44:20", completed: false },
      { status: "in_progress", completed: false },
      { status: "completed", completed: false },
    ],
  }

  const handleReadyToSell = () => {
    // TODO: Update order status
    console.log("Ready to sell clicked")
  }

  const handleDispute = () => {
    // TODO: Open dispute
    console.log("Dispute clicked")
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <div className="container mx-auto px-4 py-6">
        <BreadcrumbNav />
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Order ID: {orderId}</h1>
              <Badge className="mt-1 bg-yellow-500/20 text-yellow-500 border-yellow-500/30">AWAIT SELLER READY</Badge>
            </div>
          </div>

          {/* Item Info */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                  <img
                    src={orderData.itemImage || "/placeholder.svg"}
                    alt={orderData.itemName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-card-foreground">{orderData.itemName}</h3>
                  <p className="text-sm text-muted-foreground">จำนวน: 1</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent">{orderData.price}</p>
                  <p className="text-sm text-muted-foreground">ราคาโดยรวมโดยร์</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderData.timeline.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${step.completed ? "bg-green-500" : "bg-muted"}`} />
                  <div className="flex-1">
                    <p className={`font-medium ${step.completed ? "text-green-500" : "text-muted-foreground"}`}>
                      {step.status === "paid" && "ชำระเงินแล้ว (Escrow Held)"}
                      {step.status === "waiting_seller_ready" && "ผู้ขายพร้อม"}
                      {step.status === "in_progress" && "เทรดในเกม"}
                      {step.status === "completed" && "สิ้นสุดแล้ว/ส่ง"}
                    </p>
                    <p className="text-sm text-muted-foreground">{step.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          {userRole === "seller" && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">การดำเนินการ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    onClick={handleReadyToSell}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                  >
                    พร้อมขาย
                  </Button>
                  <Button onClick={handleDispute} variant="destructive" className="bg-red-600 hover:bg-red-700">
                    Dispute
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <TradingChat orderId={orderId} currentUserId={currentUserId} currentUserRole={userRole} />

          <EvidenceUpload orderId={orderId} currentUserId={currentUserId} userRole={userRole} />

          {/* Summary */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">price</span>
                  <span className="text-card-foreground">500$</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">fee</span>
                  <span className="text-card-foreground">0$</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-card-foreground">total</span>
                  <span className="text-accent">500$</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
