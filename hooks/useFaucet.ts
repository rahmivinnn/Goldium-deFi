"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useLocalStorage } from "./use-local-storage"
import { useToast } from "@/components/ui/use-toast"

// Mock faucet functionality
export function useFaucet() {
  const { publicKey, connected, signTransaction } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Store last claim time in local storage
  const [lastClaimTime, setLastClaimTime] = useLocalStorage<number>("lastClaimTime", 0)

  // Cooldown period in seconds (5 minutes)
  const COOLDOWN_PERIOD = 5 * 60

  // Calculate if user can claim and time until next claim
  const [canClaim, setCanClaim] = useState(false)
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState(0)

  // Update claim status
  useEffect(() => {
    if (!connected || !publicKey) {
      setCanClaim(false)
      return
    }

    const updateClaimStatus = () => {
      const now = Math.floor(Date.now() / 1000)
      const timeSinceLastClaim = now - lastClaimTime

      if (timeSinceLastClaim >= COOLDOWN_PERIOD) {
        setCanClaim(true)
        setTimeUntilNextClaim(0)
      } else {
        setCanClaim(false)
        setTimeUntilNextClaim(COOLDOWN_PERIOD - timeSinceLastClaim)
      }
    }

    updateClaimStatus()

    // Update every second
    const interval = setInterval(updateClaimStatus, 1000)

    return () => clearInterval(interval)
  }, [connected, publicKey, lastClaimTime])

  // Claim GOLD tokens
  const claimGold = useCallback(async () => {
    if (!connected || !publicKey || !canClaim) {
      return false
    }

    setIsLoading(true)

    try {
      // In a real implementation, this would call the faucet program
      // For demo purposes, we'll simulate a successful claim
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update last claim time
      setLastClaimTime(Math.floor(Date.now() / 1000))

      // Show success toast
      toast({
        title: "Tokens Claimed!",
        description: `100 GOLD tokens have been sent to your wallet.`,
      })

      setIsLoading(false)
      return true
    } catch (error) {
      console.error("Faucet error:", error)

      // Show error toast
      toast({
        title: "Claim Failed",
        description: "There was an error claiming your tokens. Please try again.",
        variant: "destructive",
      })

      setIsLoading(false)
      return false
    }
  }, [connected, publicKey, canClaim, setLastClaimTime, toast])

  return {
    claimGold,
    canClaim,
    timeUntilNextClaim,
    isLoading,
  }
}
