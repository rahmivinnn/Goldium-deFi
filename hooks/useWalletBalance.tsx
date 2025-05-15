"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { GOLD_TOKEN } from "@/constants/tokens"

export interface TokenBalance {
  mint: string
  symbol: string
  balance: number
  uiBalance: string
  decimals: number
}

export function useWalletBalance() {
  const { connection } = useConnection()
  const { publicKey, connected } = useWallet()
  const [solBalance, setSolBalance] = useState<number>(0)
  const [goldBalance, setGoldBalance] = useState<number>(0)
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Use a ref to track if the component is mounted
  const isMounted = useRef(true)

  // Clean up function to prevent memory leaks and state updates after unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  const fetchSolBalance = useCallback(async () => {
    if (!publicKey || !connected) return

    try {
      const balance = await connection.getBalance(publicKey)
      // Only update state if component is still mounted
      if (isMounted.current) {
        setSolBalance(balance / LAMPORTS_PER_SOL)
      }
    } catch (err) {
      console.error("Error fetching SOL balance:", err)
      if (isMounted.current) {
        setError("Failed to fetch SOL balance")
      }
    }
  }, [connection, publicKey, connected])

  const fetchTokenBalances = useCallback(async () => {
    if (!publicKey || !connected) return

    try {
      if (isMounted.current) {
        setIsLoading(true)
      }

      // Get all token accounts for this wallet
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID })

      // Process all balances first without setting state
      let goldBalanceValue = 0
      const balances: TokenBalance[] = tokenAccounts.value.map((account) => {
        const parsedInfo = account.account.data.parsed.info
        const mintAddress = parsedInfo.mint
        const balance = parsedInfo.tokenAmount.amount
        const decimals = parsedInfo.tokenAmount.decimals
        const uiBalance = (balance / Math.pow(10, decimals)).toFixed(decimals)

        // Check if this is the GOLD token, but don't set state yet
        if (mintAddress === GOLD_TOKEN.mint) {
          goldBalanceValue = Number.parseFloat(uiBalance)
        }

        return {
          mint: mintAddress,
          symbol: mintAddress === GOLD_TOKEN.mint ? "GOLD" : mintAddress,
          balance: Number.parseFloat(balance),
          uiBalance,
          decimals,
        }
      })

      // Only update state if component is still mounted
      if (isMounted.current) {
        setTokenBalances(balances)
        setGoldBalance(goldBalanceValue)
        setError(null)
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Error fetching token balances:", err)
      if (isMounted.current) {
        setError("Failed to fetch token balances")
        setIsLoading(false)
      }
    }
  }, [connection, publicKey, connected])

  const fetchAllBalances = useCallback(async () => {
    if (!publicKey || !connected) return

    if (isMounted.current) {
      setIsLoading(true)
    }

    try {
      await Promise.all([fetchSolBalance(), fetchTokenBalances()])
    } catch (error) {
      console.error("Error fetching balances:", error)
    }

    if (isMounted.current) {
      setIsLoading(false)
    }
  }, [fetchSolBalance, fetchTokenBalances, publicKey, connected])

  // Initial fetch - use a ref to ensure it only runs once per connection change
  const initialFetchRef = useRef(false)

  useEffect(() => {
    if (publicKey && connected && !initialFetchRef.current) {
      initialFetchRef.current = true
      fetchAllBalances()
    } else if (!connected) {
      // Reset balances when wallet disconnects
      initialFetchRef.current = false
      if (isMounted.current) {
        setSolBalance(0)
        setGoldBalance(0)
        setTokenBalances([])
      }
    }

    // Clean up function
    return () => {
      initialFetchRef.current = false
    }
  }, [publicKey, connected, fetchAllBalances])

  // Set up polling for real-time updates with proper cleanup
  useEffect(() => {
    if (!publicKey || !connected) return

    // Use a ref to track the current interval
    let isActive = true

    const interval = setInterval(() => {
      if (isActive && isMounted.current) {
        fetchAllBalances()
      }
    }, 10000) // Update every 10 seconds

    return () => {
      isActive = false
      clearInterval(interval)
    }
  }, [publicKey, connected, fetchAllBalances])

  // Function to get balance for a specific token
  const getTokenBalance = useCallback(
    (mintAddress: string): TokenBalance | undefined => {
      return tokenBalances.find((token) => token.mint === mintAddress)
    },
    [tokenBalances],
  )

  return {
    solBalance,
    goldBalance,
    tokenBalances,
    isLoading,
    error,
    refreshBalances: fetchAllBalances,
    getTokenBalance,
  }
}
