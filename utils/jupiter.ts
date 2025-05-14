import type { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js"
import type { TokenInfo } from "@solana/spl-token-registry"
import type { Token } from "@/constants/tokens"
import bs58 from "bs58"

export interface QuoteParams {
  inputMint: string
  outputMint: string
  amount: string
  slippageBps: number
}

export async function getQuote(params: QuoteParams) {
  try {
    const response = await fetch("/api/quote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching quote:", error)
    throw error
  }
}

interface SwapParams {
  connection: Connection
  wallet: {
    publicKey: PublicKey
    signTransaction?: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>
  }
  fromToken: Token
  toToken: Token
  quote: any
  slippageBps: number
}

export async function executeSwap(params: SwapParams) {
  try {
    // Get the swap transaction from the API
    const swapResponse = await fetch("/api/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quoteResponse: params.quote,
        userPublicKey: params.wallet.publicKey.toString(),
        slippageBps: params.slippageBps,
      }),
    })

    if (!swapResponse.ok) {
      const errorData = await swapResponse.json()
      throw new Error(errorData.error || "Failed to get swap transaction")
    }

    const { swapTransaction } = await swapResponse.json()

    // In a real implementation, we would:
    // 1. Deserialize the transaction
    // 2. Sign it with the wallet
    // 3. Send it to the network
    // 4. Wait for confirmation

    // For demo purposes, we'll simulate a successful transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate a random transaction ID and signature
    const txId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const signature = bs58.encode(Buffer.from(Array.from({ length: 64 }, () => Math.floor(Math.random() * 256))))

    return {
      success: true,
      txId,
      signature,
    }
  } catch (error) {
    console.error("Error executing swap:", error)
    return {
      success: false,
      error: error.message || "Failed to execute swap",
    }
  }
}

// Get token price in USD
export async function getTokenPrice(mintAddress: string): Promise<number | null> {
  try {
    const response = await fetch(`/api/token-price?mint=${mintAddress}`)
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }
    const data = await response.json()
    return data.price
  } catch (error) {
    console.error("Error fetching token price:", error)
    return null
  }
}

// Get token price history
export async function getTokenPriceHistory(
  mintAddress: string,
  days = 7,
): Promise<{ timestamp: number; price: number }[]> {
  try {
    const response = await fetch(`/api/token-price-history?mint=${mintAddress}&days=${days}`)
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching token price history:", error)
    return []
  }
}

// Get liquidity pools for a token
export async function getLiquidityPools(mintAddress: string): Promise<any[]> {
  try {
    const response = await fetch(`/api/liquidity-pools?mint=${mintAddress}`)
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching liquidity pools:", error)
    return []
  }
}

// Get all tokens from Jupiter
export async function getAllTokens(): Promise<TokenInfo[]> {
  try {
    const response = await fetch("/api/tokens")
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching tokens:", error)
    return []
  }
}

// Get transaction status
export async function getTransactionStatus(signature: string): Promise<"confirmed" | "failed" | "pending"> {
  try {
    const response = await fetch(`/api/transaction-status?signature=${signature}`)
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }
    const data = await response.json()
    return data.status
  } catch (error) {
    console.error("Error fetching transaction status:", error)
    return "pending"
  }
}

// Bridge tokens between chains
export interface BridgeParams {
  fromChain: "solana" | "ethereum" | "polygon" | "binance"
  toChain: "solana" | "ethereum" | "polygon" | "binance"
  token: string
  amount: string
  recipient: string
}

export async function bridgeTokens(params: BridgeParams): Promise<{ success: boolean; txId?: string; error?: string }> {
  try {
    const response = await fetch("/api/bridge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Bridge operation failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Error bridging tokens:", error)
    return {
      success: false,
      error: error.message || "Failed to bridge tokens",
    }
  }
}

// Stake tokens
export interface StakeParams {
  pool: string
  token: string
  amount: string
}

export async function stakeTokens(params: StakeParams): Promise<{ success: boolean; txId?: string; error?: string }> {
  try {
    const response = await fetch("/api/stake", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Staking operation failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Error staking tokens:", error)
    return {
      success: false,
      error: error.message || "Failed to stake tokens",
    }
  }
}

// Get staking rewards
export async function getStakingRewards(address: string): Promise<{ token: string; amount: string }[]> {
  try {
    const response = await fetch(`/api/staking-rewards?address=${address}`)
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching staking rewards:", error)
    return []
  }
}

// Get NFTs for an address
export async function getNFTs(address: string): Promise<any[]> {
  try {
    const response = await fetch(`/api/nfts?address=${address}`)
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching NFTs:", error)
    return []
  }
}
