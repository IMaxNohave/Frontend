"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

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

interface ItemGridProps {
  items: Item[];
  loading: boolean;
  err: string | null;
  selectedCategoryName: string | null;
  onDeleteItem?: (id: string) => void;
}

export function ItemGrid({
  items,
  loading,
  err,
  selectedCategoryName,
  onDeleteItem,
}: ItemGridProps) {
  const router = useRouter();

  const isAdmin =
    typeof window !== "undefined" &&
    localStorage.getItem("userEmail") === "admin@gmail.com";

  const handleDelete = (item: Item, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDeleteItem) return;
    if (!confirm(`Delete "${item.name}" ?`)) return;
    onDeleteItem(item.id);
  };

  return (
    <>
      {loading && (
        <div className="text-muted-foreground mb-4">Loading items…</div>
      )}
      {err && <div className="text-red-500 mb-4">Error: {err}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
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
                      onClick={() => router.push(`/item/${item.id}`)}
                    >
                      View Item
                    </Button>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
                        onClick={(e) => handleDelete(item, e)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
