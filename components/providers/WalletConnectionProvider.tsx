"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useToast } from "@/components/ui/use-toast"
import { detectBrowser, isBrowserSupported } from "@/utils/browser-detection"
import {
  parseWalletError,
  type ConnectionError,
  createUnsupportedBrowserError,
  createWalletNotFoundError,
} from "@/utils/connection-error"

// Connection status type
export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

// Connection context type
interface WalletConnectionContextType {
  status: ConnectionStatus
  error: ConnectionError | null
  connect: (walletName?: string) => Promise<boolean>
  disconnect: () => Promise<void>
  retry: () => Promise<boolean>
  clearError: () => void
  isWalletAvailable: (walletName: string) => boolean
  getRecommendedWallet: () => string
  isBrowserSupported: boolean
}

// Create context
const WalletConnectionContext = createContext<WalletConnectionContextType | undefined>(undefined)

// Custom hook to use the wallet connection context
export function useWalletConnection() {
  const context = useContext(WalletConnectionContext)
  if (!context) {
    throw new Error("useWalletConnection must be used within a WalletConnectionProvider")
  }
  return context
}

// Provider props
interface WalletConnectionProviderProps {
  children: ReactNode
  network?: string
}

// Provider component
export function WalletConnectionProvider({ children, network = "devnet" }: WalletConnectionProviderProps) {
  const wallet = useWallet()
  const { toast } = useToast()
  const [status, setStatus] = useState<ConnectionStatus>("disconnected")
  const [error, setError] = useState<ConnectionError | null>(null)
  const [lastWalletName, setLastWalletName] = useState<string | undefined>(undefined)
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const browserSupported = isBrowserSupported()
  const browserInfo = detectBrowser()

  // Clear any existing connection timeout
  const clearConnectTimeout = useCallback(() => {
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current)
      connectTimeoutRef.current = null
    }
  }, [])

  // Handle wallet connection
  const connect = useCallback(
    async (walletName?: string): Promise<boolean> => {
      // Clear any existing errors
      setError(null)

      // Check browser compatibility
      if (!browserSupported) {
        const browserError = createUnsupportedBrowserError(browserInfo.name)
        setError(browserError)
        setStatus("error")

        toast({
          title: "Browser Not Fully Supported",
          description: browserError.details,
          variant: "destructive",
        })

        return false
      }

      // Check if wallet is available
      if (walletName && !isWalletAvailable(walletName)) {
        const walletError = createWalletNotFoundError(walletName)
        setError(walletError)
        setStatus("error")

        toast({
          title: "Wallet Not Found",
          description: walletError.details,
          variant: "destructive",
        })

        return false
      }

      try {
        setStatus("connecting")
        setLastWalletName(walletName)

        // Set a timeout for the connection attempt
        clearConnectTimeout()
        connectTimeoutRef.current = setTimeout(() => {
          setStatus("error")
          setError(parseWalletError(new Error("Connection timeout")))
        }, 30000) // 30 second timeout

        // Attempt to connect
        await wallet.select(walletName || "Phantom")
        await wallet.connect()

        // Clear the timeout if connection was successful
        clearConnectTimeout()

        // Check if actually connected
        if (!wallet.connected) {
          throw new Error("Failed to connect to wallet")
        }

        setStatus("connected")

        toast({
          title: "Wallet Connected",
          description: `Successfully connected to ${walletName || "wallet"}`,
          variant: "default",
        })

        return true
      } catch (err) {
        clearConnectTimeout()

        const parsedError = parseWalletError(err)
        setError(parsedError)
        setStatus("error")

        toast({
          title: "Connection Failed",
          description: parsedError.message,
          variant: "destructive",
        })

        return false
      }
    },
    [wallet, browserSupported, browserInfo.name, toast, clearConnectTimeout],
  )

  // Handle wallet disconnection
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      await wallet.disconnect()
      setStatus("disconnected")
      setError(null)

      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
        variant: "default",
      })
    } catch (err) {
      const parsedError = parseWalletError(err)
      setError(parsedError)

      toast({
        title: "Disconnection Error",
        description: parsedError.message,
        variant: "destructive",
      })
    }
  }, [wallet, toast])

  // Retry connection
  const retry = useCallback(async (): Promise<boolean> => {
    return connect(lastWalletName)
  }, [connect, lastWalletName])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
    if (status === "error") {
      setStatus("disconnected")
    }
  }, [status])

  // Check if a wallet is available
  const isWalletAvailable = useCallback((walletName: string): boolean => {
    if (typeof window === "undefined") return false

    switch (walletName.toLowerCase()) {
      case "phantom":
        return !!window.solana?.isPhantom
      case "solflare":
        return !!window.solflare
      default:
        return false
    }
  }, [])

  // Get recommended wallet based on browser
  const getRecommendedWallet = useCallback((): string => {
    return browserInfo.recommendedWallet
  }, [browserInfo.recommendedWallet])

  // Update status when wallet connection changes
  useEffect(() => {
    if (wallet.connected) {
      setStatus("connected")
    } else if (status === "connected") {
      setStatus("disconnected")
    }
  }, [wallet.connected, status])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearConnectTimeout()
    }
  }, [clearConnectTimeout])

  // Handle network changes
  useEffect(() => {
    // If network changes and wallet is connected, update status
    if (wallet.connected) {
      // We don't need to reconnect, just update UI
      toast({
        title: "Network Changed",
        description: `Now connected to ${network}`,
        variant: "default",
      })
    }
  }, [network, wallet.connected, toast])

  // Context value
  const value = {
    status,
    error,
    connect,
    disconnect,
    retry,
    clearError,
    isWalletAvailable,
    getRecommendedWallet,
    isBrowserSupported: browserSupported,
  }

  return <WalletConnectionContext.Provider value={value}>{children}</WalletConnectionContext.Provider>
}
