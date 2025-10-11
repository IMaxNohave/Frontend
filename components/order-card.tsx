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

export function OrderCard({
  order,
  onView,
}: {
  order: any;
  onView: () => void;
}) {
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

  return (
    <Card className="bg-card border-border hover:border-accent transition-colors">
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
                  by {order.seller?.name || "Unknown"}
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
                  <Badge variant="secondary" className="text-xs capitalize">
                    <StatusIcon status={order.status} />
                    <span className="ml-1">{normStatus(order.status)}</span>
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
                <Button variant="outline" size="sm" onClick={onView}>
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                {/* <Button variant="default" size="sm" onClick={onChat}>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Chat
                </Button> */}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
