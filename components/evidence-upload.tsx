"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, X, ImageIcon, Video, FileText, Download, Eye } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface EvidenceFile {
  id: string
  name: string
  type: "image" | "video" | "document"
  url: string
  uploadedBy: string
  uploadedAt: Date
  size: number
}

interface EvidenceUploadProps {
  orderId: string
  currentUserId: string
  userRole: "buyer" | "seller"
  existingEvidence?: EvidenceFile[]
}

export function EvidenceUpload({ orderId, currentUserId, userRole, existingEvidence = [] }: EvidenceUploadProps) {
  const [evidence, setEvidence] = useState<EvidenceFile[]>(existingEvidence)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<EvidenceFile | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true)

      for (const file of acceptedFiles) {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file)

        // Determine file type
        let fileType: "image" | "video" | "document" = "document"
        if (file.type.startsWith("image/")) fileType = "image"
        else if (file.type.startsWith("video/")) fileType = "video"

        const newEvidence: EvidenceFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: fileType,
          url: previewUrl,
          uploadedBy: currentUserId,
          uploadedAt: new Date(),
          size: file.size,
        }

        setEvidence((prev) => [...prev, newEvidence])

        // TODO: Upload to actual storage service
        // const formData = new FormData()
        // formData.append('file', file)
        // formData.append('orderId', orderId)
        // const response = await fetch('/api/evidence/upload', {
        //   method: 'POST',
        //   body: formData
        // })
        // const result = await response.json()
        // Update with real URL from server
      }

      setUploading(false)
    },
    [orderId, currentUserId],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "video/*": [".mp4", ".mov", ".avi", ".webm"],
      "application/pdf": [".pdf"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
  })

  const removeEvidence = (id: string) => {
    setEvidence((prev) => prev.filter((item) => item.id !== id))
    // TODO: Delete from server
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: EvidenceFile["type"]) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getRoleColor = (uploadedBy: string) => {
    // This would be determined by checking user roles
    return uploadedBy === currentUserId ? "bg-blue-500/20 text-blue-500" : "bg-green-500/20 text-green-500"
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Evidence & Proof
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload screenshots, videos, or documents as evidence for this trade. Maximum file size: 50MB
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragActive ? "border-accent bg-accent/10" : "border-border hover:border-accent/50 hover:bg-accent/5"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          {isDragActive ? (
            <p className="text-accent font-medium">Drop files here...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-card-foreground font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground">Images, videos, or PDF documents (Max 50MB each)</p>
            </div>
          )}
          {uploading && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
            </div>
          )}
        </div>

        {/* Evidence List */}
        {evidence.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-card-foreground">Uploaded Evidence ({evidence.length})</h4>
            <div className="grid gap-3">
              {evidence.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="flex-shrink-0">
                    {file.type === "image" ? (
                      <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                        <img
                          src={file.url || "/placeholder.svg"}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-card-foreground truncate">{file.name}</p>
                      <Badge variant="secondary" className={`text-xs ${getRoleColor(file.uploadedBy)}`}>
                        {file.uploadedBy === currentUserId ? "You" : userRole === "buyer" ? "Seller" : "Buyer"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{file.uploadedAt.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setSelectedFile(file)} className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Download className="h-4 w-4" />
                    </Button>
                    {file.uploadedBy === currentUserId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeEvidence(file.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guidelines */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <h5 className="font-medium text-card-foreground mb-2">Evidence Guidelines:</h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Upload clear screenshots of the trade in progress</li>
            <li>• Include game chat logs or communication</li>
            <li>• Record video evidence for complex trades</li>
            <li>• All evidence is visible to both parties and admins</li>
            <li>• Evidence cannot be deleted once uploaded</li>
          </ul>
        </div>
      </CardContent>

      {/* File Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-medium text-card-foreground">{selectedFile.name}</h3>
              <Button size="sm" variant="ghost" onClick={() => setSelectedFile(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              {selectedFile.type === "image" ? (
                <img
                  src={selectedFile.url || "/placeholder.svg"}
                  alt={selectedFile.name}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              ) : selectedFile.type === "video" ? (
                <video src={selectedFile.url} controls className="max-w-full max-h-[70vh]" />
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Preview not available for this file type</p>
                  <Button className="mt-4">
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
