// components/item-grid.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import { api } from "@/app/services/api";

type Item = {
  id: string;
  name: string;
  seller_name: string | null;
  sellerId: string | null; // ⬅️ เพิ่ม
  detail: string | null;
  image: string | null;
  price: number;
  status: number;
  category: { id: string | null; name: string | null; detail: string | null };
  expiresAt?: string | null;
};

interface ItemGridProps {
  items: Item[];
  loading: boolean;
  err: string | null;
  selectedCategoryName: string | null;
  onDeleteItem?: (id: string) => void; // ถ้าพ่อแม่อยากจัดการเอง
}

type MeResp = { success: boolean; data?: { id: string; user_type?: number } };

function formatRemain(ms: number) {
  if (ms <= 0) return "Expired";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${ss}s`;
  return `${ss}s`;
}

export function ItemGrid({
  items,
  loading,
  err,
  selectedCategoryName,
  onDeleteItem,
}: ItemGridProps) {
  const router = useRouter();

  // ดึงข้อมูลผู้ใช้ปัจจุบันแบบง่าย (หรือเปลี่ยนไปใช้ store/auth ของคุณ)
  const user = useUserStore();

  const myId = user?.me?.id ?? null;
  const isAdmin = (user?.me?.user_type ?? 1) === 2;

  useEffect(() => {
    console.log("Current user:", user);
  }, [user]);

  // เรียก API ลบแบบ fallback ถ้า parent ไม่ได้ส่ง onDeleteItem เข้ามา
  const callDeleteApi = async (id: string) => {
    const res = await api.delete(`/v1/items/${id}`);
    if (!res.data?.success) {
      throw new Error(res.data?.error || "Delete failed");
    }
  };

  const handleDelete = async (item: Item, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${item.name}" ?`)) return;

    try {
      // ถ้า parent ส่ง onDeleteItem มาก็เรียก parent ให้จัดการ refresh เอง
      if (onDeleteItem) {
        await callDeleteApi(item.id);
        onDeleteItem(item.id);
      } else {
        // fallback: ลบผ่าน API อย่างเดียว (การ refresh list ให้ component แม่จัดการ)
        await callDeleteApi(item.id);
      }
    } catch (e: any) {
      alert(e?.response?.data?.error || e?.message || "Failed to delete item");
    }
  };

  // timer เหมือนเดิม…
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {loading && (
        <div className="text-muted-foreground mb-4">Loading items…</div>
      )}
      {err && <div className="text-red-500 mb-4">Error: {err}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const target = item.expiresAt
            ? new Date(item.expiresAt).getTime()
            : null;
          const remainMs = target ? Math.max(0, target - now) : null;
          const remainText = remainMs !== null ? formatRemain(remainMs) : null;
          const isExpired = remainMs !== null && remainMs <= 0;

          const canDelete = !!myId && (isAdmin || item.sellerId === myId);
          // console.log({ canDelete, isAdmin, myId, itemSeller: item.sellerId });
          return (
            <Card
              key={item.id}
              className="bg-card border-border hover:border-accent transition-colors cursor-pointer group"
              onClick={() => router.push(`/item/${item.id}`)}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden relative">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {item.expiresAt && (
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant="secondary"
                        className={
                          "text-xs " +
                          (isExpired
                            ? "bg-red-600/80 text-white"
                            : "bg-amber-500/80 text-white")
                        }
                      >
                        {isExpired ? "Expired" : `Ends in ${remainText}`}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-card-foreground font-semibold">
                      {item.name}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="bg-accent/20 text-accent text-xs"
                    >
                      #{item.category?.name ?? "Uncategorized"}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    by {item.seller_name ?? "-"}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-accent">
                      {Number(item.price).toLocaleString()} R$
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/item/${item.id}`);
                        }}
                      >
                        View Item
                      </Button>

                      {/* ⬇️ แสดงปุ่มลบเฉพาะ owner หรือ admin */}
                      {canDelete && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
                          onClick={(e) => handleDelete(item, e)}
                          title="Soft delete this listing"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>

                  {item.expiresAt && (
                    <div
                      className={
                        "text-xs mt-1 " +
                        (isExpired ? "text-red-600" : "text-muted-foreground")
                      }
                    >
                      {isExpired
                        ? "This listing has expired"
                        : `Ends in ${remainText}`}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!loading && !err && items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {selectedCategoryName
              ? `No items found for #${selectedCategoryName}`
              : "No items found"}
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Try searching another keyword or tag
          </p>
        </div>
      )}
    </>
  );
}
