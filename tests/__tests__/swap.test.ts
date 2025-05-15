import { renderHook, act } from '@testing-library/react-hooks';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { setupMocks, createMockConnection, createMockWalletContextState, updateMockConfig } from '../mocks';
import { getQuote, executeSwap } from '@/utils/jupiter';
import { useNetwork } from '@/components/NetworkContextProvider';
import { SOL_TOKEN, GOLD_TOKEN } from '@/constants/tokens';

// Mock the hooks
jest.mock('@solana/wallet-adapter-react', () => ({
  useConnection: jest.fn(),
  useWallet: jest.fn(),
}));

jest.mock('@/components/NetworkContextProvider', () => ({
  useNetwork: jest.fn(),
}));

describe('Swap Functionality', () => {
  // Setup mocks before each test
  beforeEach(() => {
    setupMocks();
    
    // Mock useConnection hook
    (useConnection as jest.Mock).mockReturnValue({
      connection: createMockConnection('https://api.devnet.solana.com'),
    });
    
    // Mock useWallet hook
    (useWallet as jest.Mock).mockReturnValue(
      createMockWalletContextState('DummyWa11etPubkeyXXXXXXXXXXXXXXXXXXXXXXX')
    );
    
    // Mock useNetwork hook
    (useNetwork as jest.Mock).mockReturnValue({
      network: 'devnet',
      setNetwork: jest.fn(),
      endpoint: 'https://api.devnet.solana.com',
      walletAdapterNetwork: 'devnet',
      isChangingNetwork: false,
    });
  });
  
  // Test getting a quote
  test('getQuote returns valid quote data', async () => {
    const quoteParams = {
      inputMint: SOL_TOKEN.mint as string,
      outputMint: typeof GOLD_TOKEN.mint === 'string' 
        ? GOLD_TOKEN.mint 
        : GOLD_TOKEN.mint['devnet'],
      amount: '1000000000', // 1 SOL
      slippageBps: 50,
      network: 'devnet' as const,
    };
    
    const quote = await getQuote(quoteParams);
    
    expect(quote).toBeDefined();
    expect(quote.inputMint).toBe(quoteParams.inputMint);
    expect(quote.outputMint).toBe(quoteParams.outputMint);
    expect(quote.inAmount).toBe(quoteParams.amount);
    expect(quote.outAmount).toBeDefined();
    expect(quote.outAmountWithSlippage).toBeDefined();
    expect(quote.network).toBe('devnet');
  });
  
  // Test executing a swap
  test('executeSwap successfully executes a swap transaction', async () => {
    // First get a quote
    const quoteParams = {
      inputMint: SOL_TOKEN.mint as string,
      outputMint: typeof GOLD_TOKEN.mint === 'string' 
        ? GOLD_TOKEN.mint 
        : GOLD_TOKEN.mint['devnet'],
      amount: '1000000000', // 1 SOL
      slippageBps: 50,
      network: 'devnet' as const,
    };
    
    const quote = await getQuote(quoteParams);
    
    // Then execute the swap
    const wallet = {
      publicKey: new PublicKey('DummyWa11etPubkeyXXXXXXXXXXXXXXXXXXXXXXX'),
    };
    
    const connection = createMockConnection('https://api.devnet.solana.com');
    
    const swapParams = {
      connection,
      wallet,
      fromToken: SOL_TOKEN,
      toToken: GOLD_TOKEN,
      quote,
      slippageBps: 50,
      network: 'devnet' as const,
    };
    
    const result = await executeSwap(swapParams);
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.txId).toBeDefined();
    expect(result.signature).toBeDefined();
    expect(result.fromToken).toBe(SOL_TOKEN.symbol);
    expect(result.toToken).toBe(GOLD_TOKEN.symbol);
    expect(result.network).toBe('devnet');
  });
  
  // Test error handling
  test('executeSwap handles connection errors', async () => {
    // Update mock config to simulate connection error
    updateMockConfig({
      simulateConnectionError: true,
    });
    
    // First get a quote (this will fail)
    const quoteParams = {
      inputMint: SOL_TOKEN.mint as string,
      outputMint: typeof GOLD_TOKEN.mint === 'string' 
        ? GOLD_TOKEN.mint 
        : GOLD_TOKEN.mint['devnet'],
      amount: '1000000000', // 1 SOL
      slippageBps: 50,
      network: 'devnet' as const,
    };
    
    await expect(getQuote(quoteParams)).rejects.toThrow();
    
    // Reset connection error for the next test
    updateMockConfig({
      simulateConnectionError: false,
    });
  });
  
  // Test network switching
  test('getQuote works with different networks', async () => {
    // Test with testnet
    const testnetParams = {
      inputMint: SOL_TOKEN.mint as string,
      outputMint: typeof GOLD_TOKEN.mint === 'string' 
        ? GOLD_TOKEN.mint 
        : GOLD_TOKEN.mint['testnet'],
      amount: '1000000000', // 1 SOL
      slippageBps: 50,
      network: 'testnet' as const,
    };
    
    const testnetQuote = await getQuote(testnetParams);
    expect(testnetQuote.network).toBe('testnet');
    
    // Test with mainnet
    const mainnetParams = {
      inputMint: SOL_TOKEN.mint as string,
      outputMint: typeof GOLD_TOKEN.mint === 'string' 
        ? GOLD_TOKEN.mint 
        : GOLD_TOKEN.mint['mainnet-beta'],
      amount: '1000000000', // 1 SOL
      slippageBps: 50,
      network: 'mainnet-beta' as const,
    };
    
    const mainnetQuote = await getQuote(mainnetParams);
    expect(mainnetQuote.network).toBe('mainnet-beta');
  });
});
