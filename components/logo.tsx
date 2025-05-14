"use client"

import { useEffect, useState } from "react"
import { Terminal } from "lucide-react"

interface LogoProps {
  size?: "small" | "medium" | "large"
}

export default function Logo({ size = "medium" }: LogoProps) {
  const [text, setText] = useState("")
  const fullText = "Qriosity"

  useEffect(() => {
    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setText(fullText.substring(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const sizeClasses = {
    small: "text-lg",
    medium: "text-xl",
    large: "text-3xl",
  }

  const iconSizes = {
    small: 16,
    medium: 20,
    large: 28,
  }

  return (
    <div className="flex items-center">
      <Terminal className="text-primary mr-2" size={iconSizes[size]} />
      <span className={`font-bold ${sizeClasses[size]} terminal-glow`}>
        {text}
        <span className="animate-cursor-blink">_</span>
      </span>
    </div>
  )
}
