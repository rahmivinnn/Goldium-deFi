import { type Connection, type PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js"
import type { Token } from "@/constants/tokens"

// Jupiter API endpoints
const JUPITER_QUOTE_API = "https://quote-api.jup.ag/v6/quote"
const JUPITER_SWAP_API = "https://quote-api.jup.ag/v6/swap"

// Quote parameters
interface QuoteParams {
  inputMint: string
  outputMint: string
  amount: string
  slippageBps: number
  onlyDirectRoutes?: boolean
  asLegacyTransaction?: boolean
}

// Swap parameters
interface SwapParams {
  connection: Connection
  wallet: {
    publicKey: PublicKey
    signTransaction?: (tx: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>
  }
  fromToken: Token
  toToken: Token
  quote: any
  slippageBps: number
}

// Get quote from Jupiter API
export async function getQuote(params: QuoteParams) {
  try {
    // Construct the URL with query parameters
    const url = new URL(JUPITER_QUOTE_API)
    url.searchParams.append("inputMint", params.inputMint)
    url.searchParams.append("outputMint", params.outputMint)
    url.searchParams.append("amount", params.amount)
    url.searchParams.append("slippageBps", params.slippageBps.toString())

    if (params.onlyDirectRoutes) {
      url.searchParams.append("onlyDirectRoutes", "true")
    }

    if (params.asLegacyTransaction) {
      url.searchParams.append("asLegacyTransaction", "true")
    }

    // Fetch quote from Jupiter API
    const response = await fetch(url.toString())

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Jupiter API error: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching quote:", error)
    throw error
  }
}

// Execute swap transaction
export async function executeSwap(
  params: SwapParams,
): Promise<{ success: boolean; txId?: string; signature?: string; error?: string }> {
  try {
    const { connection, wallet, quote, slippageBps } = params

    if (!wallet.publicKey) {
      throw new Error("Wallet not connected")
    }

    // Prepare the swap transaction
    const swapRequestBody = {
      quoteResponse: quote,
      userPublicKey: wallet.publicKey.toString(),
      wrapAndUnwrapSol: true,
      feeAccount: null,
      computeUnitPriceMicroLamports: 50, // Adjust priority fee as needed
      asLegacyTransaction: true, // Use legacy transaction for better compatibility
      dynamicComputeUnitLimit: true, // Automatically adjust compute unit limit
      skipUserAccountsCheck: true, // Skip checking if user has all required token accounts
    }

    // Get the swap transaction
    const swapResponse = await fetch(JUPITER_SWAP_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(swapRequestBody),
    })

    if (!swapResponse.ok) {
      const errorData = await swapResponse.json()
      throw new Error(`Jupiter Swap API error: ${JSON.stringify(errorData)}`)
    }

    const swapData = await swapResponse.json()

    // Sign and send the transaction
    let signedTx
    let signature

    if (swapData.swapTransaction) {
      // Decode and sign the transaction
      const serializedTransaction = Buffer.from(swapData.swapTransaction, "base64")

      try {
        // Try to decode as versioned transaction first
        const tx = VersionedTransaction.deserialize(serializedTransaction)

        // Sign the transaction
        if (wallet.signTransaction) {
          signedTx = await wallet.signTransaction(tx)
          signature = await connection.sendRawTransaction(signedTx.serialize())
        } else {
          throw new Error("Wallet does not support signing transactions")
        }
      } catch (e) {
        // If not a versioned transaction, try legacy transaction
        const tx = Transaction.from(serializedTransaction)

        // Sign the transaction
        if (wallet.signTransaction) {
          signedTx = await wallet.signTransaction(tx)
          signature = await connection.sendRawTransaction(signedTx.serialize())
        } else {
          throw new Error("Wallet does not support signing transactions")
        }
      }

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, "confirmed")

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`)
      }

      return {
        success: true,
        txId: signature,
        signature,
      }
    } else {
      throw new Error("No swap transaction returned from Jupiter API")
    }
  } catch (error: any) {
    console.error("Error executing swap:", error)
    return {
      success: false,
      error: error.message || "Failed to execute swap",
    }
  }
}

// Get liquidity pools
export async function getLiquidityPools(mintAddress?: string) {
  // This would normally fetch from an API, but for demo we'll return mock data
  // In a real implementation, you would fetch from Raydium or Orca API
  return [
    {
      id: "pool1",
      name: "GOLD-SOL",
      token1Info: {
        symbol: "GOLD",
        logoURI: "/goldium-logo.png",
      },
      token2Info: {
        symbol: "SOL",
        logoURI: "/solana-logo.png",
      },
      tvl: 1250000,
      apy: 12.5,
      volume24h: 450000,
      fee: 0.3,
      reserves: {
        token1: 500000,
        token2: 2500,
      },
    },
    {
      id: "pool2",
      name: "GOLD-USDC",
      token1Info: {
        symbol: "GOLD",
        logoURI: "/goldium-logo.png",
      },
      token2Info: {
        symbol: "USDC",
        logoURI: "/usdc-logo.png",
      },
      tvl: 750000,
      apy: 8.2,
      volume24h: 250000,
      fee: 0.3,
      reserves: {
        token1: 300000,
        token2: 150000,
      },
    },
    {
      id: "pool3",
      name: "SOL-USDC",
      token1Info: {
        symbol: "SOL",
        logoURI: "/solana-logo.png",
      },
      token2Info: {
        symbol: "USDC",
        logoURI: "/usdc-logo.png",
      },
      tvl: 3200000,
      apy: 6.8,
      volume24h: 950000,
      fee: 0.3,
      reserves: {
        token1: 16000,
        token2: 1600000,
      },
    },
    {
      id: "pool4",
      name: "GOLD-BONK",
      token1Info: {
        symbol: "GOLD",
        logoURI: "/goldium-logo.png",
      },
      token2Info: {
        symbol: "BONK",
        logoURI: "/bonk-token-logo.png",
      },
      tvl: 420000,
      apy: 18.5,
      volume24h: 125000,
      fee: 0.3,
      reserves: {
        token1: 42000,
        token2: 33600000000,
      },
    },
  ]
}
