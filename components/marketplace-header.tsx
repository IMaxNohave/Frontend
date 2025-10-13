// components/marketplace-header.tsx
"use client";

import { useCallback, useRef, useState, useEffect } from "react";
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
import { useAuthStore } from "@/stores/authStore";
import { useOrdersListRealtime } from "@/hooks/useOrdersListRealtime";
import { useOrders } from "@/hooks/useOrders";
import { subscribeSSE } from "@/app/services/sse";
import { MessageSquare, Bell } from "lucide-react";

type Props = { searchTerm?: string; onSearchChange?: (v: string) => void };

function fmtR(v?: string | number) {
  if (v === undefined || v === null) return "0 R$";
  if (typeof v === "string" && v.includes("∞")) return "∞R$";
  const n = Number(v);
  if (!isFinite(n)) return "∞R$";
  return `${n.toLocaleString()} R$`;
}

type Notif = {
  id: string;
  type: "CHAT" | "ORDER" | "SYSTEM";
  orderId?: string | null;
  title?: string | null;
  body?: string | null;
  createdAt?: string | null;
  isRead?: boolean;
};

const mapNotif = (r: any): Notif => ({
  id: r.id,
  type: r.type,
  orderId: r.orderId ?? r.data?.orderId ?? null,
  title: r.title ?? null,
  body: r.body ?? null,
  createdAt: typeof r.createdAt === "string" ? r.createdAt : null,
  isRead: !!r.isRead,
});

export function MarketplaceHeader({
  searchTerm = "",
  onSearchChange,
}: Props = {}) {
  const router = useRouter();

  // state จาก userStore
  const isReady = useAuthStore((s) => s.isReady);
  const isAdmin = useUserStore((s) => s.isAdmin);
  const fetchWallet = useUserStore((s) => s.fetchWallet);
  const wallet = useUserStore((s) => s.wallet);
  const walletLoading = useUserStore((s) => s.walletLoading);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // search
  const [internalQuery, setInternalQuery] = useState<string>(searchTerm ?? "");
  useEffect(() => setInternalQuery(searchTerm ?? ""), [searchTerm]);

  useEffect(() => {
    if (!isReady) return;
    fetchWallet();
  }, [isReady]);

  const me = useUserStore((s) => s.me); // หรือจาก auth store
  const [unread, setUnread] = useState(0);

  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadNotifs = useCallback(async () => {
    try {
      const r = await api.get("/v1/notifications", {
        params: { limit: 10 },
        withCredentials: true,
      });

      // ✅ API ของคุณส่ง { success, data: { items: [...], next_cursor } }
      const raw = r?.data?.data?.items ?? r?.data?.items ?? [];
      setNotifs(raw.map(mapNotif));
      // (ถ้าอยาก sync unread ให้เท่าของจริงก็ดึง /count มาด้วย)
    } catch (e) {
      console.log("[notifications/load] error", e);
    }
  }, []);

  // mark อ่านบางตัว (ตอนกดรายการ)
  const markReadOne = useCallback(async (id: string, wasRead?: boolean) => {
    try {
      await api.post(
        "/v1/notifications/read",
        { ids: [id] },
        { withCredentials: true }
      );
    } catch (e) {
      console.log("[notifications/read] error", e);
    }
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    if (!wasRead) setUnread((u) => Math.max(0, u - 1));
  }, []);

  // (ทางเลือก) mark ทั้งหมดตอนเปิดเมนู
  const markAllRead = useCallback(async () => {
    try {
      // ✅ ฝั่ง BE ที่คุณมีคือ /read-all (ไม่ใช่ {all:true} ที่ /read)
      await api.post(
        "/v1/notifications/read-all",
        {},
        { withCredentials: true }
      );
    } catch (e) {
      console.log("[notifications/read-all] error", e);
    }
    setUnread(0);
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  useEffect(() => {
    if (!me?.id) return;

    api
      .get("/v1/notifications/count", { withCredentials: true })
      .then((r) => {
        const unreadCount = r?.data?.data?.unread ?? r?.data?.unread ?? 0;
        setUnread(unreadCount);
      })
      .catch(() => {});

    const off = subscribeSSE(`user:${me.id}`, {}, [
      ["notification.new", (p) => setUnread((n) => n + 1)],
      ["order.message.new", (p) => setUnread((n) => n + 1)],
    ]);
    return () => off();
  }, [me?.id]);

  const hasNotif = unread > 0;

  useEffect(() => {
    console.log("[unread changed]", unread);
  }, [unread]);

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

              <DropdownMenu
                onOpenChange={async (open) => {
                  setMenuOpen(open);
                  if (open) {
                    await loadNotifs();
                    // ถ้าอยาก mark-all-read เมื่อเปิดเมนู ให้ปลดคอมเมนต์บรรทัดถัดไป
                    // await markAllRead();
                  }
                }}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-card-foreground hover:bg-accent hover:text-accent-foreground relative"
                    aria-label={`Orders${unread ? ` (${unread} new)` : ""}`}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {unread > 0 && (
                      <div className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-[10px] leading-4 text-white text-center">
                        {unread > 99 ? "99+" : unread}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>
                      {unread ? `Notifications (${unread})` : "Notifications"}
                    </span>
                    {unread > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={markAllRead}
                      >
                        Mark all read
                      </Button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* รายการแจ้งเตือน */}
                  <div className="max-h-80 overflow-y-auto">
                    {notifs.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        No notifications
                      </div>
                    ) : (
                      notifs.map((n) => (
                        <DropdownMenuItem
                          key={n.id}
                          className="flex items-start gap-2 py-2"
                          onClick={async () => {
                            await markReadOne(n.id, n.isRead);
                            // ไปหน้า order ถ้ามี
                            if (n.orderId) router.push(`/order/${n.orderId}`);
                            else router.push("/orders");
                          }}
                        >
                          <div className="mt-0.5">
                            {n.type === "CHAT" ? (
                              <MessageSquare className="h-4 w-4" />
                            ) : (
                              <Bell className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-medium">
                              {n.title ||
                                (n.type === "CHAT"
                                  ? "New chat message"
                                  : "Order update")}
                              {!n.isRead && (
                                <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-red-500 align-middle" />
                              )}
                            </div>
                            {n.body && (
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {n.body}
                              </div>
                            )}
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {n.orderId ? `Order: ${n.orderId}` : ""}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>

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
