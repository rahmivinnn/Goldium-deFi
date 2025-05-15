"use client"

import { useState, useEffect, useCallback } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, SystemProgram, Transaction, TransactionInstruction, VersionedTransaction, TransactionMessage } from "@solana/web3.js"
import { GOLD_TOKEN, getMintAddress, getProgramId } from "@/constants/tokens"
import { useTransaction } from "./useTransaction"
import { useNetwork } from "@/components/NetworkContextProvider"
import { BN } from "bn.js"

interface StakingState {
  stakedAmount: number
  pendingRewards: number
  stakingStartTime: number
  apy: number
  isStaking: boolean
  lastUpdated?: number
}

export function useStaking() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const { network } = useNetwork()
  const { sendAndConfirmTransaction, isProcessing } = useTransaction()

  const [stakingState, setStakingState] = useState<StakingState>({
    stakedAmount: 0,
    pendingRewards: 0,
    stakingStartTime: 0,
    apy: 0,
    isStaking: false,
    lastUpdated: 0
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Get the staking program ID for the current network
  const stakingProgramId = useCallback(() => {
    return new PublicKey(getProgramId("STAKING", network))
  }, [network])

  // Get the GOLD token mint address for the current network
  const goldMintAddress = useCallback(() => {
    return new PublicKey(getMintAddress(GOLD_TOKEN, network))
  }, [network])

  // Fetch staking state
  const fetchStakingState = useCallback(async () => {
    if (!publicKey) return

    try {
      setIsLoading(true)

      // In a real implementation, this would fetch the staking account data from the program
      // For now, we'll simulate with a fetch from our API that includes network information
      const response = await fetch(`/api/stake?wallet=${publicKey.toString()}&network=${network}`)
      if (!response.ok) throw new Error("Failed to fetch staking data")

      const data = await response.json()

      setStakingState({
        stakedAmount: data.stakedAmount || 0,
        pendingRewards: data.pendingRewards || 0,
        stakingStartTime: data.stakingStartTime || 0,
        apy: data.apy || 0,
        isStaking: data.stakedAmount > 0,
        lastUpdated: Date.now()
      })

      setError(null)
    } catch (err) {
      console.error("Error fetching staking state:", err)
      setError(`Failed to fetch staking data on ${network}`)
    } finally {
      setIsLoading(false)
    }
  }, [publicKey, network])

  // Initial fetch and polling - update when network changes
  useEffect(() => {
    if (!publicKey) return

    // Fetch immediately when network changes
    fetchStakingState()

    const interval = setInterval(() => {
      fetchStakingState()
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [publicKey, fetchStakingState, network])

  // Stake tokens
  const stakeTokens = useCallback(
    async (amount: number) => {
      if (!publicKey) return null

      try {
        // Convert amount to lamports (accounting for decimals)
        const amountLamports = new BN(amount * Math.pow(10, GOLD_TOKEN.decimals))

        // Get the current network's program ID and token mint
        const programId = stakingProgramId()
        const mintAddress = goldMintAddress()

        // In a real implementation, this would create instructions to:
        // 1. Transfer tokens to the staking program
        // 2. Call the stake instruction on the program

        // Create a transaction to call the staking program
        const instruction = new TransactionInstruction({
          keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: mintAddress, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          programId,
          data: Buffer.from([1, ...amountLamports.toArray("le", 8)]), // Instruction to stake tokens
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
            // Update staking state after successful stake
            fetchStakingState()
          },
        })

        return signature
      } catch (error) {
        console.error(`Error staking GOLD tokens on ${network}:`, error)
        throw error
      }
    },
    [publicKey, sendAndConfirmTransaction, fetchStakingState, network, connection, stakingProgramId, goldMintAddress],
  )

  // Unstake tokens
  const unstakeTokens = useCallback(
    async (amount: number) => {
      if (!publicKey) return null

      try {
        // Convert amount to lamports (accounting for decimals)
        const amountLamports = new BN(amount * Math.pow(10, GOLD_TOKEN.decimals))

        // Get the current network's program ID and token mint
        const programId = stakingProgramId()
        const mintAddress = goldMintAddress()

        // Create a transaction to call the staking program
        const instruction = new TransactionInstruction({
          keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: mintAddress, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          programId,
          data: Buffer.from([2, ...amountLamports.toArray("le", 8)]), // Instruction to unstake tokens
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
            // Update staking state after successful unstake
            fetchStakingState()
          },
        })

        return signature
      } catch (error) {
        console.error(`Error unstaking GOLD tokens on ${network}:`, error)
        throw error
      }
    },
    [publicKey, sendAndConfirmTransaction, fetchStakingState, network, connection, stakingProgramId, goldMintAddress],
  )

  // Claim rewards
  const claimRewards = useCallback(async () => {
    if (!publicKey) return null

    try {
      // Get the current network's program ID and token mint
      const programId = stakingProgramId()
      const mintAddress = goldMintAddress()

      // Create a transaction to call the staking program
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: mintAddress, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId,
        data: Buffer.from([3]), // Instruction to claim rewards
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
          // Update staking state after successful claim
          fetchStakingState()
        },
      })

      return signature
    } catch (error) {
      console.error(`Error claiming staking rewards on ${network}:`, error)
      throw error
    }
  }, [publicKey, sendAndConfirmTransaction, fetchStakingState, network, connection, stakingProgramId, goldMintAddress])

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
