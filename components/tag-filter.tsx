"use client";

import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/useCategories";

type TagFilterProps = {
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
};

export function TagFilter({ selectedTag, onTagSelect }: TagFilterProps) {
  const { categories, loading, error } = useCategories();

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

      {loading && (
        <Badge variant="secondary" className="px-3 py-1">
          Loading…
        </Badge>
      )}
      {error && (
        <Badge variant="secondary" className="px-3 py-1">
          Load failed
        </Badge>
      )}

      {(categories ?? []).map((c) => (
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
