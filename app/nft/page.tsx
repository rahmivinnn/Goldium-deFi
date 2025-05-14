"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Search, Grid3X3, List, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWallet } from "@solana/wallet-adapter-react"
import { useEthereum } from "@/components/EthereumProvider"

// Sample NFT data
const NFTS = [
  {
    id: "nft1",
    name: "Golden Egg #1",
    collection: "Goldium Genesis",
    image: "/placeholder.svg?key=3k6l9",
    price: 5.2,
    currency: "SOL",
    rarity: "Legendary",
    attributes: [
      { trait_type: "Background", value: "Cosmic" },
      { trait_type: "Shell", value: "Diamond" },
      { trait_type: "Glow", value: "Radiant Gold" },
    ],
    chain: "solana",
  },
  {
    id: "nft2",
    name: "Golden Egg #42",
    collection: "Goldium Genesis",
    image: "/placeholder.svg?key=rzqqq",
    price: 3.8,
    currency: "SOL",
    rarity: "Epic",
    attributes: [
      { trait_type: "Background", value: "Nebula" },
      { trait_type: "Shell", value: "Platinum" },
      { trait_type: "Glow", value: "Amber" },
    ],
    chain: "solana",
  },
  {
    id: "nft3",
    name: "Golden Egg #78",
    collection: "Goldium Genesis",
    image: "/placeholder.svg?key=enpck",
    price: 2.5,
    currency: "SOL",
    rarity: "Rare",
    attributes: [
      { trait_type: "Background", value: "Deep Space" },
      { trait_type: "Shell", value: "Gold" },
      { trait_type: "Glow", value: "Subtle" },
    ],
    chain: "solana",
  },
  {
    id: "nft4",
    name: "Goldium Founder #5",
    collection: "Goldium Founders",
    image: "/placeholder.svg?key=av799",
    price: 0.8,
    currency: "ETH",
    rarity: "Mythic",
    attributes: [
      { trait_type: "Background", value: "Void" },
      { trait_type: "Material", value: "Ancient Gold" },
      { trait_type: "Inscription", value: "Founder" },
    ],
    chain: "ethereum",
  },
  {
    id: "nft5",
    name: "Goldium Founder #12",
    collection: "Goldium Founders",
    image: "/placeholder.svg?height=300&width=300&query=golden token nft with abstract gold patterns on black",
    price: 0.65,
    currency: "ETH",
    rarity: "Legendary",
    attributes: [
      { trait_type: "Background", value: "Abstract" },
      { trait_type: "Material", value: "Polished Gold" },
      { trait_type: "Inscription", value: "Early Adopter" },
    ],
    chain: "ethereum",
  },
  {
    id: "nft6",
    name: "Golden Egg #103",
    collection: "Goldium Genesis",
    image: "/placeholder.svg?height=300&width=300&query=golden egg nft with starry background and gold accents",
    price: 1.9,
    currency: "SOL",
    rarity: "Uncommon",
    attributes: [
      { trait_type: "Background", value: "Starry" },
      { trait_type: "Shell", value: "Bronze" },
      { trait_type: "Glow", value: "None" },
    ],
    chain: "solana",
  },
]

export default function NFTGalleryPage() {
  const { connected: solanaConnected } = useWallet()
  const { connected: ethConnected } = useEthereum()
  const [activeTab, setActiveTab] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("price-high")
  const [selectedNFT, setSelectedNFT] = useState<(typeof NFTS)[0] | null>(null)
  const [filteredNFTs, setFilteredNFTs] = useState(NFTS)

  // Filter NFTs based on active tab, search query, and sort
  useEffect(() => {
    let filtered = [...NFTS]

    // Filter by tab
    if (activeTab === "solana") {
      filtered = filtered.filter((nft) => nft.chain === "solana")
    } else if (activeTab === "ethereum") {
      filtered = filtered.filter((nft) => nft.chain === "ethereum")
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (nft) =>
          nft.name.toLowerCase().includes(query) ||
          nft.collection.toLowerCase().includes(query) ||
          nft.rarity.toLowerCase().includes(query),
      )
    }

    // Sort
    if (sortBy === "price-high") {
      filtered.sort((a, b) => {
        // Convert ETH to SOL for comparison (rough estimate)
        const aPrice = a.currency === "ETH" ? a.price * 30 : a.price
        const bPrice = b.currency === "ETH" ? b.price * 30 : b.price
        return bPrice - aPrice
      })
    } else if (sortBy === "price-low") {
      filtered.sort((a, b) => {
        const aPrice = a.currency === "ETH" ? a.price * 30 : a.price
        const bPrice = b.currency === "ETH" ? b.price * 30 : b.price
        return aPrice - bPrice
      })
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "rarity") {
      const rarityOrder = { Mythic: 0, Legendary: 1, Epic: 2, Rare: 3, Uncommon: 4, Common: 5 }
      filtered.sort(
        (a, b) => rarityOrder[a.rarity as keyof typeof rarityOrder] - rarityOrder[b.rarity as keyof typeof rarityOrder],
      )
    }

    setFilteredNFTs(filtered)
  }, [activeTab, searchQuery, sortBy])

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">
              NFT Gallery
            </h1>
            <p className="text-gray-400 mt-2">Explore and collect unique Goldium NFTs</p>
          </div>
          <Button className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 transition-all shadow-lg shadow-amber-900/20">
            Connect Wallet to Mint
          </Button>
        </div>

        <div className="bg-gray-900 border border-gold/20 rounded-2xl shadow-lg shadow-gold/5 overflow-hidden backdrop-blur-sm mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="w-full md:w-1/2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, collection, or rarity"
                  className="pl-10 bg-gray-800 border-gray-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 w-full md:w-[180px]">
                    <div className="flex items-center">
                      <ArrowUpDown className="mr-2 h-3.5 w-3.5 text-gray-400" />
                      <SelectValue placeholder="Sort by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="rarity">Rarity</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex bg-gray-800 rounded-md overflow-hidden">
                  <button
                    className={`p-2 ${viewMode === "grid" ? "bg-gray-700 text-gold" : "text-gray-400 hover:bg-gray-700"}`}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-5 w-5" />
                  </button>
                  <button
                    className={`p-2 ${viewMode === "list" ? "bg-gray-700 text-gold" : "text-gray-400 hover:bg-gray-700"}`}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-gray-800 border border-gray-700">
            <TabsTrigger value="all">All NFTs</TabsTrigger>
            <TabsTrigger value="solana">Solana NFTs</TabsTrigger>
            <TabsTrigger value="ethereum">Ethereum NFTs</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredNFTs.length > 0 ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredNFTs.map((nft) =>
              viewMode === "grid" ? (
                <div
                  key={nft.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gold/30 transition-all cursor-pointer"
                  onClick={() => setSelectedNFT(nft)}
                >
                  <div className="relative aspect-square">
                    <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-cover" />
                    <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-full text-xs font-medium">
                      {nft.chain === "solana" ? "Solana" : "Ethereum"}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{nft.name}</h3>
                        <p className="text-gray-400 text-sm">{nft.collection}</p>
                      </div>
                      <div className="bg-gray-800 px-2 py-1 rounded text-xs font-medium text-gold">{nft.rarity}</div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="font-medium">{nft.price}</span>
                        <span className="ml-1 text-gray-400">{nft.currency}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 border-gold/30 text-gold hover:bg-gold/10"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={nft.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gold/30 transition-all cursor-pointer flex"
                  onClick={() => setSelectedNFT(nft)}
                >
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                    <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-cover" />
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{nft.name}</h3>
                          <div className="bg-gray-800 px-2 py-0.5 rounded text-xs font-medium text-gold">
                            {nft.rarity}
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm">{nft.collection}</p>
                      </div>
                      <div className="bg-black/70 px-2 py-1 rounded-full text-xs font-medium">
                        {nft.chain === "solana" ? "Solana" : "Ethereum"}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="font-medium">{nft.price}</span>
                        <span className="ml-1 text-gray-400">{nft.currency}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 border-gold/30 text-gold hover:bg-gold/10"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No NFTs found matching your criteria</p>
            <Button
              variant="outline"
              className="border-gold/30 text-gold hover:bg-gold/10"
              onClick={() => {
                setSearchQuery("")
                setActiveTab("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* NFT Detail Modal */}
        {selectedNFT && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{selectedNFT.name}</h2>
                  <button className="text-gray-400 hover:text-white" onClick={() => setSelectedNFT(null)}>
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-800">
                    <Image
                      src={selectedNFT.image || "/placeholder.svg"}
                      alt={selectedNFT.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-gray-400">Collection</p>
                        <p className="font-medium text-lg">{selectedNFT.collection}</p>
                      </div>
                      <div className="bg-gray-800 px-3 py-1 rounded-full text-sm font-medium text-gold">
                        {selectedNFT.rarity}
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-gray-400">Current Price</p>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold">{selectedNFT.price}</span>
                        <span className="ml-2 text-xl text-gray-300">{selectedNFT.currency}</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-gray-400 mb-2">Attributes</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedNFT.attributes.map((attr, index) => (
                          <div key={index} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                            <p className="text-gray-400 text-xs">{attr.trait_type}</p>
                            <p className="font-medium">{attr.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-gray-400 mb-2">Blockchain</p>
                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 inline-block">
                        {selectedNFT.chain === "solana" ? "Solana" : "Ethereum"}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex-1 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 transition-all">
                        Buy Now
                      </Button>
                      <Button variant="outline" className="flex-1 border-gold/30 text-gold hover:bg-gold/10">
                        Make Offer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
