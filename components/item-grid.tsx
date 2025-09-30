"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { PurchaseConfirmationDialog } from "./purchase-confirmation-dialog";

interface ItemGridProps {
  selectedTag: string | null; // ใช้เป็น category ชื่อ เช่น "BloxFruit"
}

type Item = {
  id: string;
  name: string;
  seller_name: string | null;
  detail: string | null;
  image: string | null;
  price: number;
  status: number;
  category: { id: string | null; name: string | null; detail: string | null };
};

export function ItemGrid({ selectedTag }: ItemGridProps) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  type Category = { id: string; name: string };

  const currentUserEmail =
    typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
  const isAdmin = currentUserEmail === "admin@gmail.com";

  const filtered = useMemo(() => {
    if (!selectedTag) return items; // All
    return items.filter((it) => it.category?.id === selectedTag);
  }, [items, selectedTag]);

  const [catMap, setCatMap] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const r = await fetch("/api/v1/categories", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const j = await r.json();
        const list: Category[] = Array.isArray(j?.data) ? j.data : [];
        const map: Record<string, string> = {};
        for (const c of list) map[c.id] = c.name;
        setCatMap(map);
      } catch {}
    })();
  }, []);

  const selectedCategoryName = useMemo(
    () => (selectedTag ? catMap[selectedTag] ?? selectedTag : null),
    [selectedTag, catMap]
  );

  // โหลดรายการจาก API
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    if (!token) {
      setErr("No token in localStorage");
      return;
    }

    setLoading(true);
    setErr(null);

    fetch("api/v1/home", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        const txt = await r.text();
        const json = JSON.parse(txt || "{}");
        if (!r.ok || !json?.success) {
          throw new Error(json?.error || `${r.status} ${r.statusText}`);
        }
        return (json.data || []) as Item[];
      })
      .then((rows) => setItems(rows))
      .catch((e) => setErr(e.message || "failed to fetch items"))
      .finally(() => setLoading(false));
    console.log("Fetched items:", items);
  }, []);

  const handleBuyClick = (item: Item, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(item);
    setShowConfirmDialog(true);
  };

  // ตัวอย่างลบ (จริง ๆ ฝั่ง API ควรมี endpoint delete/soft-delete ของ item)
  const handleDeleteItem = async (item: Item, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${item.name}" ?`)) return;

    // TODO: เรียก API ของคุณเพื่อ soft-delete เช่น PATCH /v1/home/edit/:id { isActive: false }
    // ตอนนี้ขอลบออกจาก state ก่อนเป็นตัวอย่าง
    setItems((prev) => prev.filter((it) => it.id !== item.id));
  };

  return (
    <>
      {/* states */}
      {loading && (
        <div className="text-muted-foreground mb-4">Loading items…</div>
      )}
      {err && <div className="text-red-500 mb-4">Error: {err}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => {
          // ในข้อมูลจาก /v1/home ยังไม่มี email ผู้ขาย → ตรวจ owner จริง ๆ ต้องเทียบ userId
          // ตรงนี้จะโชว์ปุ่ม Delete เฉพาะ admin ไปก่อน
          const canEditDelete = isAdmin;

          return (
            <Card
              key={item.id}
              className="bg-card border-border hover:border-accent transition-colors cursor-pointer group"
              onClick={() => router.push(`/item/${item.id}`)}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
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
                        onClick={(e) => handleBuyClick(item, e)}
                      >
                        Buy Now
                      </Button>
                      {canEditDelete && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
                          onClick={(e) => handleDeleteItem(item, e)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!loading && !err && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {selectedCategoryName
              ? `No items found for #${selectedCategoryName}`
              : "No items found"}
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Try selecting a different tag or browse all items
          </p>
        </div>
      )}

      {selectedItem && (
        <PurchaseConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          item={selectedItem}
        />
      )}
    </>
  );
}
