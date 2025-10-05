"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { PurchaseConfirmationDialog } from "./purchase-confirmation-dialog";

interface ItemGridProps {
  selectedTag: string | null; // categoryId
  token: string | null;
  searchTerm: string;
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

type Category = { id: string; name: string };

export function ItemGrid({ selectedTag, token, searchTerm }: ItemGridProps) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const currentUserEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
  const isAdmin = currentUserEmail === "admin@gmail.com";

  const [catMap, setCatMap] = useState<Record<string, string>>({});

  // โหลด category map (ชื่อ)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/v1/home/categories", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          cache: "no-store",
        });
        const j = await r.json();
        const list: Category[] = Array.isArray(j?.data) ? j.data : [];
        const map: Record<string, string> = {};
        for (const c of list) map[c.id] = c.name;
        setCatMap(map);
      } catch {}
    })();
  }, [token]);

  const selectedCategoryName = useMemo(
    () => (selectedTag ? catMap[selectedTag] ?? selectedTag : null),
    [selectedTag, catMap]
  );

  // ✅ fetch ด้วย debounce + AbortController กัน race
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedTag) params.set("categoryId", selectedTag);
    if (searchTerm) params.set("q", searchTerm);

    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setErr(null);

      fetch(`/api/v1/home?${params.toString()}`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
        signal: ctrl.signal,
      })
        .then(async (r) => {
          const txt = await r.text();
          const json = JSON.parse(txt || "{}");
          if (!r.ok || json?.success === false) {
            throw new Error(json?.error || `${r.status} ${r.statusText}`);
          }
          return (json.data || []) as Item[];
        })
        .then((rows) => setItems(rows))
        .catch((e) => {
          if (e.name === "AbortError") return;
          setErr(e.message || "failed to fetch items");
        })
        .finally(() => setLoading(false));
    }, 250); // debounce เครือข่าย

    return () => {
      clearTimeout(timer);
      ctrl.abort(); // ยกเลิกคำขอเก่าเมื่อพิมพ์ต่อ
    };
  }, [selectedTag, searchTerm, token]);

  // ✅ ฟิลเตอร์ฝั่ง client ให้ตอบสนองทันที (แม้ระหว่างรอ API)
  const visibleItems = useMemo(() => {
    let list = items;
    if (selectedTag) list = list.filter((it) => it.category?.id === selectedTag);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          (it.detail ?? "").toLowerCase().includes(q) ||
          (it.seller_name ?? "").toLowerCase().includes(q) ||
          (it.category?.name ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, selectedTag, searchTerm]);

  const handleBuyClick = (item: Item, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(item);
    setShowConfirmDialog(true);
  };

  const handleDeleteItem = async (item: Item, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${item.name}" ?`)) return;
    setItems((prev) => prev.filter((it) => it.id !== item.id));
  };

  return (
    <>
      {loading && <div className="text-muted-foreground mb-4">Loading items…</div>}
      {err && <div className="text-red-500 mb-4">Error: {err}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleItems.map((item) => {
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
                    <h3 className="text-card-foreground font-semibold">{item.name}</h3>
                    <Badge variant="secondary" className="bg-accent/20 text-accent text-xs">
                      #{item.category?.name ?? "Uncategorized"}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">by {item.seller_name ?? "-"}</p>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-accent">
                      {Number(item.price).toLocaleString()} R$
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                         onClick={() => router.push(`/item/${item.id}`)}
                      >
                        View Item
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

      {!loading && !err && visibleItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {selectedCategoryName ? `No items found for #${selectedCategoryName}` : "No items found"}
          </p>
          <p className="text-muted-foreground text-sm mt-2">Try searching another keyword or tag</p>
        </div>
      )}

      {selectedItem && (
        <PurchaseConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          item={{
            id: Number(selectedItem.id),
            name: selectedItem.name,
            price: String(selectedItem.price),
            seller: selectedItem.seller_name ?? "-",
            image: selectedItem.image ?? "/placeholder.svg",
          }}
        />
      )}
    </>
  );
}
