"use client"

import { useState, useEffect, useCallback } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"

export function useWalletBalance(mintAddress: string) {
  const { connection } = useConnection()
  const { publicKey, connected } = useWallet()
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connected) {
      setBalance(null)
      return
    }

    setIsLoading(true)

    try {
      // SOL is a special case
      if (mintAddress === "So11111111111111111111111111111111111111112") {
        const solBalance = await connection.getBalance(publicKey)
        setBalance(solBalance / LAMPORTS_PER_SOL)
      } else {
        // For SPL tokens
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        })

        const tokenAccount = tokenAccounts.value.find(
          (account) => account.account.data.parsed.info.mint === mintAddress,
        )

        if (tokenAccount) {
          const tokenBalance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount
          setBalance(tokenBalance)
        } else {
          // No token account found for this mint
          setBalance(0)
        }
      }
    } catch (error) {
      console.error("Error fetching balance:", error)
      setBalance(null)
    } finally {
      setIsLoading(false)
    }
  }, [publicKey, connected, connection, mintAddress])

  useEffect(() => {
    fetchBalance()

    // Set up interval to refresh balance
    const intervalId = setInterval(fetchBalance, 30000) // every 30 seconds

    return () => {
      clearInterval(intervalId)
    }
  }, [publicKey, connected, fetchBalance])

  return { balance, isLoading, refetch: fetchBalance }
}
