"use client";

import {
  X,
  ShoppingBag,
  Upload,
  History,
  User,
  Package,
  LogOut,
  ArrowDownToLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useUserStore } from "@/stores/userStore";

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NavigationMenu({ isOpen, onClose }: NavigationMenuProps) {
  const router = useRouter();
  const user = useUserStore();
  const isAdmin = user.me?.user_type === 2;

  // ✅ เรียกใช้ hooks ให้ครบก่อน แล้วค่อย return ตามเงื่อนไข เพื่อไม่ให้จำนวน hooks เปลี่ยนไปมาระหว่าง render
  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.warn("signout failed (ignoring):", e);
    } finally {
      localStorage.removeItem("token");
      onClose();
      router.replace("/");
    }
  }, [onClose, router]);

  if (!isOpen) return null;

  // เมนูสำหรับ Admin: แสดงเฉพาะ View Items, Withdraw, Profile
  const adminMenu = [
    {
      icon: ShoppingBag,
      label: "View Items",
      color: "text-green-400",
      path: "/marketplace",
    },
    {
      icon: ArrowDownToLine,
      label: "Withdraw",
      color: "text-emerald-400",
      path: "/withdraw",
    },
    { icon: User, label: "Profile", color: "text-pink-400", path: "/profile" },
  ];

  // เมนูสำหรับผู้ใช้ทั่วไป (ไม่ใช่ Admin)
  const userMenu = [
    {
      icon: ShoppingBag,
      label: "View Items",
      color: "text-green-400",
      path: "/marketplace",
    },
    {
      icon: Package,
      label: "Orders",
      color: "text-blue-400",
      path: "/orders",
    },
    {
      icon: Upload,
      label: "Sell Item",
      color: "text-yellow-400",
      path: "/sell",
    },
    {
      icon: ArrowDownToLine,
      label: "Withdraw",
      color: "text-emerald-400",
      path: "/withdraw",
    },
    {
      icon: History,
      label: "Transaction",
      color: "text-purple-400",
      path: "/history",
    },
    { icon: User, label: "Profile", color: "text-pink-400", path: "/profile" },
  ];

  const menuItems = isAdmin ? adminMenu : userMenu;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border p-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-card-foreground">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-card-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Items (scrollable) */}
        <div className="space-y-4 overflow-auto">
          {menuItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start gap-3 p-4 h-auto hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                router.push(item.path);
                onClose();
              }}
            >
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <span className="text-card-foreground font-medium">
                {item.label}
              </span>
            </Button>
          ))}
        </div>

        {/* Logout (stick to bottom) */}
        <div className="mt-auto pt-4 border-t border-border">
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full justify-start gap-3 p-4 h-auto"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
