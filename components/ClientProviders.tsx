"use client"

import type React from "react"

import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { WalletContextProvider } from "@/components/providers/WalletContextProvider"
import { WalletConnectionProvider } from "@/components/providers/WalletConnectionProvider"
import { NetworkContextProvider } from "@/components/providers/NetworkContextProvider"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <NetworkContextProvider>
        <WalletContextProvider>
          <WalletConnectionProvider>{children}</WalletConnectionProvider>
        </WalletContextProvider>
      </NetworkContextProvider>
    </ThemeProvider>
  )
}

export default ClientProviders
