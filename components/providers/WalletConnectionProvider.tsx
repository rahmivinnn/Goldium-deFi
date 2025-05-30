"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useToast } from "@/components/ui/use-toast"

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

interface WalletConnectionContextType {
  status: ConnectionStatus
  error: Error | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

const WalletConnectionContext = createContext<WalletConnectionContextType | undefined>(undefined)

export function WalletConnectionProvider({ children }: { children: ReactNode }) {
  const { select, connect: walletConnect, disconnect: walletDisconnect, wallet, connected } = useWallet()
  const [status, setStatus] = useState<ConnectionStatus>(connected ? "connected" : "disconnected")
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const connect = useCallback(async () => {
    try {
      setStatus("connecting")
      setError(null)

      // If no wallet is selected, we can't connect
      if (!wallet) {
        throw new Error("No wallet selected")
      }

      await walletConnect()
      setStatus("connected")

      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully.",
      })
    } catch (err: any) {
      console.error("Wallet connection error:", err)
      setStatus("error")
      setError(err instanceof Error ? err : new Error(err?.message || "Failed to connect wallet"))

      toast({
        title: "Connection Failed",
        description: err?.message || "Failed to connect wallet",
        variant: "destructive",
      })
    }
  }, [wallet, walletConnect, toast])

  const disconnect = useCallback(async () => {
    try {
      await walletDisconnect()
      setStatus("disconnected")
      setError(null)

      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      })
    } catch (err: any) {
      console.error("Wallet disconnection error:", err)
      setError(err instanceof Error ? err : new Error(err?.message || "Failed to disconnect wallet"))

      toast({
        title: "Disconnection Failed",
        description: err?.message || "Failed to disconnect wallet",
        variant: "destructive",
      })
    }
  }, [walletDisconnect, toast])

  return (
    <WalletConnectionContext.Provider value={{ status, error, connect, disconnect }}>
      {children}
    </WalletConnectionContext.Provider>
  )
}

export function useWalletConnection() {
  const context = useContext(WalletConnectionContext)
  if (!context) {
    throw new Error("useWalletConnection must be used within a WalletConnectionProvider")
  }
  return context
}
