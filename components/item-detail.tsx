"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ItemDetailProps {
  itemId: string;
}

type Item = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string | null;
  seller: string;
  sellerEmail?: string | null;
  description?: string | null;
  rarity?: string;
  condition?: string;
  status?: number;
  sellerId?: string;
};

export function ItemDetail({ itemId }: ItemDetailProps) {
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserEmail =
    typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
  const isAdmin = currentUserEmail === "admin@gmail.com";

  // โหลดข้อมูล item
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") || ""
            : "";
        const res = await fetch(`/api/v1/items/${itemId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || `Failed to load item (${res.status})`);
        }
        if (alive) setItem(data.data);
      } catch (e: any) {
        if (alive) setError(e?.message || "Failed to load item");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [itemId]);

  const isOwner = useMemo(() => {
    if (!item) return false;
    return currentUserEmail && item.sellerEmail
      ? currentUserEmail === item.sellerEmail
      : false;
  }, [item, currentUserEmail]);

  const canEditDelete = isAdmin || isOwner;

  const handleEdit = () => {
    if (!item) return;
    router.push(`/edit-item/${item.id}`);
  };

  const handleDelete = async () => {
    if (!item) return;
    if (
      !confirm(
        "Are you sure you want to delete this item? This action cannot be undone."
      )
    )
      return;
    // TODO: เรียก API ลบของจริง (ถ้าทำ endpoint ไว้ เช่น DELETE /v1/items/:id)
    alert("Item deleted successfully!");
    router.push("/marketplace");
  };

  const handleBuy = async () => {
    if (!item) return;
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`/api/v1/home`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ item_id: item.id }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success)
        throw new Error(data?.error || "Buy failed");
      alert("Order created!");
      // ไปหน้าออเดอร์ หรือรีเฟรช
      // router.push(`/order/${data.data.orderId}`)
    } catch (e: any) {
      alert(e?.message || "Failed to buy");
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto">Loading...</div>;
  }
  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <p className="text-red-500">{error || "Item not found"}</p>
      </div>
    );
  }

  // รูป: ถ้าเก็บเป็น key ใน R2 ให้แปลงก่อน; ถ้าเก็บเป็น URL เต็มก็ใช้เลย
  const imageSrc = item.image || "/placeholder.svg";
  const priceText = `${item.price}R$`;

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 text-card-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Marketplace
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Section */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
              <img
                src={imageSrc}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
              >
                <Heart className="h-4 w-4 mr-2" />
                Favorite
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
                onClick={() => {
                  if (navigator.share) {
                    navigator
                      .share({ title: item.name, url: window.location.href })
                      .catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied");
                  }
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-foreground">
                {item.name}
              </h1>
              {item.category && (
                <Badge variant="secondary" className="bg-accent/20 text-accent">
                  #{item.category}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">Sold by {item.seller}</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold text-accent">{priceText}</span>
            {item.rarity && (
              <Badge className="bg-primary/20 text-primary">
                {item.rarity}
              </Badge>
            )}
          </div>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <h3 className="font-semibold text-card-foreground mb-2">
                Item Details
              </h3>
              <div className="space-y-2 text-sm">
                {item.condition && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Condition:</span>
                    <span className="text-card-foreground">
                      {item.condition}
                    </span>
                  </div>
                )}
                {item.rarity && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rarity:</span>
                    <span className="text-card-foreground">{item.rarity}</span>
                  </div>
                )}
                {item.category && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="text-card-foreground">
                      {item.category}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {item.description && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Description
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          )}

          {canEditDelete && (
            <div className="flex gap-2 p-4 bg-muted/30 rounded-lg border border-border">
              <Button
                variant="outline"
                className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white bg-transparent"
                onClick={handleEdit}
              >
                Edit Item
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
                onClick={handleDelete}
              >
                Delete Item
              </Button>
            </div>
          )}

          <div className="space-y-3">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
              onClick={handleBuy}
            >
              Buy Now - {priceText}
            </Button>
            <Button
              variant="outline"
              className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
            >
              Make Offer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
