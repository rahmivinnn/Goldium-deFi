import { Blockhash } from '@solana/web3.js';

/**
 * Generate a mock transaction signature
 */
export function generateMockSignature(): string {
  return Array.from({ length: 64 }, () => 
    '0123456789abcdef'[Math.floor(Math.random() * 16)]
  ).join('');
}

/**
 * Generate a mock blockhash
 */
export function generateMockBlockhash(): Blockhash {
  return Array.from({ length: 32 }, () => 
    '0123456789abcdef'[Math.floor(Math.random() * 16)]
  ).join('') as Blockhash;
}

/**
 * Generate a mock public key
 */
export function generateMockPublicKey(): string {
  return Array.from({ length: 32 }, () => 
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 62)]
  ).join('');
}

/**
 * Mock fetch implementation for API endpoints
 */
export function setupMockFetch(): void {
  // Mock the global fetch function
  global.fetch = jest.fn().mockImplementation(async (url: string, options?: RequestInit) => {
    const urlObj = new URL(url.toString());
    const path = urlObj.pathname;
    const params = Object.fromEntries(urlObj.searchParams);
    
    // Mock different API endpoints
    if (path.includes('/api/stake')) {
      return mockStakingEndpoint(params);
    } else if (path.includes('/api/liquidity-pools')) {
      return mockLiquidityEndpoint(path, params);
    } else if (url.toString().includes('quote-api.jup.ag/v6/quote')) {
      return mockJupiterQuoteEndpoint(params, options);
    } else if (url.toString().includes('quote-api.jup.ag/v6/swap')) {
      return mockJupiterSwapEndpoint(options);
    }
    
    // Default response for unmocked endpoints
    return {
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    };
  });
}

/**
 * Mock staking API endpoint
 */
function mockStakingEndpoint(params: Record<string, string>): Response {
  const wallet = params.wallet || '';
  const network = (params.network || 'devnet') as 'devnet' | 'testnet' | 'mainnet-beta';
  
  // Network-specific multipliers
  const networkMultiplier = network === 'mainnet-beta' ? 2 : network === 'testnet' ? 1.5 : 1;
  
  const data = {
    stakedAmount: 100 * networkMultiplier,
    pendingRewards: 5 * networkMultiplier,
    stakingStartTime: Date.now() - 86400000, // 1 day ago
    apy: 12 * networkMultiplier,
  };
  
  return {
    ok: true,
    status: 200,
    json: async () => data,
  } as unknown as Response;
}

/**
 * Mock liquidity API endpoint
 */
function mockLiquidityEndpoint(path: string, params: Record<string, string>): Response {
  const mint = params.mint || '';
  const wallet = params.wallet || '';
  const network = (params.network || 'devnet') as 'devnet' | 'testnet' | 'mainnet-beta';
  
  // Network-specific multipliers
  const networkMultiplier = network === 'mainnet-beta' ? 10 : network === 'testnet' ? 2 : 1;
  
  // User-specific endpoint
  if (path.includes('/user')) {
    const data = {
      lpTokens: 100 * networkMultiplier,
      percentage: 0.02 * networkMultiplier,
      value: 10000 * networkMultiplier,
      earnedFees: 30 * networkMultiplier,
    };
    
    return {
      ok: true,
      status: 200,
      json: async () => data,
    } as unknown as Response;
  }
  
  // Pool data endpoint
  const data = {
    tvl: 500000 * networkMultiplier,
    volume24h: 100000 * networkMultiplier,
    fees24h: 300 * networkMultiplier,
    apy: 15 * networkMultiplier,
    tokenAReserve: 10000 * networkMultiplier,
    tokenBReserve: 50000 * networkMultiplier,
  };
  
  return {
    ok: true,
    status: 200,
    json: async () => data,
  } as unknown as Response;
}

/**
 * Mock Jupiter quote API endpoint
 */
function mockJupiterQuoteEndpoint(params: Record<string, string>, options?: RequestInit): Response {
  const inputMint = params.inputMint || '';
  const outputMint = params.outputMint || '';
  const amount = params.amount || '0';
  const slippageBps = parseInt(params.slippageBps || '50');
  
  // Calculate exchange rate (simplified)
  const inputAmount = parseInt(amount);
  const outputAmount = Math.floor(inputAmount * 0.95); // 5% slippage
  
  // Apply slippage
  const slippageMultiplier = 1 - (slippageBps / 10000);
  const outAmountWithSlippage = Math.floor(outputAmount * slippageMultiplier);
  
  const data = {
    inputMint,
    outputMint,
    inAmount: amount,
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
          inputMint,
          outputMint,
          inAmount: amount,
          outAmount: outputAmount.toString(),
          feeAmount: '1000',
          feeMint: inputMint,
        },
      },
    ],
    slippageBps,
  };
  
  return {
    ok: true,
    status: 200,
    json: async () => data,
  } as unknown as Response;
}

/**
 * Mock Jupiter swap API endpoint
 */
function mockJupiterSwapEndpoint(options?: RequestInit): Response {
  const body = options?.body ? JSON.parse(options.body as string) : {};
  
  const data = {
    swapTransaction: Buffer.from('mock-transaction-data').toString('base64'),
  };
  
  return {
    ok: true,
    status: 200,
    json: async () => data,
  } as unknown as Response;
}
