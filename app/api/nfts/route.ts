import { type NextRequest, NextResponse } from "next/server"

// Mock NFT data
const MOCK_NFTS = [
  {
    id: "nft1",
    name: "Golden Egg #1",
    collection: "Goldium Genesis",
    image: "/placeholder.svg?key=golden-egg-1",
    description: "The first Golden Egg NFT from the Goldium Genesis collection",
    attributes: [
      { trait_type: "Background", value: "Cosmic" },
      { trait_type: "Shell", value: "Diamond" },
      { trait_type: "Glow", value: "Radiant Gold" },
    ],
    mint: "NFT111111111111111111111111111111111111111",
    owner: "wallet1",
    price: 5.2,
    currency: "SOL",
  },
  {
    id: "nft2",
    name: "Golden Egg #42",
    collection: "Goldium Genesis",
    image: "/placeholder.svg?key=golden-egg-42",
    description: "A rare Golden Egg NFT from the Goldium Genesis collection",
    attributes: [
      { trait_type: "Background", value: "Nebula" },
      { trait_type: "Shell", value: "Platinum" },
      { trait_type: "Glow", value: "Amber" },
    ],
    mint: "NFT222222222222222222222222222222222222222",
    owner: "wallet1",
    price: 3.8,
    currency: "SOL",
  },
  {
    id: "nft3",
    name: "Golden Egg #78",
    collection: "Goldium Genesis",
    image: "/placeholder.svg?key=golden-egg-78",
    description: "An uncommon Golden Egg NFT from the Goldium Genesis collection",
    attributes: [
      { trait_type: "Background", value: "Deep Space" },
      { trait_type: "Shell", value: "Gold" },
      { trait_type: "Glow", value: "Subtle" },
    ],
    mint: "NFT333333333333333333333333333333333333333",
    owner: "wallet2",
    price: 2.5,
    currency: "SOL",
  },
  {
    id: "nft4",
    name: "Goldium Founder #5",
    collection: "Goldium Founders",
    image: "/placeholder.svg?key=founder-5",
    description: "A legendary Founder NFT granting governance rights",
    attributes: [
      { trait_type: "Background", value: "Void" },
      { trait_type: "Material", value: "Ancient Gold" },
      { trait_type: "Inscription", value: "Founder" },
    ],
    mint: "NFT444444444444444444444444444444444444444",
    owner: "wallet1",
    price: 25.0,
    currency: "SOL",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Missing address parameter" }, { status: 400 })
    }

    // In a real implementation, we would fetch NFTs from the blockchain
    // For this demo, we'll filter our mock data based on a simulated owner
    const walletAddress = address.toLowerCase()
    let nfts = []

    if (walletAddress.includes("wallet1")) {
      nfts = MOCK_NFTS.filter((nft) => nft.owner === "wallet1")
    } else if (walletAddress.includes("wallet2")) {
      nfts = MOCK_NFTS.filter((nft) => nft.owner === "wallet2")
    }

    // If no match, return a random subset to simulate ownership
    if (nfts.length === 0) {
      nfts = MOCK_NFTS.filter(() => Math.random() > 0.7)
    }

    return NextResponse.json(nfts)
  } catch (error) {
    console.error("Error in NFTs API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
