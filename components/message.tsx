"use client"

import { formatDistanceToNow } from "date-fns"
import { ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MessageProps {
  content: string
  author: string
  timestamp: number
  upvotes: number
  upvoted?: boolean
  onUpvote?: () => void
  onReply?: () => void
  className?: string
  isQuestion?: boolean
}

export function Message({
  content,
  author,
  timestamp,
  upvotes,
  upvoted = false,
  onUpvote,
  onReply,
  className,
  isQuestion = false,
}: MessageProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">{author}</div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
            </div>
          </div>
          <div className="text-sm whitespace-pre-wrap break-words">{content}</div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button variant="ghost" size="sm" onClick={onUpvote} className={cn(upvoted && "text-primary")}>
          <ThumbsUp className="h-4 w-4 mr-1" />
          <span>{upvotes}</span>
        </Button>
        {onReply && (
          <Button variant="ghost" size="sm" onClick={onReply}>
            Reply
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
