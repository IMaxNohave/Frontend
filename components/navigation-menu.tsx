"use client"

import { X, ShoppingBag, Upload, History, User, Package, Shield, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

interface NavigationMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function NavigationMenu({ isOpen, onClose }: NavigationMenuProps) {
  const router = useRouter()

  if (!isOpen) return null

  const isAdmin =
    typeof window !== "undefined" && localStorage.getItem("userEmail") === "admin@gmail.com"

  const menuItems = [
    { icon: ShoppingBag, label: "View Items", color: "text-green-400", path: "/marketplace" },
    isAdmin
      ? { icon: Shield, label: "Admin", color: "text-red-400", path: "/admin" }
      : { icon: Package, label: "Orders", color: "text-blue-400", path: "/orders" },
    ...(isAdmin
      ? [{ icon: Package, label: "Manage Orders", color: "text-orange-400", path: "/admin/manage-orders" }]
      : []),
    { icon: Upload, label: "Sell Item", color: "text-yellow-400", path: "/sell" },
    { icon: History, label: "History Item", color: "text-purple-400", path: "/history" },
    { icon: User, label: "Profile", color: "text-pink-400", path: "/profile" },
  ]

  const handleLogout = useCallback(async () => {
    try {
      // เรียก backend ให้ลบ session (Better-Auth)
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      })
    } catch (e) {
      console.warn("signout failed (ignoring):", e)
    } finally {
      // เคลียร์ client state ที่คุณเก็บไว้
      //localStorage.removeItem("userEmail")
      localStorage.removeItem("token")
      // ปิดเมนูแล้วพาไปหน้า login
      onClose()
      router.replace("/")
    }
  }, [onClose, router])

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
                router.push(item.path)
                onClose()
              }}
            >
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <span className="text-card-foreground font-medium">{item.label}</span>
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
  )
}
