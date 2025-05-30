"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useNetwork } from "@/components/providers/NetworkContextProvider"
import { useToast } from "@/components/ui/use-toast"
import { useWalletBalance } from "./useWalletBalance"

// Constants
const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export function useFaucet() {
  const { publicKey, connected } = useWallet()
  const { network } = useNetwork()
  const { toast } = useToast()
  const { refreshBalances } = useWalletBalance()

  const [isLoading, setIsLoading] = useState(false)
  const [canClaim, setCanClaim] = useState(false)
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState(0)
  const [lastClaimTime, setLastClaimTime] = useState<number | null>(null)

  // Get airdrop amount based on network
  const getAirdropAmount = useCallback(() => {
    if (network === "mainnet-beta") return 10
    if (network === "testnet") return 50
    return 100 // devnet
  }, [network])

  // Check if user can claim
  const checkCanClaim = useCallback(() => {
    if (!connected || !publicKey) {
      setCanClaim(false)
      setTimeUntilNextClaim(0)
      return
    }

    // Get last claim time from localStorage
    const storedLastClaimTime = localStorage.getItem(`${publicKey.toString()}_lastClaimTime`)

    if (!storedLastClaimTime) {
      setCanClaim(true)
      setTimeUntilNextClaim(0)
      setLastClaimTime(null)
      return
    }

    const lastClaim = Number(storedLastClaimTime)
    setLastClaimTime(lastClaim)

    const now = Date.now()
    const timeSinceLastClaim = now - lastClaim

    if (timeSinceLastClaim >= COOLDOWN_PERIOD) {
      setCanClaim(true)
      setTimeUntilNextClaim(0)
    } else {
      setCanClaim(false)
      setTimeUntilNextClaim(COOLDOWN_PERIOD - timeSinceLastClaim)
    }
  }, [connected, publicKey])

  // Claim GOLD tokens
  const claimGold = useCallback(async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Error",
        description: "Wallet not connected",
        variant: "destructive",
      })
      return false
    }

    if (!canClaim) {
      toast({
        title: "Error",
        description: "You cannot claim tokens yet",
        variant: "destructive",
      })
      return false
    }

    setIsLoading(true)

    try {
      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Get airdrop amount
      const amount = getAirdropAmount()

      // Update GOLD balance
      const currentGoldBalance = localStorage.getItem(`${publicKey.toString()}_goldBalance`) || "0"
      const newGoldBalance = Number(currentGoldBalance) + amount
      localStorage.setItem(`${publicKey.toString()}_goldBalance`, newGoldBalance.toString())

      // Update last claim time
      const now = Date.now()
      localStorage.setItem(`${publicKey.toString()}_lastClaimTime`, now.toString())
      setLastClaimTime(now)
      setCanClaim(false)
      setTimeUntilNextClaim(COOLDOWN_PERIOD)

      // Refresh balances
      refreshBalances()

      toast({
        title: "Success",
        description: `Successfully claimed ${amount} GOLD tokens`,
      })

      return true
    } catch (error: any) {
      console.error("Error claiming tokens:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to claim tokens",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [connected, publicKey, canClaim, getAirdropAmount, toast, refreshBalances])

  // Initial check
  useEffect(() => {
    checkCanClaim()
  }, [checkCanClaim])

  // Set up interval to update time until next claim
  useEffect(() => {
    if (!canClaim && timeUntilNextClaim > 0) {
      const intervalId = setInterval(() => {
        setTimeUntilNextClaim((prev) => {
          const newTime = Math.max(0, prev - 1000)
          if (newTime === 0) {
            setCanClaim(true)
            clearInterval(intervalId)
          }
          return newTime
        })
      }, 1000)

      return () => clearInterval(intervalId)
    }
  }, [canClaim, timeUntilNextClaim])

  return {
    isLoading,
    canClaim,
    timeUntilNextClaim,
    claimGold,
    airdropAmount: getAirdropAmount(),
  }
}
