// Export all mock services and utilities
export * from './config';
export * from './connection';
export * from './wallet';
export * from './defi';
export * from './liquidity';
export * from './utils';

// Setup function to initialize all mocks
export function setupMocks() {
  // Reset mock configuration to defaults
  resetMockConfig();
  
  // Setup mock fetch
  setupMockFetch();
  
  // Return utilities for controlling mock behavior
  return {
    getMockConfig,
    updateMockConfig,
    resetMockConfig,
    createMockConnection,
    createMockWalletContextState,
  };
}

// Import from individual files to avoid circular dependencies
import { getMockConfig, updateMockConfig, resetMockConfig } from './config';
import { createMockConnection } from './connection';
import { createMockWalletContextState } from './wallet';
import { setupMockFetch } from './utils';
