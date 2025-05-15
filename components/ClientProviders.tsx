"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { NetworkContextProvider } from "@/components/providers/NetworkContextProvider"
import { WalletContextProvider } from "@/components/providers/WalletContextProvider"
import { Toaster } from "@/components/ui/toaster"
import ClientInit from "@/app/ClientInit"
import { isBrowser } from "@/utils/browser"

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Only show the UI when mounted on the client
  useEffect(() => {
    if (!isBrowser) return

    setMounted(true)
    return () => setMounted(false)
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <NetworkContextProvider>
        <WalletContextProvider>
          {children}
          {mounted && (
            <>
              <Toaster />
              <ClientInit />
            </>
          )}
        </WalletContextProvider>
      </NetworkContextProvider>
    </ThemeProvider>
  )
}
