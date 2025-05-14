import { type NextRequest, NextResponse } from "next/server"

// Mock base prices for demo purposes
const BASE_PRICES = {
  So11111111111111111111111111111111111111112: 100, // SOL
  GoLDium1111111111111111111111111111111111111: 5.5, // GOLD
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 1.0, // USDC
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: 0.00000125, // BONK
}

// Generate realistic price history with trends
function generatePriceHistory(basePrice: number, days: number) {
  const now = Date.now()
  const millisecondsPerDay = 24 * 60 * 60 * 1000
  const result = []

  // Generate a trend direction (up, down, or sideways)
  const trendDirection = Math.random() > 0.5 ? 1 : -1
  const trendStrength = Math.random() * 0.2 // 0-20% trend over the period

  for (let i = days - 1; i >= 0; i--) {
    const timestamp = now - i * millisecondsPerDay

    // Calculate trend component
    const trendProgress = (days - i) / days
    const trendComponent = basePrice * trendStrength * trendProgress * trendDirection

    // Add daily volatility
    const dailyVolatility = (Math.random() - 0.5) * 0.05 * basePrice // +/- 2.5%

    // Calculate price with trend and volatility
    const price = basePrice + trendComponent + dailyVolatility

    result.push({
      timestamp,
      price: Math.max(0.000001, price), // Ensure price is positive
    })
  }

  return result
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mint = searchParams.get("mint")
    const days = Number.parseInt(searchParams.get("days") || "7", 10)

    if (!mint) {
      return NextResponse.json({ error: "Missing mint parameter" }, { status: 400 })
    }

    // Limit days to a reasonable range
    const limitedDays = Math.min(Math.max(1, days), 90)

    // In a real implementation, we would fetch historical prices from an API
    // For this demo, we'll generate mock data
    const basePrice = BASE_PRICES[mint]

    if (!basePrice) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 })
    }

    const priceHistory = generatePriceHistory(basePrice, limitedDays)

    return NextResponse.json(priceHistory)
  } catch (error) {
    console.error("Error in token price history API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
