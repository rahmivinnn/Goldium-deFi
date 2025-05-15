import { type Connection, type PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js"
import type { Token } from "@/constants/tokens"
import { getMintAddress } from "@/constants/tokens"
import { type NetworkType } from "@/components/NetworkContextProvider"

// Jupiter API endpoints for different networks
const JUPITER_API_ENDPOINTS = {
  "devnet": {
    quote: "https://quote-api.jup.ag/v6/quote?devnet=true",
    swap: "https://quote-api.jup.ag/v6/swap?devnet=true"
  },
  "testnet": {
    quote: "https://quote-api.jup.ag/v6/quote?devnet=true", // Jupiter doesn't support testnet directly, use devnet
    swap: "https://quote-api.jup.ag/v6/swap?devnet=true"
  },
  "mainnet-beta": {
    quote: "https://quote-api.jup.ag/v6/quote",
    swap: "https://quote-api.jup.ag/v6/swap"
  }
}

// Quote parameters
interface QuoteParams {
  inputMint: string
  outputMint: string
  amount: string
  slippageBps: number
  onlyDirectRoutes?: boolean
  asLegacyTransaction?: boolean
  network: NetworkType
}

// Swap parameters
interface SwapParams {
  connection: Connection
  wallet: { publicKey: PublicKey }
  fromToken: Token
  toToken: Token
  quote: any
  slippageBps: number
  network: NetworkType
}

// Get quote from Jupiter API
export async function getQuote(params: QuoteParams) {
  try {
    // Get the appropriate API endpoint for the current network
    const quoteApiUrl = JUPITER_API_ENDPOINTS[params.network].quote

    // Construct the URL with query parameters
    const url = new URL(quoteApiUrl)
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

    // Add retry logic for better reliability
    let retries = 3
    let response = null
    let error = null

    while (retries > 0 && !response) {
      try {
        // Fetch quote from Jupiter API
        response = await fetch(url.toString(), {
          headers: {
            'Content-Type': 'application/json',
          },
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(10000) // 10 second timeout
        })
      } catch (err) {
        error = err
        retries--
        if (retries > 0) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    if (!response || !response.ok) {
      throw new Error(`Jupiter API error: ${response?.status || 'Request failed'} ${response?.statusText || error?.message || ''}`)
    }

    const data = await response.json()

    // Calculate outAmountWithSlippage
    const outAmount = Number(data.outAmount)
    const slippageAdjustment = outAmount * (params.slippageBps / 10000)
    data.outAmountWithSlippage = (outAmount - slippageAdjustment).toString()

    // Add network information to the response
    data.network = params.network

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
    const { connection, wallet, quote, slippageBps, network, fromToken, toToken } = params

    if (!wallet.publicKey) {
      throw new Error("Wallet not connected")
    }

    // Get the appropriate API endpoint for the current network
    const swapApiUrl = JUPITER_API_ENDPOINTS[network].swap

    // Prepare the swap transaction with network-specific optimizations
    const swapRequestBody = {
      quoteResponse: quote,
      userPublicKey: wallet.publicKey.toString(),
      wrapAndUnwrapSol: true,
      feeAccount: null,
      // Adjust priority fee based on network
      computeUnitPriceMicroLamports: network === "mainnet-beta" ? 100 : 50,
      // Use legacy transaction for better compatibility on devnet/testnet
      asLegacyTransaction: network !== "mainnet-beta",
      dynamicComputeUnitLimit: true, // Automatically adjust compute unit limit
      skipUserAccountsCheck: true, // Skip checking if user has all required token accounts
    }

    // Add retry logic for better reliability
    let retries = 3
    let swapResponse = null
    let error = null

    while (retries > 0 && !swapResponse) {
      try {
        // Get the swap transaction
        swapResponse = await fetch(swapApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(swapRequestBody),
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(15000) // 15 second timeout
        })
      } catch (err) {
        error = err
        retries--
        if (retries > 0) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    if (!swapResponse || !swapResponse.ok) {
      const errorMessage = swapResponse ? await swapResponse.text() : error?.message || "Request failed"
      throw new Error(`Jupiter Swap API error: ${errorMessage}`)
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
          signature = await connection.sendRawTransaction(signedTx.serialize(), {
            skipPreflight: false,
            preflightCommitment: "confirmed",
            maxRetries: 3
          })
        } else {
          throw new Error("Wallet does not support signing transactions")
        }
      } catch (e) {
        // If not a versioned transaction, try legacy transaction
        const tx = Transaction.from(serializedTransaction)

        // Sign the transaction
        if (wallet.signTransaction) {
          signedTx = await wallet.signTransaction(tx)
          signature = await connection.sendRawTransaction(signedTx.serialize(), {
            skipPreflight: false,
            preflightCommitment: "confirmed",
            maxRetries: 3
          })
        } else {
          throw new Error("Wallet does not support signing transactions")
        }
      }

      // Wait for confirmation with timeout
      const confirmationPromise = connection.confirmTransaction(signature, "confirmed")
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Transaction confirmation timeout")), 60000)
      )

      try {
        const confirmation = await Promise.race([confirmationPromise, timeoutPromise])
        if (confirmation.value?.err) {
          throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`)
        }
      } catch (error) {
        if (error.message === "Transaction confirmation timeout") {
          // Transaction might still be processing
          return {
            success: true,
            txId: signature,
            signature,
            warning: "Transaction sent but confirmation timed out. Check explorer for status."
          }
        }
        throw error
      }

      return {
        success: true,
        txId: signature,
        signature,
        fromToken: fromToken.symbol,
        toToken: toToken.symbol,
        network
      }
    } else {
      throw new Error("No swap transaction returned from Jupiter API")
    }
  } catch (error) {
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
        logoURI: "/placeholder.svg?key=drkna",
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
        logoURI: "/placeholder.svg?key=drkna",
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
  ]
}

// Get NFTs
export async function getNFTs(walletAddress: string) {
  // In a real implementation, you would fetch from Metaplex or another NFT API
  // For now, we'll return mock data
  return [
    {
      id: "nft1",
      name: "Golden Ticket #1",
      collection: "Goldium Tickets",
      image: "/placeholder.svg?key=nft1",
      price: 10,
      currency: "GOLD",
      attributes: [
        { trait_type: "Rarity", value: "Legendary" },
        { trait_type: "Type", value: "Access" },
      ],
      description: "This NFT grants special access to Goldium premium features.",
    },
    {
      id: "nft2",
      name: "Gold Bar #42",
      collection: "Goldium Collectibles",
      image: "/placeholder.svg?key=nft2",
      price: 5,
      currency: "GOLD",
      attributes: [
        { trait_type: "Rarity", value: "Rare" },
        { trait_type: "Type", value: "Collectible" },
      ],
      description: "A rare digital gold bar from the Goldium collection.",
    },
  ]
}

// Get staking rewards
export async function getStakingRewards(walletAddress: string) {
  // In a real implementation, you would fetch from your staking program
  // For now, we'll return mock data
  return [
    {
      token: "GOLD",
      amount: "12.5",
    },
  ]
}

// Add the missing getTokenPriceHistory function
export async function getTokenPriceHistory(tokenAddress: string, timeframe = "7d") {
  // This would normally fetch from an API, but for demo we'll return mock data
  // In a real implementation, you would fetch from CoinGecko, CoinMarketCap, or a similar API

  // Generate some realistic price data
  const now = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000
  const dataPoints = timeframe === "24h" ? 24 : timeframe === "7d" ? 7 : 30
  const basePrice = 2.5 // Base price in USD

  const priceData = Array.from({ length: dataPoints }, (_, i) => {
    // Create some random price fluctuation
    const randomFactor = 0.9 + Math.random() * 0.2 // Random between 0.9 and 1.1
    const timestamp = now - (dataPoints - i) * oneDayMs
    const price = basePrice * randomFactor

    return {
      timestamp,
      price,
      volume: Math.floor(Math.random() * 1000000) + 500000, // Random volume between 500k and 1.5M
    }
  })

  return {
    tokenAddress,
    timeframe,
    data: priceData,
    currentPrice: priceData[priceData.length - 1].price,
    priceChange: {
      percentage: ((priceData[priceData.length - 1].price - priceData[0].price) / priceData[0].price) * 100,
      value: priceData[priceData.length - 1].price - priceData[0].price,
    },
  }
}
