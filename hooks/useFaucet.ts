"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useNetwork } from "@/components/providers/NetworkContextProvider"
import { mintGoldTokens } from "@/services/tokenService"

// Default claim amount adjusted for 1M total supply
const DEFAULT_CLAIM_AMOUNT = 100 // 0.01% of total supply

// Cooldown period in seconds
const CLAIM_COOLDOWN = 300 // 5 minutes

export function useFaucet() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const { network } = useNetwork()
  const [isLoading, setIsLoading] = useState(false)
  const [lastClaimTime, setLastClaimTime] = useLocalStorage<number>("lastClaimTime", 0)
  const [claimAmount, setClaimAmount] = useState(DEFAULT_CLAIM_AMOUNT)

  // Calculate time until next claim
  const calculateTimeUntilNextClaim = useCallback(() => {
    if (!lastClaimTime) return 0
    const now = Date.now()
    const timeSinceClaim = Math.floor((now - lastClaimTime) / 1000)
    return Math.max(0, CLAIM_COOLDOWN - timeSinceClaim)
  }, [lastClaimTime])

  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState(calculateTimeUntilNextClaim())
  const [canClaim, setCanClaim] = useState(timeUntilNextClaim === 0)

  // Update time until next claim
  useEffect(() => {
    if (!connected || !publicKey) {
      setCanClaim(false)
      return
    }

    const updateTimeRemaining = () => {
      const timeRemaining = calculateTimeUntilNextClaim()
      setTimeUntilNextClaim(timeRemaining)
      setCanClaim(timeRemaining === 0)
    }

    // Initial update
    updateTimeRemaining()

    // Set up interval to update time remaining
    const interval = setInterval(updateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [connected, publicKey, lastClaimTime, calculateTimeUntilNextClaim])

  // Adjust claim amount based on network
  useEffect(() => {
    // For testnet, we use a smaller amount to prevent excessive token distribution
    if (network === "testnet") {
      setClaimAmount(100) // 0.01% of total supply
    } else if (network === "devnet") {
      setClaimAmount(1000) // 0.1% of total supply for testing
    } else {
      setClaimAmount(10) // 0.001% of total supply for mainnet
    }
  }, [network])

  // Claim GOLD tokens
  const claimGold = useCallback(async () => {
    if (!connected || !publicKey || !canClaim) {
      return false
    }

    setIsLoading(true)

    try {
      // Mint tokens to the user's wallet
      await mintGoldTokens(connection, { publicKey, connected } as any, claimAmount, network)

      // Update last claim time
      const now = Date.now()
      setLastClaimTime(now)
      setCanClaim(false)
      setTimeUntilNextClaim(CLAIM_COOLDOWN)

      return true
    } catch (error) {
      console.error("Error claiming GOLD tokens:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [connected, publicKey, canClaim, connection, claimAmount, network, setLastClaimTime])

  return {
    claimGold,
    canClaim,
    timeUntilNextClaim,
    isLoading,
    claimAmount,
  }
}
