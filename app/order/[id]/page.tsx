// app/order/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MarketplaceHeader } from "@/components/marketplace-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TradingChat } from "@/components/trading-chat";
import { EvidenceUpload } from "@/components/evidence-upload";
import { api } from "@/app/service/api";

type Me = { id: string; name: string; email: string; image?: string | null };

type OrderDTO = {
  id: string;
  status: string;            // "PENDING" | "READY" | "COMPLETED" | "DISPUTED" | ...
  createdAt: string;
  deadlineAt: string | null;
  quantity: number;
  price: number;             // price_at_purchase (ต่อชิ้น)
  total: number;
  item: { id: string; name: string; image: string | null };
  seller: { id: string; name: string | null };
  buyer: { id: string; name: string | null };
  hasNewMessages?: boolean;
};

function fmtR(n: number | string | undefined) {
  const num = Number(n ?? 0);
  return `${num.toLocaleString()} R$`;
}

function normalizeStatus(s: string) {
  return s?.toLowerCase?.() ?? "pending";
}

export default function OrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [me, setMe] = useState<Me | null>(null);
  const [meLoaded, setMeLoaded] = useState(false);

  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // ----- Fetch me -----
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setMeLoaded(false);
        const res = await api.get<{ success: boolean; data: Me }>("/auth/user/me");
        if (!alive) return;
        if (res.data?.success) setMe(res.data.data);
      } catch {
        // 401 -> ยังไม่ล็อกอินก็ปล่อย me = null
      } finally {
        if (alive) setMeLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ----- Fetch order detail -----
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await api.get<{ success: boolean; data: OrderDTO }>(`/v1/orders/${orderId}`);
        if (!res.data?.success) throw new Error("Failed to load order");
        if (alive) setOrder(res.data.data);
      } catch (e: any) {
        if (!alive) return;
        if (e?.response?.status === 401) {
          // ไม่ได้ auth -> ชวนไปล็อกอิน
          if (confirm("Please sign in to view this order. Go to login?")) {
            router.push("/login");
            return;
          }
        }
        setErr(e?.message || "Failed to load order");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [orderId, router]);

  const role: "buyer" | "seller" | "guest" = useMemo(() => {
    if (!order || !me) return "guest";
    if (order.seller?.id === me.id) return "seller";
    if (order.buyer?.id === me.id) return "buyer";
    return "guest"; // ไม่ใช่คู่สัญญา (ควรโดน 403 ที่ backend อยู่แล้ว)
  }, [order, me]);

  const statusChip = useMemo(() => {
    const s = normalizeStatus(order?.status ?? "");
    switch (s) {
      case "pending":
        return { label: "PENDING", className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" };
      case "ready":
        return { label: "READY", className: "bg-green-500/20 text-green-500 border-green-500/30" };
      case "completed":
        return { label: "COMPLETED", className: "bg-blue-500/20 text-blue-500 border-blue-500/30" };
      case "disputed":
        return { label: "DISPUTED", className: "bg-red-500/20 text-red-500 border-red-500/30" };
      default:
        return { label: s.toUpperCase(), className: "bg-muted text-muted-foreground border-border" };
    }
  }, [order]);

  // ไทม์ไลน์อย่างง่าย (demo): พอมีสถานะก็เติม step
  const timeline = useMemo(() => {
    const s = normalizeStatus(order?.status ?? "");
    const created = order?.createdAt ? new Date(order.createdAt).toLocaleString() : "";
    const base = [
      { key: "paid", label: "ชำระเงินแล้ว (Escrow Held)", completed: true, time: created },
      { key: "waiting_seller_ready", label: "ผู้ขายพร้อม", completed: s === "ready" || s === "completed", time: "" },
      { key: "in_progress", label: "เทรดในเกม", completed: s === "completed", time: "" },
      { key: "completed", label: "สิ้นสุดแล้ว/ส่ง", completed: s === "completed", time: "" },
    ];
    if (s === "disputed") {
      base.push({ key: "disputed", label: "มีข้อพิพาท", completed: true, time: "" } as any);
    }
    return base;
  }, [order]);

  const handleReadyToSell = () => {
    // TODO: call PATCH /v1/orders/:id/ready (ถ้ามี)
    alert("TODO: Ready to sell");
  };

  const handleDispute = () => {
    // TODO: call POST /v1/disputes (หรือ /v1/orders/:id/dispute)
    alert("TODO: Dispute");
  };

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

  if (err || !order) {
    return (
      <div className="min-h-screen bg-background">
        <MarketplaceHeader />
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <p className="text-red-500">{err || "Order not found"}</p>
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
              <h1 className="text-2xl font-bold text-foreground">Order ID: {order.id}</h1>
              <Badge className={`mt-1 ${statusChip.className}`}>{statusChip.label}</Badge>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Buyer: <span className="text-foreground">{order.buyer?.name ?? "-"}</span></div>
              <div>Seller: <span className="text-foreground">{order.seller?.name ?? "-"}</span></div>
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
                  <h3 className="text-lg font-semibold text-card-foreground">{order.item.name}</h3>
                  <p className="text-sm text-muted-foreground">จำนวน: {order.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent">{fmtR(order.total)}</p>
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
                  <div className={`w-3 h-3 rounded-full ${step.completed ? "bg-green-500" : "bg-muted"}`} />
                  <div className="flex-1">
                    <p className={`font-medium ${step.completed ? "text-green-500" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                    {step.time ? (
                      <p className="text-sm text-muted-foreground">{step.time}</p>
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

          {/* Chat / Evidence */}
          <TradingChat orderId={order.id} currentUserId={me?.id ?? ""} currentUserRole={role === "guest" ? "buyer" : role} />
          <EvidenceUpload orderId={order.id} currentUserId={me?.id ?? ""} userRole={role === "guest" ? "buyer" : role} />

          {/* Summary */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">price</span>
                  <span className="text-card-foreground">{fmtR(order.price)}</span>
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
