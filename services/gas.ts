"use client"

import { Connection, PublicKey, Transaction, VersionedTransaction, TransactionMessage } from '@solana/web3.js';
import { ComputeBudgetProgram } from '@solana/web3.js';
import { NetworkType } from '@/components/NetworkContextProvider';

// Default compute unit limits
const DEFAULT_COMPUTE_UNIT_LIMIT = 200_000;
const DEFAULT_COMPUTE_UNIT_PRICE = 1_000; // micro-lamports

// Network-specific compute unit prices
const NETWORK_COMPUTE_UNIT_PRICES = {
  'devnet': 1_000,
  'testnet': 1_500,
  'mainnet-beta': 2_000,
};

// Transaction priority levels
export enum TransactionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Priority multipliers
const PRIORITY_MULTIPLIERS = {
  [TransactionPriority.LOW]: 0.8,
  [TransactionPriority.MEDIUM]: 1.0,
  [TransactionPriority.HIGH]: 1.5,
  [TransactionPriority.URGENT]: 3.0,
};

/**
 * Gas optimization service for Solana transactions
 */
export class GasOptimizationService {
  private connection: Connection;
  private network: NetworkType;
  private recentPrices: number[] = [];
  private lastPriceUpdate: number = 0;
  private congestionLevel: number = 0;
  
  constructor(connection: Connection, network: NetworkType) {
    this.connection = connection;
    this.network = network;
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
   * Get the current compute unit price based on network congestion
   */
  public async getComputeUnitPrice(priority: TransactionPriority = TransactionPriority.MEDIUM): Promise<number> {
    // Update congestion level if needed
    await this.updateCongestionLevel();
    
    // Get base price for the current network
    const basePrice = NETWORK_COMPUTE_UNIT_PRICES[this.network] || DEFAULT_COMPUTE_UNIT_PRICE;
    
    // Apply congestion multiplier
    const congestionMultiplier = 1 + (this.congestionLevel * 2); // Up to 3x during high congestion
    
    // Apply priority multiplier
    const priorityMultiplier = PRIORITY_MULTIPLIERS[priority] || 1.0;
    
    // Calculate final price
    const finalPrice = Math.floor(basePrice * congestionMultiplier * priorityMultiplier);
    
    return finalPrice;
  }
  
  /**
   * Add compute budget instructions to a transaction
   */
  public async addComputeBudgetToTransaction(
    transaction: Transaction,
    priority: TransactionPriority = TransactionPriority.MEDIUM,
    customUnitLimit?: number
  ): Promise<Transaction> {
    // Get compute unit price
    const computeUnitPrice = await this.getComputeUnitPrice(priority);
    
    // Create compute budget instructions
    const unitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: customUnitLimit || DEFAULT_COMPUTE_UNIT_LIMIT,
    });
    
    const unitPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: computeUnitPrice,
    });
    
    // Add instructions to the beginning of the transaction
    transaction.instructions = [unitLimitIx, unitPriceIx, ...transaction.instructions];
    
    return transaction;
  }
  
  /**
   * Add compute budget instructions to a versioned transaction message
   */
  public async addComputeBudgetToVersionedTransaction(
    instructions: TransactionMessage['instructions'],
    priority: TransactionPriority = TransactionPriority.MEDIUM,
    customUnitLimit?: number
  ): Promise<TransactionMessage['instructions']> {
    // Get compute unit price
    const computeUnitPrice = await this.getComputeUnitPrice(priority);
    
    // Create compute budget instructions
    const unitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: customUnitLimit || DEFAULT_COMPUTE_UNIT_LIMIT,
    });
    
    const unitPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: computeUnitPrice,
    });
    
    // Add instructions to the beginning of the transaction
    return [unitLimitIx, unitPriceIx, ...instructions];
  }
  
  /**
   * Simulate a transaction to estimate compute units
   */
  public async simulateTransaction(
    transaction: Transaction | VersionedTransaction,
    signers?: PublicKey[]
  ): Promise<number> {
    try {
      // Simulate the transaction
      const simulation = await this.connection.simulateTransaction(transaction);
      
      // Extract compute units used
      const unitsUsed = simulation.value.unitsConsumed || DEFAULT_COMPUTE_UNIT_LIMIT;
      
      // Add a buffer for safety (20%)
      return Math.min(DEFAULT_COMPUTE_UNIT_LIMIT, Math.ceil(unitsUsed * 1.2));
    } catch (error) {
      console.error('Error simulating transaction:', error);
      return DEFAULT_COMPUTE_UNIT_LIMIT;
    }
  }
  
  /**
   * Update the congestion level based on recent transactions
   */
  private async updateCongestionLevel(): Promise<void> {
    // Only update every 30 seconds
    const now = Date.now();
    if (now - this.lastPriceUpdate < 30000) {
      return;
    }
    
    try {
      // Get recent performance samples
      const perfSamples = await this.connection.getRecentPerformanceSamples(5);
      
      if (perfSamples.length > 0) {
        // Calculate average transactions per slot
        const avgTxPerSlot = perfSamples.reduce((sum, sample) => sum + sample.numTransactions, 0) / perfSamples.length;
        
        // Calculate congestion level (0-1)
        // Assuming 5000 tx/slot is high congestion
        this.congestionLevel = Math.min(1, avgTxPerSlot / 5000);
      }
    } catch (error) {
      console.error('Error updating congestion level:', error);
    }
    
    this.lastPriceUpdate = now;
  }
}

// Singleton instance
let gasService: GasOptimizationService | null = null;

/**
 * Get the gas optimization service instance
 */
export function getGasService(connection: Connection, network: NetworkType): GasOptimizationService {
  if (!gasService) {
    gasService = new GasOptimizationService(connection, network);
  } else {
    gasService.updateConnection(connection);
    gasService.updateNetwork(network);
  }
  
  return gasService;
}
