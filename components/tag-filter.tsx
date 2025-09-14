"use client"

import { Badge } from "@/components/ui/badge"

interface TagFilterProps {
  selectedTag: string | null
  onTagSelect: (tag: string | null) => void
}

export function TagFilter({ selectedTag, onTagSelect }: TagFilterProps) {
  const tags = ["BloxFruit", "Bloxmesh", "Bloxbox"]

  return (
    <div className="flex gap-2 mb-6">
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

      {tags.map((tag) => (
        <Badge
          key={tag}
          variant={selectedTag === tag ? "default" : "secondary"}
          className={`cursor-pointer px-3 py-1 transition-colors ${
            selectedTag === tag
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-accent text-accent-foreground hover:bg-accent/90"
          }`}
          onClick={() => onTagSelect(tag)}
        >
          #{tag}
        </Badge>
      ))}
    </div>
  )
}
