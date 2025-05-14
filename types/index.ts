export interface Question {
  id: string
  content: string
  author: string
  timestamp: number
  upvotes: number
  upvoted?: boolean
  isPinned?: boolean
  isLocked?: boolean
  tags?: string[]
}

export interface Reply {
  id: string
  questionId: string
  parentReplyId?: string | null
  content: string
  author: string
  timestamp: number
  upvotes: number
  upvoted?: boolean
}

export interface DataContextType {
  questions: Question[]
  replies: Reply[]
  tags: string[]
  isLoading: boolean
  addQuestion: (question: Partial<Question>) => Promise<void>
  updateQuestion: (question: Question) => Promise<void>
  deleteQuestion: (id: string) => Promise<void>
  upvoteQuestion: (id: string) => Promise<void>
  addReply: (reply: Partial<Reply>) => Promise<void>
  updateReply: (reply: Reply) => Promise<void>
  deleteReply: (id: string) => Promise<void>
  upvoteReply: (id: string) => Promise<void>
  getReplyCount: (questionId: string) => number
  getRepliesByQuestionId: (questionId: string) => Promise<Reply[]>
  getQuestionById: (id: string) => Promise<Question | null>
  addTag: (tag: string) => Promise<void>
  availableTags: string[]
}
