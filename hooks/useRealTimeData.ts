"use client"

import { useState, useEffect, useCallback } from "react"
import { useConnection } from "@solana/wallet-adapter-react"
import { GOLD_TOKEN } from "@/constants/tokens"

interface TokenPrice {
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  lastUpdated: number
}

interface StakingStats {
  totalStaked: number
  apy: number
  totalStakers: number
  lastUpdated: number
}

interface PoolStats {
  tvl: number
  volume24h: number
  fees24h: number
  lastUpdated: number
}

export function useRealTimeData() {
  const { connection } = useConnection()
  const [goldPrice, setGoldPrice] = useState<TokenPrice | null>(null)
  const [stakingStats, setStakingStats] = useState<StakingStats | null>(null)
  const [poolStats, setPoolStats] = useState<PoolStats | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGoldPrice = useCallback(async () => {
    try {
      // In a real implementation, this would fetch from a price oracle like Pyth
      // For now, we'll simulate with a fetch from our API
      const response = await fetch("/api/token-price?mint=" + GOLD_TOKEN.mint)
      if (!response.ok) throw new Error("Failed to fetch price data")

      const data = await response.json()
      setGoldPrice({
        price: data.price,
        change24h: data.change24h,
        volume24h: data.volume24h,
        marketCap: data.marketCap,
        lastUpdated: Date.now(),
      })
    } catch (err) {
      console.error("Error fetching GOLD price:", err)
      setError("Failed to fetch price data")
    }
  }, [])

  const fetchStakingStats = useCallback(async () => {
    try {
      // In a real implementation, this would fetch from the staking program
      // For now, we'll simulate with a fetch from our API
      const response = await fetch("/api/staking-stats")
      if (!response.ok) throw new Error("Failed to fetch staking stats")

      const data = await response.json()
      setStakingStats({
        totalStaked: data.totalStaked,
        apy: data.apy,
        totalStakers: data.totalStakers,
        lastUpdated: Date.now(),
      })
    } catch (err) {
      console.error("Error fetching staking stats:", err)
      setError("Failed to fetch staking stats")
    }
  }, [])

  const fetchPoolStats = useCallback(async () => {
    try {
      // In a real implementation, this would fetch from DEX APIs
      // For now, we'll simulate with a fetch from our API
      const response = await fetch("/api/liquidity-pools?mint=" + GOLD_TOKEN.mint)
      if (!response.ok) throw new Error("Failed to fetch pool stats")

      const data = await response.json()
      setPoolStats({
        tvl: data.tvl,
        volume24h: data.volume24h,
        fees24h: data.fees24h,
        lastUpdated: Date.now(),
      })
    } catch (err) {
      console.error("Error fetching pool stats:", err)
      setError("Failed to fetch pool stats")
    }
  }, [])

  const fetchAllData = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([fetchGoldPrice(), fetchStakingStats(), fetchPoolStats()])
    setIsLoading(false)
  }, [fetchGoldPrice, fetchStakingStats, fetchPoolStats])

  // Initial fetch
  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Set up polling for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllData()
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [fetchAllData])

  return {
    goldPrice,
    stakingStats,
    poolStats,
    isLoading,
    error,
    refreshData: fetchAllData,
  }
}
