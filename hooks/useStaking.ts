"use client"

import { useState, useEffect, useCallback } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js"
import { GOLD_TOKEN } from "@/constants/tokens"
import { useTransaction } from "./useTransaction"
import { BN } from "bn.js"

// Simulated staking program ID - in a real implementation, this would be the actual program ID
const STAKING_PROGRAM_ID = new PublicKey("StakXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")

interface StakingState {
  stakedAmount: number
  pendingRewards: number
  stakingStartTime: number
  apy: number
  isStaking: boolean
}

export function useStaking() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const { sendAndConfirmTransaction, isProcessing } = useTransaction()

  const [stakingState, setStakingState] = useState<StakingState>({
    stakedAmount: 0,
    pendingRewards: 0,
    stakingStartTime: 0,
    apy: 0,
    isStaking: false,
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch staking state
  const fetchStakingState = useCallback(async () => {
    if (!publicKey) return

    try {
      setIsLoading(true)

      // In a real implementation, this would fetch the staking account data from the program
      // For now, we'll simulate with a fetch from our API
      const response = await fetch(`/api/stake?wallet=${publicKey.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch staking data")

      const data = await response.json()

      setStakingState({
        stakedAmount: data.stakedAmount || 0,
        pendingRewards: data.pendingRewards || 0,
        stakingStartTime: data.stakingStartTime || 0,
        apy: data.apy || 0,
        isStaking: data.stakedAmount > 0,
      })

      setError(null)
    } catch (err) {
      console.error("Error fetching staking state:", err)
      setError("Failed to fetch staking data")
    } finally {
      setIsLoading(false)
    }
  }, [publicKey])

  // Initial fetch and polling
  useEffect(() => {
    if (!publicKey) return

    fetchStakingState()

    const interval = setInterval(() => {
      fetchStakingState()
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [publicKey, fetchStakingState])

  // Stake tokens
  const stakeTokens = useCallback(
    async (amount: number) => {
      if (!publicKey) return null

      try {
        // Convert amount to lamports (accounting for decimals)
        const amountLamports = new BN(amount * Math.pow(10, GOLD_TOKEN.decimals))

        // In a real implementation, this would create instructions to:
        // 1. Transfer tokens to the staking program
        // 2. Call the stake instruction on the program

        // Create a transaction to call the staking program
        const instruction = new TransactionInstruction({
          keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: new PublicKey(GOLD_TOKEN.mint), isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          programId: STAKING_PROGRAM_ID,
          data: Buffer.from([1, ...amountLamports.toArray("le", 8)]), // Instruction to stake tokens
        })

        const transaction = new Transaction().add(instruction)

        const signature = await sendAndConfirmTransaction(transaction, {
          onSuccess: () => {
            // Update staking state after successful stake
            fetchStakingState()
          },
        })

        return signature
      } catch (error) {
        console.error("Error staking GOLD tokens:", error)
        throw error
      }
    },
    [publicKey, sendAndConfirmTransaction, fetchStakingState],
  )

  // Unstake tokens
  const unstakeTokens = useCallback(
    async (amount: number) => {
      if (!publicKey) return null

      try {
        // Convert amount to lamports (accounting for decimals)
        const amountLamports = new BN(amount * Math.pow(10, GOLD_TOKEN.decimals))

        // Create a transaction to call the staking program
        const instruction = new TransactionInstruction({
          keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: new PublicKey(GOLD_TOKEN.mint), isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          programId: STAKING_PROGRAM_ID,
          data: Buffer.from([2, ...amountLamports.toArray("le", 8)]), // Instruction to unstake tokens
        })

        const transaction = new Transaction().add(instruction)

        const signature = await sendAndConfirmTransaction(transaction, {
          onSuccess: () => {
            // Update staking state after successful unstake
            fetchStakingState()
          },
        })

        return signature
      } catch (error) {
        console.error("Error unstaking GOLD tokens:", error)
        throw error
      }
    },
    [publicKey, sendAndConfirmTransaction, fetchStakingState],
  )

  // Claim rewards
  const claimRewards = useCallback(async () => {
    if (!publicKey) return null

    try {
      // Create a transaction to call the staking program
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: new PublicKey(GOLD_TOKEN.mint), isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: STAKING_PROGRAM_ID,
        data: Buffer.from([3]), // Instruction to claim rewards
      })

      const transaction = new Transaction().add(instruction)

      const signature = await sendAndConfirmTransaction(transaction, {
        onSuccess: () => {
          // Update staking state after successful claim
          fetchStakingState()
        },
      })

      return signature
    } catch (error) {
      console.error("Error claiming staking rewards:", error)
      throw error
    }
  }, [publicKey, sendAndConfirmTransaction, fetchStakingState])

  return {
    ...stakingState,
    stakeTokens,
    unstakeTokens,
    claimRewards,
    fetchStakingState,
    isLoading: isLoading || isProcessing,
    error,
  }
}
