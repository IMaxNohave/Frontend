// app/orders/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { MarketplaceHeader } from "@/components/marketplace-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/useOrders";
import { OrderCard } from "@/components/order-card";

export default function OrdersPage() {
  const router = useRouter();

  // ได้ลิสต์แยกฝั่งเรียบร้อยจาก hook
  const { purchases, sales, loading, error, acceptOrder } = useOrders();

  const hasNoData = purchases.length === 0 && sales.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 mt-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
          <p className="text-muted-foreground">
            Track your purchases and sales
          </p>
        </div>

        {loading && <p className="text-muted-foreground">Loading...</p>}
        {/* {error && <p className="text-red-500">{error}</p>} */}

        {hasNoData && (
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

        {!loading && !hasNoData && (
          <Tabs defaultValue="purchases" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-card">
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
            </TabsList>

            <TabsContent value="purchases">
              <div className="grid gap-4">
                {purchases.length === 0 ? (
                  <p className="text-muted-foreground">No purchases yet</p>
                ) : (
                  purchases.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onView={() => router.push(`/order/${order.id}`)}
                      // onChat={() => router.push(`/order/${order.id}#chat`)}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="sales">
              <div className="grid gap-4">
                {sales.length === 0 ? (
                  <p className="text-muted-foreground">No sales yet</p>
                ) : (
                  sales.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      isSellerView //
                      onAccept={() => acceptOrder(order.id)}
                      onView={() => router.push(`/order/${order.id}`)}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
