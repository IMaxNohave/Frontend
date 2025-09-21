"use client"

import type React from "react"

import { MarketplaceHeader } from "@/components/marketplace-header"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Plus } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function EditItemPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>("/placeholder-engvj.png")
  const [formData, setFormData] = useState({
    name: "Dragon Fruit",
    description: "Rare Dragon Fruit with special fire abilities. Perfect for combat and exploration.",
    price: "500",
    category: "BloxFruit",
    condition: "Excellent",
    tags: ["rare", "combat", "fire"] as string[],
  })
  const [newTag, setNewTag] = useState("")

  const categories = ["BloxFruit", "Bloxmesh", "Bloxbox", "Weapons", "Accessories", "Pets"]
  const conditions = ["New", "Excellent", "Good", "Fair", "Poor"]

  // Check permissions
  useEffect(() => {
    const currentUserEmail = localStorage.getItem("userEmail")
    const isAdmin = currentUserEmail === "admin@gmail.com"
    // In real app, check if user owns this item
    const isOwner = true // Mock ownership check

    if (!isAdmin && !isOwner) {
      router.push("/marketplace")
    }
  }, [router])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate update process
    setTimeout(() => {
      setIsLoading(false)
      alert("Item updated successfully!")
      router.push(`/item/${itemId}`)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />

      <div className="container mx-auto px-4 py-6">
        <BreadcrumbNav
          items={[
            { label: "Marketplace", href: "/marketplace" },
            { label: "Item Details", href: `/item/${itemId}` },
            { label: "Edit Item", href: `/edit-item/${itemId}` },
          ]}
        />

        <div className="max-w-2xl mx-auto mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-card-foreground">Edit Item</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label className="text-card-foreground font-medium">Item Image</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6">
                    {selectedImage ? (
                      <div className="relative">
                        <img
                          src={selectedImage || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => setSelectedImage(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">Click to upload item image</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Label
                          htmlFor="image-upload"
                          className="cursor-pointer bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-md inline-block"
                        >
                          Choose File
                        </Label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Item Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-card-foreground font-medium">
                    Item Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter item name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-input border-border text-foreground"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-card-foreground font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="bg-input border-border text-foreground min-h-[100px]"
                    required
                  />
                </div>

                {/* Price and Category Row */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-card-foreground font-medium">
                      Price (R$)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                      className="bg-input border-border text-foreground"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-card-foreground font-medium">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <Label className="text-card-foreground font-medium">Condition</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, condition: value }))}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition} value={condition}>
                          {condition}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label className="text-card-foreground font-medium">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="bg-input border-border text-foreground"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-accent/20 text-accent cursor-pointer"
                          onClick={() => removeTag(tag)}
                        >
                          #{tag}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-border text-card-foreground hover:bg-accent hover:text-accent-foreground bg-transparent"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    {isLoading ? "Updating Item..." : "Update Item"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
