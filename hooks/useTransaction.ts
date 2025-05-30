"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { type Connection, Transaction, type VersionedTransaction, type TransactionSignature } from "@solana/web3.js"
import { useToast } from "@/components/ui/use-toast"

interface TransactionOptions {
  onSuccess?: (signature: string) => void
  onError?: (error: Error) => void
}

export function useTransaction(connection?: Connection) {
  const { publicKey, signTransaction, signAllTransactions } = useWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const sendTransaction = useCallback(
    async (transaction: Transaction, options?: TransactionOptions) => {
      if (!publicKey || !signTransaction) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to continue",
          variant: "destructive",
        })
        return null
      }

      setIsProcessing(true)

      try {
        // Add recent blockhash
        if (!transaction.recentBlockhash) {
          const { blockhash } = await connection!.getLatestBlockhash()
          transaction.recentBlockhash = blockhash
        }

        // Set fee payer
        if (!transaction.feePayer) {
          transaction.feePayer = publicKey
        }

        // Sign transaction
        const signedTransaction = await signTransaction(transaction)

        // Send transaction
        const signature = await connection!.sendRawTransaction(signedTransaction.serialize())

        // Call onSuccess callback if provided
        if (options?.onSuccess) {
          options.onSuccess(signature)
        }

        return signature
      } catch (error: any) {
        console.error("Transaction error:", error)

        // Call onError callback if provided
        if (options?.onError) {
          options.onError(error)
        }

        toast({
          title: "Transaction failed",
          description: error.message || "Failed to send transaction",
          variant: "destructive",
        })

        return null
      } finally {
        setIsProcessing(false)
      }
    },
    [publicKey, signTransaction, connection, toast],
  )

  const sendAndConfirmTransaction = useCallback(
    async (transaction: Transaction | VersionedTransaction, options?: TransactionOptions) => {
      if (!publicKey || !signTransaction) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to continue",
          variant: "destructive",
        })
        return null
      }

      setIsProcessing(true)

      try {
        let signature: TransactionSignature

        if (transaction instanceof Transaction) {
          // Add recent blockhash if not already set
          if (!transaction.recentBlockhash) {
            const { blockhash } = await connection!.getLatestBlockhash()
            transaction.recentBlockhash = blockhash
          }

          // Set fee payer if not already set
          if (!transaction.feePayer) {
            transaction.feePayer = publicKey
          }

          // Sign transaction
          const signedTransaction = await signTransaction(transaction)

          // Send transaction
          signature = await connection!.sendRawTransaction(signedTransaction.serialize())
        } else {
          // For VersionedTransaction
          const signedTransaction = await signTransaction(transaction)

          // Send transaction
          signature = await connection!.sendRawTransaction(signedTransaction.serialize())
        }

        // Confirm transaction
        const confirmation = await connection!.confirmTransaction(signature, "confirmed")

        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`)
        }

        // Call onSuccess callback if provided
        if (options?.onSuccess) {
          options.onSuccess(signature)
        }

        return signature
      } catch (error: any) {
        console.error("Transaction error:", error)

        // Call onError callback if provided
        if (options?.onError) {
          options.onError(error)
        }

        toast({
          title: "Transaction failed",
          description: error.message || "Failed to send transaction",
          variant: "destructive",
        })

        return null
      } finally {
        setIsProcessing(false)
      }
    },
    [publicKey, signTransaction, connection, toast],
  )

  const signTransactions = useCallback(
    async (transactions: Transaction[]) => {
      if (!publicKey || !signAllTransactions) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to continue",
          variant: "destructive",
        })
        return null
      }

      try {
        // Add recent blockhash and fee payer to all transactions
        const { blockhash } = await connection!.getLatestBlockhash()
        transactions.forEach((tx) => {
          if (!tx.recentBlockhash) {
            tx.recentBlockhash = blockhash
          }
          if (!tx.feePayer) {
            tx.feePayer = publicKey
          }
        })

        // Sign all transactions
        return await signAllTransactions(transactions)
      } catch (error: any) {
        console.error("Transaction signing error:", error)
        toast({
          title: "Signing failed",
          description: error.message || "Failed to sign transactions",
          variant: "destructive",
        })
        return null
      }
    },
    [publicKey, signAllTransactions, connection, toast],
  )

  return {
    sendTransaction,
    sendAndConfirmTransaction,
    signTransactions,
    isProcessing,
  }
}
