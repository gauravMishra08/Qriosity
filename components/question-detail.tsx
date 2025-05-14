"use client"

import { useData } from "@/context/data-context"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThumbsUp, Hash, Pin } from "lucide-react"
import type { Question } from "@/types"
import { motion } from "framer-motion"

interface QuestionDetailProps {
  question: Question
}

export default function QuestionDetail({ question }: QuestionDetailProps) {
  const { upvoteQuestion } = useData()

  // Ensure question has all required properties with defaults
  const isPinned = question?.isPinned || false
  const content = question?.content || ""
  const author = question?.author || ""
  const timestamp = question?.timestamp || Date.now()
  const upvotes = question?.upvotes || 0
  const upvoted = question?.upvoted || false
  const tags = question?.tags || []
  const id = question?.id || ""

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className={`terminal-card p-4 ${isPinned ? "border-primary" : "border-border"}`}>
        {isPinned && (
          <div className="flex items-center text-primary text-xs mb-2">
            <Pin className="h-3 w-3 mr-1" />
            <span className="terminal-glow">PINNED_QUESTION</span>
          </div>
        )}

        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <span className="text-primary mr-2">$</span>
            <span className="font-medium">{author}</span>
          </div>
          <div className="text-xs text-muted-foreground">{formatDistanceToNow(timestamp, { addSuffix: true })}</div>
        </div>

        <div className="pl-4 border-l-2 border-primary/30 my-4">
          <pre className="whitespace-pre-wrap font-mono text-foreground">{content}</pre>
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 mb-4">
            {tags.map((tag, index) => (
              <Badge key={`${tag}-${index}`} variant="outline" className="border-primary/50 text-primary">
                <Hash className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1 ${upvoted ? "text-primary" : "text-muted-foreground"}`}
            onClick={() => id && upvoteQuestion(id)}
          >
            <ThumbsUp className={`h-4 w-4 ${upvoted ? "text-primary" : ""}`} />
            <span>{upvotes}</span>
          </Button>

          <div className="text-xs text-muted-foreground">
            <span className="text-primary">ID:</span> {id.substring(0, 8)}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
