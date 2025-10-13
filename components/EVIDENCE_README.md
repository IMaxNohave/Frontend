# Evidence Components

## Components

### 1. EvidenceUploadBox
กล่องอัพโหลดหลักฐานสำหรับ User (ผู้ซื้อ/ผู้ขาย)

**Features:**
- อัพโหลดรูปภาพ 1 ไฟล์ต่อ user
- รองรับ JPG, PNG, GIF, WebP (max 10MB)
- แสดงรูปที่อัพโหลดแล้ว
- Auto change order status to DISPUTED เมื่ออัพโหลด
- ใช้งานได้ใน status: IN_TRADE, AWAIT_CONFIRM, DISPUTED

**Usage:**
```tsx
import { EvidenceUploadBox } from "@/components/evidence-upload-box"

<EvidenceUploadBox
  orderId={orderId}
  currentUserId={currentUserId}
  userRole="buyer"  // or "seller"
  orderStatus="in_trade"  // or "await_confirm" or "disputed"
/>
```

### 2. AdminEvidenceViewer
กล่องแสดงหลักฐานทั้งสองฝ่ายสำหรับ Admin

**Features:**
- แสดงหลักฐานของ Buyer และ Seller ในกล่องเดียว
- แสดง Badge สถานะการอัพโหลด
- แสดงเวลาที่อัพโหลด
- แสดง Note (ถ้ามี)
- เฉพาะ status DISPUTED เท่านั้น

**Usage:**
```tsx
import { AdminEvidenceViewer } from "@/components/admin-evidence-viewer"

<AdminEvidenceViewer
  orderId={orderId}
  buyerId={order.buyerId}
  sellerId={order.sellerId}
  buyerName={order.buyer.name}
  sellerName={order.seller.name}
  orderStatus="disputed"
/>
```

### 3. EvidenceUpload (Deprecated)
Wrapper สำหรับ backwards compatibility

**Usage:**
```tsx
import { EvidenceUpload } from "@/components/evidence-upload"

// Automatically uses EvidenceUploadBox internally
<EvidenceUpload {...props} />
```

## Example: Order Detail Page

```tsx
import { EvidenceUploadBox } from "@/components/evidence-upload-box"
import { AdminEvidenceViewer } from "@/components/admin-evidence-viewer"
import { useUser } from "@/hooks/useUser"

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { user } = useUser()
  const order = useOrderDetail(params.id)
  
  const isAdmin = user?.user_type === 2
  const userRole = order.buyerId === user?.id ? "buyer" : "seller"
  
  return (
    <div>
      {/* Order Summary */}
      <OrderSummary order={order} />
      
      {/* Evidence Section */}
      {isAdmin ? (
        // Admin เห็นหลักฐานทั้งสองฝ่าย
        <AdminEvidenceViewer
          orderId={order.id}
          buyerId={order.buyerId}
          sellerId={order.sellerId}
          buyerName={order.buyer.name}
          sellerName={order.seller.name}
          orderStatus={order.status}
        />
      ) : (
        // User อัพโหลดหลักฐานของตัวเอง
        <EvidenceUploadBox
          orderId={order.id}
          currentUserId={user.id}
          userRole={userRole}
          orderStatus={order.status}
        />
      )}
      
      {/* Actions */}
      <OrderActions order={order} />
    </div>
  )
}
```

## API Endpoints

**Backend Evidence API:**
- `POST /v1/evidence` - Create evidence
- `GET /v1/evidence/order/:orderId` - List all evidence for order
- `DELETE /v1/evidence/:id` - Delete evidence

**Upload R2:**
- `GET /v1/upload/r2/upload-url` - Get presigned URL for R2 upload

## Status Flow

```
IN_TRADE → อัพโหลดหลักฐาน → DISPUTED
AWAIT_CONFIRM → อัพโหลดหลักฐาน → DISPUTED
DISPUTED → Admin Review → COMPLETED/CANCELLED
```
