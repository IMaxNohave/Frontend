// app/order/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { MarketplaceHeader } from "@/components/marketplace-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TradingChat } from "@/components/trading-chat";
import { EvidenceUpload } from "@/components/evidence-upload";
import { useOrderDetail } from "@/hooks/useOrderDetail";

const fmtR = (n?: number | string) => `${Number(n ?? 0).toLocaleString()} R$`;

export default function OrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const { me, order, loading, error, role, timeline, statusChip, actions } =
    useOrderDetail(orderId, { pollMs: null });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MarketplaceHeader />
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <p className="text-muted-foreground">Loading order…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <MarketplaceHeader />
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <p className="text-red-500">{error || "Order not found"}</p>
            <Button variant="outline" onClick={() => router.push("/orders")}>
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Order ID: {order.id}
              </h1>
              <Badge className={`mt-1 ${statusChip.className}`}>
                {statusChip.label}
              </Badge>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>
                Buyer:{" "}
                <span className="text-foreground">
                  {order.buyer?.name ?? "-"}
                </span>
              </div>
              <div>
                Seller:{" "}
                <span className="text-foreground">
                  {order.seller?.name ?? "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Item Info */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={order.item.image || "/placeholder.svg"}
                    alt={order.item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {order.item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    จำนวน: {order.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent">
                    {fmtR(order.total)}
                  </p>
                  <p className="text-sm text-muted-foreground">รวมสุทธิ</p>
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
              {timeline.map((step) => (
                <div key={step.key} className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      step.completed ? "bg-green-500" : "bg-muted"
                    }`}
                  />
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        step.completed
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.time ? (
                      <p className="text-sm text-muted-foreground">
                        {step.time}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions (เฉพาะผู้ขาย) */}
          {role === "seller" && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  การดำเนินการ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    onClick={actions.markReady}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                  >
                    พร้อมขาย
                  </Button>
                  <Button
                    onClick={actions.raiseDispute}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Dispute
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat / Evidence */}
          <TradingChat
            orderId={order.id}
            currentUserId={me?.id ?? ""}
            currentUserRole={role === "guest" ? "buyer" : role}
          />
          {/* <EvidenceUpload
            orderId={order.id}
            currentUserId={me?.id ?? ""}
            userRole={role === "guest" ? "buyer" : role}
          /> */}

          {/* Summary */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">price</span>
                  <span className="text-card-foreground">
                    {fmtR(order.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">fee</span>
                  <span className="text-card-foreground">{fmtR(0)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-card-foreground">total</span>
                  <span className="text-accent">{fmtR(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
