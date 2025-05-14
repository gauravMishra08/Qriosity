import type React from "react"
import type { Metadata, Viewport } from "next"
import { IBM_Plex_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { DataProvider } from "@/context/data-context"
import { AdminProvider } from "@/context/admin-context"
import { TerminalEffects } from "@/components/terminal-effects"

// Load IBM Plex Mono font
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Qriosity – Where Curiosity Connects Campus",
  description: "Qriosity is a student-first Q&A platform crafted for college communities to post questions, reply freely, and engage with trending topics.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  generator: "v0.dev",
}

export const viewport: Viewport = {
  themeColor: "#0F0F0F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`dark ${ibmPlexMono.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Qriosity" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-mono bg-background text-foreground">
        <TerminalEffects />
        <AdminProvider>
          <DataProvider>
            {children}
            <Toaster />
          </DataProvider>
        </AdminProvider>
      </body>
    </html>
  )
}