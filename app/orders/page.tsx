// app/orders/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { MarketplaceHeader } from "@/components/marketplace-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { normStatus, statusChipOf } from "@/stores/orderStore";
import { use } from "react";

const StatusIcon = ({ status }: { status: string }) => {
  switch (normStatus(status)) {
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "ready":
    case "completed":
      return <CheckCircle className="h-4 w-4" />;
    case "disputed":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export default function OrdersPage() {
  const router = useRouter();
  const { orders, loading, error } = useOrders();

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 mt-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
          <p className="text-muted-foreground">
            Track your purchases and communicate with sellers
          </p>
        </div>

        {loading && <p className="text-muted-foreground">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No orders found</p>
            <p className="text-muted-foreground text-sm mt-2">
              Start shopping to see your orders here
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/marketplace")}
            >
              Browse Items
            </Button>
          </div>
        )}

        <div className="grid gap-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="bg-card border-border hover:border-accent transition-colors"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={order.item.image || "/placeholder.svg"}
                      alt={order.item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">
                          {order.item.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          by {order.seller.name || "Unknown"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent text-lg">
                          {order.total.toLocaleString()} R$
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {order.id}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${statusChipOf(
                              order.status
                            )}`}
                          />
                          <Badge
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            <StatusIcon status={order.status} />
                            <span className="ml-1">
                              {normStatus(order.status)}
                            </span>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/order/${order.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => router.push(`/order/${order.id}#chat`)}
                        >
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
      </div>
    </div>
  );
}
