/**
 * Test script to verify DeFi functionality across different networks
 * 
 * This script tests:
 * 1. Swapping functionality
 * 2. Staking functionality
 * 3. Liquidity provision
 * 4. Transaction approval and security features
 * 5. Cross-network support
 */

import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { getTransactionService } from '../services/transaction';
import { getTransactionApprovalService } from '../services/transaction-approval';
import { getTransactionAnomalyDetectionService } from '../services/transaction-anomaly-detection';
import { getCacheService } from '../services/cache';
import { getTokenPriceCacheService } from '../services/token-price-cache';
import { NetworkType } from '../components/NetworkContextProvider';

// Test networks
const NETWORKS: { type: NetworkType; endpoint: string }[] = [
  { type: 'mainnet-beta', endpoint: 'https://api.mainnet-beta.solana.com' },
  { type: 'testnet', endpoint: 'https://api.testnet.solana.com' },
  { type: 'devnet', endpoint: 'https://api.devnet.solana.com' },
];

// Test wallet (for simulation only)
const testWallet = Keypair.generate();

async function testSwapFunctionality(network: NetworkType, connection: Connection) {
  console.log(`\nTesting swap functionality on ${network}...`);
  
  try {
    // Initialize services
    const transactionService = getTransactionService(connection, network);
    const approvalService = getTransactionApprovalService(connection, network);
    const tokenPriceService = getTokenPriceCacheService(network);
    
    // Create a mock swap transaction
    const swapTransaction = await transactionService.createSwapTransaction({
      fromToken: 'So11111111111111111111111111111111111111112', // SOL
      toToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
      amount: 0.1,
      slippage: 0.5,
    });
    
    // Test transaction approval
    const approvalResult = await approvalService.approveTransaction(swapTransaction);
    
    console.log(`Swap transaction approval status: ${approvalResult.status}`);
    console.log(`Swap transaction risk level: ${approvalResult.riskLevel}`);
    
    // Test transaction simulation
    const simulationResult = await transactionService.simulateTransaction(swapTransaction);
    
    console.log(`Swap transaction simulation success: ${simulationResult.success}`);
    console.log(`Estimated fee: ${simulationResult.formattedEstimatedFee}`);
    
    return true;
  } catch (error) {
    console.error(`Error testing swap functionality on ${network}:`, error);
    return false;
  }
}

async function testStakingFunctionality(network: NetworkType, connection: Connection) {
  console.log(`\nTesting staking functionality on ${network}...`);
  
  try {
    // Initialize services
    const transactionService = getTransactionService(connection, network);
    const approvalService = getTransactionApprovalService(connection, network);
    
    // Create a mock stake transaction
    const stakeTransaction = await transactionService.createStakeTransaction({
      token: 'GoLDium1111111111111111111111111111111111111', // GOLD
      amount: 100,
      duration: 30, // 30 days
    });
    
    // Test transaction approval
    const approvalResult = await approvalService.approveTransaction(stakeTransaction);
    
    console.log(`Stake transaction approval status: ${approvalResult.status}`);
    console.log(`Stake transaction risk level: ${approvalResult.riskLevel}`);
    
    // Test transaction simulation
    const simulationResult = await transactionService.simulateTransaction(stakeTransaction);
    
    console.log(`Stake transaction simulation success: ${simulationResult.success}`);
    console.log(`Estimated fee: ${simulationResult.formattedEstimatedFee}`);
    
    return true;
  } catch (error) {
    console.error(`Error testing staking functionality on ${network}:`, error);
    return false;
  }
}

async function testLiquidityProvision(network: NetworkType, connection: Connection) {
  console.log(`\nTesting liquidity provision on ${network}...`);
  
  try {
    // Initialize services
    const transactionService = getTransactionService(connection, network);
    const approvalService = getTransactionApprovalService(connection, network);
    
    // Create a mock add liquidity transaction
    const addLiquidityTransaction = await transactionService.createAddLiquidityTransaction({
      token1: 'So11111111111111111111111111111111111111112', // SOL
      token2: 'GoLDium1111111111111111111111111111111111111', // GOLD
      amount1: 0.5,
      amount2: 50,
    });
    
    // Test transaction approval
    const approvalResult = await approvalService.approveTransaction(addLiquidityTransaction);
    
    console.log(`Add liquidity transaction approval status: ${approvalResult.status}`);
    console.log(`Add liquidity transaction risk level: ${approvalResult.riskLevel}`);
    
    // Test transaction simulation
    const simulationResult = await transactionService.simulateTransaction(addLiquidityTransaction);
    
    console.log(`Add liquidity transaction simulation success: ${simulationResult.success}`);
    console.log(`Estimated fee: ${simulationResult.formattedEstimatedFee}`);
    
    return true;
  } catch (error) {
    console.error(`Error testing liquidity provision on ${network}:`, error);
    return false;
  }
}

async function testSecurityFeatures(network: NetworkType, connection: Connection) {
  console.log(`\nTesting security features on ${network}...`);
  
  try {
    // Initialize services
    const transactionService = getTransactionService(connection, network);
    const approvalService = getTransactionApprovalService(connection, network);
    const anomalyService = getTransactionAnomalyDetectionService(connection, network);
    
    // Create a mock high-value transaction (potentially risky)
    const highValueTransaction = await transactionService.createTransferTransaction({
      token: 'So11111111111111111111111111111111111111112', // SOL
      recipient: new PublicKey('3Krd6c4vVKqgVkQMoMrxKNU7xQKkUY94ZvpWgPtKvkLF'),
      amount: 10, // 10 SOL (high value)
    });
    
    // Test transaction approval
    const approvalResult = await approvalService.approveTransaction(highValueTransaction);
    
    console.log(`High-value transaction approval status: ${approvalResult.status}`);
    console.log(`High-value transaction risk level: ${approvalResult.riskLevel}`);
    console.log(`Requires hardware wallet: ${approvalResult.requiresHardwareWallet}`);
    
    // Test anomaly detection
    const anomalies = await anomalyService.detectAnomalies(highValueTransaction);
    
    console.log(`Detected anomalies: ${anomalies.length}`);
    if (anomalies.length > 0) {
      console.log(`First anomaly type: ${anomalies[0].type}`);
      console.log(`First anomaly severity: ${anomalies[0].severity}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error testing security features on ${network}:`, error);
    return false;
  }
}

async function runTests() {
  console.log('Starting DeFi functionality tests...');
  
  const results = {
    swap: {} as Record<NetworkType, boolean>,
    staking: {} as Record<NetworkType, boolean>,
    liquidity: {} as Record<NetworkType, boolean>,
    security: {} as Record<NetworkType, boolean>,
  };
  
  for (const { type, endpoint } of NETWORKS) {
    console.log(`\n=== Testing on ${type} ===`);
    const connection = new Connection(endpoint);
    
    // Run tests
    results.swap[type] = await testSwapFunctionality(type, connection);
    results.staking[type] = await testStakingFunctionality(type, connection);
    results.liquidity[type] = await testLiquidityProvision(type, connection);
    results.security[type] = await testSecurityFeatures(type, connection);
  }
  
  // Print summary
  console.log('\n=== Test Results Summary ===');
  
  for (const network of NETWORKS.map(n => n.type)) {
    console.log(`\n${network}:`);
    console.log(`- Swap: ${results.swap[network] ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`- Staking: ${results.staking[network] ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`- Liquidity: ${results.liquidity[network] ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`- Security: ${results.security[network] ? '✅ PASS' : '❌ FAIL'}`);
  }
}

// Run the tests
runTests().catch(console.error);
