import { getMockConfig, NETWORK_ERRORS, NetworkType } from './config';
import { generateMockSignature } from './utils';

/**
 * Mock liquidity pool API responses
 */
export const mockLiquidityApi = {
  /**
   * Get pool data
   */
  getPoolData: async (mint: string, network: NetworkType) => {
    const config = getMockConfig();
    
    if (config.simulateConnectionError) {
      throw new Error(NETWORK_ERRORS[config.network].connection);
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Network-specific multipliers
    const networkMultiplier = network === 'mainnet-beta' ? 10 : network === 'testnet' ? 2 : 1;
    
    return {
      tvl: 500000 * networkMultiplier,
      volume24h: 100000 * networkMultiplier,
      fees24h: 300 * networkMultiplier,
      apy: 15 * networkMultiplier,
      tokenAReserve: 10000 * networkMultiplier,
      tokenBReserve: 50000 * networkMultiplier,
      network,
      lastUpdated: Date.now(),
    };
  },
  
  /**
   * Get user pool share
   */
  getUserPoolShare: async (mint: string, wallet: string, network: NetworkType) => {
    const config = getMockConfig();
    
    if (config.simulateConnectionError) {
      throw new Error(NETWORK_ERRORS[config.network].connection);
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Network-specific multipliers
    const networkMultiplier = network === 'mainnet-beta' ? 10 : network === 'testnet' ? 2 : 1;
    
    return {
      lpTokens: 100 * networkMultiplier,
      percentage: 0.02 * networkMultiplier,
      value: 10000 * networkMultiplier,
      earnedFees: 30 * networkMultiplier,
    };
  },
  
  /**
   * Add liquidity
   */
  addLiquidity: async (wallet: string, mint: string, amount: number, network: NetworkType) => {
    const config = getMockConfig();
    
    if (config.simulateConnectionError) {
      throw new Error(NETWORK_ERRORS[config.network].connection);
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate transaction success/failure based on success rate
    if (Math.random() > config.transactionSuccessRate) {
      throw new Error('Transaction simulation failed');
    }
    
    const signature = generateMockSignature();
    
    return {
      success: true,
      txId: signature,
      signature,
      amount,
      network,
    };
  },
  
  /**
   * Remove liquidity
   */
  removeLiquidity: async (wallet: string, mint: string, amount: number, network: NetworkType) => {
    const config = getMockConfig();
    
    if (config.simulateConnectionError) {
      throw new Error(NETWORK_ERRORS[config.network].connection);
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate transaction success/failure based on success rate
    if (Math.random() > config.transactionSuccessRate) {
      throw new Error('Transaction simulation failed');
    }
    
    const signature = generateMockSignature();
    
    return {
      success: true,
      txId: signature,
      signature,
      amount,
      network,
    };
  },
  
  /**
   * Claim fees
   */
  claimFees: async (wallet: string, mint: string, network: NetworkType) => {
    const config = getMockConfig();
    
    if (config.simulateConnectionError) {
      throw new Error(NETWORK_ERRORS[config.network].connection);
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate transaction success/failure based on success rate
    if (Math.random() > config.transactionSuccessRate) {
      throw new Error('Transaction simulation failed');
    }
    
    const signature = generateMockSignature();
    
    // Network-specific multipliers
    const networkMultiplier = network === 'mainnet-beta' ? 10 : network === 'testnet' ? 2 : 1;
    
    return {
      success: true,
      txId: signature,
      signature,
      fees: 30 * networkMultiplier,
      network,
    };
  },
};
