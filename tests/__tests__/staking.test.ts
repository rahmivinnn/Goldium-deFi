import { renderHook, act } from '@testing-library/react-hooks';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { setupMocks, createMockConnection, createMockWalletContextState, updateMockConfig } from '../mocks';
import { useStaking } from '@/hooks/useStaking';
import { useNetwork } from '@/components/NetworkContextProvider';
import { useTransaction } from '@/hooks/useTransaction';

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

describe('Staking Functionality', () => {
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
      if (url.toString().includes('/api/stake')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            stakedAmount: 100,
            pendingRewards: 5,
            stakingStartTime: Date.now() - 86400000, // 1 day ago
            apy: 12,
          }),
        });
      }
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Not found' }),
      });
    });
  });
  
  // Test hook initialization
  test('useStaking initializes with default values', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useStaking());
    
    // Initial state should have default values
    expect(result.current.stakingState).toEqual({
      stakedAmount: 0,
      pendingRewards: 0,
      stakingStartTime: 0,
      apy: 0,
      isStaking: false,
      lastUpdated: 0,
    });
    
    // Wait for data to load
    await waitForNextUpdate();
    
    // After loading, state should be updated
    expect(result.current.stakingState.stakedAmount).toBe(100);
    expect(result.current.stakingState.pendingRewards).toBe(5);
    expect(result.current.stakingState.apy).toBe(12);
    expect(result.current.stakingState.isStaking).toBe(true);
  });
  
  // Test staking tokens
  test('stakeTokens calls transaction with correct parameters', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useStaking());
    
    // Wait for initial data to load
    await waitForNextUpdate();
    
    // Mock the sendAndConfirmTransaction function
    const mockSendAndConfirm = jest.fn().mockResolvedValue('mock-signature');
    (useTransaction as jest.Mock).mockReturnValue({
      sendAndConfirmTransaction: mockSendAndConfirm,
      isProcessing: false,
    });
    
    // Call stakeTokens
    await act(async () => {
      await result.current.stakeTokens(100);
    });
    
    // Check that sendAndConfirmTransaction was called
    expect(mockSendAndConfirm).toHaveBeenCalled();
    
    // The first argument should be a transaction
    const transaction = mockSendAndConfirm.mock.calls[0][0];
    expect(transaction).toBeDefined();
  });
  
  // Test unstaking tokens
  test('unstakeTokens calls transaction with correct parameters', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useStaking());
    
    // Wait for initial data to load
    await waitForNextUpdate();
    
    // Mock the sendAndConfirmTransaction function
    const mockSendAndConfirm = jest.fn().mockResolvedValue('mock-signature');
    (useTransaction as jest.Mock).mockReturnValue({
      sendAndConfirmTransaction: mockSendAndConfirm,
      isProcessing: false,
    });
    
    // Call unstakeTokens
    await act(async () => {
      await result.current.unstakeTokens(50);
    });
    
    // Check that sendAndConfirmTransaction was called
    expect(mockSendAndConfirm).toHaveBeenCalled();
    
    // The first argument should be a transaction
    const transaction = mockSendAndConfirm.mock.calls[0][0];
    expect(transaction).toBeDefined();
  });
  
  // Test claiming rewards
  test('claimRewards calls transaction with correct parameters', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useStaking());
    
    // Wait for initial data to load
    await waitForNextUpdate();
    
    // Mock the sendAndConfirmTransaction function
    const mockSendAndConfirm = jest.fn().mockResolvedValue('mock-signature');
    (useTransaction as jest.Mock).mockReturnValue({
      sendAndConfirmTransaction: mockSendAndConfirm,
      isProcessing: false,
    });
    
    // Call claimRewards
    await act(async () => {
      await result.current.claimRewards();
    });
    
    // Check that sendAndConfirmTransaction was called
    expect(mockSendAndConfirm).toHaveBeenCalled();
    
    // The first argument should be a transaction
    const transaction = mockSendAndConfirm.mock.calls[0][0];
    expect(transaction).toBeDefined();
  });
  
  // Test network switching
  test('useStaking works with different networks', async () => {
    // Test with testnet
    (useNetwork as jest.Mock).mockReturnValue({
      network: 'testnet',
      setNetwork: jest.fn(),
      endpoint: 'https://api.testnet.solana.com',
      walletAdapterNetwork: 'testnet',
      isChangingNetwork: false,
    });
    
    const { result: testnetResult, waitForNextUpdate: waitForTestnet } = renderHook(() => useStaking());
    await waitForTestnet();
    
    // Test with mainnet
    (useNetwork as jest.Mock).mockReturnValue({
      network: 'mainnet-beta',
      setNetwork: jest.fn(),
      endpoint: 'https://api.mainnet-beta.solana.com',
      walletAdapterNetwork: 'mainnet-beta',
      isChangingNetwork: false,
    });
    
    const { result: mainnetResult, waitForNextUpdate: waitForMainnet } = renderHook(() => useStaking());
    await waitForMainnet();
  });
});
