"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useData } from "@/context/data-context"
import QuestionList from "@/components/question-list"
import QuestionForm from "@/components/question-form"
import { Button } from "@/components/ui/button"
import { PlusCircle, Terminal } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"
import TagFilter from "@/components/tag-filter"
import Logo from "@/components/logo"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const { questions, tags, isLoading } = useData()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState(questions)
  const { toast } = useToast()
  const [isClient, setIsClient] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [bootSequence, setBootSequence] = useState(0)
  const [showLogo, setShowLogo] = useState(false)
  const bootMessages = [
    "Booting Qriosity...",
    "Campus mode: ON",
    "Let the questions flow.",
  ]

  useEffect(() => {
    setIsClient(true)

    // Boot sequence animation
    const bootInterval = setInterval(() => {
      setBootSequence((prev) => {
        if (prev >= bootMessages.length - 1) {
          clearInterval(bootInterval)
          setTimeout(() => {
            setShowLogo(true)
            setTimeout(() => setShowContent(true), 1500)
          }, 500)
          return prev
        }
        return prev + 1
      })
    }, 600)

    return () => clearInterval(bootInterval)
  }, [])

  useEffect(() => {
    // Filter questions based on selected tags
    let filtered = questions

    if (selectedTags.length > 0) {
      filtered = filtered.filter((question) => selectedTags.some((tag) => question.tags?.includes(tag)))
    }

    setFilteredQuestions(filtered)
  }, [selectedTags, questions])

  // Sort questions by trending (upvotes + recency)
  const trendingQuestions = [...filteredQuestions].sort((a, b) => {
    const aScore = a.upvotes + (Date.now() - a.timestamp) / 86400000
    const bScore = b.upvotes + (Date.now() - b.timestamp) / 86400000
    return bScore - aScore
  })

  // Sort questions by recency
  const recentQuestions = [...filteredQuestions].sort((a, b) => b.timestamp - a.timestamp)

  if (!isClient) {
    return null // Prevent hydration errors
  }

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {!showContent ? (
        <div className="h-screen w-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md w-full p-6"
          >
            {!showLogo ? (
              <>
                <Terminal className="h-12 w-12 text-primary mx-auto mb-6" />

                <div className="terminal-card p-4 text-left font-mono">
                  <div className="flex items-center mb-4">
                    <span className="text-primary mr-2">$</span>
                    <span className="terminal-glow">SYSTEM_BOOT</span>
                  </div>

                  {bootMessages.slice(0, bootSequence + 1).map((message, index) => (
                    <div key={index} className="text-sm mb-2 flex">
                      <span className="text-primary mr-2">&gt;</span>
                      <span>{message}</span>
                      {index === bootSequence && index < bootMessages.length - 1 && (
                        <span className="terminal-loading ml-1 text-primary">.</span>
                      )}
                    </div>
                  ))}

                  {bootSequence >= bootMessages.length - 1 && (
                    <div className="text-sm mt-4 text-primary">
                      <span className="animate-cursor-blink">_</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-center mb-6">
                  <span className="text-5xl font-bold terminal-glow">
                    <Terminal className="h-16 w-16 text-primary mx-auto mb-4" />
                    Qriosity
                  </span>
                </div>
                <p className="text-xl text-primary">
             Where Curiosity Connects Campus
                  <span className="animate-cursor-blink ml-1">_</span>
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <header className="border-b border-primary/30 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <Logo />

              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/80 text-primary-foreground">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    NEW_QUESTION
                  </Button>
                </SheetTrigger>
                <SheetContent className="border-primary bg-background overflow-y-auto">
                  <QuestionForm
                    onSuccess={() => {
                      setIsSheetOpen(false)
                      toast({
                        title: "SUCCESS",
                        description: "Question posted successfully",
                        className: "bg-muted border-primary text-primary",
                      })
                    }}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              {tags.length > 0 && (
                <TagFilter availableTags={tags} selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
              )}

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="terminal-card p-4">
                      <div className="flex items-center mb-4">
                        <span className="text-primary mr-2">&gt;</span>
                        <span className="terminal-glow">LOADING_DATA</span>
                        <span className="terminal-loading ml-2 text-primary">.</span>
                      </div>
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-10 w-full bg-muted mb-2" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <Tabs defaultValue="trending" className="mb-8">
                    <TabsList className="mb-4 bg-muted/50 p-1 border border-primary">
                      <TabsTrigger
                        value="trending"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        TRENDING
                      </TabsTrigger>
                      <TabsTrigger
                        value="recent"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        RECENT
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="trending">
                      <QuestionList questions={trendingQuestions} />
                    </TabsContent>

                    <TabsContent value="recent">
                      <QuestionList questions={recentQuestions} />
                    </TabsContent>
                  </Tabs>
                )}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </main>
  )
}
