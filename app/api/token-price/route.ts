import { type NextRequest, NextResponse } from "next/server"

// Mock token prices for demo purposes
const TOKEN_PRICES = {
  So11111111111111111111111111111111111111112: 100.25, // SOL
  GoLDium1111111111111111111111111111111111111: 5.75, // GOLD
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 1.0, // USDC
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: 0.00000125, // BONK
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mint = searchParams.get("mint")

    if (!mint) {
      return NextResponse.json({ error: "Missing mint parameter" }, { status: 400 })
    }

    // In a real implementation, we would fetch the price from an API like CoinGecko
    // For this demo, we'll use mock data
    const price = TOKEN_PRICES[mint] || null

    if (price === null) {
      return NextResponse.json({ error: "Token price not found" }, { status: 404 })
    }

    // Add some random fluctuation to simulate real-time price changes
    const fluctuation = (Math.random() - 0.5) * 0.02 // +/- 1%
    const adjustedPrice = price * (1 + fluctuation)

    return NextResponse.json({ price: adjustedPrice })
  } catch (error) {
    console.error("Error in token price API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
