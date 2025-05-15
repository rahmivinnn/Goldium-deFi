"use client"

import { useState, useCallback } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import {
  Transaction,
  type TransactionInstruction,
  type PublicKey,
  VersionedTransaction,
  TransactionMessage,
} from "@solana/web3.js"
import { useToast } from "@/components/ui/use-toast"

interface TransactionOptions {
  onSuccess?: (signature: string) => void
  onError?: (error: Error) => void
  confirmOptions?: {
    maxRetries?: number
    skipPreflight?: boolean
  }
}

export function useTransaction() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, signTransaction, signAllTransactions } = useWallet()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const sendAndConfirmTransaction = useCallback(
    async (transaction: Transaction | VersionedTransaction, options?: TransactionOptions) => {
      if (!publicKey) {
        const error = new Error("Wallet not connected")
        setError(error)
        options?.onError?.(error)
        toast({
          title: "Error",
          description: "Wallet not connected",
          variant: "destructive",
        })
        return null
      }

      setIsProcessing(true)
      setError(null)
      setSignature(null)

      try {
        // Show toast for transaction initiation
        const toastId = toast({
          title: "Transaction Initiated",
          description: "Please confirm the transaction in your wallet...",
          duration: 10000,
        })

        let txSignature: string

        if (transaction instanceof Transaction) {
          // Legacy transaction
          transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
          transaction.feePayer = publicKey

          txSignature = await sendTransaction(transaction, connection, {
            skipPreflight: options?.confirmOptions?.skipPreflight || false,
          })
        } else {
          // Versioned transaction (v0)
          txSignature = await sendTransaction(transaction, connection)
        }

        setSignature(txSignature)

        // Update toast for confirmation
        toast({
          id: toastId,
          title: "Transaction Sent",
          description: "Confirming transaction...",
          duration: 5000,
        })

        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(txSignature, "confirmed")

        if (confirmation.value.err) {
          throw new Error("Transaction confirmed but failed: " + confirmation.value.err.toString())
        }

        // Success toast
        toast({
          title: "Transaction Confirmed",
          description: `Transaction successful!`,
          variant: "default",
        })

        options?.onSuccess?.(txSignature)
        return txSignature
      } catch (err) {
        console.error("Transaction error:", err)
        const error = err instanceof Error ? err : new Error("Unknown transaction error")
        setError(error)
        options?.onError?.(error)

        // Error toast
        toast({
          title: "Transaction Failed",
          description: error.message,
          variant: "destructive",
        })

        return null
      } finally {
        setIsProcessing(false)
      }
    },
    [publicKey, connection, sendTransaction, toast],
  )

  // Helper for creating and sending a versioned transaction (v0)
  const sendVersionedTransaction = useCallback(
    async (
      instructions: TransactionInstruction[],
      lookupTableAddresses: PublicKey[] = [],
      options?: TransactionOptions,
    ) => {
      if (!publicKey) {
        const error = new Error("Wallet not connected")
        setError(error)
        options?.onError?.(error)
        return null
      }

      try {
        const blockhash = await connection.getLatestBlockhash()

        const messageV0 = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: blockhash.blockhash,
          instructions,
        }).compileToV0Message(lookupTableAddresses)

        const transaction = new VersionedTransaction(messageV0)

        return sendAndConfirmTransaction(transaction, options)
      } catch (err) {
        console.error("Error creating versioned transaction:", err)
        const error = err instanceof Error ? err : new Error("Failed to create transaction")
        setError(error)
        options?.onError?.(error)
        return null
      }
    },
    [publicKey, connection, sendAndConfirmTransaction],
  )

  return {
    sendAndConfirmTransaction,
    sendVersionedTransaction,
    isProcessing,
    signature,
    error,
    resetState: () => {
      setIsProcessing(false)
      setSignature(null)
      setError(null)
    },
  }
}
