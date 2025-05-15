import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { getMockConfig, NETWORK_ERRORS } from './config';

/**
 * Mock wallet adapter for testing
 */
export class MockWalletAdapter {
  private _publicKey: PublicKey | null = null;
  private _connected: boolean = false;

  constructor(publicKey?: string) {
    if (publicKey) {
      this._publicKey = new PublicKey(publicKey);
      this._connected = true;
    }
  }

  /**
   * Connect the wallet
   */
  async connect(): Promise<void> {
    const config = getMockConfig();
    
    if (config.simulateWalletError) {
      throw new Error('Failed to connect wallet');
    }
    
    this._publicKey = new PublicKey('DummyWa11etPubkeyXXXXXXXXXXXXXXXXXXXXXXX');
    this._connected = true;
  }

  /**
   * Disconnect the wallet
   */
  async disconnect(): Promise<void> {
    this._publicKey = null;
    this._connected = false;
  }

  /**
   * Sign a transaction
   */
  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    const config = getMockConfig();
    
    if (config.simulateWalletError) {
      throw new Error('Failed to sign transaction');
    }
    
    if (!this._connected || !this._publicKey) {
      throw new Error('Wallet not connected');
    }
    
    // For a real implementation, this would add a signature to the transaction
    // For testing, we just return the transaction as is
    return transaction;
  }

  /**
   * Sign multiple transactions
   */
  async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    const config = getMockConfig();
    
    if (config.simulateWalletError) {
      throw new Error('Failed to sign transactions');
    }
    
    if (!this._connected || !this._publicKey) {
      throw new Error('Wallet not connected');
    }
    
    // For testing, we just return the transactions as is
    return transactions;
  }

  /**
   * Sign a message
   */
  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    const config = getMockConfig();
    
    if (config.simulateWalletError) {
      throw new Error('Failed to sign message');
    }
    
    if (!this._connected || !this._publicKey) {
      throw new Error('Wallet not connected');
    }
    
    // Return the message as the signature for testing
    return message;
  }

  /**
   * Get the wallet public key
   */
  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  /**
   * Get the wallet connection status
   */
  get connected(): boolean {
    return this._connected;
  }
}

/**
 * Create a mock wallet context state for testing
 */
export function createMockWalletContextState(publicKey?: string): WalletContextState {
  const mockWallet = new MockWalletAdapter(publicKey);
  
  return {
    publicKey: mockWallet.publicKey,
    connected: mockWallet.connected,
    connecting: false,
    disconnecting: false,
    
    connect: jest.fn(async () => await mockWallet.connect()),
    disconnect: jest.fn(async () => await mockWallet.disconnect()),
    select: jest.fn(),
    sendTransaction: jest.fn(async (transaction, connection, options) => {
      const config = getMockConfig();
      
      if (config.simulateWalletError) {
        throw new Error('Failed to send transaction');
      }
      
      // Mock transaction signature
      return 'mock-transaction-signature-' + Math.random().toString(36).substring(2, 15);
    }),
    signTransaction: jest.fn(async (transaction) => await mockWallet.signTransaction(transaction)),
    signAllTransactions: jest.fn(async (transactions) => await mockWallet.signAllTransactions(transactions)),
    signMessage: jest.fn(async (message) => await mockWallet.signMessage(message)),
    wallet: null,
    adapter: null,
  };
}
