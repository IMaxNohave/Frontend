"use client"

import { X, ShoppingBag, Upload, History, User, Package, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface NavigationMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function NavigationMenu({ isOpen, onClose }: NavigationMenuProps) {
  const router = useRouter()

  if (!isOpen) return null

  const isAdmin = typeof window !== "undefined" && localStorage.getItem("userEmail") === "admin@gmail.com"

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

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
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

        <div className="space-y-4">
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
      </div>
    </div>
  )
}
