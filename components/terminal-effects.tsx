"use client"

import { useEffect, useState } from "react"

export function TerminalEffects() {
  const [showEffects, setShowEffects] = useState(false)

  useEffect(() => {
    // Only show effects after hydration to prevent SSR issues
    setShowEffects(true)
  }, [])

  if (!showEffects) return null

  return (
    <>
      <div className="scanline" />
      <div className="fixed inset-0 pointer-events-none bg-[url('/noise.png')] opacity-[0.03] z-50" />
    </>
  )
}