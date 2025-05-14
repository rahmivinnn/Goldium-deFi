import { type NextRequest, NextResponse } from "next/server"
import { AVAILABLE_TOKENS } from "@/constants/tokens"

// Extended token list with more tokens
const EXTENDED_TOKENS = [
  ...AVAILABLE_TOKENS,
  {
    name: "Raydium",
    symbol: "RAY",
    mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
    decimals: 6,
    logoURI: "/placeholder.svg?key=ray-token",
  },
  {
    name: "Serum",
    symbol: "SRM",
    mint: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
    decimals: 6,
    logoURI: "/placeholder.svg?key=srm-token",
  },
  {
    name: "Mango",
    symbol: "MNGO",
    mint: "MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac",
    decimals: 6,
    logoURI: "/placeholder.svg?key=mngo-token",
  },
  {
    name: "Orca",
    symbol: "ORCA",
    mint: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
    decimals: 6,
    logoURI: "/placeholder.svg?key=orca-token",
  },
  {
    name: "Saber",
    symbol: "SBR",
    mint: "Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1",
    decimals: 6,
    logoURI: "/placeholder.svg?key=sbr-token",
  },
  {
    name: "Step Finance",
    symbol: "STEP",
    mint: "StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT",
    decimals: 9,
    logoURI: "/placeholder.svg?key=step-token",
  },
  {
    name: "Marinade Staked SOL",
    symbol: "mSOL",
    mint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    decimals: 9,
    logoURI: "/placeholder.svg?key=msol-token",
  },
  {
    name: "Lido Staked SOL",
    symbol: "stSOL",
    mint: "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj",
    decimals: 9,
    logoURI: "/placeholder.svg?key=stsol-token",
  },
]

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, we would fetch tokens from Jupiter or another API
    // For this demo, we'll return our extended mock data

    // Add market data to each token
    const tokensWithMarketData = EXTENDED_TOKENS.map((token) => {
      // Generate random market data
      const price = token.symbol === "USDC" ? 1 : Math.random() * (token.symbol === "SOL" ? 100 : 10)
      const change24h = Math.random() * 20 - 10 // -10% to +10%
      const volume24h = Math.random() * 10000000
      const marketCap = price * (Math.random() * 1000000000)

      return {
        ...token,
        price,
        change24h,
        volume24h,
        marketCap,
      }
    })

    return NextResponse.json(tokensWithMarketData)
  } catch (error) {
    console.error("Error in tokens API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
