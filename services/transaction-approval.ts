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

// Transaction risk level
export enum TransactionRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Transaction approval status
export enum TransactionApprovalStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PENDING = 'pending',
  REQUIRES_CONFIRMATION = 'requires_confirmation',
}

// Transaction approval result
export interface TransactionApprovalResult {
  status: TransactionApprovalStatus;
  riskLevel: TransactionRiskLevel;
  riskFactors: string[];
  preview: TransactionPreview;
  requiresConfirmation: boolean;
  requiresHardwareWallet: boolean;
}

// Transaction approval options
export interface TransactionApprovalOptions {
  autoApproveThreshold?: number; // USD value threshold for auto-approval
  requireHardwareWalletThreshold?: number; // USD value threshold for requiring hardware wallet
  skipPreview?: boolean; // Skip preview generation
  tokenPrices?: Record<string, TokenPriceData>; // Token prices for value calculation
}

/**
 * Transaction approval service
 */
export class TransactionApprovalService {
  private connection: Connection;
  private network: NetworkType;
  private previewService: ReturnType<typeof getTransactionPreviewService>;
  private knownSafeProgramIds: string[] = [];
  private knownRiskyProgramIds: string[] = [];
  
  constructor(connection: Connection, network: NetworkType) {
    this.connection = connection;
    this.network = network;
    this.previewService = getTransactionPreviewService(connection, network);
    
    // Initialize known program IDs
    this.initializeKnownProgramIds();
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
   * Approve a transaction
   */
  public async approveTransaction(
    transaction: Transaction | VersionedTransaction | TransactionInstruction[],
    signers?: PublicKey[],
    options: TransactionApprovalOptions = {}
  ): Promise<TransactionApprovalResult> {
    const {
      autoApproveThreshold = 50, // $50 USD
      requireHardwareWalletThreshold = 1000, // $1000 USD
      skipPreview = false,
      tokenPrices = {},
    } = options;
    
    // Generate preview if not skipped
    const preview = skipPreview
      ? null
      : await this.previewService.previewTransaction(transaction, signers, tokenPrices);
    
    // If preview failed, reject the transaction
    if (preview && !preview.success) {
      return {
        status: TransactionApprovalStatus.REJECTED,
        riskLevel: TransactionRiskLevel.HIGH,
        riskFactors: [`Transaction simulation failed: ${preview.error}`],
        preview,
        requiresConfirmation: true,
        requiresHardwareWallet: false,
      };
    }
    
    // Assess risk factors
    const riskFactors: string[] = [];
    let riskLevel = TransactionRiskLevel.LOW;
    
    // Add preview warnings as risk factors
    if (preview) {
      riskFactors.push(...preview.warnings);
    }
    
    // Check program IDs
    const programIds = this.extractProgramIds(transaction);
    
    for (const programId of programIds) {
      if (this.knownRiskyProgramIds.includes(programId)) {
        riskFactors.push(`Transaction interacts with a potentially risky program: ${programId}`);
        riskLevel = TransactionRiskLevel.HIGH;
      } else if (!this.knownSafeProgramIds.includes(programId)) {
        riskFactors.push(`Transaction interacts with an unknown program: ${programId}`);
        riskLevel = Math.max(riskLevel, TransactionRiskLevel.MEDIUM);
      }
    }
    
    // Calculate total value at risk
    let totalValueUsd = 0;
    
    if (preview) {
      // Add SOL changes
      for (const solChange of preview.solChanges) {
        if (solChange.usdValue && solChange.rawChange < 0) {
          totalValueUsd += Math.abs(solChange.usdValue);
        }
      }
      
      // Add token changes
      for (const tokenChange of preview.tokenChanges) {
        if (tokenChange.usdValue && tokenChange.rawChange < 0) {
          totalValueUsd += Math.abs(tokenChange.usdValue);
        }
      }
    }
    
    // Adjust risk level based on value
    if (totalValueUsd > requireHardwareWalletThreshold) {
      riskFactors.push(`Transaction involves a large value: $${totalValueUsd.toFixed(2)}`);
      riskLevel = TransactionRiskLevel.HIGH;
    } else if (totalValueUsd > autoApproveThreshold) {
      riskFactors.push(`Transaction involves a moderate value: $${totalValueUsd.toFixed(2)}`);
      riskLevel = Math.max(riskLevel, TransactionRiskLevel.MEDIUM);
    }
    
    // Determine if confirmation is required
    const requiresConfirmation = riskLevel >= TransactionRiskLevel.MEDIUM || totalValueUsd > autoApproveThreshold;
    
    // Determine if hardware wallet is recommended
    const requiresHardwareWallet = riskLevel >= TransactionRiskLevel.HIGH || totalValueUsd > requireHardwareWalletThreshold;
    
    // Determine approval status
    let status: TransactionApprovalStatus;
    
    if (riskLevel >= TransactionRiskLevel.CRITICAL) {
      status = TransactionApprovalStatus.REJECTED;
    } else if (requiresConfirmation) {
      status = TransactionApprovalStatus.REQUIRES_CONFIRMATION;
    } else {
      status = TransactionApprovalStatus.APPROVED;
    }
    
    return {
      status,
      riskLevel,
      riskFactors,
      preview: preview || {
        success: true,
        warnings: [],
        tokenChanges: [],
        solChanges: [],
        logs: [],
        estimatedFee: 0,
        formattedEstimatedFee: "0 SOL",
        accounts: {
          writableCount: 0,
          signerCount: 0,
          readonlyCount: 0,
          newAccounts: [],
          programIds: [],
        },
      },
      requiresConfirmation,
      requiresHardwareWallet,
    };
  }
  
  /**
   * Extract program IDs from a transaction
   */
  private extractProgramIds(
    transaction: Transaction | VersionedTransaction | TransactionInstruction[]
  ): string[] {
    const programIds: string[] = [];
    
    // Extract instructions
    let instructions: TransactionInstruction[];
    
    if (Array.isArray(transaction)) {
      instructions = transaction;
    } else if (transaction instanceof Transaction) {
      instructions = transaction.instructions;
    } else if (transaction instanceof VersionedTransaction) {
      // This is a simplification
      instructions = [];
    } else {
      throw new Error('Unsupported transaction type');
    }
    
    // Extract program IDs from instructions
    for (const instruction of instructions) {
      const programIdStr = instruction.programId.toString();
      if (!programIds.includes(programIdStr)) {
        programIds.push(programIdStr);
      }
    }
    
    return programIds;
  }
  
  /**
   * Initialize known program IDs
   */
  private initializeKnownProgramIds(): void {
    // Known safe program IDs
    this.knownSafeProgramIds = [
      '11111111111111111111111111111111', // System Program
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Token Program
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', // Associated Token Program
      'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr', // Memo Program
      'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s', // Metaplex Token Metadata
      'ComputeBudget111111111111111111111111111111', // Compute Budget Program
    ];
    
    // Known risky program IDs (this is just an example)
    this.knownRiskyProgramIds = [
      // Add any known malicious program IDs here
    ];
  }
}

// Singleton instance
let transactionApprovalService: TransactionApprovalService | null = null;

/**
 * Get the transaction approval service instance
 */
export function getTransactionApprovalService(
  connection: Connection,
  network: NetworkType
): TransactionApprovalService {
  if (!transactionApprovalService) {
    transactionApprovalService = new TransactionApprovalService(connection, network);
  } else {
    transactionApprovalService.updateConnection(connection, network);
  }
  
  return transactionApprovalService;
}
