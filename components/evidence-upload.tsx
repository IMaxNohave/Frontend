"use client"

import { EvidenceUploadBox } from "./evidence-upload-box"

interface EvidenceUploadProps {
  orderId: string
  currentUserId: string
  userRole: "buyer" | "seller"
  orderStatus?: string
  existingEvidence?: any[]
}

export function EvidenceUpload(props: EvidenceUploadProps) {
  return <EvidenceUploadBox {...props} />
}
