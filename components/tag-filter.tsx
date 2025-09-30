"use client";

import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

type Category = { id: string; name: string; detail?: string | null };

interface TagFilterProps {
  /** เก็บ categoryId ที่เลือก (หรือ null = ทั้งหมด) */
  selectedTag: string | null;
  /** ส่ง categoryId กลับ (หรือ null = ทั้งหมด) */
  onTagSelect: (tag: string | null) => void;
  token: string | null;
}

export function TagFilter({ selectedTag, onTagSelect, token }: TagFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setCatLoading(true);
        setCatError(null);

        //const token = localStorage.getItem("token") || "";
        const res = await fetch(`/api/v1/categories`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        const text = await res.text();
        const json = text ? JSON.parse(text) : {};
        if (!res.ok || !json?.success) {
          throw new Error(
            json?.error || `Load categories failed (${res.status})`
          );
        }

        const list: Category[] = Array.isArray(json.data) ? json.data : [];
        if (alive) setCategories(list);
      } catch (e: any) {
        if (alive) setCatError(e?.message || "Load categories failed");
      } finally {
        if (alive) setCatLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Badge
        variant={selectedTag === null ? "default" : "secondary"}
        className={`cursor-pointer px-3 py-1 transition-colors ${
          selectedTag === null
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-accent text-accent-foreground hover:bg-accent/90"
        }`}
        onClick={() => onTagSelect(null)}
      >
        All
      </Badge>

      {catLoading && (
        <Badge variant="secondary" className="px-3 py-1">
          Loading…
        </Badge>
      )}
      {catError && (
        <Badge variant="secondary" className="px-3 py-1">
          Load failed
        </Badge>
      )}

      {categories.map((c) => (
        <Badge
          key={c.id}
          variant={selectedTag === c.id ? "default" : "secondary"}
          className={`cursor-pointer px-3 py-1 transition-colors ${
            selectedTag === c.id
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-accent text-accent-foreground hover:bg-accent/90"
          }`}
          onClick={() => onTagSelect(c.id)}
          title={c.detail || c.name}
        >
          #{c.name}
        </Badge>
      ))}
    </div>
  );
}
