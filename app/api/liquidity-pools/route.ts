import { type NextRequest, NextResponse } from "next/server"
import { AVAILABLE_TOKENS } from "@/constants/tokens"

// Mock liquidity pool data
const MOCK_POOLS = [
  {
    id: "pool1",
    name: "SOL-GOLD",
    token1: "So11111111111111111111111111111111111111112", // SOL
    token2: "GoLDium1111111111111111111111111111111111111", // GOLD
    tvl: 1250000,
    volume24h: 320000,
    fee: 0.3,
    apy: 42.5,
    reserves: {
      token1: 6250,
      token2: 125000,
    },
  },
  {
    id: "pool2",
    name: "GOLD-USDC",
    token1: "GoLDium1111111111111111111111111111111111111", // GOLD
    token2: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
    tvl: 850000,
    volume24h: 180000,
    fee: 0.3,
    apy: 38.2,
    reserves: {
      token1: 85000,
      token2: 425000,
    },
  },
  {
    id: "pool3",
    name: "SOL-USDC",
    token1: "So11111111111111111111111111111111111111112", // SOL
    token2: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
    tvl: 3200000,
    volume24h: 950000,
    fee: 0.3,
    apy: 28.7,
    reserves: {
      token1: 16000,
      token2: 1600000,
    },
  },
  {
    id: "pool4",
    name: "GOLD-BONK",
    token1: "GoLDium1111111111111111111111111111111111111", // GOLD
    token2: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // BONK
    tvl: 420000,
    volume24h: 125000,
    fee: 0.3,
    apy: 65.3,
    reserves: {
      token1: 42000,
      token2: 33600000000,
    },
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mint = searchParams.get("mint")

    // In a real implementation, we would fetch pool data from an API or blockchain
    // For this demo, we'll filter our mock data
    let pools = MOCK_POOLS

    if (mint) {
      pools = pools.filter((pool) => pool.token1 === mint || pool.token2 === mint)
    }

    // Enhance the pool data with token information
    const enhancedPools = pools.map((pool) => {
      const token1Info = AVAILABLE_TOKENS.find((t) => t.mint === pool.token1)
      const token2Info = AVAILABLE_TOKENS.find((t) => t.mint === pool.token2)

      return {
        ...pool,
        token1Info,
        token2Info,
      }
    })

    return NextResponse.json(enhancedPools)
  } catch (error) {
    console.error("Error in liquidity pools API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
