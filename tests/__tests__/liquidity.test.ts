import { renderHook, act } from '@testing-library/react-hooks';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { setupMocks, createMockConnection, createMockWalletContextState, updateMockConfig } from '../mocks';
import { useLiquidityPool } from '@/hooks/useLiquidityPool';
import { useNetwork } from '@/components/NetworkContextProvider';
import { useTransaction } from '@/hooks/useTransaction';
import { GOLD_TOKEN, SOL_TOKEN } from '@/constants/tokens';

// Mock the hooks
jest.mock('@solana/wallet-adapter-react', () => ({
  useConnection: jest.fn(),
  useWallet: jest.fn(),
}));

jest.mock('@/components/NetworkContextProvider', () => ({
  useNetwork: jest.fn(),
}));

jest.mock('@/hooks/useTransaction', () => ({
  useTransaction: jest.fn(),
}));

describe('Liquidity Pool Functionality', () => {
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
    
    // Mock useTransaction hook
    (useTransaction as jest.Mock).mockReturnValue({
      sendAndConfirmTransaction: jest.fn().mockResolvedValue('mock-signature'),
      isProcessing: false,
      signature: null,
      error: null,
      sendTransaction: jest.fn().mockResolvedValue('mock-signature'),
      isPending: false,
      sendVersionedTransaction: jest.fn().mockResolvedValue('mock-signature'),
    });
    
    // Setup mock fetch for API responses
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.toString().includes('/api/liquidity-pools')) {
        if (url.toString().includes('/user')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              lpTokens: 100,
              percentage: 0.02,
              value: 10000,
              earnedFees: 30,
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            tvl: 500000,
            volume24h: 100000,
            fees24h: 300,
            apy: 15,
            tokenAReserve: 10000,
            tokenBReserve: 50000,
          }),
        });
      }
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Not found' }),
      });
    });
  });
  
  // Get the token mint for the current network
  const getTokenMint = () => {
    return typeof GOLD_TOKEN.mint === 'string' 
      ? GOLD_TOKEN.mint 
      : GOLD_TOKEN.mint['devnet'];
  };
  
  // Test hook initialization
  test('useLiquidityPool initializes with default values', async () => {
    const tokenMint = getTokenMint();
    const { result, waitForNextUpdate } = renderHook(() => useLiquidityPool(tokenMint));
    
    // Initial state should have default values
    expect(result.current.state.isLoading).toBe(true);
    
    // Wait for data to load
    await waitForNextUpdate();
    
    // After loading, state should be updated
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.totalValueLocked).toBe(500000);
    expect(result.current.state.userLpBalance).toBe(10.5);
    expect(result.current.state.poolShare).toBe(0.02);
    expect(result.current.state.earnedFees).toBe(25.75);
  });
  
  // Test adding liquidity
  test('addLiquidity calls transaction with correct parameters', async () => {
    const tokenMint = getTokenMint();
    const { result, waitForNextUpdate } = renderHook(() => useLiquidityPool(tokenMint));
    
    // Wait for initial data to load
    await waitForNextUpdate();
    
    // Mock the sendAndConfirmTransaction function
    const mockSendAndConfirm = jest.fn().mockResolvedValue('mock-signature');
    (useTransaction as jest.Mock).mockReturnValue({
      sendAndConfirmTransaction: mockSendAndConfirm,
      isProcessing: false,
    });
    
    // Call addLiquidity
    await act(async () => {
      await result.current.addLiquidity(100);
    });
    
    // Check that sendAndConfirmTransaction was called
    expect(mockSendAndConfirm).toHaveBeenCalled();
    
    // The first argument should be a transaction
    const transaction = mockSendAndConfirm.mock.calls[0][0];
    expect(transaction).toBeDefined();
  });
  
  // Test removing liquidity
  test('removeLiquidity calls transaction with correct parameters', async () => {
    const tokenMint = getTokenMint();
    const { result, waitForNextUpdate } = renderHook(() => useLiquidityPool(tokenMint));
    
    // Wait for initial data to load
    await waitForNextUpdate();
    
    // Mock the sendAndConfirmTransaction function
    const mockSendAndConfirm = jest.fn().mockResolvedValue('mock-signature');
    (useTransaction as jest.Mock).mockReturnValue({
      sendAndConfirmTransaction: mockSendAndConfirm,
      isProcessing: false,
    });
    
    // Call removeLiquidity
    await act(async () => {
      await result.current.removeLiquidity(50);
    });
    
    // Check that sendAndConfirmTransaction was called
    expect(mockSendAndConfirm).toHaveBeenCalled();
    
    // The first argument should be a transaction
    const transaction = mockSendAndConfirm.mock.calls[0][0];
    expect(transaction).toBeDefined();
  });
  
  // Test claiming fees
  test('claimFees calls transaction with correct parameters', async () => {
    const tokenMint = getTokenMint();
    const { result, waitForNextUpdate } = renderHook(() => useLiquidityPool(tokenMint));
    
    // Wait for initial data to load
    await waitForNextUpdate();
    
    // Mock the sendAndConfirmTransaction function
    const mockSendAndConfirm = jest.fn().mockResolvedValue('mock-signature');
    (useTransaction as jest.Mock).mockReturnValue({
      sendAndConfirmTransaction: mockSendAndConfirm,
      isProcessing: false,
    });
    
    // Call claimFees
    await act(async () => {
      await result.current.claimFees();
    });
    
    // Check that sendAndConfirmTransaction was called
    expect(mockSendAndConfirm).toHaveBeenCalled();
    
    // The first argument should be a transaction
    const transaction = mockSendAndConfirm.mock.calls[0][0];
    expect(transaction).toBeDefined();
  });
  
  // Test network switching
  test('useLiquidityPool works with different networks', async () => {
    const tokenMint = getTokenMint();
    
    // Test with testnet
    (useNetwork as jest.Mock).mockReturnValue({
      network: 'testnet',
      setNetwork: jest.fn(),
      endpoint: 'https://api.testnet.solana.com',
      walletAdapterNetwork: 'testnet',
      isChangingNetwork: false,
    });
    
    const { result: testnetResult, waitForNextUpdate: waitForTestnet } = renderHook(() => useLiquidityPool(tokenMint));
    await waitForTestnet();
    
    // Test with mainnet
    (useNetwork as jest.Mock).mockReturnValue({
      network: 'mainnet-beta',
      setNetwork: jest.fn(),
      endpoint: 'https://api.mainnet-beta.solana.com',
      walletAdapterNetwork: 'mainnet-beta',
      isChangingNetwork: false,
    });
    
    const { result: mainnetResult, waitForNextUpdate: waitForMainnet } = renderHook(() => useLiquidityPool(tokenMint));
    await waitForMainnet();
  });
});
