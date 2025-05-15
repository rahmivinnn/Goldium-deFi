import { getMockConfig, NETWORK_ERRORS, NetworkType } from './config';
import { generateMockSignature } from './utils';

/**
 * Mock Jupiter Swap API responses
 */
export const mockJupiterApi = {
  /**
   * Mock quote response
   */
  getQuote: async (params: any) => {
    const config = getMockConfig();
    
    if (config.simulateConnectionError) {
      throw new Error(NETWORK_ERRORS[config.network].connection);
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get token prices from config
    const inputPrice = config.tokenPrices[params.inputMint] || 1;
    const outputPrice = config.tokenPrices[params.outputMint] || 1;
    
    // Calculate exchange rate
    const exchangeRate = inputPrice / outputPrice;
    
    // Calculate output amount
    const inputAmount = parseInt(params.amount);
    const outputAmount = Math.floor(inputAmount * exchangeRate);
    
    // Apply slippage
    const slippageBps = params.slippageBps || 50; // Default 0.5%
    const slippageMultiplier = 1 - (slippageBps / 10000);
    const outAmountWithSlippage = Math.floor(outputAmount * slippageMultiplier);
    
    return {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      inAmount: params.amount,
      outAmount: outputAmount.toString(),
      outAmountWithSlippage: outAmountWithSlippage.toString(),
      otherAmountThreshold: outAmountWithSlippage.toString(),
      swapMode: 'ExactIn',
      priceImpactPct: 0.1,
      routePlan: [
        {
          swapInfo: {
            ammKey: 'mock-amm-key',
            label: 'Mock AMM',
            inputMint: params.inputMint,
            outputMint: params.outputMint,
            inAmount: params.amount,
            outAmount: outputAmount.toString(),
            feeAmount: '1000',
            feeMint: params.inputMint,
          },
        },
      ],
      slippageBps: params.slippageBps,
      network: params.network,
    };
  },
  
  /**
   * Mock swap response
   */
  executeSwap: async (params: any) => {
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
      fromToken: params.fromToken?.symbol || 'UNKNOWN',
      toToken: params.toToken?.symbol || 'UNKNOWN',
      network: params.network,
    };
  },
};

/**
 * Mock staking API responses
 */
export const mockStakingApi = {
  /**
   * Get staking state
   */
  getStakingState: async (wallet: string, network: NetworkType) => {
    const config = getMockConfig();
    
    if (config.simulateConnectionError) {
      throw new Error(NETWORK_ERRORS[config.network].connection);
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Network-specific multipliers
    const networkMultiplier = network === 'mainnet-beta' ? 2 : network === 'testnet' ? 1.5 : 1;
    
    return {
      stakedAmount: 100 * networkMultiplier,
      pendingRewards: 5 * networkMultiplier,
      stakingStartTime: Date.now() - 86400000, // 1 day ago
      apy: 12 * networkMultiplier,
      isStaking: true,
      lastUpdated: Date.now(),
    };
  },
  
  /**
   * Stake tokens
   */
  stakeTokens: async (wallet: string, amount: number, network: NetworkType) => {
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
   * Unstake tokens
   */
  unstakeTokens: async (wallet: string, amount: number, network: NetworkType) => {
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
   * Claim rewards
   */
  claimRewards: async (wallet: string, network: NetworkType) => {
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
      rewards: 5,
      network,
    };
  },
};
