"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useNetwork } from "@/components/providers/NetworkContextProvider"
import { useToast } from "@/components/ui/use-toast"
import { useWalletBalance } from "./useWalletBalance"
import { GOLD_TOKEN } from "@/constants/tokens"

// Adjusted for 1M total supply
const REWARD_RATE = 0.15 // 15% APY
const REWARD_INTERVAL = 86400 // 1 day in seconds
const MIN_STAKE_DURATION = 604800 // 7 days in seconds

export function useStaking() {
  const { publicKey, connected } = useWallet()
  const { network } = useNetwork()
  const { toast } = useToast()
  const { refreshBalances, balances } = useWalletBalance()

  const [stakedAmount, setStakedAmount] = useState(0)
  const [pendingRewards, setPendingRewards] = useState(0)
  const [stakeStartTime, setStakeStartTime] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [apy, setApy] = useState(REWARD_RATE * 100)

  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)
  const [isClaimingRewards, setIsClaimingRewards] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Format time remaining
  const formattedTimeRemaining = useCallback(() => {
    if (timeRemaining <= 0) return "Ready to unstake"

    const days = Math.floor(timeRemaining / 86400)
    const hours = Math.floor((timeRemaining % 86400) / 3600)
    const minutes = Math.floor((timeRemaining % 3600) / 60)

    return `${days}d ${hours}h ${minutes}m`
  }, [timeRemaining])

  // Calculate pending rewards
  const calculatePendingRewards = useCallback(() => {
    if (stakedAmount <= 0 || stakeStartTime <= 0) return 0

    const now = Math.floor(Date.now() / 1000)
    const stakeDuration = now - stakeStartTime

    // Calculate rewards based on staked amount, duration, and APY
    // For 1M total supply, we adjust the reward calculation
    const dailyRewardRate = REWARD_RATE / 365
    const daysStaked = stakeDuration / 86400

    return stakedAmount * dailyRewardRate * daysStaked
  }, [stakedAmount, stakeStartTime])

  // Refresh staking data
  const refreshStakingData = useCallback(async () => {
    if (!connected || !publicKey) {
      setStakedAmount(0)
      setPendingRewards(0)
      setStakeStartTime(0)
      setTimeRemaining(0)
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      // Get staked amount from localStorage
      const storedStakedAmount = localStorage.getItem(`${publicKey.toString()}_stakedAmount`)
      const storedStakeStartTime = localStorage.getItem(`${publicKey.toString()}_stakeStartTime`)

      const staked = storedStakedAmount ? Number(storedStakedAmount) : 0
      const startTime = storedStakeStartTime ? Number(storedStakeStartTime) : 0

      setStakedAmount(staked)
      setStakeStartTime(startTime)

      // Calculate pending rewards
      if (staked > 0 && startTime > 0) {
        const rewards = calculatePendingRewards()
        setPendingRewards(rewards)

        // Calculate time remaining until unstake is available
        const now = Math.floor(Date.now() / 1000)
        const unlockTime = startTime + MIN_STAKE_DURATION
        const remaining = Math.max(0, unlockTime - now)

        setTimeRemaining(remaining)
      } else {
        setPendingRewards(0)
        setTimeRemaining(0)
      }

      // Set APY based on network
      if (network === "testnet") {
        setApy(15) // 15% APY on testnet
      } else if (network === "devnet") {
        setApy(20) // 20% APY on devnet for testing
      } else {
        setApy(12) // 12% APY on mainnet
      }
    } catch (error) {
      console.error("Error refreshing staking data:", error)
      toast({
        title: "Error",
        description: "Failed to refresh staking data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [connected, publicKey, network, calculatePendingRewards, toast])

  // Stake tokens
  const stakeTokens = useCallback(
    async (amount: number) => {
      if (!connected || !publicKey || amount <= 0) {
        toast({
          title: "Error",
          description: "Cannot stake tokens. Please connect your wallet and enter a valid amount.",
          variant: "destructive",
        })
        return false
      }

      // Check if user has enough GOLD
      const goldBalance = balances[GOLD_TOKEN.symbol] || 0
      if (goldBalance < amount) {
        toast({
          title: "Error",
          description: "Insufficient GOLD balance",
          variant: "destructive",
        })
        return false
      }

      setIsStaking(true)

      try {
        // Simulate transaction delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Get current staked amount
        const storedStakedAmount = localStorage.getItem(`${publicKey.toString()}_stakedAmount`)
        const currentStakedAmount = storedStakedAmount ? Number(storedStakedAmount) : 0

        // Update staked amount
        const newStakedAmount = currentStakedAmount + amount
        localStorage.setItem(`${publicKey.toString()}_stakedAmount`, newStakedAmount.toString())

        // Update GOLD balance
        const currentGoldBalance = localStorage.getItem(`${publicKey.toString()}_goldBalance`) || "0"
        const newGoldBalance = Math.max(0, Number(currentGoldBalance) - amount)
        localStorage.setItem(`${publicKey.toString()}_goldBalance`, newGoldBalance.toString())

        // Set stake start time if this is the first stake
        if (currentStakedAmount <= 0) {
          const now = Math.floor(Date.now() / 1000)
          localStorage.setItem(`${publicKey.toString()}_stakeStartTime`, now.toString())
        }

        // Refresh balances
        refreshBalances()

        // Refresh staking data
        await refreshStakingData()

        toast({
          title: "Success",
          description: `Successfully staked ${amount} GOLD`,
        })

        return true
      } catch (error: any) {
        console.error("Error staking tokens:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to stake tokens",
          variant: "destructive",
        })
        return false
      } finally {
        setIsStaking(false)
      }
    },
    [connected, publicKey, refreshStakingData, toast, refreshBalances, balances],
  )

  // Unstake tokens
  const unstakeTokens = useCallback(
    async (amount: number) => {
      if (!connected || !publicKey || amount <= 0 || amount > stakedAmount) {
        toast({
          title: "Error",
          description: "Cannot unstake tokens. Please check your staked balance.",
          variant: "destructive",
        })
        return false
      }

      // Check if minimum stake duration has passed
      if (timeRemaining > 0) {
        toast({
          title: "Error",
          description: `Cannot unstake yet. ${formattedTimeRemaining()} remaining.`,
          variant: "destructive",
        })
        return false
      }

      setIsUnstaking(true)

      try {
        // Simulate transaction delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Get current staked amount
        const storedStakedAmount = localStorage.getItem(`${publicKey.toString()}_stakedAmount`)
        const currentStakedAmount = storedStakedAmount ? Number(storedStakedAmount) : 0

        // Update staked amount
        const newStakedAmount = Math.max(0, currentStakedAmount - amount)
        localStorage.setItem(`${publicKey.toString()}_stakedAmount`, newStakedAmount.toString())

        // Update GOLD balance
        const currentGoldBalance = localStorage.getItem(`${publicKey.toString()}_goldBalance`) || "0"
        const newGoldBalance = Number(currentGoldBalance) + amount
        localStorage.setItem(`${publicKey.toString()}_goldBalance`, newGoldBalance.toString())

        // Reset stake start time if all tokens are unstaked
        if (newStakedAmount <= 0) {
          localStorage.removeItem(`${publicKey.toString()}_stakeStartTime`)
        }

        // Refresh balances
        refreshBalances()

        // Refresh staking data
        await refreshStakingData()

        toast({
          title: "Success",
          description: `Successfully unstaked ${amount} GOLD`,
        })

        return true
      } catch (error: any) {
        console.error("Error unstaking tokens:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to unstake tokens",
          variant: "destructive",
        })
        return false
      } finally {
        setIsUnstaking(false)
      }
    },
    [
      connected,
      publicKey,
      stakedAmount,
      timeRemaining,
      formattedTimeRemaining,
      refreshStakingData,
      toast,
      refreshBalances,
    ],
  )

  // Claim rewards
  const claimRewards = useCallback(async () => {
    if (!connected || !publicKey || pendingRewards <= 0) {
      toast({
        title: "Error",
        description: "No rewards to claim",
        variant: "destructive",
      })
      return false
    }

    setIsClaimingRewards(true)

    try {
      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update GOLD balance with rewards
      const currentGoldBalance = localStorage.getItem(`${publicKey.toString()}_goldBalance`) || "0"
      const newGoldBalance = Number(currentGoldBalance) + pendingRewards
      localStorage.setItem(`${publicKey.toString()}_goldBalance`, newGoldBalance.toString())

      // Update stake start time to now for future reward calculations
      const now = Math.floor(Date.now() / 1000)
      localStorage.setItem(`${publicKey.toString()}_stakeStartTime`, now.toString())

      // Reset pending rewards
      const claimedAmount = pendingRewards
      setPendingRewards(0)

      // Refresh balances
      refreshBalances()

      toast({
        title: "Success",
        description: `Successfully claimed ${claimedAmount.toFixed(4)} GOLD rewards`,
      })

      return true
    } catch (error: any) {
      console.error("Error claiming rewards:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to claim rewards",
        variant: "destructive",
      })
      return false
    } finally {
      setIsClaimingRewards(false)
    }
  }, [connected, publicKey, pendingRewards, toast, refreshBalances])

  // Initial load
  useEffect(() => {
    refreshStakingData()

    // Initialize localStorage if needed for testing
    if (connected && publicKey && typeof window !== "undefined") {
      if (!localStorage.getItem(`${publicKey.toString()}_goldBalance`)) {
        localStorage.setItem(`${publicKey.toString()}_goldBalance`, "1000")
      }
    }
  }, [refreshStakingData, connected, publicKey])

  // Set up interval to refresh data
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (connected && publicKey) {
        // Update pending rewards calculation
        const rewards = calculatePendingRewards()
        setPendingRewards(rewards)

        // Update time remaining
        if (stakeStartTime > 0) {
          const now = Math.floor(Date.now() / 1000)
          const unlockTime = stakeStartTime + MIN_STAKE_DURATION
          const remaining = Math.max(0, unlockTime - now)

          setTimeRemaining(remaining)
        }
      }
    }, 5000)

    return () => clearInterval(intervalId)
  }, [connected, publicKey, calculatePendingRewards, stakeStartTime])

  return {
    stakedAmount,
    pendingRewards,
    apy,
    timeRemaining,
    isStaking,
    isUnstaking,
    isClaimingRewards,
    isLoading,
    stakeTokens,
    unstakeTokens,
    claimRewards,
    refreshStakingData,
    formattedTimeRemaining,
  }
}
