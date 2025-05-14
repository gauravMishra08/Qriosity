"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useData } from "@/context/data-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Send, Hash, User, MessageSquare, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface QuestionFormProps {
  onSuccess?: () => void
}

export default function QuestionForm({ onSuccess }: QuestionFormProps) {
  const { addQuestion, availableTags, addTag } = useData()
  const { toast } = useToast()

  const [author, setAuthor] = useState("")
  const [content, setContent] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCursor, setShowCursor] = useState(true)

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      setError("ERROR: Question content required")
      return
    }

    if (!author.trim()) {
      setError("ERROR: Author name required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await addQuestion({
        content,
        author,
        tags: selectedTags,
      })

      toast({
        title: "SUCCESS",
        description: "Question posted successfully",
        className: "bg-muted border-primary text-primary",
      })

      setContent("")
      setSelectedTags([])

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error submitting question:", error)
      setError("ERROR: Failed to submit question")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTagAdd = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      const tag = newTag.trim().toLowerCase().replace(/\s+/g, "-")
      setSelectedTags([...selectedTags, tag])
      addTag(tag)
      setNewTag("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault()
      handleTagAdd()
    }
  }

  return (
    <div className="terminal-card p-4">
      <div className="flex items-center mb-4">
        <span className="text-primary mr-2">&gt;</span>
        <h2 className="text-xl font-bold terminal-glow">ASK_QUESTION</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="author" className="flex items-center text-sm font-medium text-primary">
            <User className="h-4 w-4 mr-2" />
            USERNAME:
          </label>
          <div className="flex items-center bg-background border border-primary rounded-md overflow-hidden">
            <input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none p-2 text-foreground"
              placeholder="e.g. ab1234"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="flex items-center text-sm font-medium text-primary">
            <MessageSquare className="h-4 w-4 mr-2" />
            QUERY:
          </label>
          <div className="bg-background border border-primary rounded-md p-2">
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none min-h-[100px] resize-none"
              placeholder="What would you like to ask?"
            />
            <div className="text-xs text-primary opacity-70 mt-1">
              {content.length} characters {showCursor ? "|" : " "}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="tags" className="flex items-center text-sm font-medium text-primary">
            <Hash className="h-4 w-4 mr-2" />
            TAGS:
          </label>

          <div className="flex items-center bg-background border border-primary rounded-md overflow-hidden">
            <input
              id="tags"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-none focus:outline-none p-2 text-foreground"
              placeholder="Add tags (press Enter to add)"
            />
            <Button
              type="button"
              onClick={handleTagAdd}
              disabled={!newTag.trim()}
              variant="ghost"
              className="h-full px-3 text-primary hover:bg-primary/20"
            >
              +
            </Button>
          </div>

          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.map((tag) => (
                <Badge key={tag} className="bg-primary/20 text-primary border border-primary">
                  {tag}
                  <button
                    type="button"
                    onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                    className="ml-1 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="text-destructive border border-destructive p-2 rounded-md bg-destructive/10">{error}</div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/80 text-primary-foreground"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              PROCESSING...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              SUBMIT_QUESTION
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
