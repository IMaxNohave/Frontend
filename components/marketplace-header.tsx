// components/marketplace-header.tsx
"use client";

import { useEffect, useState } from "react";
import { Search, Menu, User, Plus, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavigationMenu } from "@/components/navigation-menu";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/app/service/api";

type WalletDTO = { balance: string; held: string; available: string; updatedAt?: string };

type Props = {
  searchTerm?: string;
  onSearchChange?: (v: string) => void;
};

function fmtR(amount?: string | number) {
  if (amount === undefined || amount === null) return "0 R$";
  if (typeof amount === "string" && amount.includes("∞")) return "∞R$";
  const n = Number(amount);
  if (!isFinite(n)) return "∞R$";
  return `${n.toLocaleString()} R$`;
}

export function MarketplaceHeader({ searchTerm = "", onSearchChange }: Props = {}) {
  const router = useRouter();

  // side menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // admin flag (demo)
  const isAdmin =
    typeof window !== "undefined" && localStorage.getItem("userEmail") === "admin@gmail.com";

  // search
  const [internalQuery, setInternalQuery] = useState<string>(searchTerm ?? "");
  useEffect(() => setInternalQuery(searchTerm ?? ""), [searchTerm]);

  // wallet
  const [wallet, setWallet] = useState<WalletDTO | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setWalletLoading(true);
        const res = await api.get<{ success: boolean; data: WalletDTO }>("/auth/user/wallet");
        if (!alive) return;
        if (!res.data?.success) throw new Error("Load wallet failed");
        setWallet(res.data.data); // balance, held, available มาจาก DB
      } catch (e: any) {
        if (!alive) return;
        // ถ้า 401 (ยังไม่ล็อกอิน/ token หมดอายุ) → แสดงค่า 0 R$
        if (e?.response?.status === 401) {
          setWallet(null);
          // ถ้าต้องการเด้งไปหน้า Login: router.push("/login");
        } else {
          // error อื่น ๆ ก็ยังให้เห็น 0 R$
          setWallet(null);
          console.error("wallet error:", e?.message || e);
        }
      } finally {
        if (alive) setWalletLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // demo badge ที่ไอคอนกระเป๋า (ถ้าจะต่อข้อความใหม่จริง ให้ดึงจาก /v1/orders/my พร้อม last read)
  const activeOrdersHasNew = false;

  return (
    <>
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* left */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-card-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/marketplace")}
                className="text-card-foreground hover:bg-accent hover:text-accent-foreground font-bold text-lg"
              >
                <Home className="h-5 w-5 mr-2" />
                Ro Trade
              </Button>
            </div>

            {/* middle: search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  value={internalQuery ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setInternalQuery(v);
                    onSearchChange?.(v);
                  }}
                  placeholder="Search items…"
                  className="pl-10 bg-input border-border text-foreground"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSearchChange?.(internalQuery ?? "");
                  }}
                />
              </div>
            </div>

            {/* right */}
            <div className="flex items-center gap-2">
              {walletLoading ? (
                <span className="text-muted-foreground text-sm animate-pulse">Loading…</span>
              ) : (
                <span className="text-accent font-bold text-lg">
                  {isAdmin ? "∞R$" : fmtR(wallet?.available ?? 0)}
                </span>
              )}

              <Button
                size="icon"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => router.push("/add-money")}
              >
                <Plus className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-card-foreground hover:bg-accent hover:text-accent-foreground relative"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {activeOrdersHasNew && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>{isAdmin ? "Admin Dashboard" : "My Orders"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-center justify-center"
                    onClick={() => router.push(isAdmin ? "/admin" : "/orders")}
                  >
                    {isAdmin ? "View Admin Dashboard" : "View All Orders"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="text-card-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => router.push("/profile")}
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <NavigationMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
