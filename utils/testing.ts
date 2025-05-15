import type { Connection } from "@solana/web3.js"
import type { WalletContextState } from "@solana/wallet-adapter-react"
import type { NetworkType } from "@/components/providers/NetworkContextProvider"
import { GOLD_MINT_ADDRESS } from "@/constants/tokens"
import { getTokenBalance } from "@/services/tokenService"

// Test result interface
export interface TestResult {
  feature: string
  success: boolean
  message: string
  details?: any
}

// Test wallet connection
export async function testWalletConnection(wallet: WalletContextState): Promise<TestResult> {
  try {
    if (!wallet.connected || !wallet.publicKey) {
      return {
        feature: "Wallet Connection",
        success: false,
        message: "Wallet not connected",
      }
    }

    return {
      feature: "Wallet Connection",
      success: true,
      message: "Wallet connected successfully",
      details: {
        publicKey: wallet.publicKey.toString(),
        adapter: wallet.wallet?.adapter.name,
      },
    }
  } catch (error) {
    return {
      feature: "Wallet Connection",
      success: false,
      message: `Error testing wallet connection: ${error.message}`,
    }
  }
}

// Test network connection
export async function testNetworkConnection(connection: Connection, network: NetworkType): Promise<TestResult> {
  try {
    const version = await connection.getVersion()

    return {
      feature: "Network Connection",
      success: true,
      message: `Connected to ${network} successfully`,
      details: {
        version,
        endpoint: connection.rpcEndpoint,
      },
    }
  } catch (error) {
    return {
      feature: "Network Connection",
      success: false,
      message: `Error connecting to ${network}: ${error.message}`,
    }
  }
}

// Test token balance
export async function testTokenBalance(
  connection: Connection,
  wallet: WalletContextState,
  network: NetworkType,
): Promise<TestResult> {
  try {
    if (!wallet.connected || !wallet.publicKey) {
      return {
        feature: "Token Balance",
        success: false,
        message: "Wallet not connected",
      }
    }

    const goldMintAddress = GOLD_MINT_ADDRESS[network]
    const balance = await getTokenBalance(connection, wallet.publicKey, goldMintAddress)

    return {
      feature: "Token Balance",
      success: true,
      message: `GOLD token balance retrieved successfully`,
      details: {
        balance,
        mintAddress: goldMintAddress,
      },
    }
  } catch (error) {
    return {
      feature: "Token Balance",
      success: false,
      message: `Error getting token balance: ${error.message}`,
    }
  }
}

// Run all tests
export async function runAllTests(
  connection: Connection,
  wallet: WalletContextState,
  network: NetworkType,
): Promise<TestResult[]> {
  const results: TestResult[] = []

  // Test wallet connection
  results.push(await testWalletConnection(wallet))

  // Test network connection
  results.push(await testNetworkConnection(connection, network))

  // Test token balance
  if (results[0].success) {
    results.push(await testTokenBalance(connection, wallet, network))
  }

  return results
}
