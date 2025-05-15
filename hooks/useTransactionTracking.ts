"use client"

import { useState, useEffect, useCallback } from "react"
import { useConnection } from "@solana/wallet-adapter-react"
import { useNetwork } from "@/components/NetworkContextProvider"
import { 
  getTransactionTrackingService, 
  TransactionData, 
  TransactionStatus,
  TransactionType,
  TransactionUpdateListener
} from "@/services/transaction-tracking"

export function useTransactionTracking() {
  const { connection } = useConnection()
  const { network } = useNetwork()
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [recentTransactions, setRecentTransactions] = useState<TransactionData[]>([])
  const [pendingTransactions, setPendingTransactions] = useState<TransactionData[]>([])
  
  // Get the transaction tracking service
  const trackingService = getTransactionTrackingService(connection, network)
  
  // Update transactions state when transactions are updated
  useEffect(() => {
    const handleTransactionUpdate: TransactionUpdateListener = (transaction) => {
      // Update transactions list
      setTransactions(prev => {
        const index = prev.findIndex(tx => tx.id === transaction.id)
        if (index >= 0) {
          // Update existing transaction
          const newTransactions = [...prev]
          newTransactions[index] = transaction
          return newTransactions
        } else {
          // Add new transaction
          return [...prev, transaction]
        }
      })
    }
    
    // Add transaction update listener
    trackingService.addUpdateListener(handleTransactionUpdate)
    
    // Initial load
    setTransactions(trackingService.getTransactions())
    
    return () => {
      // Remove transaction update listener
      trackingService.removeUpdateListener(handleTransactionUpdate)
    }
  }, [trackingService])
  
  // Update filtered transaction lists
  useEffect(() => {
    // Recent transactions (last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    const recent = transactions
      .filter(tx => tx.timestamp > oneDayAgo)
      .sort((a, b) => b.timestamp - a.timestamp)
    setRecentTransactions(recent)
    
    // Pending transactions
    const pending = transactions.filter(tx => 
      tx.status === TransactionStatus.SENT || 
      tx.status === TransactionStatus.CONFIRMING ||
      tx.status === TransactionStatus.CONFIRMED
    )
    setPendingTransactions(pending)
  }, [transactions])
  
  // Track a new transaction
  const trackTransaction = useCallback(
    (
      signature: string,
      type: TransactionType,
      metadata: Record<string, any> = {},
      walletAddress?: string
    ) => {
      return trackingService.trackTransaction(signature, type, metadata, walletAddress)
    },
    [trackingService]
  )
  
  // Get transaction by ID
  const getTransactionById = useCallback(
    (id: string) => {
      return trackingService.getTransactionById(id)
    },
    [trackingService]
  )
  
  // Get transaction by signature
  const getTransactionBySignature = useCallback(
    (signature: string) => {
      return trackingService.getTransactionBySignature(signature)
    },
    [trackingService]
  )
  
  // Get transactions by type
  const getTransactionsByType = useCallback(
    (type: TransactionType) => {
      return trackingService.getTransactionsByType(type)
    },
    [trackingService]
  )
  
  // Get transactions by status
  const getTransactionsByStatus = useCallback(
    (status: TransactionStatus) => {
      return trackingService.getTransactionsByStatus(status)
    },
    [trackingService]
  )
  
  // Get transactions by wallet address
  const getTransactionsByWallet = useCallback(
    (walletAddress: string) => {
      return trackingService.getTransactionsByWallet(walletAddress)
    },
    [trackingService]
  )
  
  // Update transaction status
  const updateTransactionStatus = useCallback(
    (
      idOrSignature: string,
      status: TransactionStatus,
      additionalData: Partial<TransactionData> = {}
    ) => {
      return trackingService.updateTransactionStatus(idOrSignature, status, additionalData)
    },
    [trackingService]
  )
  
  // Clear all transactions
  const clearTransactions = useCallback(() => {
    trackingService.clearTransactions()
    setTransactions([])
    setRecentTransactions([])
    setPendingTransactions([])
  }, [trackingService])
  
  // Get explorer URL for a transaction
  const getExplorerUrl = useCallback(
    (signature: string) => {
      return trackingService.getExplorerUrl(signature)
    },
    [trackingService]
  )
  
  // Get a formatted status label
  const getStatusLabel = useCallback((status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.CREATED:
        return 'Created'
      case TransactionStatus.SIGNED:
        return 'Signed'
      case TransactionStatus.SENT:
        return 'Sent'
      case TransactionStatus.CONFIRMING:
        return 'Confirming'
      case TransactionStatus.CONFIRMED:
        return 'Confirmed'
      case TransactionStatus.FINALIZED:
        return 'Finalized'
      case TransactionStatus.FAILED:
        return 'Failed'
      case TransactionStatus.TIMEOUT:
        return 'Timed Out'
      default:
        return 'Unknown'
    }
  }, [])
  
  // Get a formatted type label
  const getTypeLabel = useCallback((type: TransactionType): string => {
    switch (type) {
      case TransactionType.SWAP:
        return 'Swap'
      case TransactionType.STAKE:
        return 'Stake'
      case TransactionType.UNSTAKE:
        return 'Unstake'
      case TransactionType.CLAIM_REWARDS:
        return 'Claim Rewards'
      case TransactionType.ADD_LIQUIDITY:
        return 'Add Liquidity'
      case TransactionType.REMOVE_LIQUIDITY:
        return 'Remove Liquidity'
      case TransactionType.CLAIM_FEES:
        return 'Claim Fees'
      case TransactionType.TRANSFER:
        return 'Transfer'
      default:
        return 'Other'
    }
  }, [])
  
  return {
    transactions,
    recentTransactions,
    pendingTransactions,
    trackTransaction,
    getTransactionById,
    getTransactionBySignature,
    getTransactionsByType,
    getTransactionsByStatus,
    getTransactionsByWallet,
    updateTransactionStatus,
    clearTransactions,
    getExplorerUrl,
    getStatusLabel,
    getTypeLabel,
  }
}
