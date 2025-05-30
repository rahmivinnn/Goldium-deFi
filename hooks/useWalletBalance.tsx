"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useConnection } from "@solana/wallet-adapter-react"
import { useToast } from "@/components/ui/use-toast"

export function useWalletBalance() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const { toast } = useToast()

  // Initialize with null to indicate "not loaded yet" state
  const [solBalance, setSolBalance] = useState<number | undefined>(undefined)
  const [goldBalance, setGoldBalance] = useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshBalances = useCallback(async () => {
    if (!publicKey || !connected || !connection) {
      // Reset balances when disconnected
      setSolBalance(undefined)
      setGoldBalance(undefined)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch SOL balance
      const balance = await connection.getBalance(publicKey)
      const solBalanceValue = balance / 10 ** 9 // Convert lamports to SOL
      setSolBalance(solBalanceValue)

      // Simulate fetching GOLD token balance (in a real app, you'd fetch from a token account)
      // This is just a placeholder - in a real app you'd use proper token account lookup
      setTimeout(() => {
        setGoldBalance(1000) // Simulated GOLD balance
        setIsLoading(false)
      }, 500)
    } catch (err: any) {
      console.error("Failed to fetch balances", err)
      setError(err.message || "Failed to fetch balances")
      setIsLoading(false)

      toast({
        title: "Error fetching balances",
        description: err.message || "Failed to fetch wallet balances",
        variant: "destructive",
      })

      // Set default values on error
      setSolBalance(0)
      setGoldBalance(0)
    }
  }, [connection, publicKey, connected, toast])

  // Fetch balances when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      refreshBalances()
    } else {
      // Reset balances when disconnected
      setSolBalance(undefined)
      setGoldBalance(undefined)
    }
  }, [connected, publicKey, refreshBalances])

  return {
    solBalance: solBalance ?? 0, // Provide default value of 0 if undefined
    goldBalance: goldBalance ?? 0, // Provide default value of 0 if undefined
    isLoading,
    error,
    refreshBalances,
  }
}

export default useWalletBalance
