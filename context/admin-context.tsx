"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface AdminContextType {
  isAdmin: boolean
  setIsAdmin: (value: boolean) => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)

  return <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>{children}</AdminContext.Provider>
}
