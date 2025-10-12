"use client";

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
import { normStatus, statusChipOf } from "@/stores/orderStore";

/**
 * Props:
 * - isSellerView: แสดงว่า card นี้อยู่บนแท็บ Sales หรือไม่
 * - onAccept: กด accept (เฉพาะ seller view + ESCROW_HELD)
 * - onView: เปิดรายละเอียดออเดอร์ (disabled ถ้า ESCROW_HELD)
 */
export function OrderCard({
  order,
  onView,
  isSellerView = false,
  onAccept,
}: {
  order: any;
  onView: () => void;
  isSellerView?: boolean;
  onAccept?: () => void;
}) {
  const StatusIcon = ({ status }: { status: string }) => {
    switch (normStatus(status)) {
      case "pending": // ESCROW_HELD
        return <Clock className="h-4 w-4" />;
      case "in_trade": // IN_TRADE
      case "await_confirm": // AWAIT_CONFIRM
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "disputed":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // ปรับ mapping ให้ชัด
  const normalized = normStatus(order.status);
  const chip = statusChipOf(order.status); // { label, className }
  const canView = normalized !== "pending"; // pending = ESCROW_HELD → ยังห้ามดูรายละเอียด
  const showAccept =
    isSellerView && order.status?.toUpperCase() === "ESCROW_HELD";

  // ป้ายสถานะสำหรับโชว์ (สวยงาม)
  const prettyLabel = (() => {
    switch (normalized) {
      case "pending":
        return "ESCROW_HELD";
      case "in_trade":
        return "IN_TRADE";
      case "await_confirm":
        return "AWAIT_CONFIRM";
      case "completed":
        return "COMPLETED";
      case "cancelled":
        return "CANCELLED";
      case "expired":
        return "EXPIRED";
      case "disputed":
        return "DISPUTED";
      default:
        return (order.status || "").toString().toUpperCase();
    }
  })();

  return (
    <Card className="bg-card border-border hover:border-accent transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={order.item?.image || "/placeholder.svg"}
              alt={order.item?.name || "Item"}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-foreground text-lg">
                  {order.item?.name ?? "Unknown Item"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  by {order.seller?.name || "Unknown"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-accent text-lg">
                  {Number(order.total).toLocaleString()} R$
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
                  <div className={`w-2 h-2 rounded-full ${chip}`} />
                  <Badge variant="secondary" className="text-xs">
                    <span className="inline-flex items-center gap-1">
                      <StatusIcon status={order.status} />
                      <span className="ml-1">{prettyLabel}</span>
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
                {/* ปุ่ม Accept เฉพาะ Sales + ESCROW_HELD */}
                {showAccept && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onAccept}
                    title="Accept & start trading within the time window"
                  >
                    Accept & Start Trade
                  </Button>
                )}

                {/* View Details: disabled ถ้ายังไม่ accept */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onView}
                  disabled={!canView}
                  title={
                    !canView ? "Seller must accept before viewing details" : ""
                  }
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
