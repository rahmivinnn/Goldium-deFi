import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Missing address parameter" }, { status: 400 })
    }

    // In a real implementation, we would fetch staking rewards from the blockchain
    // For this demo, we'll return mock data

    // Generate random rewards
    const rewards = [
      {
        token: "GOLD",
        amount: (Math.random() * 100).toFixed(2),
      },
      {
        token: "SOL",
        amount: (Math.random() * 0.5).toFixed(4),
      },
    ]

    return NextResponse.json(rewards)
  } catch (error) {
    console.error("Error in staking rewards API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
