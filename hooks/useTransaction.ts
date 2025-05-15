"use client"

import { useState, useCallback } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import {
  Transaction,
  type TransactionInstruction,
  type PublicKey,
  VersionedTransaction,
  TransactionMessage,
  Commitment,
} from "@solana/web3.js"
import { useToast } from "@/components/ui/use-toast"
import { useNetwork } from "@/components/NetworkContextProvider"
import { getGasService, TransactionPriority } from "@/services/gas"
import { getTransactionBatcher } from "@/services/transaction-batcher"
import { getErrorMonitoringService, ErrorCategory, ErrorSeverity } from "@/services/error-monitoring"
import {
  getTransactionTrackingService,
  TransactionStatus,
  TransactionType
} from "@/services/transaction-tracking"

interface TransactionOptions {
  onSuccess?: (signature: string) => void
  onError?: (error: Error) => void
  confirmOptions?: {
    maxRetries?: number
    skipPreflight?: boolean
    commitment?: Commitment
    preflightCommitment?: Commitment
  }
  showToasts?: boolean
  priority?: TransactionPriority
  simulateTransaction?: boolean
  batchInstructions?: boolean
  transactionType?: TransactionType
  metadata?: Record<string, any>
}

export function useTransaction() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, signTransaction, signAllTransactions } = useWallet()
  const { network, isChangingNetwork } = useNetwork()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const sendAndConfirmTransaction = useCallback(
    async (transaction: Transaction | VersionedTransaction, options?: TransactionOptions) => {
      // Default to showing toasts unless explicitly disabled
      const showToasts = options?.showToasts !== false

      // Don't allow transactions while network is changing
      if (isChangingNetwork) {
        const error = new Error(`Network is changing to ${network}. Please wait and try again.`)
        setError(error)
        options?.onError?.(error)
        if (showToasts) {
          toast({
            title: "Network Changing",
            description: `Please wait for network change to ${network} to complete`,
            variant: "destructive",
          })
        }
        return null
      }

      if (!publicKey) {
        const error = new Error("Wallet not connected")
        setError(error)
        options?.onError?.(error)
        if (showToasts) {
          toast({
            title: "Error",
            description: "Wallet not connected",
            variant: "destructive",
          })
        }
        return null
      }

      setIsProcessing(true)
      setError(null)
      setSignature(null)

      try {
        // Show toast for transaction initiation
        let toastId
        if (showToasts) {
          toastId = toast({
            title: "Transaction Initiated",
            description: `Please confirm the transaction in your wallet (${network})...`,
            duration: 10000,
          })
        }

        let txSignature: string

        // Set network-specific options
        const txOptions = {
          skipPreflight: options?.confirmOptions?.skipPreflight || false,
          preflightCommitment: options?.confirmOptions?.preflightCommitment || "confirmed",
          maxRetries: options?.confirmOptions?.maxRetries || 3,
        }

        // Get gas optimization service
        const gasService = getGasService(connection, network);

        if (transaction instanceof Transaction) {
          // Legacy transaction
          transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
          transaction.feePayer = publicKey

          // Apply gas optimization
          const priority = options?.priority || TransactionPriority.MEDIUM;

          // Simulate transaction if requested
          let computeUnitLimit;
          if (options?.simulateTransaction) {
            computeUnitLimit = await gasService.simulateTransaction(transaction);
          }

          // Add compute budget instructions
          transaction = await gasService.addComputeBudgetToTransaction(
            transaction,
            priority,
            computeUnitLimit
          );

          // Track transaction before sending
          const trackingService = getTransactionTrackingService(connection, network);
          const transactionType = options?.transactionType || TransactionType.OTHER;

          // Create transaction tracking record
          const trackedTx = trackingService.trackTransaction(
            'pending', // Temporary signature until we get the real one
            transactionType,
            options?.metadata || {},
            publicKey?.toString()
          );

          // Update status to SIGNED
          trackingService.updateTransactionStatus(
            trackedTx.id,
            TransactionStatus.SIGNED
          );

          // Send the transaction
          txSignature = await sendTransaction(transaction, connection, txOptions);

          // Update transaction with real signature
          trackingService.updateTransactionStatus(
            trackedTx.id,
            TransactionStatus.SENT,
            {
              signature: txSignature,
              explorerUrl: trackingService.getExplorerUrl(txSignature)
            }
          );
        } else if (transaction instanceof VersionedTransaction) {
          // For versioned transactions, we can't modify them directly
          // They should have been created with gas optimization already

          // Track transaction before sending
          const trackingService = getTransactionTrackingService(connection, network);
          const transactionType = options?.transactionType || TransactionType.OTHER;

          // Create transaction tracking record
          const trackedTx = trackingService.trackTransaction(
            'pending', // Temporary signature until we get the real one
            transactionType,
            options?.metadata || {},
            publicKey?.toString()
          );

          // Update status to SIGNED
          trackingService.updateTransactionStatus(
            trackedTx.id,
            TransactionStatus.SIGNED
          );

          // Send the transaction
          txSignature = await sendTransaction(transaction, connection, txOptions);

          // Update transaction with real signature
          trackingService.updateTransactionStatus(
            trackedTx.id,
            TransactionStatus.SENT,
            {
              signature: txSignature,
              explorerUrl: trackingService.getExplorerUrl(txSignature)
            }
          );
        } else {
          throw new Error("Unsupported transaction type")
        }

        setSignature(txSignature)

        // Update toast for confirmation
        if (showToasts && toastId) {
          toast({
            id: toastId,
            title: "Transaction Sent",
            description: `Confirming transaction on ${network}...`,
            duration: 5000,
          })
        }

        // Set confirmation timeout based on network
        const confirmationTimeout = network === "mainnet-beta" ? 60000 : 30000 // 60s for mainnet, 30s for others

        // Create a promise that will reject after the timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Transaction confirmation timeout")), confirmationTimeout)
        })

        // Wait for confirmation with timeout
        const confirmationPromise = connection.confirmTransaction(
          txSignature,
          options?.confirmOptions?.commitment || "confirmed"
        )

        // Get tracking service
        const trackingService = getTransactionTrackingService(connection, network);

        // Update transaction status to CONFIRMING
        trackingService.updateTransactionStatus(
          txSignature,
          TransactionStatus.CONFIRMING
        );

        // Race the confirmation against the timeout
        const confirmation = await Promise.race([confirmationPromise, timeoutPromise])
            .catch(err => {
              if (err.message === "Transaction confirmation timeout") {
                // Transaction might still be processing
                if (showToasts) {
                  toast({
                    title: "Transaction Processing",
                    description: `Transaction sent but confirmation is taking longer than expected. Check explorer for status.`,
                    variant: "default",
                    duration: 10000,
                  })
                }

                // Update transaction status to TIMEOUT
                trackingService.updateTransactionStatus(
                  txSignature,
                  TransactionStatus.TIMEOUT
                );

                // Still return the signature for the caller to handle
                options?.onSuccess?.(txSignature)
                return { value: { err: null } }
              }
              throw err
            })

        if (confirmation.value?.err) {
          // Update transaction status to FAILED
          trackingService.updateTransactionStatus(
            txSignature,
            TransactionStatus.FAILED,
            {
              errorMessage: JSON.stringify(confirmation.value.err)
            }
          );

          throw new Error("Transaction confirmed but failed: " + confirmation.value.err.toString())
        }

        // Update transaction status to FINALIZED
        trackingService.updateTransactionStatus(
          txSignature,
          TransactionStatus.FINALIZED
        );

        // Success toast
        if (showToasts) {
          toast({
            title: "Transaction Confirmed",
            description: `Transaction successful on ${network}!`,
            variant: "default",
          })
        }

        options?.onSuccess?.(txSignature)
        return txSignature
      } catch (err) {
        console.error(`Transaction error on ${network}:`, err)
        const error = err instanceof Error ? err : new Error("Unknown transaction error")
        setError(error)

        // Log error to monitoring service
        const errorService = getErrorMonitoringService();
        const errorCategory = determineErrorCategory(error);
        const errorSeverity = determineErrorSeverity(error);

        const errorData = errorService.logError(
          error,
          errorCategory,
          errorSeverity,
          {
            network,
            transactionType: transaction instanceof VersionedTransaction ? 'versioned' : 'legacy',
            walletAddress: publicKey?.toString(),
            signature: txSignature || null,
          }
        );

        // Update transaction status if we have a signature
        if (txSignature) {
          const trackingService = getTransactionTrackingService(connection, network);
          trackingService.updateTransactionStatus(
            txSignature,
            TransactionStatus.FAILED,
            {
              errorMessage: error.message
            }
          );
        }

        // Get user-friendly error message
        const userFriendlyMessage = errorService.getUserFriendlyMessage(error.message);

        // Error toast
        if (showToasts) {
          toast({
            title: "Transaction Failed",
            description: `${userFriendlyMessage} (${network})`,
            variant: "destructive",
          })
        }

        // Call onError callback
        options?.onError?.(error)

        return null
      } finally {
        setIsProcessing(false)
      }

      // Helper function to determine error category
      function determineErrorCategory(error: Error): ErrorCategory {
        const message = error.message.toLowerCase();

        if (message.includes('wallet') || message.includes('rejected')) {
          return ErrorCategory.WALLET_ERROR;
        }

        if (message.includes('network') || message.includes('connection') ||
            message.includes('timeout') || message.includes('blockhash')) {
          return ErrorCategory.NETWORK_ERROR;
        }

        if (message.includes('transaction') || message.includes('signature') ||
            message.includes('account') || message.includes('balance')) {
          return ErrorCategory.TRANSACTION_ERROR;
        }

        if (message.includes('program') || message.includes('instruction') ||
            message.includes('contract') || message.includes('execution')) {
          return ErrorCategory.CONTRACT_ERROR;
        }

        return ErrorCategory.UNKNOWN_ERROR;
      }

      // Helper function to determine error severity
      function determineErrorSeverity(error: Error): ErrorSeverity {
        const message = error.message.toLowerCase();

        if (message.includes('rejected') || message.includes('cancelled')) {
          return ErrorSeverity.INFO; // User rejected, not a system error
        }

        if (message.includes('timeout') || message.includes('rate limit')) {
          return ErrorSeverity.WARNING; // Temporary issues
        }

        if (message.includes('insufficient') || message.includes('balance')) {
          return ErrorSeverity.ERROR; // User needs to take action
        }

        if (message.includes('invalid') || message.includes('failed')) {
          return ErrorSeverity.ERROR; // Something is wrong with the transaction
        }

        return ErrorSeverity.ERROR; // Default to ERROR for unknown issues
      }
    },
    [publicKey, connection, sendTransaction, toast, network, isChangingNetwork],
  )

  // Helper for creating and sending a versioned transaction (v0)
  const sendVersionedTransaction = useCallback(
    async (
      instructions: TransactionInstruction[],
      lookupTableAddresses: PublicKey[] = [],
      options?: TransactionOptions,
    ) => {
      // Don't allow transactions while network is changing
      if (isChangingNetwork) {
        const error = new Error(`Network is changing to ${network}. Please wait and try again.`)
        setError(error)
        options?.onError?.(error)
        if (options?.showToasts !== false) {
          toast({
            title: "Network Changing",
            description: `Please wait for network change to ${network} to complete`,
            variant: "destructive",
          })
        }
        return null
      }

      if (!publicKey) {
        const error = new Error("Wallet not connected")
        setError(error)
        options?.onError?.(error)
        return null
      }

      // Get services
      const gasService = getGasService(connection, network);
      const batcherService = getTransactionBatcher(connection, network);
      const priority = options?.priority || TransactionPriority.MEDIUM;

      try {
        // Check if we should batch instructions
        if (options?.batchInstructions && instructions.length > 1) {
          // Batch instructions into multiple transactions if needed
          if (network === "mainnet-beta") {
            // Use versioned transactions for mainnet
            const batchedTransactions = await batcherService.batchInstructionsVersioned(
              instructions,
              publicKey,
              priority
            );

            // If there's only one transaction, send it directly
            if (batchedTransactions.length === 1) {
              return sendAndConfirmTransaction(batchedTransactions[0], options);
            }

            // For multiple transactions, send them sequentially
            const signatures: string[] = [];
            for (const tx of batchedTransactions) {
              const sig = await sendAndConfirmTransaction(tx, {
                ...options,
                onSuccess: (signature) => {
                  signatures.push(signature);
                  // Only call the original onSuccess after all transactions are sent
                  if (signatures.length === batchedTransactions.length) {
                    options?.onSuccess?.(signatures.join(','));
                  }
                },
              });
              if (!sig) {
                // If any transaction fails, stop and return null
                return null;
              }
            }

            // Return the first signature (or all signatures joined)
            return signatures[0];
          } else {
            // Use legacy transactions for devnet/testnet
            const batchedTransactions = await batcherService.batchInstructions(
              instructions,
              publicKey,
              priority
            );

            // If there's only one transaction, send it directly
            if (batchedTransactions.length === 1) {
              return sendAndConfirmTransaction(batchedTransactions[0], options);
            }

            // For multiple transactions, send them sequentially
            const signatures: string[] = [];
            for (const tx of batchedTransactions) {
              const sig = await sendAndConfirmTransaction(tx, {
                ...options,
                onSuccess: (signature) => {
                  signatures.push(signature);
                  // Only call the original onSuccess after all transactions are sent
                  if (signatures.length === batchedTransactions.length) {
                    options?.onSuccess?.(signatures.join(','));
                  }
                },
              });
              if (!sig) {
                // If any transaction fails, stop and return null
                return null;
              }
            }

            // Return the first signature (or all signatures joined)
            return signatures[0];
          }
        }

        // For single transactions or when batching is disabled
        if (network === "mainnet-beta") {
          // For mainnet, use versioned transaction with gas optimization
          const blockhash = await connection.getLatestBlockhash();

          // Apply gas optimization
          const optimizedInstructions = await gasService.addComputeBudgetToVersionedTransaction(
            instructions,
            priority
          );

          const messageV0 = new TransactionMessage({
            payerKey: publicKey,
            recentBlockhash: blockhash.blockhash,
            instructions: optimizedInstructions,
          }).compileToV0Message(lookupTableAddresses);

          const transaction = new VersionedTransaction(messageV0);

          return sendAndConfirmTransaction(transaction, options);
        } else {
          // For devnet and testnet, use legacy transaction with gas optimization
          const blockhash = await connection.getLatestBlockhash();
          const transaction = new Transaction();
          transaction.recentBlockhash = blockhash.blockhash;
          transaction.feePayer = publicKey;

          // Add all instructions to the transaction
          instructions.forEach(instruction => {
            transaction.add(instruction);
          });

          // Apply gas optimization
          const optimizedTransaction = await gasService.addComputeBudgetToTransaction(
            transaction,
            priority
          );

          return sendAndConfirmTransaction(optimizedTransaction, options);
        }
      } catch (err) {
        console.error(`Error creating transaction on ${network}:`, err);
        const error = err instanceof Error ? err : new Error("Failed to create transaction");
        setError(error);
        options?.onError?.(error);
        return null;
      }
    },
    [publicKey, connection, sendAndConfirmTransaction, network, isChangingNetwork, toast],
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
