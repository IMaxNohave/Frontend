"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";
import { useItemStore } from "@/stores/itemStore";
import { useAuthStore } from "@/stores/authStore";

export function ItemUploadForm() {
  const router = useRouter();
  const { categories, loading: catLoading, error: catError } = useCategories();
  const token = useAuthStore((s) => s.token);

  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    // tags: [] as string[],
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const parseJson = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        `${res.status} ${res.statusText} - ${
          text?.slice(0, 200) || "empty response"
        }`
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!file) throw new Error("กรุณาเลือกรูป");
      if (!formData.name || !formData.price || !formData.categoryId)
        throw new Error("กรอกข้อมูลให้ครบ");

      setIsLoading(true);
      // 1) presign
      const pre = await fetch(`/api/v1/upload/r2/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contentType: file.type, fileName: file.name }),
      });
      if (!pre.ok)
        throw new Error(`presign failed: ${pre.status} ${pre.statusText}`);
      const preJson = await parseJson(pre);
      if (!preJson?.success)
        throw new Error(preJson?.error || "ขอ presign ไม่สำเร็จ");

      // 2) upload
      const put = await fetch(preJson.data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!put.ok) throw new Error(await put.text());

      const imageForDb: string = preJson.data.imageUrl ?? preJson.data.key;

      // 3) create item
      console.log("Creating item with data:", {
        image: imageForDb,
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.categoryId,
      });

      const create = await fetch(`/api/v1/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          image: imageForDb,
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          category: formData.categoryId,
          // tag: formData.tags.join(","),
        }),
      });
      console.log("Create response status:", create.status);
      if (!create.ok) {
        const errorText = await create.text();
        console.error("Create error response:", errorText);
        throw new Error(
          `create item failed: ${create.status} ${create.statusText}`
        );
      }
      const creJson = await parseJson(create);
      if (!creJson?.success)
        throw new Error(creJson?.error || "สร้างไอเท็มไม่สำเร็จ");

      router.push("/marketplace");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-2xl text-card-foreground">
          Item Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image */}
          <div className="space-y-2">
            <Label className="text-card-foreground font-medium">
              Item Image
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              {preview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setPreview(null);
                      setFile(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Click to upload item image
                  </p>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
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

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-card-foreground font-medium">
              Item Name
            </Label>
            <Input
              id="name"
              placeholder="Enter item name"
              value={formData.name}
              onChange={(e) =>
                setFormData((p) => ({ ...p, name: e.target.value }))
              }
              className="bg-input border-border text-foreground"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-card-foreground font-medium"
            >
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your item..."
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              className="bg-input border-border text-foreground min-h-[100px]"
              required
            />
          </div>

          {/* Price + Category */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="price"
                className="text-card-foreground font-medium"
              >
                Price (R$)
              </Label>
              <Input
                id="price"
                type="number"
                min={0}
                placeholder="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, price: e.target.value }))
                }
                className="bg-input border-border text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-card-foreground font-medium">
                Category
              </Label>
              {catLoading ? (
                <div className="text-sm text-muted-foreground">
                  Loading categories…
                </div>
              ) : catError ? (
                <div className="text-sm text-red-500">{catError}</div>
              ) : (
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData((p) => ({ ...p, categoryId: value }))
                  }
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Actions */}
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
              {isLoading ? "Listing Item..." : "List Item"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
