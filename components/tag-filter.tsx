"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Hash } from "lucide-react"
import { useState, useEffect } from "react"

interface TagFilterProps {
  availableTags: string[]
  selectedTags: string[]
  setSelectedTags: (tags: string[]) => void
}

export default function TagFilter({ availableTags, selectedTags, setSelectedTags }: TagFilterProps) {
  const [isTyping, setIsTyping] = useState(false)
  const [displayedTags, setDisplayedTags] = useState<string[]>([])

  useEffect(() => {
    if (availableTags.length === 0) return

    setIsTyping(true)
    let index = 0

    const interval = setInterval(() => {
      if (index < availableTags.length) {
        setDisplayedTags(availableTags.slice(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [availableTags])

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const clearTags = () => {
    setSelectedTags([])
  }

  if (availableTags.length === 0) return null

  return (
    <div className="terminal-card p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="text-primary mr-2">&gt;</span>
          <h3 className="text-sm font-medium terminal-glow">FILTER_BY_TAGS</h3>
        </div>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearTags}
            className="h-8 px-2 text-primary hover:text-primary hover:bg-background/50"
          >
            <X className="h-3 w-3 mr-1" />
            CLEAR
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {displayedTags.map((tag, index) => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className={`
              cursor-pointer transition-all duration-200
              ${
                selectedTags.includes(tag)
                  ? "bg-primary text-primary-foreground hover:bg-primary/80"
                  : "border-primary text-primary hover:bg-primary/20"
              }
            `}
            onClick={() => toggleTag(tag)}
          >
            <Hash className="h-3 w-3 mr-1" />
            {tag}
          </Badge>
        ))}
        {isTyping && <span className="terminal-loading text-primary">.</span>}
      </div>
    </div>
  )
}
