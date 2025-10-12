// components/item-detail.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/app/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// shadcn confirm dialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ItemDetailProps {
  itemId: string;
}

type Item = {
  id: string;
  name: string;
  price: number;
  category: string | null;
  image: string | null;
  seller: string;
  sellerEmail?: string | null;
  sellerId?: string | null;
  description?: string | null;
  rarity?: string | null;
  condition?: string | null;
  status?: number; // 1 = available
};

type Me = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export function ItemDetail({ itemId }: ItemDetailProps) {
  const router = useRouter();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null); // State สำหรับ error การซื้อ

  // โปรไฟล์ผู้ใช้จาก backend (เชื่อถือได้กว่า localStorage)
  const [me, setMe] = useState<Me | null>(null);
  const [meLoaded, setMeLoaded] = useState(false);

  // ---- โหลด Item ----
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<{
          data: Item;
          success?: boolean;
          error?: string;
        }>(`/v1/items/${itemId}`);
        if (res.status >= 400 || res.data?.success === false) {
          throw new Error(
            res.data?.error || `Failed to load item (${res.status})`
          );
        }
        if (alive) setItem(res.data.data);
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

  // ---- โหลดโปรไฟล์ผู้ใช้ (ถ้ามี token) ----
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setMeLoaded(false);
        const res = await api.get<{ success: boolean; data: Me }>(
          "/auth/user/me"
        );
        if (!alive) return;
        if (res.data?.success) setMe(res.data.data);
      } catch (e: any) {
        // 401 = ยังไม่ล็อกอิน → ปล่อย me = null
      } finally {
        if (alive) setMeLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ---- เช็คเจ้าของ: เทียบทั้ง id และ email (ถ้ามี) ----
  const isOwner = useMemo(() => {
    if (!item) return false;
    if (!me) return false;
    if (item.sellerId && me.id && item.sellerId === me.id) return true;
    if (item.sellerEmail && me.email && item.sellerEmail === me.email)
      return true;
    return false;
  }, [item, me]);

  // ---- แสดงปุ่มซื้อได้ไหม ----
  const canBuy = useMemo(() => {
    if (!item) return false;
    if (isOwner) return false;
    if (typeof item.status === "number" && item.status !== 1) return false; // ไม่พร้อมขาย
    return true;
  }, [item, isOwner]);

  const handleEdit = () => item && router.push(`/edit-item/${item.id}`);

  const handleDelete = async () => {
    if (!item) return;
    if (!confirm(`Delete "${item.name}" ?`)) return;
    try {
      alert("Item deleted successfully! (demo)");
      router.push("/marketplace");
    } catch (e: any) {
      alert(e?.message || "Failed to delete");
    }
  };

  const handleBuy = async () => {
    if (!item || buying) return;

    // guard ฝั่ง FE อีกชั้น
    if (isOwner) {
      alert("You cannot buy your own item.");
      return;
    }
    if (!canBuy) {
      alert("This item is not available for purchase.");
      return;
    }

    // ต้องล็อกอินก่อนซื้อ
    if (!meLoaded || !me) {
      if (
        confirm("You need to sign in to buy this item. Go to sign in page?")
      ) {
        router.push("/login");
      }
      return;
    }
    
    setBuyError(null); // เคลียร์ error เก่าทุกครั้งที่กดซื้อใหม่

    try {
      setBuying(true);
      const res = await api.post(`/v1/home/buy`, { item_id: item.id });
      const ok = (res.data && (res.data.success ?? true)) as boolean;
      if (!ok) throw new Error(res.data?.error || "Buy failed");
      setConfirmOpen(false);
      alert("Order created!");
      // router.push(`/order/${res.data.data.orderId}`);
    } catch (e: any) {
      setConfirmOpen(false); // ปิด Dialog ทุกครั้งที่เกิด error

      if (e?.response?.status === 402) {
        // ดักจับ Error 402 (Payment Required)
        setBuyError("You do not have enough balance to purchase this item.");
      } else if (e?.response?.status === 401) {
        // จัดการ Error 401 (Unauthorized)
        if (confirm("Your session has expired. Sign in again?")) {
          router.push("/login");
          return;
        }
      } else {
        // Error อื่นๆ ทั่วไป
        setBuyError(e?.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 h-9 w-40 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-7">
            <div className="aspect-square bg-muted rounded-lg animate-pulse" />
          </div>
          <div className="col-span-12 md:col-span-5 space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-6 w-1/2 bg-muted rounded animate-pulse" />
            <div className="h-24 bg-muted rounded animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <p className="text-red-500">{error || "Item not found"}</p>
      </div>
    );
  }

  const imageSrc = item.image || "/placeholder.svg";
  const priceText = `${Number(item.price).toLocaleString()}R$`;

  return (
    <div className="max-w-6xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 text-card-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Marketplace
      </Button>

      <div className="grid grid-cols-12 gap-8">
        {/* LEFT */}
        <div className="col-span-12 md:col-span-7">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="col-span-12 md:col-span-5 flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-foreground">{item.name}</h1>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {item.condition && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Condition</span>
                    <span className="text-card-foreground">
                      {item.condition}
                    </span>
                  </div>
                )}
                {item.rarity && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rarity</span>
                    <span className="text-card-foreground">{item.rarity}</span>
                  </div>
                )}

                {item.category && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Category
                    </span>
                    <Badge
                      variant="secondary"
                      className="px-2 py-1 text-sm bg-accent/15 text-accent ring-1 ring-accent/40"
                    >
                      #{item.category}
                    </Badge>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Seller
                  </span>
                  <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium text-card-foreground">
                    {item.seller}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {item.description && (
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-2">
                  Description
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Admin controls */}
          {/* {(me && isOwner) && (
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
          )} */}

          {/* Buy Section */}
          <div className="space-y-3">
            {!canBuy ? (
              <p className="text-sm text-muted-foreground">
                {isOwner
                  ? "You are the owner of this item. You cannot purchase your own listing."
                                    : "This item is not available to buy right now."}
              </p>
            ) : (
              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={buying}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
                    onClick={() => setConfirmOpen(true)}
                  >
                    {buying ? "Processing..." : `Buy Now - ${priceText}`}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm your order</AlertDialogTitle>
                    <AlertDialogDescription>
                      You are about to purchase <b>{item.name}</b> for{" "}
                      <b>{priceText}</b>.
                      <br />
                      Please confirm to create the order.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={buying}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBuy}
                      disabled={buying}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {buying ? "Processing..." : "Confirm Order"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
             {/* ส่วนแสดง Error Message */}
            {buyError && (
                <p className="text-sm text-red-500 text-center pt-2">{buyError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}