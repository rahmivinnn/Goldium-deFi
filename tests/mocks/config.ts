/**
 * Configuration for mock blockchain services
 * This file contains settings that control the behavior of mock services
 */

export type NetworkType = 'devnet' | 'testnet' | 'mainnet-beta';

export interface MockConfig {
  // Network settings
  network: NetworkType;
  
  // Transaction settings
  transactionDelay: number; // milliseconds
  transactionSuccessRate: number; // 0-1
  confirmationDelay: number; // milliseconds
  
  // Error simulation
  simulateConnectionError: boolean;
  simulateWalletError: boolean;
  simulateTimeoutError: boolean;
  
  // Gas settings
  baseFeePerGas: number;
  priorityFeePerGas: number;
  networkCongestion: number; // 0-1
  
  // Token settings
  tokenBalances: Record<string, number>;
  tokenPrices: Record<string, number>;
}

// Default configuration
export const DEFAULT_MOCK_CONFIG: MockConfig = {
  network: 'devnet',
  transactionDelay: 500,
  transactionSuccessRate: 0.95,
  confirmationDelay: 1000,
  simulateConnectionError: false,
  simulateWalletError: false,
  simulateTimeoutError: false,
  baseFeePerGas: 10,
  priorityFeePerGas: 5,
  networkCongestion: 0.2,
  tokenBalances: {
    'So11111111111111111111111111111111111111112': 10, // SOL
    'GoLDiumDevXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX': 1000, // GOLD (devnet)
    'GoLDiumTestXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX': 1000, // GOLD (testnet)
    'ApkBg8kzMBpVKxvgrw67vkd5KuGWqSu2GVb19eK4pump': 1000, // GOLD (mainnet)
    '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU': 500, // USDC (devnet)
    'CpMah17kQEL2wqyMKt3mZBdTnZbkbfx4nqmQMFDP5vwp': 500, // USDC (testnet)
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 500, // USDC (mainnet)
  },
  tokenPrices: {
    'So11111111111111111111111111111111111111112': 100, // SOL
    'GoLDiumDevXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX': 5, // GOLD (devnet)
    'GoLDiumTestXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX': 5, // GOLD (testnet)
    'ApkBg8kzMBpVKxvgrw67vkd5KuGWqSu2GVb19eK4pump': 5, // GOLD (mainnet)
    '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU': 1, // USDC (devnet)
    'CpMah17kQEL2wqyMKt3mZBdTnZbkbfx4nqmQMFDP5vwp': 1, // USDC (testnet)
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 1, // USDC (mainnet)
  },
};

// Current configuration (can be modified during tests)
let currentConfig: MockConfig = { ...DEFAULT_MOCK_CONFIG };

// Get current configuration
export const getMockConfig = (): MockConfig => {
  return { ...currentConfig };
};

// Update configuration
export const updateMockConfig = (config: Partial<MockConfig>): void => {
  currentConfig = { ...currentConfig, ...config };
};

// Reset configuration to defaults
export const resetMockConfig = (): void => {
  currentConfig = { ...DEFAULT_MOCK_CONFIG };
};

// Network-specific error messages
export const NETWORK_ERRORS = {
  devnet: {
    connection: 'Failed to connect to devnet RPC endpoint',
    timeout: 'Transaction confirmation timeout on devnet',
    insufficientFunds: 'Insufficient funds for transaction on devnet',
    invalidInstruction: 'Invalid instruction data on devnet',
  },
  testnet: {
    connection: 'Failed to connect to testnet RPC endpoint',
    timeout: 'Transaction confirmation timeout on testnet',
    insufficientFunds: 'Insufficient funds for transaction on testnet',
    invalidInstruction: 'Invalid instruction data on testnet',
  },
  'mainnet-beta': {
    connection: 'Failed to connect to mainnet RPC endpoint',
    timeout: 'Transaction confirmation timeout on mainnet',
    insufficientFunds: 'Insufficient funds for transaction on mainnet',
    invalidInstruction: 'Invalid instruction data on mainnet',
  },
};
