import { Connection, PublicKey, Blockhash, BlockheightBasedTransactionConfirmationStrategy, TransactionSignature, VersionedTransaction, Transaction } from '@solana/web3.js';
import { getMockConfig, NETWORK_ERRORS } from './config';
import { generateMockSignature, generateMockBlockhash } from './utils';

/**
 * Mock implementation of Solana Connection
 */
export class MockConnection {
  private latestBlockhash: { blockhash: Blockhash; lastValidBlockHeight: number } = {
    blockhash: generateMockBlockhash(),
    lastValidBlockHeight: 100,
  };

  constructor(private endpoint: string, private commitment?: string) {}

  /**
   * Get the latest blockhash
   */
  async getLatestBlockhash(): Promise<{ blockhash: Blockhash; lastValidBlockHeight: number }> {
    const config = getMockConfig();
    
    if (config.simulateConnectionError) {
      throw new Error(NETWORK_ERRORS[config.network].connection);
    }
    
    // Generate a new blockhash
    this.latestBlockhash = {
      blockhash: generateMockBlockhash(),
      lastValidBlockHeight: this.latestBlockhash.lastValidBlockHeight + 1,
    };
    
    return this.latestBlockhash;
  }

  /**
   * Send a raw transaction
   */
  async sendRawTransaction(
    rawTransaction: Buffer | Uint8Array | Array<number>,
    options?: any
  ): Promise<TransactionSignature> {
    const config = getMockConfig();
    
    if (config.simulateConnectionError) {
      throw new Error(NETWORK_ERRORS[config.network].connection);
    }
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, config.transactionDelay));
    
    // Simulate transaction success/failure based on success rate
    if (Math.random() > config.transactionSuccessRate) {
      throw new Error('Transaction simulation failed');
    }
    
    return generateMockSignature();
  }

  /**
   * Confirm a transaction
   */
  async confirmTransaction(
    signature: TransactionSignature | BlockheightBasedTransactionConfirmationStrategy,
    commitment?: string
  ): Promise<{ context: { slot: number }; value: { err: any } }> {
    const config = getMockConfig();
    
    if (config.simulateConnectionError) {
      throw new Error(NETWORK_ERRORS[config.network].connection);
    }
    
    // Simulate confirmation delay
    await new Promise(resolve => setTimeout(resolve, config.confirmationDelay));
    
    // Simulate timeout error
    if (config.simulateTimeoutError) {
      throw new Error(NETWORK_ERRORS[config.network].timeout);
    }
    
    // Return successful confirmation by default
    return {
      context: { slot: Math.floor(Math.random() * 1000) + 1 },
      value: { err: null },
    };
  }

  /**
   * Get token account balance
   */
  async getTokenAccountBalance(tokenAccount: PublicKey): Promise<{ value: { amount: string; decimals: number } }> {
    const config = getMockConfig();
    
    if (config.simulateConnectionError) {
      throw new Error(NETWORK_ERRORS[config.network].connection);
    }
    
    // Return a mock balance
    return {
      value: {
        amount: '1000000000', // 1 token with 9 decimals
        decimals: 9,
      },
    };
  }

  /**
   * Get balance
   */
  async getBalance(publicKey: PublicKey): Promise<number> {
    const config = getMockConfig();
    
    if (config.simulateConnectionError) {
      throw new Error(NETWORK_ERRORS[config.network].connection);
    }
    
    // Return SOL balance from config
    return config.tokenBalances['So11111111111111111111111111111111111111112'] * 1e9; // Convert to lamports
  }

  /**
   * Get minimum balance for rent exemption
   */
  async getMinimumBalanceForRentExemption(dataSize: number): Promise<number> {
    return 2039280; // Mock value
  }

  /**
   * Get account info
   */
  async getAccountInfo(publicKey: PublicKey): Promise<any> {
    const config = getMockConfig();
    
    if (config.simulateConnectionError) {
      throw new Error(NETWORK_ERRORS[config.network].connection);
    }
    
    // Return mock account info
    return {
      executable: false,
      owner: new PublicKey('11111111111111111111111111111111'),
      lamports: 1000000000,
      data: Buffer.from([]),
    };
  }
}

/**
 * Create a mock Connection instance
 */
export function createMockConnection(endpoint: string, commitment?: string): Connection {
  const mockConnection = new MockConnection(endpoint, commitment);
  
  // Cast the mock connection to a real Connection type
  return mockConnection as unknown as Connection;
}
