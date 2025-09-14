"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface PurchaseConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  item: {
    id: number
    name: string
    price: string
    seller: string
    image: string
  }
}

export function PurchaseConfirmationDialog({ isOpen, onClose, item }: PurchaseConfirmationDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const router = useRouter()

  const handleConfirm = async () => {
    setIsConfirming(true)

    // Simulate order creation
    const orderId = `ORD-${Date.now()}`

    // TODO: Create actual order in database
    setTimeout(() => {
      setIsConfirming(false)
      onClose()
      router.push(`/order/${orderId}`)
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-card-foreground text-center text-xl">ยืนยันการสั่งซื้อ</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            จะซื้อ {item.price} จากเกมและพิกัดให้ในเกมโดยร์ เมื่อสั่งแล้วจะไม่สามารถยกเลิกได้
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isConfirming}
            className="flex-1 border-border hover:bg-accent hover:text-accent-foreground bg-transparent"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isConfirming ? "กำลังสั่งซื้อ..." : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
