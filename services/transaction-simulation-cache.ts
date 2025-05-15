"use client"

import { 
  Connection, 
  Transaction, 
  VersionedTransaction, 
  TransactionInstruction,
  PublicKey,
  SimulatedTransactionResponse,
  TransactionMessage,
  VersionedMessage,
  Message
} from "@solana/web3.js"
import { transactionSimulationCache } from "@/services/cache"
import { NetworkType } from "@/components/NetworkContextProvider"

// Transaction simulation result interface
export interface TransactionSimulationResult {
  success: boolean;
  logs: string[];
  unitsConsumed?: number;
  error?: string;
  returnData?: any;
  accounts?: any[];
  lastUpdated: number;
}

// Transaction hash options
export interface TransactionHashOptions {
  includeRecentBlockhash?: boolean;
  includeFeePayerAndSigners?: boolean;
}

/**
 * Transaction simulation cache service
 */
export class TransactionSimulationCacheService {
  private connection: Connection;
  private network: NetworkType;
  
  constructor(connection: Connection, network: NetworkType) {
    this.connection = connection;
    this.network = network;
  }
  
  /**
   * Update the connection and network
   */
  public updateConnection(connection: Connection, network: NetworkType): void {
    this.connection = connection;
    this.network = network;
    
    // Clear cache when network changes
    this.clearSimulations();
  }
  
  /**
   * Simulate a transaction
   */
  public async simulateTransaction(
    transaction: Transaction | VersionedTransaction | TransactionInstruction[],
    signers?: PublicKey[]
  ): Promise<TransactionSimulationResult> {
    // Generate a hash for the transaction
    const txHash = this.hashTransaction(transaction, signers);
    const cacheKey = `${this.network}:${txHash}`;
    
    // Check cache first
    const cachedResult = transactionSimulationCache.get<TransactionSimulationResult>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    // Simulate transaction
    try {
      const result = await this.simulateTransactionRaw(transaction, signers);
      
      // Cache the result
      transactionSimulationCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Error simulating transaction:', error);
      
      // Return error result
      const errorResult: TransactionSimulationResult = {
        success: false,
        logs: [],
        error: error instanceof Error ? error.message : String(error),
        lastUpdated: Date.now(),
      };
      
      // Cache the error result (with shorter TTL)
      transactionSimulationCache.set(cacheKey, errorResult, { ttl: 60 * 1000 }); // 1 minute
      
      return errorResult;
    }
  }
  
  /**
   * Clear all cached simulations
   */
  public clearSimulations(): void {
    // Get all keys for the current network
    const keys = transactionSimulationCache.keys().filter(key => key.startsWith(`${this.network}:`));
    
    // Delete each key
    for (const key of keys) {
      transactionSimulationCache.delete(key);
    }
  }
  
  /**
   * Simulate transaction without caching
   */
  private async simulateTransactionRaw(
    transaction: Transaction | VersionedTransaction | TransactionInstruction[],
    signers?: PublicKey[]
  ): Promise<TransactionSimulationResult> {
    let simulationResponse: SimulatedTransactionResponse;
    
    // Handle different transaction types
    if (Array.isArray(transaction)) {
      // Convert instructions to a transaction
      const tx = new Transaction();
      transaction.forEach(instruction => tx.add(instruction));
      
      // Add a recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      
      // Add fee payer if signers are provided
      if (signers && signers.length > 0) {
        tx.feePayer = signers[0];
      }
      
      // Simulate
      simulationResponse = await this.connection.simulateTransaction(tx);
    } else if (transaction instanceof Transaction) {
      // Ensure transaction has a recent blockhash
      if (!transaction.recentBlockhash) {
        const { blockhash } = await this.connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
      }
      
      // Add fee payer if signers are provided and not already set
      if (!transaction.feePayer && signers && signers.length > 0) {
        transaction.feePayer = signers[0];
      }
      
      // Simulate
      simulationResponse = await this.connection.simulateTransaction(transaction);
    } else if (transaction instanceof VersionedTransaction) {
      // Simulate
      simulationResponse = await this.connection.simulateTransaction(transaction);
    } else {
      throw new Error('Unsupported transaction type');
    }
    
    // Process simulation response
    const result: TransactionSimulationResult = {
      success: simulationResponse.value.err === null,
      logs: simulationResponse.value.logs || [],
      unitsConsumed: simulationResponse.value.unitsConsumed,
      lastUpdated: Date.now(),
    };
    
    // Add error if present
    if (simulationResponse.value.err) {
      result.error = JSON.stringify(simulationResponse.value.err);
    }
    
    // Add return data if present
    if (simulationResponse.value.returnData) {
      result.returnData = simulationResponse.value.returnData;
    }
    
    // Add accounts if present
    if (simulationResponse.value.accounts) {
      result.accounts = simulationResponse.value.accounts;
    }
    
    return result;
  }
  
  /**
   * Hash a transaction for caching
   */
  private hashTransaction(
    transaction: Transaction | VersionedTransaction | TransactionInstruction[],
    signers?: PublicKey[],
    options: TransactionHashOptions = {}
  ): string {
    const { includeRecentBlockhash = false, includeFeePayerAndSigners = false } = options;
    
    // Extract instructions
    let instructions: TransactionInstruction[];
    let feePayer: PublicKey | undefined;
    let recentBlockhash: string | undefined;
    
    if (Array.isArray(transaction)) {
      instructions = transaction;
    } else if (transaction instanceof Transaction) {
      instructions = transaction.instructions;
      feePayer = transaction.feePayer;
      recentBlockhash = transaction.recentBlockhash;
    } else if (transaction instanceof VersionedTransaction) {
      const message = transaction.message;
      
      // Extract instructions from versioned message
      if (message instanceof VersionedMessage) {
        instructions = this.extractInstructionsFromVersionedMessage(message);
      } else {
        throw new Error('Unsupported message type');
      }
    } else {
      throw new Error('Unsupported transaction type');
    }
    
    // Create a string representation of the instructions
    const instructionsStr = instructions.map(instruction => {
      return {
        programId: instruction.programId.toString(),
        keys: instruction.keys.map(key => ({
          pubkey: key.pubkey.toString(),
          isSigner: key.isSigner,
          isWritable: key.isWritable,
        })),
        data: Buffer.from(instruction.data).toString('base64'),
      };
    });
    
    // Add optional elements
    const hashObj: any = { instructions: instructionsStr };
    
    if (includeFeePayerAndSigners) {
      if (feePayer) {
        hashObj.feePayer = feePayer.toString();
      }
      
      if (signers && signers.length > 0) {
        hashObj.signers = signers.map(signer => signer.toString());
      }
    }
    
    if (includeRecentBlockhash && recentBlockhash) {
      hashObj.recentBlockhash = recentBlockhash;
    }
    
    // Create a hash
    return this.objectHash(hashObj);
  }
  
  /**
   * Extract instructions from a versioned message
   */
  private extractInstructionsFromVersionedMessage(
    message: VersionedMessage
  ): TransactionInstruction[] {
    const instructions: TransactionInstruction[] = [];
    
    // Convert compiled instructions to TransactionInstructions
    message.compiledInstructions.forEach(compiledInstruction => {
      const keys = compiledInstruction.accountKeyIndexes.map(index => {
        const pubkey = message.staticAccountKeys[index];
        
        // Determine if the account is a signer or writable
        // This is a simplification and may not be accurate for all cases
        const isWritable = message.isAccountWritable(index);
        const isSigner = message.isAccountSigner(index);
        
        return {
          pubkey,
          isSigner,
          isWritable,
        };
      });
      
      const programId = message.staticAccountKeys[compiledInstruction.programIdIndex];
      
      instructions.push(
        new TransactionInstruction({
          keys,
          programId,
          data: Buffer.from(compiledInstruction.data),
        })
      );
    });
    
    return instructions;
  }
  
  /**
   * Create a hash of an object
   */
  private objectHash(obj: any): string {
    const str = JSON.stringify(obj);
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return hash.toString(36);
  }
}

// Singleton instance
let transactionSimulationCacheService: TransactionSimulationCacheService | null = null;

/**
 * Get the transaction simulation cache service instance
 */
export function getTransactionSimulationCacheService(
  connection: Connection,
  network: NetworkType
): TransactionSimulationCacheService {
  if (!transactionSimulationCacheService) {
    transactionSimulationCacheService = new TransactionSimulationCacheService(connection, network);
  } else {
    transactionSimulationCacheService.updateConnection(connection, network);
  }
  
  return transactionSimulationCacheService;
}
