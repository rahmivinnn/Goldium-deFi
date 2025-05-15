"use client"

import { 
  Connection, 
  Transaction, 
  VersionedTransaction, 
  TransactionInstruction,
  PublicKey,
  LAMPORTS_PER_SOL
} from "@solana/web3.js"
import { NetworkType } from "@/components/NetworkContextProvider"
import { getTransactionPreviewService, TransactionPreview } from "@/services/transaction-preview"
import { TokenPriceData } from "@/services/token-price-cache"

// Anomaly type
export enum AnomalyType {
  UNUSUAL_PROGRAM = 'unusual_program',
  HIGH_VALUE_TRANSFER = 'high_value_transfer',
  UNUSUAL_ACCOUNT_CREATION = 'unusual_account_creation',
  UNUSUAL_TOKEN_TRANSFER = 'unusual_token_transfer',
  UNUSUAL_PATTERN = 'unusual_pattern',
  POTENTIAL_SCAM = 'potential_scam',
}

// Anomaly severity
export enum AnomalySeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

// Anomaly interface
export interface Anomaly {
  type: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  details?: any;
}

// Transaction history item
export interface TransactionHistoryItem {
  signature: string;
  timestamp: number;
  programIds: string[];
  accounts: string[];
  tokenTransfers?: {
    mint: string;
    amount: number;
  }[];
  solTransfers?: {
    amount: number;
  }[];
}

// Anomaly detection options
export interface AnomalyDetectionOptions {
  tokenPrices?: Record<string, TokenPriceData>;
  transactionHistory?: TransactionHistoryItem[];
  highValueThreshold?: number; // USD value threshold for high value transfers
  unusualProgramThreshold?: number; // Number of times a program must be seen to be considered usual
}

/**
 * Transaction anomaly detection service
 */
export class TransactionAnomalyDetectionService {
  private connection: Connection;
  private network: NetworkType;
  private previewService: ReturnType<typeof getTransactionPreviewService>;
  private knownSafeProgramIds: string[] = [];
  private knownScamProgramIds: string[] = [];
  private knownScamTokens: string[] = [];
  
  constructor(connection: Connection, network: NetworkType) {
    this.connection = connection;
    this.network = network;
    this.previewService = getTransactionPreviewService(connection, network);
    
    // Initialize known program IDs and tokens
    this.initializeKnownEntities();
  }
  
  /**
   * Update the connection and network
   */
  public updateConnection(connection: Connection, network: NetworkType): void {
    this.connection = connection;
    this.network = network;
    this.previewService.updateConnection(connection, network);
  }
  
  /**
   * Detect anomalies in a transaction
   */
  public async detectAnomalies(
    transaction: Transaction | VersionedTransaction | TransactionInstruction[],
    signers?: PublicKey[],
    options: AnomalyDetectionOptions = {}
  ): Promise<Anomaly[]> {
    const {
      tokenPrices = {},
      transactionHistory = [],
      highValueThreshold = 1000, // $1000 USD
      unusualProgramThreshold = 3,
    } = options;
    
    const anomalies: Anomaly[] = [];
    
    // Generate transaction preview
    const preview = await this.previewService.previewTransaction(transaction, signers, tokenPrices);
    
    // Check for unusual programs
    await this.detectUnusualPrograms(
      anomalies,
      preview,
      transactionHistory,
      unusualProgramThreshold
    );
    
    // Check for high value transfers
    this.detectHighValueTransfers(
      anomalies,
      preview,
      highValueThreshold
    );
    
    // Check for unusual account creations
    this.detectUnusualAccountCreations(
      anomalies,
      preview
    );
    
    // Check for unusual token transfers
    this.detectUnusualTokenTransfers(
      anomalies,
      preview,
      transactionHistory
    );
    
    // Check for potential scams
    this.detectPotentialScams(
      anomalies,
      preview
    );
    
    // Check for unusual patterns
    this.detectUnusualPatterns(
      anomalies,
      preview,
      transactionHistory
    );
    
    return anomalies;
  }
  
  /**
   * Detect unusual programs
   */
  private async detectUnusualPrograms(
    anomalies: Anomaly[],
    preview: TransactionPreview,
    transactionHistory: TransactionHistoryItem[],
    unusualProgramThreshold: number
  ): Promise<void> {
    // Get program IDs from preview
    const programIds = preview.accounts.programIds;
    
    // Check each program ID
    for (const programId of programIds) {
      // Skip known safe programs
      if (this.knownSafeProgramIds.includes(programId)) {
        continue;
      }
      
      // Check if program is in known scam list
      if (this.knownScamProgramIds.includes(programId)) {
        anomalies.push({
          type: AnomalyType.POTENTIAL_SCAM,
          severity: AnomalySeverity.CRITICAL,
          description: `Transaction interacts with a known malicious program: ${programId}`,
          details: { programId },
        });
        continue;
      }
      
      // Count how many times this program appears in transaction history
      const programCount = transactionHistory.filter(tx => 
        tx.programIds.includes(programId)
      ).length;
      
      // If program is rarely used, flag it as unusual
      if (programCount < unusualProgramThreshold) {
        // Try to get program info
        try {
          const accountInfo = await this.connection.getAccountInfo(new PublicKey(programId));
          
          // If program doesn't exist, that's very suspicious
          if (!accountInfo) {
            anomalies.push({
              type: AnomalyType.UNUSUAL_PROGRAM,
              severity: AnomalySeverity.CRITICAL,
              description: `Transaction interacts with a program that doesn't exist: ${programId}`,
              details: { programId, programCount },
            });
          } 
          // If program exists but is rarely used
          else {
            anomalies.push({
              type: AnomalyType.UNUSUAL_PROGRAM,
              severity: AnomalySeverity.WARNING,
              description: `Transaction interacts with an unusual program: ${programId}`,
              details: { programId, programCount },
            });
          }
        } catch (error) {
          console.error(`Error checking program ${programId}:`, error);
          
          // If we can't check the program, flag it as unusual
          anomalies.push({
            type: AnomalyType.UNUSUAL_PROGRAM,
            severity: AnomalySeverity.WARNING,
            description: `Transaction interacts with an unusual program: ${programId}`,
            details: { programId, programCount },
          });
        }
      }
    }
  }
  
  /**
   * Detect high value transfers
   */
  private detectHighValueTransfers(
    anomalies: Anomaly[],
    preview: TransactionPreview,
    highValueThreshold: number
  ): void {
    // Check SOL transfers
    for (const solChange of preview.solChanges) {
      if (solChange.usdValue && Math.abs(solChange.usdValue) > highValueThreshold) {
        anomalies.push({
          type: AnomalyType.HIGH_VALUE_TRANSFER,
          severity: AnomalySeverity.WARNING,
          description: `High value SOL transfer: ${solChange.formattedChange} (approx. $${Math.abs(solChange.usdValue).toFixed(2)})`,
          details: { solChange },
        });
      }
    }
    
    // Check token transfers
    for (const tokenChange of preview.tokenChanges) {
      if (tokenChange.usdValue && Math.abs(tokenChange.usdValue) > highValueThreshold) {
        anomalies.push({
          type: AnomalyType.HIGH_VALUE_TRANSFER,
          severity: AnomalySeverity.WARNING,
          description: `High value token transfer: ${tokenChange.formattedChange} (approx. $${Math.abs(tokenChange.usdValue).toFixed(2)})`,
          details: { tokenChange },
        });
      }
    }
  }
  
  /**
   * Detect unusual account creations
   */
  private detectUnusualAccountCreations(
    anomalies: Anomaly[],
    preview: TransactionPreview
  ): void {
    // Check for new account creations
    if (preview.accounts.newAccounts.length > 3) {
      anomalies.push({
        type: AnomalyType.UNUSUAL_ACCOUNT_CREATION,
        severity: AnomalySeverity.WARNING,
        description: `Transaction creates an unusually high number of accounts: ${preview.accounts.newAccounts.length}`,
        details: { newAccounts: preview.accounts.newAccounts },
      });
    }
  }
  
  /**
   * Detect unusual token transfers
   */
  private detectUnusualTokenTransfers(
    anomalies: Anomaly[],
    preview: TransactionPreview,
    transactionHistory: TransactionHistoryItem[]
  ): void {
    // Check each token transfer
    for (const tokenChange of preview.tokenChanges) {
      // Check if token is in known scam list
      if (this.knownScamTokens.includes(tokenChange.mint)) {
        anomalies.push({
          type: AnomalyType.POTENTIAL_SCAM,
          severity: AnomalySeverity.CRITICAL,
          description: `Transaction involves a known scam token: ${tokenChange.mintSymbol || tokenChange.mint}`,
          details: { tokenChange },
        });
        continue;
      }
      
      // Count how many times this token appears in transaction history
      const tokenCount = transactionHistory.filter(tx => 
        tx.tokenTransfers?.some(transfer => transfer.mint === tokenChange.mint)
      ).length;
      
      // If token is rarely used, flag it as unusual
      if (tokenCount < 2) {
        anomalies.push({
          type: AnomalyType.UNUSUAL_TOKEN_TRANSFER,
          severity: AnomalySeverity.INFO,
          description: `Transaction involves an unusual token: ${tokenChange.mintSymbol || tokenChange.mint}`,
          details: { tokenChange, tokenCount },
        });
      }
    }
  }
  
  /**
   * Detect potential scams
   */
  private detectPotentialScams(
    anomalies: Anomaly[],
    preview: TransactionPreview
  ): void {
    // Check for suspicious patterns in logs
    const logs = preview.logs.join('\n').toLowerCase();
    
    // Check for suspicious keywords
    const suspiciousKeywords = [
      'airdrop',
      'free',
      'claim',
      'reward',
      'bonus',
      'giveaway',
      'prize',
      'winner',
    ];
    
    for (const keyword of suspiciousKeywords) {
      if (logs.includes(keyword)) {
        anomalies.push({
          type: AnomalyType.POTENTIAL_SCAM,
          severity: AnomalySeverity.WARNING,
          description: `Transaction contains suspicious keyword: "${keyword}"`,
          details: { keyword },
        });
        break;
      }
    }
  }
  
  /**
   * Detect unusual patterns
   */
  private detectUnusualPatterns(
    anomalies: Anomaly[],
    preview: TransactionPreview,
    transactionHistory: TransactionHistoryItem[]
  ): void {
    // Check for unusual combinations of programs
    const programIds = preview.accounts.programIds;
    
    // Example: If transaction uses both token program and system program
    // and transfers tokens to an address that's not in transaction history
    if (
      programIds.includes('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') && 
      programIds.includes('11111111111111111111111111111111') &&
      preview.tokenChanges.length > 0
    ) {
      // Get recipient addresses
      const recipientAddresses = preview.tokenChanges
        .filter(change => change.rawChange < 0)
        .map(change => change.walletAddress);
      
      // Check if any recipient is not in transaction history
      for (const recipient of recipientAddresses) {
        const isKnownRecipient = transactionHistory.some(tx => 
          tx.accounts.includes(recipient)
        );
        
        if (!isKnownRecipient) {
          anomalies.push({
            type: AnomalyType.UNUSUAL_PATTERN,
            severity: AnomalySeverity.INFO,
            description: `Transaction transfers tokens to an unknown address: ${recipient}`,
            details: { recipient },
          });
        }
      }
    }
  }
  
  /**
   * Initialize known entities
   */
  private initializeKnownEntities(): void {
    // Known safe program IDs
    this.knownSafeProgramIds = [
      '11111111111111111111111111111111', // System Program
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Token Program
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', // Associated Token Program
      'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr', // Memo Program
      'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s', // Metaplex Token Metadata
      'ComputeBudget111111111111111111111111111111', // Compute Budget Program
    ];
    
    // Known scam program IDs (this is just an example)
    this.knownScamProgramIds = [
      // Add any known malicious program IDs here
    ];
    
    // Known scam tokens (this is just an example)
    this.knownScamTokens = [
      // Add any known scam token mints here
    ];
  }
}

// Singleton instance
let transactionAnomalyDetectionService: TransactionAnomalyDetectionService | null = null;

/**
 * Get the transaction anomaly detection service instance
 */
export function getTransactionAnomalyDetectionService(
  connection: Connection,
  network: NetworkType
): TransactionAnomalyDetectionService {
  if (!transactionAnomalyDetectionService) {
    transactionAnomalyDetectionService = new TransactionAnomalyDetectionService(connection, network);
  } else {
    transactionAnomalyDetectionService.updateConnection(connection, network);
  }
  
  return transactionAnomalyDetectionService;
}
