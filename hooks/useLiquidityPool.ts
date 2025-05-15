"use client"

import { useState, useEffect, useCallback } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, SystemProgram, Transaction, TransactionInstruction, VersionedTransaction, TransactionMessage } from "@solana/web3.js"
import { useTransaction } from "./useTransaction"
import { useNetwork } from "@/components/NetworkContextProvider"
import { getProgramId } from "@/constants/tokens"
import { BN } from "bn.js"
import { toast } from "@/components/ui/use-toast"

interface PoolData {
  tvl: number
  volume24h: number
  fees24h: number
  apy: number
  tokenAReserve: number
  tokenBReserve: number
  network?: string
  lastUpdated?: number
}

interface UserPoolShare {
  lpTokens: number
  percentage: number
  value: number
  earnedFees: number
}

interface PoolState {
  isLoading: boolean
  userLpBalance: number
  poolShare: number
  totalValueLocked: number
  earnedFees: number
  isAddingLiquidity: boolean
  isRemovingLiquidity: boolean
  isClaimingFees: boolean
}

export function useLiquidityPool(tokenMint: string) {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const { network } = useNetwork()
  const { sendTransaction, isPending } = useTransaction(connection)
  const { sendAndConfirmTransaction, isProcessing } = useTransaction()

  const [poolData, setPoolData] = useState<PoolData | null>(null)
  const [userPoolShare, setUserPoolShare] = useState<UserPoolShare | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Get the DEX program ID for the current network
  const dexProgramId = useCallback(() => {
    return new PublicKey(getProgramId("DEX", network))
  }, [network])

  const [state, setState] = useState<PoolState>({
    isLoading: true,
    userLpBalance: 0,
    poolShare: 0,
    totalValueLocked: 0,
    earnedFees: 0,
    isAddingLiquidity: false,
    isRemovingLiquidity: false,
    isClaimingFees: false
  })

  // Function to fetch pool data
  const fetchPoolData = useCallback(async () => {
    if (!tokenMint) return

    try {
      setIsLoading(true)
      setState((prev) => ({ ...prev, isLoading: true }))

      // In a real implementation, this would fetch the pool data from the DEX
      // For now, we'll simulate with a fetch from our API that includes network information
      const response = await fetch(`/api/liquidity-pools?mint=${tokenMint}&network=${network}`)
      if (!response.ok) throw new Error(`Failed to fetch pool data on ${network}`)

      const data = await response.json()

      setPoolData({
        tvl: data.tvl || 0,
        volume24h: data.volume24h || 0,
        fees24h: data.fees24h || 0,
        apy: data.apy || 0,
        tokenAReserve: data.tokenAReserve || 0,
        tokenBReserve: data.tokenBReserve || 0,
        network: network,
        lastUpdated: Date.now()
      })

      // If wallet is connected, fetch user's pool share
      if (publicKey) {
        const userResponse = await fetch(
          `/api/liquidity-pools/user?mint=${tokenMint}&wallet=${publicKey.toString()}&network=${network}`
        )
        if (userResponse.ok) {
          const userData = await userResponse.json()

          setUserPoolShare({
            lpTokens: userData.lpTokens || 0,
            percentage: userData.percentage || 0,
            value: userData.value || 0,
            earnedFees: userData.earnedFees || 0,
          })
        }
      }

      setError(null)

      // Generate network-specific mock data for demonstration
      // In a real implementation, this would come from the API response
      const mockMultiplier = network === "mainnet-beta" ? 10 : network === "testnet" ? 2 : 1
      const mockData = {
        userLpBalance: 10.5 * mockMultiplier,
        poolShare: 0.02 * mockMultiplier, // 2%
        totalValueLocked: 500000 * mockMultiplier,
        earnedFees: 25.75 * mockMultiplier,
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        userLpBalance: mockData.userLpBalance,
        poolShare: mockData.poolShare,
        totalValueLocked: mockData.totalValueLocked,
        earnedFees: mockData.earnedFees,
      }))
    } catch (error) {
      console.error(`Error fetching pool data on ${network}:`, error)
      setError(`Failed to fetch pool data on ${network}`)
      setState((prev) => ({ ...prev, isLoading: false }))
      toast({
        title: "Error",
        description: `Failed to fetch liquidity pool data on ${network}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [tokenMint, publicKey, network])

  // Initial fetch and polling - update when network changes
  useEffect(() => {
    // Fetch immediately when network changes
    fetchPoolData()

    const interval = setInterval(() => {
      fetchPoolData()
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [fetchPoolData, network])

  // Add liquidity
  const addLiquidity = useCallback(
    async (amount: number) => {
      if (!publicKey || !tokenMint) return null

      try {
        setState((prev) => ({ ...prev, isAddingLiquidity: true }))

        // Convert amount to lamports
        const amountLamports = new BN(amount * 1e9)

        // Get the current network's DEX program ID
        const programId = dexProgramId()

        // Create a transaction to call the DEX program
        const instruction = new TransactionInstruction({
          keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: new PublicKey(tokenMint), isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          programId,
          data: Buffer.from([1, ...amountLamports.toArray("le", 8)]), // Instruction to add liquidity
        })

        // Use versioned transactions on mainnet for better performance
        let transaction

        if (network === "mainnet-beta") {
          // Create a versioned transaction (v0)
          const { blockhash } = await connection.getLatestBlockhash()
          const messageV0 = new TransactionMessage({
            payerKey: publicKey,
            recentBlockhash: blockhash,
            instructions: [instruction]
          }).compileToV0Message()

          transaction = new VersionedTransaction(messageV0)
        } else {
          // Use legacy transaction for devnet/testnet
          transaction = new Transaction().add(instruction)
        }

        const signature = await sendAndConfirmTransaction(transaction, {
          onSuccess: () => {
            // Update pool data after successful operation
            fetchPoolData()
            toast({
              title: "Liquidity Added",
              description: `Successfully added liquidity on ${network}`,
              variant: "default",
            })
          },
        })

        setState((prev) => ({ ...prev, isAddingLiquidity: false }))
        return signature
      } catch (error) {
        console.error(`Error adding liquidity on ${network}:`, error)
        setState((prev) => ({ ...prev, isAddingLiquidity: false }))
        toast({
          title: "Error",
          description: `Failed to add liquidity on ${network}: ${error.message}`,
          variant: "destructive",
        })
        throw error
      }
    },
    [publicKey, tokenMint, sendAndConfirmTransaction, fetchPoolData, network, connection, dexProgramId],
  )

  // Function to add liquidity
  const addLiquidityOld = useCallback(
    async (tokenAAmount: number, tokenBAmount: number) => {
      if (!publicKey) return null

      try {
        setState((prev) => ({ ...prev, isAddingLiquidity: true }))

        // Create a transaction to add liquidity
        // This is a simplified version. In a real implementation, you would use the actual pool program
        const transaction = new Transaction()
        // Add instructions to add liquidity

        // Send the transaction
        const signature = await sendTransaction(transaction, {
          onSuccess: () => {
            toast({
              title: "Liquidity Added",
              description: "You have successfully added liquidity to the pool.",
            })
            fetchPoolData() // Refresh pool data
          },
        })

        setState((prev) => ({ ...prev, isAddingLiquidity: false }))
        return signature
      } catch (error) {
        console.error("Error adding liquidity:", error)
        setState((prev) => ({ ...prev, isAddingLiquidity: false }))
        return null
      }
    },
    [publicKey, sendTransaction, fetchPoolData],
  )

  // Remove liquidity
  const removeLiquidity = useCallback(
    async (amount: number) => {
      if (!publicKey || !tokenMint) return null

      try {
        setState((prev) => ({ ...prev, isRemovingLiquidity: true }))

        // Convert amount to lamports
        const amountLamports = new BN(amount * 1e9)

        // Get the current network's DEX program ID
        const programId = dexProgramId()

        // Create a transaction to call the DEX program
        const instruction = new TransactionInstruction({
          keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: new PublicKey(tokenMint), isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          programId,
          data: Buffer.from([2, ...amountLamports.toArray("le", 8)]), // Instruction to remove liquidity
        })

        // Use versioned transactions on mainnet for better performance
        let transaction

        if (network === "mainnet-beta") {
          // Create a versioned transaction (v0)
          const { blockhash } = await connection.getLatestBlockhash()
          const messageV0 = new TransactionMessage({
            payerKey: publicKey,
            recentBlockhash: blockhash,
            instructions: [instruction]
          }).compileToV0Message()

          transaction = new VersionedTransaction(messageV0)
        } else {
          // Use legacy transaction for devnet/testnet
          transaction = new Transaction().add(instruction)
        }

        const signature = await sendAndConfirmTransaction(transaction, {
          onSuccess: () => {
            // Update pool data after successful operation
            fetchPoolData()
            toast({
              title: "Liquidity Removed",
              description: `Successfully removed liquidity on ${network}`,
              variant: "default",
            })
          },
        })

        setState((prev) => ({ ...prev, isRemovingLiquidity: false }))
        return signature
      } catch (error) {
        console.error(`Error removing liquidity on ${network}:`, error)
        setState((prev) => ({ ...prev, isRemovingLiquidity: false }))
        toast({
          title: "Error",
          description: `Failed to remove liquidity on ${network}: ${error.message}`,
          variant: "destructive",
        })
        throw error
      }
    },
    [publicKey, tokenMint, sendAndConfirmTransaction, fetchPoolData, network, connection, dexProgramId],
  )

  // Function to remove liquidity
  const removeLiquidityOld = useCallback(
    async (lpAmount: number) => {
      if (!publicKey) return null

      try {
        setState((prev) => ({ ...prev, isRemovingLiquidity: true }))

        // Create a transaction to remove liquidity
        // This is a simplified version. In a real implementation, you would use the actual pool program
        const transaction = new Transaction()
        // Add instructions to remove liquidity

        // Send the transaction
        const signature = await sendTransaction(transaction, {
          onSuccess: () => {
            toast({
              title: "Liquidity Removed",
              description: "You have successfully removed liquidity from the pool.",
            })
            fetchPoolData() // Refresh pool data
          },
        })

        setState((prev) => ({ ...prev, isRemovingLiquidity: false }))
        return signature
      } catch (error) {
        console.error("Error removing liquidity:", error)
        setState((prev) => ({ ...prev, isRemovingLiquidity: false }))
        return null
      }
    },
    [publicKey, sendTransaction, fetchPoolData],
  )

  // Claim fees
  const claimFees = useCallback(async () => {
    if (!publicKey || !tokenMint) return null

    try {
      setState((prev) => ({ ...prev, isClaimingFees: true }))

      // Get the current network's DEX program ID
      const programId = dexProgramId()

      // Create a transaction to call the DEX program
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: new PublicKey(tokenMint), isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId,
        data: Buffer.from([3]), // Instruction to claim fees
      })

      // Use versioned transactions on mainnet for better performance
      let transaction

      if (network === "mainnet-beta") {
        // Create a versioned transaction (v0)
        const { blockhash } = await connection.getLatestBlockhash()
        const messageV0 = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: blockhash,
          instructions: [instruction]
        }).compileToV0Message()

        transaction = new VersionedTransaction(messageV0)
      } else {
        // Use legacy transaction for devnet/testnet
        transaction = new Transaction().add(instruction)
      }

      const signature = await sendAndConfirmTransaction(transaction, {
        onSuccess: () => {
          // Update pool data after successful operation
          fetchPoolData()
          toast({
            title: "Fees Claimed",
            description: `Successfully claimed fees on ${network}`,
            variant: "default",
          })
        },
      })

      setState((prev) => ({ ...prev, isClaimingFees: false }))
      return signature
    } catch (error) {
      console.error(`Error claiming fees on ${network}:`, error)
      setState((prev) => ({ ...prev, isClaimingFees: false }))
      toast({
        title: "Error",
        description: `Failed to claim fees on ${network}: ${error.message}`,
        variant: "destructive",
      })
      throw error
    }
  }, [publicKey, tokenMint, sendAndConfirmTransaction, fetchPoolData, network, connection, dexProgramId])

  // Format pool share
  const formattedPoolShare = useCallback(() => {
    return `${(state.poolShare * 100).toFixed(4)}%`
  }, [state.poolShare])

  return {
    poolData,
    userPoolShare,
    addLiquidity,
    removeLiquidity,
    claimFees,
    fetchPoolData,
    isLoading: isLoading || isProcessing,
    error,
    ...state,
    refreshPoolData: fetchPoolData,
    formattedPoolShare,
  }
}
