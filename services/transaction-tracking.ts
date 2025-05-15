"use client"

import { Connection } from "@solana/web3.js"
import { NetworkType } from "@/components/NetworkContextProvider"

// Transaction status enum
export enum TransactionStatus {
  CREATED = 'created',
  SIGNED = 'signed',
  SENT = 'sent',
  CONFIRMING = 'confirming',
  CONFIRMED = 'confirmed',
  FINALIZED = 'finalized',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

// Transaction type enum
export enum TransactionType {
  SWAP = 'swap',
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  CLAIM_REWARDS = 'claim_rewards',
  ADD_LIQUIDITY = 'add_liquidity',
  REMOVE_LIQUIDITY = 'remove_liquidity',
  CLAIM_FEES = 'claim_fees',
  TRANSFER = 'transfer',
  OTHER = 'other',
}

// Transaction data structure
export interface TransactionData {
  id: string;
  signature: string;
  timestamp: number;
  status: TransactionStatus;
  type: TransactionType;
  network: NetworkType;
  walletAddress?: string;
  amount?: number;
  token?: string;
  fee?: number;
  blockHeight?: number;
  confirmations?: number;
  errorMessage?: string;
  explorerUrl?: string;
  metadata?: Record<string, any>;
}

// Transaction update listener
export type TransactionUpdateListener = (transaction: TransactionData) => void;

/**
 * Transaction tracking service for monitoring transaction status
 */
export class TransactionTrackingService {
  private transactions: TransactionData[] = [];
  private connection: Connection;
  private network: NetworkType;
  private updateListeners: TransactionUpdateListener[] = [];
  private pollingIntervals: Record<string, NodeJS.Timeout> = {};
  
  constructor(connection: Connection, network: NetworkType) {
    this.connection = connection;
    this.network = network;
    
    // Load transactions from local storage
    this.loadTransactions();
  }
  
  /**
   * Update the network type
   */
  public updateNetwork(network: NetworkType): void {
    this.network = network;
  }
  
  /**
   * Update the connection
   */
  public updateConnection(connection: Connection): void {
    this.connection = connection;
  }
  
  /**
   * Track a new transaction
   */
  public trackTransaction(
    signature: string,
    type: TransactionType,
    metadata: Record<string, any> = {},
    walletAddress?: string,
  ): TransactionData {
    // Generate a unique ID
    const id = this.generateTransactionId();
    
    // Create transaction data
    const transaction: TransactionData = {
      id,
      signature,
      timestamp: Date.now(),
      status: TransactionStatus.SENT,
      type,
      network: this.network,
      walletAddress,
      metadata,
      explorerUrl: this.getExplorerUrl(signature),
    };
    
    // Add to transactions list
    this.transactions.push(transaction);
    
    // Save to local storage
    this.saveTransactions();
    
    // Start polling for status updates
    this.startPolling(transaction);
    
    // Notify listeners
    this.notifyListeners(transaction);
    
    return transaction;
  }
  
  /**
   * Get all transactions
   */
  public getTransactions(): TransactionData[] {
    return [...this.transactions];
  }
  
  /**
   * Get transaction by ID
   */
  public getTransactionById(id: string): TransactionData | undefined {
    return this.transactions.find(tx => tx.id === id);
  }
  
  /**
   * Get transaction by signature
   */
  public getTransactionBySignature(signature: string): TransactionData | undefined {
    return this.transactions.find(tx => tx.signature === signature);
  }
  
  /**
   * Get transactions by type
   */
  public getTransactionsByType(type: TransactionType): TransactionData[] {
    return this.transactions.filter(tx => tx.type === type);
  }
  
  /**
   * Get transactions by status
   */
  public getTransactionsByStatus(status: TransactionStatus): TransactionData[] {
    return this.transactions.filter(tx => tx.status === status);
  }
  
  /**
   * Get transactions by wallet address
   */
  public getTransactionsByWallet(walletAddress: string): TransactionData[] {
    return this.transactions.filter(tx => tx.walletAddress === walletAddress);
  }
  
  /**
   * Get transactions by network
   */
  public getTransactionsByNetwork(network: NetworkType): TransactionData[] {
    return this.transactions.filter(tx => tx.network === network);
  }
  
  /**
   * Update transaction status
   */
  public updateTransactionStatus(
    idOrSignature: string,
    status: TransactionStatus,
    additionalData: Partial<TransactionData> = {}
  ): boolean {
    // Find transaction by ID or signature
    const transaction = this.getTransactionById(idOrSignature) || 
                        this.getTransactionBySignature(idOrSignature);
    
    if (!transaction) {
      return false;
    }
    
    // Update status and additional data
    transaction.status = status;
    Object.assign(transaction, additionalData);
    
    // Save to local storage
    this.saveTransactions();
    
    // Notify listeners
    this.notifyListeners(transaction);
    
    // Stop polling if transaction is in a final state
    if (this.isFinalStatus(status)) {
      this.stopPolling(transaction.id);
    }
    
    return true;
  }
  
  /**
   * Clear all transactions
   */
  public clearTransactions(): void {
    // Stop all polling intervals
    Object.keys(this.pollingIntervals).forEach(id => {
      this.stopPolling(id);
    });
    
    this.transactions = [];
    this.saveTransactions();
  }
  
  /**
   * Add a transaction update listener
   */
  public addUpdateListener(listener: TransactionUpdateListener): void {
    this.updateListeners.push(listener);
  }
  
  /**
   * Remove a transaction update listener
   */
  public removeUpdateListener(listener: TransactionUpdateListener): void {
    this.updateListeners = this.updateListeners.filter(l => l !== listener);
  }
  
  /**
   * Get explorer URL for a transaction
   */
  public getExplorerUrl(signature: string): string {
    const baseUrl = this.network === 'mainnet-beta'
      ? 'https://explorer.solana.com'
      : `https://explorer.solana.com/${this.network}`;
    
    return `${baseUrl}/tx/${signature}`;
  }
  
  /**
   * Start polling for transaction status updates
   */
  private startPolling(transaction: TransactionData): void {
    // Clear any existing interval
    this.stopPolling(transaction.id);
    
    // Set polling interval (more frequent for recent transactions)
    const interval = setInterval(async () => {
      try {
        // Get transaction status
        const status = await this.connection.getSignatureStatus(transaction.signature);
        
        if (status && status.value) {
          // Transaction found
          const confirmations = status.value.confirmations || 0;
          
          if (status.value.err) {
            // Transaction failed
            this.updateTransactionStatus(transaction.id, TransactionStatus.FAILED, {
              errorMessage: JSON.stringify(status.value.err),
              confirmations,
            });
          } else if (confirmations === 0) {
            // Transaction is confirming
            this.updateTransactionStatus(transaction.id, TransactionStatus.CONFIRMING, {
              confirmations,
            });
          } else if (confirmations > 0 && confirmations < 32) {
            // Transaction is confirmed
            this.updateTransactionStatus(transaction.id, TransactionStatus.CONFIRMED, {
              confirmations,
            });
          } else {
            // Transaction is finalized
            this.updateTransactionStatus(transaction.id, TransactionStatus.FINALIZED, {
              confirmations,
            });
            
            // Get transaction details
            try {
              const txDetails = await this.connection.getTransaction(transaction.signature, {
                commitment: 'confirmed',
              });
              
              if (txDetails) {
                this.updateTransactionStatus(transaction.id, TransactionStatus.FINALIZED, {
                  blockHeight: txDetails.slot,
                  fee: txDetails.meta?.fee,
                });
              }
            } catch (e) {
              console.error('Error fetching transaction details:', e);
            }
          }
        } else {
          // Transaction not found yet
          const timeSinceCreation = Date.now() - transaction.timestamp;
          
          // If more than 5 minutes have passed, mark as timeout
          if (timeSinceCreation > 5 * 60 * 1000) {
            this.updateTransactionStatus(transaction.id, TransactionStatus.TIMEOUT);
          }
        }
      } catch (error) {
        console.error('Error polling transaction status:', error);
      }
    }, this.getPollingInterval(transaction));
    
    // Store interval ID
    this.pollingIntervals[transaction.id] = interval;
  }
  
  /**
   * Stop polling for a transaction
   */
  private stopPolling(id: string): void {
    if (this.pollingIntervals[id]) {
      clearInterval(this.pollingIntervals[id]);
      delete this.pollingIntervals[id];
    }
  }
  
  /**
   * Get polling interval based on transaction age
   */
  private getPollingInterval(transaction: TransactionData): number {
    const age = Date.now() - transaction.timestamp;
    
    // More frequent polling for recent transactions
    if (age < 30 * 1000) { // Less than 30 seconds
      return 2000; // 2 seconds
    } else if (age < 2 * 60 * 1000) { // Less than 2 minutes
      return 5000; // 5 seconds
    } else if (age < 10 * 60 * 1000) { // Less than 10 minutes
      return 15000; // 15 seconds
    } else {
      return 30000; // 30 seconds
    }
  }
  
  /**
   * Check if a status is final (no more updates expected)
   */
  private isFinalStatus(status: TransactionStatus): boolean {
    return [
      TransactionStatus.FINALIZED,
      TransactionStatus.FAILED,
      TransactionStatus.TIMEOUT,
    ].includes(status);
  }
  
  /**
   * Generate a unique transaction ID
   */
  private generateTransactionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
  
  /**
   * Notify all transaction update listeners
   */
  private notifyListeners(transaction: TransactionData): void {
    this.updateListeners.forEach(listener => {
      try {
        listener(transaction);
      } catch (e) {
        console.error('Error in transaction update listener:', e);
      }
    });
  }
  
  /**
   * Save transactions to local storage
   */
  private saveTransactions(): void {
    try {
      localStorage.setItem('goldium-transactions', JSON.stringify(this.transactions));
    } catch (e) {
      console.error('Failed to save transactions to local storage:', e);
    }
  }
  
  /**
   * Load transactions from local storage
   */
  private loadTransactions(): void {
    try {
      const storedTransactions = localStorage.getItem('goldium-transactions');
      if (storedTransactions) {
        this.transactions = JSON.parse(storedTransactions);
        
        // Restart polling for non-final transactions
        this.transactions.forEach(transaction => {
          if (!this.isFinalStatus(transaction.status)) {
            this.startPolling(transaction);
          }
        });
      }
    } catch (e) {
      console.error('Failed to load transactions from local storage:', e);
    }
  }
}

// Singleton instance
let trackingService: TransactionTrackingService | null = null;

/**
 * Get the transaction tracking service instance
 */
export function getTransactionTrackingService(
  connection: Connection,
  network: NetworkType
): TransactionTrackingService {
  if (!trackingService) {
    trackingService = new TransactionTrackingService(connection, network);
  } else {
    trackingService.updateConnection(connection);
    trackingService.updateNetwork(network);
  }
  
  return trackingService;
}
