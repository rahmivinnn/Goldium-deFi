"use client"

import { 
  Connection, 
  Transaction, 
  VersionedTransaction, 
  TransactionInstruction,
  PublicKey,
  AccountMeta,
  LAMPORTS_PER_SOL
} from "@solana/web3.js"
import { NetworkType } from "@/components/NetworkContextProvider"
import { getTransactionSimulationCacheService } from "@/services/transaction-simulation-cache"
import { TokenPriceData } from "@/services/token-price-cache"

// Token amount change interface
export interface TokenAmountChange {
  mint: string;
  mintName?: string;
  mintSymbol?: string;
  mintDecimals: number;
  walletAddress: string;
  preBalance: number;
  postBalance: number;
  rawChange: number;
  formattedChange: string;
  usdValue?: number;
}

// SOL amount change interface
export interface SolAmountChange {
  walletAddress: string;
  preBalance: number;
  postBalance: number;
  rawChange: number;
  formattedChange: string;
  usdValue?: number;
  fee: number;
  formattedFee: string;
}

// Transaction preview interface
export interface TransactionPreview {
  success: boolean;
  error?: string;
  warnings: string[];
  tokenChanges: TokenAmountChange[];
  solChanges: SolAmountChange[];
  logs: string[];
  unitsConsumed?: number;
  estimatedFee: number;
  formattedEstimatedFee: string;
  accounts: {
    writableCount: number;
    signerCount: number;
    readonlyCount: number;
    newAccounts: string[];
    programIds: string[];
  };
}

// Known token info
interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
}

/**
 * Transaction preview service
 */
export class TransactionPreviewService {
  private connection: Connection;
  private network: NetworkType;
  private simulationService: ReturnType<typeof getTransactionSimulationCacheService>;
  private knownTokens: Record<string, TokenInfo> = {};
  
  constructor(connection: Connection, network: NetworkType) {
    this.connection = connection;
    this.network = network;
    this.simulationService = getTransactionSimulationCacheService(connection, network);
    
    // Initialize known tokens
    this.initializeKnownTokens();
  }
  
  /**
   * Update the connection and network
   */
  public updateConnection(connection: Connection, network: NetworkType): void {
    this.connection = connection;
    this.network = network;
    this.simulationService.updateConnection(connection, network);
  }
  
  /**
   * Generate a preview for a transaction
   */
  public async previewTransaction(
    transaction: Transaction | VersionedTransaction | TransactionInstruction[],
    signers?: PublicKey[],
    tokenPrices?: Record<string, TokenPriceData>
  ): Promise<TransactionPreview> {
    // Simulate the transaction
    const simulationResult = await this.simulationService.simulateTransaction(transaction, signers);
    
    // Extract accounts from transaction
    const accounts = this.extractAccounts(transaction);
    
    // Initialize preview
    const preview: TransactionPreview = {
      success: simulationResult.success,
      error: simulationResult.error,
      warnings: [],
      tokenChanges: [],
      solChanges: [],
      logs: simulationResult.logs || [],
      unitsConsumed: simulationResult.unitsConsumed,
      estimatedFee: 0,
      formattedEstimatedFee: "0 SOL",
      accounts: {
        writableCount: accounts.writable.length,
        signerCount: accounts.signers.length,
        readonlyCount: accounts.readonly.length,
        newAccounts: [],
        programIds: [...new Set(accounts.programIds)],
      },
    };
    
    // If simulation failed, return early
    if (!simulationResult.success) {
      return preview;
    }
    
    // Estimate fee
    preview.estimatedFee = await this.estimateTransactionFee(transaction);
    preview.formattedEstimatedFee = `${(preview.estimatedFee / LAMPORTS_PER_SOL).toFixed(6)} SOL`;
    
    // Parse token and SOL changes from logs
    await this.parseBalanceChanges(preview, simulationResult.logs || [], accounts, tokenPrices);
    
    // Check for new account creations
    preview.accounts.newAccounts = await this.detectNewAccounts(accounts.writable);
    
    // Add warnings
    this.addWarnings(preview, accounts);
    
    return preview;
  }
  
  /**
   * Extract accounts from a transaction
   */
  private extractAccounts(
    transaction: Transaction | VersionedTransaction | TransactionInstruction[]
  ): {
    writable: string[];
    readonly: string[];
    signers: string[];
    programIds: string[];
  } {
    const writable: string[] = [];
    const readonly: string[] = [];
    const signers: string[] = [];
    const programIds: string[] = [];
    
    // Extract instructions
    let instructions: TransactionInstruction[];
    
    if (Array.isArray(transaction)) {
      instructions = transaction;
    } else if (transaction instanceof Transaction) {
      instructions = transaction.instructions;
      
      // Add fee payer to signers and writable
      if (transaction.feePayer) {
        const feePayerStr = transaction.feePayer.toString();
        if (!signers.includes(feePayerStr)) {
          signers.push(feePayerStr);
        }
        if (!writable.includes(feePayerStr)) {
          writable.push(feePayerStr);
        }
      }
    } else if (transaction instanceof VersionedTransaction) {
      // This is a simplification - extracting accounts from VersionedTransaction
      // would require more complex logic to handle address lookup tables
      instructions = [];
      
      // Add a warning that this is a simplified preview
      console.warn('Simplified preview for VersionedTransaction');
    } else {
      throw new Error('Unsupported transaction type');
    }
    
    // Process instructions
    for (const instruction of instructions) {
      // Add program ID
      const programIdStr = instruction.programId.toString();
      if (!programIds.includes(programIdStr)) {
        programIds.push(programIdStr);
      }
      
      // Process account metas
      for (const accountMeta of instruction.keys) {
        const pubkeyStr = accountMeta.pubkey.toString();
        
        if (accountMeta.isSigner && !signers.includes(pubkeyStr)) {
          signers.push(pubkeyStr);
        }
        
        if (accountMeta.isWritable) {
          if (!writable.includes(pubkeyStr)) {
            writable.push(pubkeyStr);
          }
        } else if (!readonly.includes(pubkeyStr)) {
          readonly.push(pubkeyStr);
        }
      }
    }
    
    return { writable, readonly, signers, programIds };
  }
  
  /**
   * Estimate transaction fee
   */
  private async estimateTransactionFee(
    transaction: Transaction | VersionedTransaction | TransactionInstruction[]
  ): Promise<number> {
    try {
      // For instruction arrays, create a transaction
      if (Array.isArray(transaction)) {
        const tx = new Transaction();
        transaction.forEach(instruction => tx.add(instruction));
        
        // Add a recent blockhash
        const { blockhash } = await this.connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        
        transaction = tx;
      }
      
      // For Transaction objects, ensure it has a recent blockhash
      if (transaction instanceof Transaction && !transaction.recentBlockhash) {
        const { blockhash } = await this.connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
      }
      
      // Get fee from simulation result
      const simulationResult = await this.simulationService.simulateTransaction(transaction);
      
      // Use units consumed to estimate fee
      if (simulationResult.unitsConsumed) {
        // This is a simplified fee calculation
        // In reality, fees depend on the current fee structure and priority fees
        const baseFee = 5000; // Base fee in lamports
        const computeUnitPrice = 0.00001; // Lamports per compute unit
        
        return baseFee + Math.ceil(simulationResult.unitsConsumed * computeUnitPrice);
      }
      
      // Fallback to a default estimate
      return 5000; // 0.000005 SOL
    } catch (error) {
      console.error('Error estimating transaction fee:', error);
      return 10000; // 0.00001 SOL as a safe default
    }
  }
  
  /**
   * Parse balance changes from simulation logs
   */
  private async parseBalanceChanges(
    preview: TransactionPreview,
    logs: string[],
    accounts: { writable: string[]; readonly: string[]; signers: string[]; programIds: string[] },
    tokenPrices?: Record<string, TokenPriceData>
  ): Promise<void> {
    // This is a simplified implementation
    // In a real app, you would parse the logs to extract token transfers and SOL changes
    // For now, we'll generate mock data based on the accounts
    
    // Mock SOL changes for fee payer
    if (accounts.signers.length > 0) {
      const feePayer = accounts.signers[0];
      
      preview.solChanges.push({
        walletAddress: feePayer,
        preBalance: 1 * LAMPORTS_PER_SOL,
        postBalance: 1 * LAMPORTS_PER_SOL - preview.estimatedFee,
        rawChange: -preview.estimatedFee,
        formattedChange: `-${(preview.estimatedFee / LAMPORTS_PER_SOL).toFixed(6)} SOL`,
        fee: preview.estimatedFee,
        formattedFee: `${(preview.estimatedFee / LAMPORTS_PER_SOL).toFixed(6)} SOL`,
        usdValue: tokenPrices?.['SOL']?.price ? (preview.estimatedFee / LAMPORTS_PER_SOL) * tokenPrices['SOL'].price : undefined,
      });
    }
    
    // Look for token program in program IDs
    const hasTokenProgram = accounts.programIds.some(id => 
      id === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' || // Token program
      id === 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'   // Associated Token program
    );
    
    // If token program is involved, mock some token changes
    if (hasTokenProgram && accounts.writable.length > 2) {
      // Find some token accounts (this is just a mock)
      const tokenAccounts = accounts.writable.slice(1, 3);
      
      for (const tokenAccount of tokenAccounts) {
        // Mock a token transfer
        const mockMint = '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'; // Example mint
        const mockDecimals = 6;
        const mockChange = Math.random() * 100;
        const formattedChange = (mockChange / Math.pow(10, mockDecimals)).toFixed(mockDecimals);
        
        preview.tokenChanges.push({
          mint: mockMint,
          mintName: this.knownTokens[mockMint]?.name || 'Unknown Token',
          mintSymbol: this.knownTokens[mockMint]?.symbol || 'UNKNOWN',
          mintDecimals: mockDecimals,
          walletAddress: tokenAccount,
          preBalance: 1000 * Math.pow(10, mockDecimals),
          postBalance: 1000 * Math.pow(10, mockDecimals) + mockChange,
          rawChange: mockChange,
          formattedChange: `+${formattedChange} ${this.knownTokens[mockMint]?.symbol || 'UNKNOWN'}`,
          usdValue: tokenPrices?.[mockMint]?.price ? mockChange / Math.pow(10, mockDecimals) * tokenPrices[mockMint].price : undefined,
        });
      }
    }
  }
  
  /**
   * Detect new account creations
   */
  private async detectNewAccounts(writableAccounts: string[]): Promise<string[]> {
    const newAccounts: string[] = [];
    
    // Check each writable account to see if it exists
    for (const account of writableAccounts) {
      try {
        const accountInfo = await this.connection.getAccountInfo(new PublicKey(account));
        
        // If account doesn't exist, it might be created by this transaction
        if (!accountInfo) {
          newAccounts.push(account);
        }
      } catch (error) {
        console.error(`Error checking account ${account}:`, error);
      }
    }
    
    return newAccounts;
  }
  
  /**
   * Add warnings to the preview
   */
  private addWarnings(
    preview: TransactionPreview,
    accounts: { writable: string[]; readonly: string[]; signers: string[]; programIds: string[] }
  ): void {
    // Check for large number of writable accounts
    if (accounts.writable.length > 10) {
      preview.warnings.push(`Transaction modifies ${accounts.writable.length} accounts, which is unusually high.`);
    }
    
    // Check for large number of signers
    if (accounts.signers.length > 2) {
      preview.warnings.push(`Transaction requires ${accounts.signers.length} signers, which is unusually high.`);
    }
    
    // Check for new account creations
    if (preview.accounts.newAccounts.length > 0) {
      preview.warnings.push(`Transaction creates ${preview.accounts.newAccounts.length} new accounts.`);
    }
    
    // Check for token program interactions
    const hasTokenProgram = accounts.programIds.some(id => 
      id === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
    );
    
    if (hasTokenProgram) {
      preview.warnings.push('Transaction interacts with token accounts. Verify token transfers are as expected.');
    }
    
    // Check for large SOL transfers
    for (const solChange of preview.solChanges) {
      if (Math.abs(solChange.rawChange) > 0.1 * LAMPORTS_PER_SOL) {
        preview.warnings.push(`Transaction includes a large SOL transfer of ${Math.abs(solChange.rawChange / LAMPORTS_PER_SOL).toFixed(3)} SOL.`);
      }
    }
    
    // Check for large token transfers
    for (const tokenChange of preview.tokenChanges) {
      const absChange = Math.abs(tokenChange.rawChange) / Math.pow(10, tokenChange.mintDecimals);
      
      // If USD value is available and it's large
      if (tokenChange.usdValue && Math.abs(tokenChange.usdValue) > 100) {
        preview.warnings.push(`Transaction includes a large token transfer worth approximately $${Math.abs(tokenChange.usdValue).toFixed(2)}.`);
      } 
      // Otherwise check the raw amount
      else if (absChange > 1000) {
        preview.warnings.push(`Transaction includes a large token transfer of ${absChange.toFixed(2)} ${tokenChange.mintSymbol || 'tokens'}.`);
      }
    }
  }
  
  /**
   * Initialize known tokens
   */
  private initializeKnownTokens(): void {
    // This would typically be loaded from a token list API
    // For now, we'll just add a few examples
    this.knownTokens = {
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      },
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      },
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
        name: 'USDT',
        symbol: 'USDT',
        decimals: 6,
      },
      'So11111111111111111111111111111111111111112': {
        name: 'Wrapped SOL',
        symbol: 'wSOL',
        decimals: 9,
      },
    };
  }
}

// Singleton instance
let transactionPreviewService: TransactionPreviewService | null = null;

/**
 * Get the transaction preview service instance
 */
export function getTransactionPreviewService(
  connection: Connection,
  network: NetworkType
): TransactionPreviewService {
  if (!transactionPreviewService) {
    transactionPreviewService = new TransactionPreviewService(connection, network);
  } else {
    transactionPreviewService.updateConnection(connection, network);
  }
  
  return transactionPreviewService;
}
