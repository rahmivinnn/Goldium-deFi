"use client"

import { NetworkType } from "@/components/NetworkContextProvider"

// Error categories
export enum ErrorCategory {
  WALLET_ERROR = 'wallet_error',
  NETWORK_ERROR = 'network_error',
  TRANSACTION_ERROR = 'transaction_error',
  CONTRACT_ERROR = 'contract_error',
  USER_ERROR = 'user_error',
  UNKNOWN_ERROR = 'unknown_error',
}

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// Error data structure
export interface ErrorData {
  id: string;
  timestamp: number;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  network: NetworkType;
  transactionSignature?: string;
  walletAddress?: string;
  stackTrace?: string;
  metadata?: Record<string, any>;
  resolved: boolean;
  retryCount: number;
  maxRetries: number;
}

// Retry strategy configuration
export interface RetryStrategy {
  maxRetries: number;
  initialDelay: number; // milliseconds
  backoffFactor: number;
  maxDelay: number; // milliseconds
}

// Default retry strategies by error category
const DEFAULT_RETRY_STRATEGIES: Record<ErrorCategory, RetryStrategy> = {
  [ErrorCategory.WALLET_ERROR]: {
    maxRetries: 3,
    initialDelay: 1000,
    backoffFactor: 1.5,
    maxDelay: 10000,
  },
  [ErrorCategory.NETWORK_ERROR]: {
    maxRetries: 5,
    initialDelay: 500,
    backoffFactor: 2,
    maxDelay: 15000,
  },
  [ErrorCategory.TRANSACTION_ERROR]: {
    maxRetries: 3,
    initialDelay: 2000,
    backoffFactor: 1.5,
    maxDelay: 20000,
  },
  [ErrorCategory.CONTRACT_ERROR]: {
    maxRetries: 2,
    initialDelay: 3000,
    backoffFactor: 2,
    maxDelay: 15000,
  },
  [ErrorCategory.USER_ERROR]: {
    maxRetries: 0, // Don't retry user errors
    initialDelay: 0,
    backoffFactor: 1,
    maxDelay: 0,
  },
  [ErrorCategory.UNKNOWN_ERROR]: {
    maxRetries: 1,
    initialDelay: 2000,
    backoffFactor: 2,
    maxDelay: 10000,
  },
};

// User-friendly error messages
export const USER_FRIENDLY_MESSAGES: Record<string, string> = {
  // Wallet errors
  'Wallet not connected': 'Please connect your wallet to continue.',
  'User rejected the request': 'Transaction was cancelled. Please try again.',
  
  // Network errors
  'Failed to fetch': 'Network connection issue. Please check your internet connection.',
  'Timeout': 'The operation timed out. The network might be congested.',
  
  // Transaction errors
  'Transaction simulation failed': 'Transaction failed during simulation. This could be due to insufficient funds or a contract error.',
  'Blockhash not found': 'The network is experiencing high traffic. Please try again later.',
  'Transaction too large': 'Transaction is too large. Try splitting it into multiple smaller transactions.',
  
  // Contract errors
  'Program execution error': 'Smart contract execution failed. This could be due to invalid parameters or contract state.',
  'Invalid instruction data': 'Invalid transaction data. Please report this issue.',
  
  // Generic errors
  'Unknown error': 'An unexpected error occurred. Please try again or contact support.',
};

/**
 * Error monitoring service for tracking and managing errors
 */
export class ErrorMonitoringService {
  private errors: ErrorData[] = [];
  private retryStrategies: Record<ErrorCategory, RetryStrategy>;
  private onErrorListeners: ((error: ErrorData) => void)[] = [];
  
  constructor(customRetryStrategies?: Partial<Record<ErrorCategory, Partial<RetryStrategy>>>) {
    // Initialize retry strategies with defaults and any custom overrides
    this.retryStrategies = { ...DEFAULT_RETRY_STRATEGIES };
    
    if (customRetryStrategies) {
      Object.entries(customRetryStrategies).forEach(([category, strategy]) => {
        const errorCategory = category as ErrorCategory;
        this.retryStrategies[errorCategory] = {
          ...this.retryStrategies[errorCategory],
          ...strategy,
        };
      });
    }
    
    // Load errors from local storage
    this.loadErrors();
  }
  
  /**
   * Log a new error
   */
  public logError(
    error: Error | string,
    category: ErrorCategory = ErrorCategory.UNKNOWN_ERROR,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    metadata: Record<string, any> = {},
    network: NetworkType = 'devnet',
  ): ErrorData {
    const message = typeof error === 'string' ? error : error.message;
    const stackTrace = typeof error === 'string' ? undefined : error.stack;
    
    const errorData: ErrorData = {
      id: this.generateErrorId(),
      timestamp: Date.now(),
      message,
      category,
      severity,
      network,
      stackTrace,
      metadata,
      resolved: false,
      retryCount: 0,
      maxRetries: this.retryStrategies[category].maxRetries,
    };
    
    // Add to errors list
    this.errors.push(errorData);
    
    // Save to local storage
    this.saveErrors();
    
    // Notify listeners
    this.notifyListeners(errorData);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${category}][${severity}] ${message}`, metadata);
    }
    
    return errorData;
  }
  
  /**
   * Get all errors
   */
  public getErrors(): ErrorData[] {
    return [...this.errors];
  }
  
  /**
   * Get errors by category
   */
  public getErrorsByCategory(category: ErrorCategory): ErrorData[] {
    return this.errors.filter(error => error.category === category);
  }
  
  /**
   * Get errors by network
   */
  public getErrorsByNetwork(network: NetworkType): ErrorData[] {
    return this.errors.filter(error => error.network === network);
  }
  
  /**
   * Get unresolved errors
   */
  public getUnresolvedErrors(): ErrorData[] {
    return this.errors.filter(error => !error.resolved);
  }
  
  /**
   * Mark an error as resolved
   */
  public resolveError(errorId: string): boolean {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      this.saveErrors();
      return true;
    }
    return false;
  }
  
  /**
   * Clear all errors
   */
  public clearErrors(): void {
    this.errors = [];
    this.saveErrors();
  }
  
  /**
   * Add an error listener
   */
  public addErrorListener(listener: (error: ErrorData) => void): void {
    this.onErrorListeners.push(listener);
  }
  
  /**
   * Remove an error listener
   */
  public removeErrorListener(listener: (error: ErrorData) => void): void {
    this.onErrorListeners = this.onErrorListeners.filter(l => l !== listener);
  }
  
  /**
   * Get a user-friendly error message
   */
  public getUserFriendlyMessage(errorMessage: string): string {
    // Check for exact matches
    if (USER_FRIENDLY_MESSAGES[errorMessage]) {
      return USER_FRIENDLY_MESSAGES[errorMessage];
    }
    
    // Check for partial matches
    for (const [key, message] of Object.entries(USER_FRIENDLY_MESSAGES)) {
      if (errorMessage.includes(key)) {
        return message;
      }
    }
    
    // Default message
    return USER_FRIENDLY_MESSAGES['Unknown error'];
  }
  
  /**
   * Get retry strategy for an error
   */
  public getRetryStrategy(category: ErrorCategory): RetryStrategy {
    return this.retryStrategies[category] || this.retryStrategies[ErrorCategory.UNKNOWN_ERROR];
  }
  
  /**
   * Calculate delay for next retry
   */
  public getRetryDelay(error: ErrorData): number {
    const strategy = this.retryStrategies[error.category];
    const delay = strategy.initialDelay * Math.pow(strategy.backoffFactor, error.retryCount);
    return Math.min(delay, strategy.maxDelay);
  }
  
  /**
   * Increment retry count for an error
   */
  public incrementRetryCount(errorId: string): boolean {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.retryCount += 1;
      this.saveErrors();
      return error.retryCount <= error.maxRetries;
    }
    return false;
  }
  
  /**
   * Generate a unique error ID
   */
  private generateErrorId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
  
  /**
   * Notify all error listeners
   */
  private notifyListeners(error: ErrorData): void {
    this.onErrorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }
  
  /**
   * Save errors to local storage
   */
  private saveErrors(): void {
    try {
      localStorage.setItem('goldium-errors', JSON.stringify(this.errors));
    } catch (e) {
      console.error('Failed to save errors to local storage:', e);
    }
  }
  
  /**
   * Load errors from local storage
   */
  private loadErrors(): void {
    try {
      const storedErrors = localStorage.getItem('goldium-errors');
      if (storedErrors) {
        this.errors = JSON.parse(storedErrors);
      }
    } catch (e) {
      console.error('Failed to load errors from local storage:', e);
    }
  }
}

// Singleton instance
let errorService: ErrorMonitoringService | null = null;

/**
 * Get the error monitoring service instance
 */
export function getErrorMonitoringService(
  customRetryStrategies?: Partial<Record<ErrorCategory, Partial<RetryStrategy>>>
): ErrorMonitoringService {
  if (!errorService) {
    errorService = new ErrorMonitoringService(customRetryStrategies);
  }
  
  return errorService;
}
