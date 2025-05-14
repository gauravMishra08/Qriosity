"use client"

import { useState } from "react"
import { useData } from "@/context/data-context"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageSquare, ChevronDown, ChevronUp, Trash } from "lucide-react"
import { motion } from "framer-motion"
import ReplyForm from "./reply-form"
import { useToast } from "@/components/ui/use-toast"
import type { Reply } from "@/types"

interface MessageThreadProps {
  replies: Reply[]
  allReplies: Reply[]
  questionId: string
  questionLocked: boolean
  showDeleteButton?: boolean
}

export default function MessageThread({
  replies,
  allReplies,
  questionId,
  questionLocked,
  showDeleteButton = false,
}: MessageThreadProps) {
  const { upvoteReply, deleteReply } = useData()
  const { toast } = useToast()
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const toggleExpanded = (replyId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [replyId]: !prev[replyId],
    }))
  }

  const handleReplyClick = (replyId: string) => {
    if (questionLocked) return
    setReplyingTo(replyId === replyingTo ? null : replyId)
  }

  const handleDeleteReply = async (replyId: string) => {
    try {
      await deleteReply(replyId)
      toast({
        title: "SUCCESS",
        description: "Reply deleted successfully",
        className: "bg-muted border-primary text-primary",
      })
    } catch (error) {
      console.error("Error deleting reply:", error)
      toast({
        variant: "destructive",
        title: "ERROR",
        description: "Failed to delete reply",
      })
    }
  }

  const renderReplies = (parentReplies: Reply[], depth = 0) => {
    return parentReplies.map((reply, index) => {
      // Ensure reply has all required properties with defaults
      const id = reply?.id || ""
      const content = reply?.content || ""
      const author = reply?.author || ""
      const timestamp = reply?.timestamp || Date.now()
      const upvotes = reply?.upvotes || 0
      const upvoted = reply?.upvoted || false

      const childReplies = allReplies.filter((r) => r.parentReplyId === id)
      const hasChildren = childReplies.length > 0
      const isExpanded = expandedReplies[id] !== false // Default to expanded

      return (
        <motion.div
          key={id || index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className={`mb-3`}
          style={{ marginLeft: `${depth * 16}px` }}
        >
          <div className={`terminal-card p-3 border-primary/30 ${depth > 0 ? "border-l-2" : ""}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <span className="text-primary mr-2">{">".repeat(depth + 1)}</span>
                <span className="font-medium">{author}</span>
              </div>
              <div className="text-xs text-muted-foreground">{formatDistanceToNow(timestamp, { addSuffix: true })}</div>
            </div>

            <div className="pl-3 my-2">
              <p className="whitespace-pre-wrap">{content}</p>
            </div>

            <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 text-xs ${upvoted ? "text-primary" : "text-muted-foreground"}`}
                  onClick={() => id && upvoteReply(id)}
                >
                  <ThumbsUp className={`h-3 w-3 ${upvoted ? "text-primary" : ""}`} />
                  <span>{upvotes}</span>
                </Button>

                {!questionLocked && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-xs text-muted-foreground"
                    onClick={() => id && handleReplyClick(id)}
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>Reply</span>
                  </Button>
                )}

                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-xs text-primary"
                    onClick={() => id && toggleExpanded(id)}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        <span>Show {childReplies.length}</span>
                      </>
                    )}
                  </Button>
                )}
              </div>

              {showDeleteButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/80"
                  onClick={() => id && handleDeleteReply(id)}
                >
                  <Trash className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {replyingTo === id && !questionLocked && (
            <div className="mt-2 ml-4">
              <ReplyForm questionId={questionId} parentReplyId={id} onSuccess={() => setReplyingTo(null)} />
            </div>
          )}

          {hasChildren && isExpanded && <div className="mt-2">{renderReplies(childReplies, depth + 1)}</div>}
        </motion.div>
      )
    })
  }

  if (!replies || replies.length === 0) {
    return (
      <div className="terminal-card p-4 text-center">
        <p className="text-primary terminal-glow">NO_REPLIES_FOUND</p>
        <p className="text-secondary mt-2">Be the first to reply!</p>
        <div className="mt-4 text-xs text-muted-foreground">
          <span className="text-primary">$</span> waiting for input<span className="animate-cursor-blink">_</span>
        </div>
      </div>
    )
  }

  return <div className="space-y-4">{renderReplies(replies)}</div>
}
