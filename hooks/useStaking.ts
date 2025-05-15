"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useNetwork } from "@/components/providers/NetworkContextProvider"

// Adjusted for 1M total supply
const REWARD_RATE = 0.15 // 15% APY
const REWARD_INTERVAL = 86400 // 1 day in seconds
const MIN_STAKE_DURATION = 604800 // 7 days in seconds

export function useStaking() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const { network } = useNetwork()

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
      // In a real implementation, we would fetch this data from the blockchain
      // For this demo, we'll simulate it with mock data

      // Get staked amount from localStorage for demo purposes
      const storedStakedAmount = localStorage.getItem(`${publicKey.toString()}_stakedAmount`)
      const storedStakeStartTime = localStorage.getItem(`${publicKey.toString()}_stakeStartTime`)

      const staked = storedStakedAmount ? Number.parseFloat(storedStakedAmount) : 0
      const startTime = storedStakeStartTime ? Number.parseInt(storedStakeStartTime) : 0

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
    } finally {
      setIsLoading(false)
    }
  }, [connected, publicKey, network, calculatePendingRewards])

  // Stake tokens
  const stakeTokens = useCallback(
    async (amount: number) => {
      if (!connected || !publicKey || amount <= 0) {
        throw new Error("Cannot stake tokens")
      }

      setIsStaking(true)

      try {
        // In a real implementation, we would send a transaction to the blockchain
        // For this demo, we'll simulate it with localStorage

        // Get current staked amount
        const storedStakedAmount = localStorage.getItem(`${publicKey.toString()}_stakedAmount`)
        const currentStakedAmount = storedStakedAmount ? Number.parseFloat(storedStakedAmount) : 0

        // Update staked amount
        const newStakedAmount = currentStakedAmount + amount
        localStorage.setItem(`${publicKey.toString()}_stakedAmount`, newStakedAmount.toString())

        // Set stake start time if this is the first stake
        if (currentStakedAmount <= 0) {
          const now = Math.floor(Date.now() / 1000)
          localStorage.setItem(`${publicKey.toString()}_stakeStartTime`, now.toString())
        }

        // Refresh staking data
        await refreshStakingData()

        return true
      } catch (error) {
        console.error("Error staking tokens:", error)
        throw error
      } finally {
        setIsStaking(false)
      }
    },
    [connected, publicKey, refreshStakingData],
  )

  // Unstake tokens
  const unstakeTokens = useCallback(
    async (amount: number) => {
      if (!connected || !publicKey || amount <= 0 || amount > stakedAmount) {
        throw new Error("Cannot unstake tokens")
      }

      // Check if minimum stake duration has passed
      if (timeRemaining > 0) {
        throw new Error(`Cannot unstake yet. ${formattedTimeRemaining()} remaining.`)
      }

      setIsUnstaking(true)

      try {
        // In a real implementation, we would send a transaction to the blockchain
        // For this demo, we'll simulate it with localStorage

        // Get current staked amount
        const storedStakedAmount = localStorage.getItem(`${publicKey.toString()}_stakedAmount`)
        const currentStakedAmount = storedStakedAmount ? Number.parseFloat(storedStakedAmount) : 0

        // Update staked amount
        const newStakedAmount = Math.max(0, currentStakedAmount - amount)
        localStorage.setItem(`${publicKey.toString()}_stakedAmount`, newStakedAmount.toString())

        // Reset stake start time if all tokens are unstaked
        if (newStakedAmount <= 0) {
          localStorage.removeItem(`${publicKey.toString()}_stakeStartTime`)
        }

        // Refresh staking data
        await refreshStakingData()

        return true
      } catch (error) {
        console.error("Error unstaking tokens:", error)
        throw error
      } finally {
        setIsUnstaking(false)
      }
    },
    [connected, publicKey, stakedAmount, timeRemaining, formattedTimeRemaining, refreshStakingData],
  )

  // Claim rewards
  const claimRewards = useCallback(async () => {
    if (!connected || !publicKey || pendingRewards <= 0) {
      throw new Error("No rewards to claim")
    }

    setIsClaimingRewards(true)

    try {
      // In a real implementation, we would send a transaction to the blockchain
      // For this demo, we'll simulate it with a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Reset pending rewards
      setPendingRewards(0)

      // Update stake start time to now for future reward calculations
      const now = Math.floor(Date.now() / 1000)
      localStorage.setItem(`${publicKey.toString()}_stakeStartTime`, now.toString())

      return true
    } catch (error) {
      console.error("Error claiming rewards:", error)
      throw error
    } finally {
      setIsClaimingRewards(false)
    }
  }, [connected, publicKey, pendingRewards])

  // Initial load
  useEffect(() => {
    refreshStakingData()
  }, [refreshStakingData])

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
