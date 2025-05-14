import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const signature = searchParams.get("signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing signature parameter" }, { status: 400 })
    }

    // In a real implementation, we would check the transaction status on the blockchain
    // For this demo, we'll randomly return a status
    const random = Math.random()
    let status: "confirmed" | "failed" | "pending"

    if (random < 0.8) {
      status = "confirmed"
    } else if (random < 0.9) {
      status = "failed"
    } else {
      status = "pending"
    }

    return NextResponse.json({ status })
  } catch (error) {
    console.error("Error in transaction status API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
