"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, User, ShieldCheck } from "lucide-react"
import { useAuthStore } from "@/stores/authStore"

interface Evidence {
  id: string
  orderId: string
  byUserId: string
  isVideo: boolean
  url: string
  note: string | null
  createdAt: string
}

interface AdminEvidenceViewerProps {
  orderId: string
  buyerId: string
  sellerId: string
  buyerName: string
  sellerName: string
  orderStatus?: string
}

export function AdminEvidenceViewer({ 
  orderId, 
  buyerId,
  sellerId,
  buyerName,
  sellerName,
  orderStatus = "disputed"
}: AdminEvidenceViewerProps) {
  const [evidences, setEvidences] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)
  
  // Get token from auth store
  const token = useAuthStore((s) => s.token)

  // โหลด evidence ทั้งหมด
  useEffect(() => {
    const loadEvidences = async () => {
      if (!orderId || !token) return
      
      try {
        const response = await fetch(
          `/api/v1/evidence/order/${orderId}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        )

        if (response.ok) {
          const json = await response.json()
          setEvidences(json.data || [])
        }
      } catch (error) {
        console.error("Failed to load evidences:", error)
      } finally {
        setLoading(false)
      }
    }

    loadEvidences()
  }, [orderId, token])

  // แยกหลักฐานของแต่ละฝ่าย
  const buyerEvidence = evidences.find(e => e.byUserId === buyerId)
  const sellerEvidence = evidences.find(e => e.byUserId === sellerId)

  // ถ้าไม่ใช่สถานะ disputed ไม่แสดง
  if (orderStatus !== "disputed") {
    return null
  }

  // แสดง loading
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Evidence Review (Admin)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">กำลังโหลดหลักฐาน...</p>
        </CardContent>
      </Card>
    )
  }

  // ถ้าไม่มีหลักฐานเลย
  if (evidences.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Evidence Review (Admin)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">ยังไม่มีหลักฐานจากทั้งสองฝ่าย</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Evidence Review (Admin)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          หลักฐานจากทั้งสองฝ่ายในข้อพิพาท
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Buyer Evidence */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-card-foreground">
              ผู้ซื้อ: {buyerName}
            </h3>
            {buyerEvidence ? (
              <Badge variant="default" className="bg-green-600 text-white">
                แนบหลักฐานแล้ว
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-600 text-white">
                ยังไม่แนบหลักฐาน
              </Badge>
            )}
          </div>
          
          {buyerEvidence ? (
            <div className="space-y-2">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-blue-200 dark:border-blue-800">
                <img
                  src={buyerEvidence.url}
                  alt="Buyer Evidence"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                อัพโหลดเมื่อ: {new Date(buyerEvidence.createdAt).toLocaleString("th-TH")}
              </p>
              {buyerEvidence.note && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    <strong>หมายเหตุ:</strong> {buyerEvidence.note}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-border rounded-lg p-6 text-center bg-muted/30">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                ผู้ซื้อยังไม่ได้แนบหลักฐาน
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border"></div>

        {/* Seller Evidence */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-card-foreground">
              ผู้ขาย: {sellerName}
            </h3>
            {sellerEvidence ? (
              <Badge variant="default" className="bg-green-600 text-white">
                แนบหลักฐานแล้ว
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-600 text-white">
                ยังไม่แนบหลักฐาน
              </Badge>
            )}
          </div>
          
          {sellerEvidence ? (
            <div className="space-y-2">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-green-200 dark:border-green-800">
                <img
                  src={sellerEvidence.url}
                  alt="Seller Evidence"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                อัพโหลดเมื่อ: {new Date(sellerEvidence.createdAt).toLocaleString("th-TH")}
              </p>
              {sellerEvidence.note && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    <strong>หมายเหตุ:</strong> {sellerEvidence.note}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-border rounded-lg p-6 text-center bg-muted/30">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                ผู้ขายยังไม่ได้แนบหลักฐาน
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                สถานะหลักฐาน
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                ผู้ซื้อ: {buyerEvidence ? "✅ แนบแล้ว" : "❌ ยังไม่แนบ"} • 
                ผู้ขาย: {sellerEvidence ? "✅ แนบแล้ว" : "❌ ยังไม่แนบ"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
