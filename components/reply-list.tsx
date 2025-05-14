"use client"

import { useData } from "@/context/data-context"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { motion } from "framer-motion"
import type { Reply } from "@/types"

interface ReplyListProps {
  replies: Reply[]
}

export default function ReplyList({ replies }: ReplyListProps) {
  const { upvoteReply } = useData()

  if (replies.length === 0) {
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

  return (
    <div className="space-y-4">
      {replies.map((reply, index) => (
        <motion.div
          key={reply.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <div className="terminal-card p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <span className="text-primary mr-2">&gt;</span>
                <span className="font-medium">{reply.author}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(reply.timestamp, { addSuffix: true })}
              </div>
            </div>

            <div className="pl-4 border-l-2 border-primary/30 my-3">
              <p className="whitespace-pre-wrap">{reply.content}</p>
            </div>

            <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-1 ${reply.upvoted ? "text-primary" : "text-muted-foreground"}`}
                onClick={() => upvoteReply(reply.id)}
              >
                <ThumbsUp className={`h-4 w-4 ${reply.upvoted ? "text-primary" : ""}`} />
                <span>{reply.upvotes}</span>
              </Button>

              <div className="text-xs text-muted-foreground">
                <span className="text-primary">ID:</span> {reply.id.substring(0, 8)}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
