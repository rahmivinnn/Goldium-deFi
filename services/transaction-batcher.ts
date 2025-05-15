"use client"

import { Connection, PublicKey, Transaction, TransactionInstruction, VersionedTransaction, TransactionMessage } from '@solana/web3.js';
import { getGasService, TransactionPriority } from './gas';
import { NetworkType } from '@/components/NetworkContextProvider';

// Maximum number of instructions per transaction
const MAX_INSTRUCTIONS_PER_TRANSACTION = 20;

// Maximum transaction size in bytes
const MAX_TRANSACTION_SIZE = 1232;

/**
 * Transaction batching service for optimizing gas usage
 */
export class TransactionBatcherService {
  private connection: Connection;
  private network: NetworkType;
  
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
   * Batch instructions into optimized transactions
   */
  public async batchInstructions(
    instructions: TransactionInstruction[],
    feePayer: PublicKey,
    priority: TransactionPriority = TransactionPriority.MEDIUM
  ): Promise<Transaction[]> {
    if (instructions.length === 0) {
      return [];
    }
    
    const gasService = getGasService(this.connection, this.network);
    const batches: TransactionInstruction[][] = [];
    let currentBatch: TransactionInstruction[] = [];
    let currentSize = 0;
    
    // Group instructions into batches
    for (const instruction of instructions) {
      // Estimate instruction size
      const instructionSize = this.estimateInstructionSize(instruction);
      
      // Check if adding this instruction would exceed limits
      if (
        currentBatch.length >= MAX_INSTRUCTIONS_PER_TRANSACTION ||
        currentSize + instructionSize > MAX_TRANSACTION_SIZE
      ) {
        // Start a new batch
        batches.push(currentBatch);
        currentBatch = [instruction];
        currentSize = instructionSize;
      } else {
        // Add to current batch
        currentBatch.push(instruction);
        currentSize += instructionSize;
      }
    }
    
    // Add the last batch if not empty
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }
    
    // Create transactions from batches
    const transactions: Transaction[] = [];
    
    for (const batch of batches) {
      // Create a new transaction
      const transaction = new Transaction();
      
      // Add instructions
      batch.forEach(ix => transaction.add(ix));
      
      // Add compute budget instructions
      const optimizedTx = await gasService.addComputeBudgetToTransaction(transaction, priority);
      
      // Set fee payer
      optimizedTx.feePayer = feePayer;
      
      transactions.push(optimizedTx);
    }
    
    return transactions;
  }
  
  /**
   * Batch instructions into optimized versioned transactions
   */
  public async batchInstructionsVersioned(
    instructions: TransactionInstruction[],
    feePayer: PublicKey,
    priority: TransactionPriority = TransactionPriority.MEDIUM
  ): Promise<VersionedTransaction[]> {
    if (instructions.length === 0) {
      return [];
    }
    
    const gasService = getGasService(this.connection, this.network);
    const batches: TransactionInstruction[][] = [];
    let currentBatch: TransactionInstruction[] = [];
    let currentSize = 0;
    
    // Group instructions into batches
    for (const instruction of instructions) {
      // Estimate instruction size
      const instructionSize = this.estimateInstructionSize(instruction);
      
      // Check if adding this instruction would exceed limits
      if (
        currentBatch.length >= MAX_INSTRUCTIONS_PER_TRANSACTION ||
        currentSize + instructionSize > MAX_TRANSACTION_SIZE
      ) {
        // Start a new batch
        batches.push(currentBatch);
        currentBatch = [instruction];
        currentSize = instructionSize;
      } else {
        // Add to current batch
        currentBatch.push(instruction);
        currentSize += instructionSize;
      }
    }
    
    // Add the last batch if not empty
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }
    
    // Get recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash();
    
    // Create versioned transactions from batches
    const transactions: VersionedTransaction[] = [];
    
    for (const batch of batches) {
      // Add compute budget instructions
      const optimizedInstructions = await gasService.addComputeBudgetToVersionedTransaction(batch, priority);
      
      // Create a transaction message
      const messageV0 = new TransactionMessage({
        payerKey: feePayer,
        recentBlockhash: blockhash,
        instructions: optimizedInstructions,
      }).compileToV0Message();
      
      // Create a versioned transaction
      const transaction = new VersionedTransaction(messageV0);
      
      transactions.push(transaction);
    }
    
    return transactions;
  }
  
  /**
   * Estimate the size of an instruction in bytes
   */
  private estimateInstructionSize(instruction: TransactionInstruction): number {
    // Program ID (32 bytes) + number of accounts (1 byte)
    let size = 33;
    
    // Account metas
    size += instruction.keys.length * 34; // pubkey (32) + is_signer (1) + is_writable (1)
    
    // Data length (1 byte) + data
    size += 1 + instruction.data.length;
    
    return size;
  }
}

// Singleton instance
let batcherService: TransactionBatcherService | null = null;

/**
 * Get the transaction batcher service instance
 */
export function getTransactionBatcher(connection: Connection, network: NetworkType): TransactionBatcherService {
  if (!batcherService) {
    batcherService = new TransactionBatcherService(connection, network);
  } else {
    batcherService.updateConnection(connection);
    batcherService.updateNetwork(network);
  }
  
  return batcherService;
}
