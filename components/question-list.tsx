"use client"

import { useRouter } from "next/navigation"
import { useData } from "@/context/data-context"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, ThumbsUp, Pin, Hash, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import type { Question } from "@/types"

interface QuestionListProps {
  questions: Question[]
}

export default function QuestionList({ questions }: QuestionListProps) {
  const router = useRouter()
  const { upvoteQuestion, getReplyCount } = useData()
  const [visibleQuestions, setVisibleQuestions] = useState<Question[]>([])

  useEffect(() => {
    if (!questions || questions.length === 0) return

    // Simulate terminal-style loading of questions
    setVisibleQuestions([])
    let index = 0

    const interval = setInterval(() => {
      if (index < questions.length) {
        setVisibleQuestions((prev) => [...prev, questions[index]])
        index++
      } else {
        clearInterval(interval)
      }
    }, 150)

    return () => clearInterval(interval)
  }, [questions])

  if (!questions || questions.length === 0) {
    return (
      <div className="terminal-card p-6 text-center">
        <p className="text-primary terminal-glow">NO_RESULTS_FOUND</p>
        <p className="text-secondary mt-2">Be the first to ask a question!</p>
        <div className="mt-4 text-xs text-muted-foreground">
          <span className="text-primary">$</span> waiting for input<span className="animate-cursor-blink">_</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {visibleQuestions.map((question, index) => {
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
          <motion.div
            key={id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div
              className={`
                terminal-card p-4 cursor-pointer hover:border-primary/80 transition-all
                ${isPinned ? "border-primary" : "border-border"}
              `}
              onClick={() => id && router.push(`/question/${id}`)}
            >
              {isPinned && (
                <div className="flex items-center text-primary text-xs mb-2">
                  <Pin className="h-3 w-3 mr-1" />
                  <span className="terminal-glow">PINNED_QUESTION</span>
                </div>
              )}

              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <span className="text-primary mr-2">$</span>
                  <span className="font-medium">{author}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(timestamp, { addSuffix: true })}
                </div>
              </div>

              <div className="pl-4 border-l-2 border-primary/30 my-3">
                <p className="line-clamp-3 whitespace-pre-wrap">{content}</p>
              </div>

              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 mb-3">
                  {tags.map((tag, tagIndex) => (
                    <Badge
                      key={`${tag}-${tagIndex}`}
                      variant="outline"
                      className="border-primary/50 text-primary text-xs"
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-1 text-xs ${upvoted ? "text-primary" : "text-muted-foreground"}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      id && upvoteQuestion(id)
                    }}
                  >
                    <ThumbsUp className={`h-3 w-3 ${upvoted ? "text-primary" : ""}`} />
                    <span>{upvotes}</span>
                  </Button>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    <span>{id ? getReplyCount(id) : 0}</span>
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-primary" />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
