"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useWallet } from "@solana/wallet-adapter-react"
import { getNFTs } from "@/utils/jupiter"
import { Loader2, Search, Grid3X3, List } from "lucide-react"
import { useTheme } from "@/components/WalletContextProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function NFTGallery() {
  const { connected, publicKey } = useWallet()
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  const [nfts, setNfts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedNFT, setSelectedNFT] = useState<any | null>(null)

  useEffect(() => {
    if (connected && publicKey) {
      fetchNFTs()
    }
  }, [connected, publicKey])

  const fetchNFTs = async () => {
    if (!connected || !publicKey) return

    setIsLoading(true)
    try {
      const nftsData = await getNFTs(publicKey.toString())
      setNfts(nftsData)
    } catch (error) {
      console.error("Error fetching NFTs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter NFTs based on search query
  const filteredNFTs = nfts.filter(
    (nft) =>
      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.collection.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div
      className={`p-6 rounded-xl ${isDarkTheme ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"} shadow-lg`}
    >
      <h2 className="text-xl font-bold text-center mb-6 bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
        NFT Gallery
      </h2>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="w-full md:w-1/2 relative">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkTheme ? "text-gray-400" : "text-gray-500"} h-4 w-4`}
          />
          <Input
            placeholder="Search by name or collection"
            className={`pl-10 ${isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex bg-gray-800 rounded-md overflow-hidden">
          <button
            className={`p-2 ${viewMode === "grid" ? "bg-gray-700 text-gold" : `${isDarkTheme ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-200"}`}`}
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-5 w-5" />
          </button>
          <button
            className={`p-2 ${viewMode === "list" ? "bg-gray-700 text-gold" : `${isDarkTheme ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-200"}`}`}
            onClick={() => setViewMode("list")}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {!connected ? (
        <div className="text-center py-12">
          <p className={`mb-4 ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
            Connect your wallet to view your NFTs
          </p>
          <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400">
            Connect Wallet
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : filteredNFTs.length > 0 ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredNFTs.map((nft) =>
            viewMode === "grid" ? (
              <div
                key={nft.id}
                className={`${isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl overflow-hidden hover:border-gold/30 transition-all cursor-pointer`}
                onClick={() => setSelectedNFT(nft)}
              >
                <div className="relative aspect-square">
                  <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-bold ${isDarkTheme ? "text-white" : "text-gray-900"}`}>{nft.name}</h3>
                      <p className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>{nft.collection}</p>
                    </div>
                    <div
                      className={`${isDarkTheme ? "bg-gray-700" : "bg-gray-100"} px-2 py-1 rounded text-xs font-medium text-gold`}
                    >
                      {nft.attributes.find((attr: any) => attr.trait_type === "Rarity")?.value || "Common"}
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <span className={`font-medium ${isDarkTheme ? "text-white" : "text-gray-900"}`}>{nft.price}</span>
                      <span className={`ml-1 ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>{nft.currency}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`text-xs h-8 ${isDarkTheme ? "border-gold/30 text-gold hover:bg-gold/10" : "border-amber-500/30 text-amber-600 hover:bg-amber-50"}`}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={nft.id}
                className={`${isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-xl overflow-hidden hover:border-gold/30 transition-all cursor-pointer flex`}
                onClick={() => setSelectedNFT(nft)}
              >
                <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                  <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-cover" />
                </div>
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold ${isDarkTheme ? "text-white" : "text-gray-900"}`}>{nft.name}</h3>
                        <div
                          className={`${isDarkTheme ? "bg-gray-700" : "bg-gray-100"} px-2 py-0.5 rounded text-xs font-medium text-gold`}
                        >
                          {nft.attributes.find((attr: any) => attr.trait_type === "Rarity")?.value || "Common"}
                        </div>
                      </div>
                      <p className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>{nft.collection}</p>
                    </div>
                    <div
                      className={`${isDarkTheme ? "bg-black/70" : "bg-gray-200"} px-2 py-1 rounded-full text-xs font-medium`}
                    >
                      {nft.currency}
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <span className={`font-medium ${isDarkTheme ? "text-white" : "text-gray-900"}`}>{nft.price}</span>
                      <span className={`ml-1 ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>{nft.currency}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`text-xs h-8 ${isDarkTheme ? "border-gold/30 text-gold hover:bg-gold/10" : "border-amber-500/30 text-amber-600 hover:bg-amber-50"}`}
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
          <p className={`mb-4 ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
            {searchQuery ? "No NFTs found matching your search" : "No NFTs found in your wallet"}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              className={
                isDarkTheme
                  ? "border-gold/30 text-gold hover:bg-gold/10"
                  : "border-amber-500/30 text-amber-600 hover:bg-amber-50"
              }
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* NFT Detail Modal */}
      <Dialog open={!!selectedNFT} onOpenChange={(open) => !open && setSelectedNFT(null)}>
        <DialogContent
          className={`max-w-4xl ${isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
        >
          <DialogHeader>
            <DialogTitle className={isDarkTheme ? "text-white" : "text-gray-900"}>{selectedNFT?.name}</DialogTitle>
          </DialogHeader>

          {selectedNFT && (
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
                    <p className={isDarkTheme ? "text-gray-400" : "text-gray-500"}>Collection</p>
                    <p className={`font-medium text-lg ${isDarkTheme ? "text-white" : "text-gray-900"}`}>
                      {selectedNFT.collection}
                    </p>
                  </div>
                  <div
                    className={`${isDarkTheme ? "bg-gray-800" : "bg-gray-100"} px-3 py-1 rounded-full text-sm font-medium text-gold`}
                  >
                    {selectedNFT.attributes.find((attr: any) => attr.trait_type === "Rarity")?.value || "Common"}
                  </div>
                </div>

                <div className="mb-6">
                  <p className={isDarkTheme ? "text-gray-400" : "text-gray-500"}>Description</p>
                  <p className={`mt-1 ${isDarkTheme ? "text-white" : "text-gray-900"}`}>{selectedNFT.description}</p>
                </div>

                <div className="mb-6">
                  <p className={isDarkTheme ? "text-gray-400" : "text-gray-500"}>Current Price</p>
                  <div className="flex items-baseline">
                    <span className={`text-3xl font-bold ${isDarkTheme ? "text-white" : "text-gray-900"}`}>
                      {selectedNFT.price}
                    </span>
                    <span className={`ml-2 text-xl ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}>
                      {selectedNFT.currency}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className={`${isDarkTheme ? "text-gray-400" : "text-gray-500"} mb-2`}>Attributes</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedNFT.attributes.map((attr: any, index: number) => (
                      <div
                        key={index}
                        className={`${isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"} rounded-lg p-3 border`}
                      >
                        <p className={`text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
                          {attr.trait_type}
                        </p>
                        <p className={`font-medium ${isDarkTheme ? "text-white" : "text-gray-900"}`}>{attr.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 transition-all">
                    Buy Now
                  </Button>
                  <Button
                    variant="outline"
                    className={`flex-1 ${isDarkTheme ? "border-gold/30 text-gold hover:bg-gold/10" : "border-amber-500/30 text-amber-600 hover:bg-amber-50"}`}
                  >
                    Make Offer
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
