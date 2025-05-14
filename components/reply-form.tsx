"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useData } from "@/context/data-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Send, User, MessageSquare } from "lucide-react"

interface ReplyFormProps {
  questionId: string
  parentReplyId?: string | null
  onSuccess?: () => void
}

export default function ReplyForm({ questionId, parentReplyId = null, onSuccess }: ReplyFormProps) {
  const { addReply } = useData()
  const { toast } = useToast()

  const [author, setAuthor] = useState("")
  const [content, setContent] = useState("")
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
      setError("ERROR: Reply content required")
      return
    }

    if (!author.trim()) {
      setError("ERROR: Author name required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await addReply({
        questionId,
        parentReplyId,
        content,
        author,
      })

      toast({
        title: "SUCCESS",
        description: "Reply posted successfully",
        className: "bg-muted border-primary text-primary",
      })

      setContent("")

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error submitting reply:", error)
      setError("ERROR: Failed to submit reply")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="terminal-card p-4">
      <div className="flex items-center mb-4">
        <span className="text-primary mr-2">&gt;</span>
        <h2 className="text-lg font-bold terminal-glow">NEW_REPLY</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="author" className="flex items-center text-sm font-medium text-primary">
            <User className="h-4 w-4 mr-2" />
            USER:
          </label>
          <div className="flex items-center bg-background border border-primary rounded-md overflow-hidden">
            <span className="text-primary px-3">$</span>
            <input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none p-2 text-foreground"
              placeholder="Enter your username"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="flex items-center text-sm font-medium text-primary">
            <MessageSquare className="h-4 w-4 mr-2" />
            RESPONSE:
          </label>
          <div className="bg-background border border-primary rounded-md p-2">
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none min-h-[100px] resize-none"
              placeholder="Write your reply..."
            />
            <div className="text-xs text-primary opacity-70 mt-1">
              {content.length} characters {showCursor ? "|" : " "}
            </div>
          </div>
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
              SUBMIT_REPLY
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
