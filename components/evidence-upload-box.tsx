"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, X, ImageIcon } from "lucide-react"
import { useAuthStore } from "@/stores/authStore"

interface EvidenceUploadBoxProps {
  orderId: string
  currentUserId: string
  userRole: "buyer" | "seller"
  orderStatus?: string
}

export function EvidenceUploadBox({ 
  orderId, 
  currentUserId, 
  userRole, 
  orderStatus = "in_trade"
}: EvidenceUploadBoxProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [evidences, setEvidences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Get token from auth store
  const token = useAuthStore((s) => s.token)

  // โหลด evidence ที่มีอยู่แล้ว
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

  // ตรวจสอบว่า user คนนี้ upload แล้วหรือยัง
  const myEvidence = evidences.find(e => e.byUserId === currentUserId)
  const hasUploaded = !!myEvidence

  // ตรวจสอบสถานะ order ต้องเป็น in_trade, await_confirm หรือ disputed
  const canUpload = (orderStatus === "in_trade" || orderStatus === "await_confirm" || orderStatus === "disputed") && !hasUploaded

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    // ตรวจสอบชนิดไฟล์
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(f.type)) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, GIF, WebP)")
      return
    }

    // ตรวจสอบขนาดไฟล์ (10MB)
    if (f.size > 10 * 1024 * 1024) {
      alert("ไฟล์มีขนาดใหญ่เกิน 10MB")
      return
    }

    setFile(f)
    
    // สร้าง preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target?.result as string)
    }
    reader.readAsDataURL(f)
  }

  const handleRemove = () => {
    setFile(null)
    setPreview(null)
  }

  const handleSubmit = async () => {
    if (!file || !token) return

    setUploading(true)
    try {
      // 1. ขอ presigned URL
      const uploadUrlResponse = await fetch(
        `/api/v1/upload/r2/upload-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            contentType: file.type,
            fileName: file.name,
          }),
        }
      )

      if (!uploadUrlResponse.ok) {
        throw new Error("Failed to get upload URL")
      }

      const responseData = await uploadUrlResponse.json()
      const uploadUrl = responseData.data?.uploadUrl
      const publicUrl = responseData.data?.imageUrl

      // 2. อัพโหลดไฟล์ไปที่ R2
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to R2")
      }

      // 3. บันทึก evidence record
      const evidenceResponse = await fetch(`/api/v1/evidence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          url: publicUrl,
          isVideo: false,
          note: null,
        }),
      })

      if (!evidenceResponse.ok) {
        const errorData = await evidenceResponse.json()
        throw new Error(errorData.error || "Failed to save evidence")
      }

      const result = await evidenceResponse.json()

      // แสดงข้อความสำเร็จแบบมืออาชีพ
      alert("✅ คุณได้แนบหลักฐานการเอาเปรียบ\n📋 สถานะการแลกเปลี่ยนถูกแก้ไข")

      // รีโหลดหน้า
      window.location.reload()
    } catch (error: any) {
      console.error("Upload error:", error)
      alert("เกิดข้อผิดพลาด: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  // ถ้าไม่ใช่สถานะที่อนุญาตให้อัพโหลด ไม่แสดง component
  if (orderStatus !== "in_trade" && orderStatus !== "await_confirm" && orderStatus !== "disputed") {
    return null
  }

  // แสดง loading
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Evidence</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
        </CardContent>
      </Card>
    )
  }

  // ถ้า upload แล้ว แสดงรูปที่ upload ไว้
  if (hasUploaded) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Your Evidence</CardTitle>
          <p className="text-sm text-muted-foreground">
            คุณได้อัพโหลดหลักฐานแล้ว
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={myEvidence.url}
              alt="Evidence"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            อัพโหลดเมื่อ: {new Date(myEvidence.createdAt).toLocaleString("th-TH")}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Upload Evidence</CardTitle>
        <p className="text-sm text-muted-foreground">
          {orderStatus === "disputed" 
            ? "การซื้อขายอยู่ในสถานะข้อพิพาท - อัพโหลดหลักฐานเพื่อสนับสนุนกรณีของคุณ"
            : "อัพโหลดรูปภาพเป็นหลักฐาน (JPG, PNG, GIF, WebP สูงสุด 10MB)"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        {!preview ? (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent/50 hover:bg-accent/5 transition-colors">
            <label
              htmlFor="evidence-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-card-foreground font-medium mb-1">
                คลิกเพื่อเลือกรูปภาพ
              </p>
              <p className="text-sm text-muted-foreground">
                รูปภาพเท่านั้น (สูงสุด 10MB)
              </p>
              <input
                id="evidence-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-border">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* File Info */}
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                <span className="truncate">{file.name}</span>
                <span className="ml-auto">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={uploading}
              className="w-full bg-accent hover:bg-accent/90"
            >
              {uploading ? "กำลังอัพโหลด..." : "อัพโหลดหลักฐาน"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
