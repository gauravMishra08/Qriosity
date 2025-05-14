"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useData } from "@/context/data-context"
import { useAdmin } from "@/context/admin-context"
import ReplyForm from "@/components/reply-form"
import MessageThread from "@/components/message-thread"
import QuestionDetail from "@/components/question-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Lock, Trash, Terminal } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Logo from "@/components/logo"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function QuestionPage() {
  const params = useParams()
  const router = useRouter()
  const { questions, replies, isLoading: dataIsLoading, deleteQuestion } = useData()
  const { isAdmin } = useAdmin()
  const [isClient, setIsClient] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingStep, setLoadingStep] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    setIsClient(true)

    // Terminal-style loading animation
    const loadingInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= 3) {
          clearInterval(loadingInterval)
          setTimeout(() => setIsLoading(false), 300)
          return prev
        }
        return prev + 1
      })
    }, 400)

    return () => clearInterval(loadingInterval)
  }, [])

  if (!isClient) {
    return null // Prevent hydration errors
  }

  if (isLoading || dataIsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-primary/30 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Logo />
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="mb-6 border-primary text-primary hover:bg-primary/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK
          </Button>

          <div className="terminal-card p-4 mb-6">
            <div className="flex items-center mb-4">
              <span className="text-primary mr-2">&gt;</span>
              <span className="terminal-glow">LOADING_QUESTION</span>
              <span className="terminal-loading ml-2 text-primary">.</span>
            </div>
            <Skeleton className="h-20 w-full bg-muted mb-4" />
            <Skeleton className="h-10 w-3/4 bg-muted mb-2" />
            <Skeleton className="h-10 w-1/2 bg-muted" />
          </div>

          <div className="terminal-card p-4">
            <div className="flex items-center mb-4">
              <span className="text-primary mr-2">&gt;</span>
              <span className="terminal-glow">LOADING_REPLIES</span>
              <span className="terminal-loading ml-2 text-primary">.</span>
            </div>
            <Skeleton className="h-16 w-full bg-muted mb-3" />
            <Skeleton className="h-16 w-full bg-muted mb-3" />
            <Skeleton className="h-16 w-full bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  const questionId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : ""
  const question = questions.find((q) => q.id === questionId)

  if (!question) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-primary/30 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Logo />
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="mb-6 border-primary text-primary hover:bg-primary/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK
          </Button>

          <div className="terminal-card p-6 text-center">
            <Terminal className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-destructive mb-2">ERROR_404</h2>
            <p className="text-muted-foreground mb-4">Question not found or has been deleted.</p>
            <div className="text-xs text-muted-foreground mt-4 font-mono">
              <span className="text-primary">$</span> question_id: {questionId}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Ensure question has all required properties with defaults
  const isLocked = question?.isLocked || false
  const id = question?.id || ""

  const questionReplies = replies.filter((r) => r.questionId === id && !r.parentReplyId)

  const handleDeleteQuestion = async () => {
    try {
      setIsDeleting(true)
      await deleteQuestion(id)
      toast({
        title: "SUCCESS",
        description: "Question deleted successfully",
        className: "bg-muted border-primary text-primary",
      })
      router.push("/")
    } catch (error) {
      console.error("Error deleting question:", error)
      setIsDeleting(false)
      toast({
        variant: "destructive",
        title: "ERROR",
        description: "Failed to delete question",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-primary/30 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Logo />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-between items-center mb-6"
        >
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="border-primary text-primary hover:bg-primary/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK
          </Button>

          {isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting}
                  className="bg-destructive/20 text-destructive border border-destructive hover:bg-destructive/30"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  DELETE
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-background border-primary">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-primary">CONFIRM_DELETE</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All replies will also be deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-primary text-primary hover:bg-primary/20">
                    CANCEL
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteQuestion}
                    className="bg-destructive/20 text-destructive border border-destructive hover:bg-destructive/30"
                  >
                    DELETE
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <QuestionDetail question={question} />
        </motion.div>

        {isLocked ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="my-6"
          >
            <Alert className="border-destructive bg-destructive/10 terminal-card">
              <AlertDescription className="flex items-center">
                <Lock className="h-4 w-4 mr-2 text-destructive" />
                <span className="text-destructive">THREAD_LOCKED: No new replies can be added.</span>
              </AlertDescription>
            </Alert>
          </motion.div>
        ) : (
          <motion.div
            className="my-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <ReplyForm
              questionId={id}
              onSuccess={() => {
                toast({
                  title: "SUCCESS",
                  description: "Reply posted successfully",
                  className: "bg-muted border-primary text-primary",
                })
              }}
            />
          </motion.div>
        )}

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center mb-4">
            <span className="text-primary mr-2">&gt;</span>
            <h2 className="text-xl font-bold terminal-glow">REPLIES [{questionReplies.length}]</h2>
          </div>

          <MessageThread
            replies={questionReplies}
            allReplies={replies}
            questionId={id}
            questionLocked={isLocked}
            showDeleteButton={isAdmin}
          />
        </motion.div>
      </div>
    </div>
  )
}
