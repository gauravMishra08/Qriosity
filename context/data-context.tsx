"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore"
import type { Question, Reply, DataContextType } from "@/types"

const DataContext = createContext<DataContextType | undefined>(undefined)

// Create provider
export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [replies, setReplies] = useState<Reply[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load questions and replies from Firebase
  useEffect(() => {
    setIsLoading(true)

    // Subscribe to questions collection
    const unsubscribeQuestions = onSnapshot(
      query(collection(db, "questions"), orderBy("timestamp", "desc")),
      (snapshot) => {
        const loadedQuestions = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            content: data.content || "",
            author: data.author || "",
            timestamp: data.timestamp?.toMillis() || Date.now(),
            upvotes: data.upvotes || 0,
            isPinned: data.isPinned || false,
            isLocked: data.isLocked || false,
            tags: data.tags || [],
            upvoted: false,
          }
        })
        setQuestions(loadedQuestions)

        // Extract unique tags
        const allTags = loadedQuestions.flatMap((q) => q.tags || [])
        const uniqueTags = [...new Set(allTags)]
        setTags(uniqueTags)

        setIsLoading(false)
      },
      (error) => {
        console.error("Error loading questions:", error)
        setIsLoading(false)
      },
    )

    // Subscribe to replies collection
    const unsubscribeReplies = onSnapshot(
      query(collection(db, "replies"), orderBy("timestamp", "asc")),
      (snapshot) => {
        const loadedReplies = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            questionId: data.questionId || "",
            parentReplyId: data.parentReplyId || null,
            content: data.content || "",
            author: data.author || "",
            timestamp: data.timestamp?.toMillis() || Date.now(),
            upvotes: data.upvotes || 0,
            upvoted: false,
          }
        })
        setReplies(loadedReplies)
      },
      (error) => {
        console.error("Error loading replies:", error)
      },
    )

    return () => {
      unsubscribeQuestions()
      unsubscribeReplies()
    }
  }, [])

  // Add a new question
  const addQuestion = async (question: Partial<Question>) => {
    try {
      const newTags = question.tags || []

      // Add the question to Firestore
      await addDoc(collection(db, "questions"), {
        content: question.content || "",
        author: question.author || "",
        timestamp: serverTimestamp(),
        upvotes: 0,
        isPinned: false,
        isLocked: false,
        tags: newTags,
      })

      // Add any new tags to the tags collection
      for (const tag of newTags) {
        await addTag(tag)
      }
    } catch (error) {
      console.error("Error adding question:", error)
      throw error
    }
  }

  // Update a question
  const updateQuestion = async (question: Question) => {
    try {
      const questionRef = doc(db, "questions", question.id)
      await updateDoc(questionRef, {
        content: question.content,
        author: question.author,
        isPinned: question.isPinned || false,
        isLocked: question.isLocked || false,
        tags: question.tags || [],
      })
    } catch (error) {
      console.error("Error updating question:", error)
      throw error
    }
  }

  // Delete a question
  const deleteQuestion = async (id: string) => {
    try {
      // Delete the question
      await deleteDoc(doc(db, "questions", id))

      // Delete all replies to this question
      const repliesSnapshot = await getDocs(query(collection(db, "replies"), where("questionId", "==", id)))
      const deletePromises = repliesSnapshot.docs.map((doc) => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
    } catch (error) {
      console.error("Error deleting question:", error)
      throw error
    }
  }

  // Upvote a question
  const upvoteQuestion = async (id: string) => {
    try {
      const questionRef = doc(db, "questions", id)
      const questionDoc = await getDoc(questionRef)

      if (questionDoc.exists()) {
        const currentUpvotes = questionDoc.data().upvotes || 0
        await updateDoc(questionRef, {
          upvotes: currentUpvotes + 1,
        })

        // Update local state
        setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, upvotes: q.upvotes + 1, upvoted: true } : q)))
      }
    } catch (error) {
      console.error("Error upvoting question:", error)
    }
  }

  // Add a new reply
  const addReply = async (reply: Partial<Reply>) => {
    try {
      await addDoc(collection(db, "replies"), {
        questionId: reply.questionId || "",
        parentReplyId: reply.parentReplyId || null,
        content: reply.content || "",
        author: reply.author || "",
        timestamp: serverTimestamp(),
        upvotes: 0,
      })
    } catch (error) {
      console.error("Error adding reply:", error)
      throw error
    }
  }

  // Update a reply
  const updateReply = async (reply: Reply) => {
    try {
      const replyRef = doc(db, "replies", reply.id)
      await updateDoc(replyRef, {
        content: reply.content,
        author: reply.author,
      })
    } catch (error) {
      console.error("Error updating reply:", error)
      throw error
    }
  }

  // Delete a reply
  const deleteReply = async (id: string) => {
    try {
      // Delete the reply
      await deleteDoc(doc(db, "replies", id))

      // Delete all child replies
      const childRepliesSnapshot = await getDocs(query(collection(db, "replies"), where("parentReplyId", "==", id)))
      const deletePromises = childRepliesSnapshot.docs.map((doc) => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
    } catch (error) {
      console.error("Error deleting reply:", error)
      throw error
    }
  }

  // Upvote a reply
  const upvoteReply = async (id: string) => {
    try {
      const replyRef = doc(db, "replies", id)
      const replyDoc = await getDoc(replyRef)

      if (replyDoc.exists()) {
        const currentUpvotes = replyDoc.data().upvotes || 0
        await updateDoc(replyRef, {
          upvotes: currentUpvotes + 1,
        })

        // Update local state
        setReplies((prev) => prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1, upvoted: true } : r)))
      }
    } catch (error) {
      console.error("Error upvoting reply:", error)
    }
  }

  // Get reply count for a question
  const getReplyCount = (questionId: string) => {
    return replies.filter((r) => r.questionId === questionId).length
  }

  // Get replies for a question
  const getRepliesByQuestionId = async (questionId: string) => {
    try {
      const repliesSnapshot = await getDocs(
        query(collection(db, "replies"), where("questionId", "==", questionId), orderBy("timestamp", "asc")),
      )

      return repliesSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          questionId: data.questionId || "",
          parentReplyId: data.parentReplyId || null,
          content: data.content || "",
          author: data.author || "",
          timestamp: data.timestamp?.toMillis() || Date.now(),
          upvotes: data.upvotes || 0,
          upvoted: false,
        }
      })
    } catch (error) {
      console.error("Error getting replies:", error)
      return []
    }
  }

  // Get a question by ID
  const getQuestionById = async (id: string) => {
    try {
      const questionDoc = await getDoc(doc(db, "questions", id))

      if (questionDoc.exists()) {
        const data = questionDoc.data()
        return {
          id: questionDoc.id,
          content: data.content || "",
          author: data.author || "",
          timestamp: data.timestamp?.toMillis() || Date.now(),
          upvotes: data.upvotes || 0,
          isPinned: data.isPinned || false,
          isLocked: data.isLocked || false,
          tags: data.tags || [],
          upvoted: false,
        }
      }

      return null
    } catch (error) {
      console.error("Error getting question:", error)
      return null
    }
  }

  // Add a tag
  const addTag = async (tag: string) => {
    try {
      // Check if tag already exists
      const tagsSnapshot = await getDocs(query(collection(db, "tags"), where("name", "==", tag)))

      if (tagsSnapshot.empty) {
        await addDoc(collection(db, "tags"), {
          name: tag,
          createdAt: serverTimestamp(),
        })
      }
    } catch (error) {
      console.error("Error adding tag:", error)
    }
  }

  // Get all available tags
  const availableTags = tags

  const value = {
    questions,
    replies,
    tags,
    isLoading,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    upvoteQuestion,
    addReply,
    updateReply,
    deleteReply,
    upvoteReply,
    getReplyCount,
    getRepliesByQuestionId,
    getQuestionById,
    addTag,
    availableTags,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
