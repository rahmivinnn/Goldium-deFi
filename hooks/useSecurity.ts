"use client"

import { useState, useEffect, useCallback } from "react"
import { useConnection } from "@solana/wallet-adapter-react"
import { useNetwork } from "@/components/NetworkContextProvider"
import { PublicKey, Transaction, VersionedTransaction, TransactionInstruction } from "@solana/web3.js"
import { 
  getTransactionPreviewService, 
  TransactionPreview 
} from "@/services/transaction-preview"
import { 
  getTransactionApprovalService, 
  TransactionApprovalResult,
  TransactionApprovalStatus,
  TransactionRiskLevel,
  TransactionApprovalOptions
} from "@/services/transaction-approval"
import { 
  getTransactionAnomalyDetectionService, 
  Anomaly,
  AnomalyType,
  AnomalySeverity,
  AnomalyDetectionOptions
} from "@/services/transaction-anomaly-detection"
import { useTransactionTracking } from "@/hooks/useTransactionTracking"
import { useCache } from "@/hooks/useCache"

export function useSecurity() {
  const { connection } = useConnection()
  const { network } = useNetwork()
  const { getTransactionsByWallet } = useTransactionTracking()
  const { getTokenPrices } = useCache()
  
  // Get security services
  const previewService = getTransactionPreviewService(connection, network)
  const approvalService = getTransactionApprovalService(connection, network)
  const anomalyDetectionService = getTransactionAnomalyDetectionService(connection, network)
  
  // Update services when connection or network changes
  useEffect(() => {
    previewService.updateConnection(connection, network)
    approvalService.updateConnection(connection, network)
    anomalyDetectionService.updateConnection(connection, network)
  }, [connection, network])
  
  // Preview transaction
  const previewTransaction = useCallback(
    async (
      transaction: Transaction | VersionedTransaction | TransactionInstruction[],
      signers?: PublicKey[]
    ): Promise<TransactionPreview> => {
      // Get token prices for relevant tokens
      const tokenPrices = await getTokenPrices([
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
        'So11111111111111111111111111111111111111112', // Wrapped SOL
      ])
      
      return previewService.previewTransaction(transaction, signers, tokenPrices)
    },
    [previewService, getTokenPrices]
  )
  
  // Approve transaction
  const approveTransaction = useCallback(
    async (
      transaction: Transaction | VersionedTransaction | TransactionInstruction[],
      signers?: PublicKey[],
      options?: TransactionApprovalOptions
    ): Promise<TransactionApprovalResult> => {
      // Get token prices if not provided
      let tokenPrices = options?.tokenPrices
      
      if (!tokenPrices) {
        tokenPrices = await getTokenPrices([
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
          'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
          'So11111111111111111111111111111111111111112', // Wrapped SOL
        ])
      }
      
      return approvalService.approveTransaction(transaction, signers, {
        ...options,
        tokenPrices,
      })
    },
    [approvalService, getTokenPrices]
  )
  
  // Detect anomalies
  const detectAnomalies = useCallback(
    async (
      transaction: Transaction | VersionedTransaction | TransactionInstruction[],
      signers?: PublicKey[],
      options?: AnomalyDetectionOptions
    ): Promise<Anomaly[]> => {
      // Get token prices if not provided
      let tokenPrices = options?.tokenPrices
      
      if (!tokenPrices) {
        tokenPrices = await getTokenPrices([
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
          'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
          'So11111111111111111111111111111111111111112', // Wrapped SOL
        ])
      }
      
      // Get transaction history if not provided
      let transactionHistory = options?.transactionHistory
      
      if (!transactionHistory && signers && signers.length > 0) {
        // Get transactions for the first signer
        const walletTransactions = getTransactionsByWallet(signers[0].toString())
        
        // Convert to history items
        transactionHistory = walletTransactions.map(tx => ({
          signature: tx.signature,
          timestamp: tx.timestamp,
          programIds: [], // We don't have this info in the tracking service
          accounts: [tx.walletAddress || ''].filter(Boolean),
          tokenTransfers: tx.metadata?.tokens?.map((token: any) => ({
            mint: token.mint,
            amount: token.amount,
          })),
          solTransfers: tx.metadata?.sol?.map((sol: any) => ({
            amount: sol.amount,
          })),
        }))
      }
      
      return anomalyDetectionService.detectAnomalies(transaction, signers, {
        ...options,
        tokenPrices,
        transactionHistory,
      })
    },
    [anomalyDetectionService, getTokenPrices, getTransactionsByWallet]
  )
  
  // Get risk level description
  const getRiskLevelDescription = useCallback(
    (riskLevel: TransactionRiskLevel): string => {
      switch (riskLevel) {
        case TransactionRiskLevel.LOW:
          return "This transaction appears to be low risk."
        case TransactionRiskLevel.MEDIUM:
          return "This transaction has some risk factors to consider."
        case TransactionRiskLevel.HIGH:
          return "This transaction has high risk factors. Please review carefully."
        case TransactionRiskLevel.CRITICAL:
          return "This transaction has critical risk factors and is not recommended."
        default:
          return "Unknown risk level."
      }
    },
    []
  )
  
  // Get risk level color
  const getRiskLevelColor = useCallback(
    (riskLevel: TransactionRiskLevel): string => {
      switch (riskLevel) {
        case TransactionRiskLevel.LOW:
          return "green"
        case TransactionRiskLevel.MEDIUM:
          return "yellow"
        case TransactionRiskLevel.HIGH:
          return "orange"
        case TransactionRiskLevel.CRITICAL:
          return "red"
        default:
          return "gray"
      }
    },
    []
  )
  
  // Get anomaly severity description
  const getAnomalySeverityDescription = useCallback(
    (severity: AnomalySeverity): string => {
      switch (severity) {
        case AnomalySeverity.INFO:
          return "Information"
        case AnomalySeverity.WARNING:
          return "Warning"
        case AnomalySeverity.CRITICAL:
          return "Critical"
        default:
          return "Unknown"
      }
    },
    []
  )
  
  // Get anomaly severity color
  const getAnomalySeverityColor = useCallback(
    (severity: AnomalySeverity): string => {
      switch (severity) {
        case AnomalySeverity.INFO:
          return "blue"
        case AnomalySeverity.WARNING:
          return "yellow"
        case AnomalySeverity.CRITICAL:
          return "red"
        default:
          return "gray"
      }
    },
    []
  )
  
  // Get anomaly type description
  const getAnomalyTypeDescription = useCallback(
    (type: AnomalyType): string => {
      switch (type) {
        case AnomalyType.UNUSUAL_PROGRAM:
          return "Unusual Program"
        case AnomalyType.HIGH_VALUE_TRANSFER:
          return "High Value Transfer"
        case AnomalyType.UNUSUAL_ACCOUNT_CREATION:
          return "Unusual Account Creation"
        case AnomalyType.UNUSUAL_TOKEN_TRANSFER:
          return "Unusual Token Transfer"
        case AnomalyType.UNUSUAL_PATTERN:
          return "Unusual Pattern"
        case AnomalyType.POTENTIAL_SCAM:
          return "Potential Scam"
        default:
          return "Unknown"
      }
    },
    []
  )
  
  return {
    // Transaction preview
    previewTransaction,
    
    // Transaction approval
    approveTransaction,
    
    // Anomaly detection
    detectAnomalies,
    
    // Helper functions
    getRiskLevelDescription,
    getRiskLevelColor,
    getAnomalySeverityDescription,
    getAnomalySeverityColor,
    getAnomalyTypeDescription,
    
    // Constants
    TransactionApprovalStatus,
    TransactionRiskLevel,
    AnomalyType,
    AnomalySeverity,
  }
}
