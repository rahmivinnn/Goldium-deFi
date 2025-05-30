"use client"

import type React from "react"

import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { WalletContextProvider } from "@/components/providers/WalletContextProvider"
import { WalletConnectionProvider } from "@/components/providers/WalletConnectionProvider"
import { NetworkContextProvider } from "@/components/providers/NetworkContextProvider"
import ClientErrorBoundary from "@/components/ClientErrorBoundary"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClientErrorBoundary>
      <ThemeProvider>
        <NetworkContextProvider>
          <WalletContextProvider>
            <WalletConnectionProvider>{children}</WalletConnectionProvider>
          </WalletContextProvider>
        </NetworkContextProvider>
      </ThemeProvider>
    </ClientErrorBoundary>
  )
}

export default ClientProviders
