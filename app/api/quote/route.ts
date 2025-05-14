import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { inputMint, outputMint, amount, slippageBps } = body

    // Validate required parameters
    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Construct the URL with query parameters
    const url = new URL("https://quote-api.jup.ag/v6/quote")
    url.searchParams.append("inputMint", inputMint)
    url.searchParams.append("outputMint", outputMint)
    url.searchParams.append("amount", amount)

    if (slippageBps) {
      url.searchParams.append("slippageBps", slippageBps.toString())
    }

    // Forward the request to Jupiter API
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: "Jupiter API error", details: errorData }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in quote API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
