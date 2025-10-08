// components/marketplace-header.tsx
"use client";

import { useEffect, useState } from "react";
import { Search, Menu, User, Plus, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavigationMenu } from "@/components/navigation-menu";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/app/services/api";

type Props = { searchTerm?: string; onSearchChange?: (v: string) => void };

function fmtR(v?: string | number) {
  if (v === undefined || v === null) return "0 R$";
  if (typeof v === "string" && v.includes("∞")) return "∞R$";
  const n = Number(v);
  if (!isFinite(n)) return "∞R$";
  return `${n.toLocaleString()} R$`;
}

export function MarketplaceHeader({
  searchTerm = "",
  onSearchChange,
}: Props = {}) {
  const router = useRouter();

  // state จาก userStore
  const isAdmin = useUserStore((s) => s.isAdmin);
  const wallet = useUserStore((s) => s.wallet);
  const walletLoading = useUserStore((s) => s.walletLoading);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // // bootstrap ครั้งแรก (initToken + me + wallet)
  // useEffect(() => {
  //   bootstrap();
  // }, [bootstrap]);

  // // (ถ้าต้องการ refresh wallet เมื่อเข้าเพจนี้ทุกครั้ง)
  // useEffect(() => {
  //   if (!isAdmin) fetchWallet();
  // }, [isAdmin, fetchWallet]);

  // search
  const [internalQuery, setInternalQuery] = useState<string>(searchTerm ?? "");
  useEffect(() => setInternalQuery(searchTerm ?? ""), [searchTerm]);

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
                    if (e.key === "Enter")
                      onSearchChange?.(internalQuery ?? "");
                  }}
                />
              </div>
            </div>

            {/* right */}
            <div className="flex items-center gap-2">
              {walletLoading ? (
                <span className="text-muted-foreground text-sm animate-pulse">
                  Loading…
                </span>
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
                  <DropdownMenuLabel>
                    {isAdmin ? "Admin Dashboard" : "My Orders"}
                  </DropdownMenuLabel>
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
      <NavigationMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
}
