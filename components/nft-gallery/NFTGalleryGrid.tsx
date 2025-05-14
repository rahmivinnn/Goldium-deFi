"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useWallet } from "@solana/wallet-adapter-react"
import { useConnection } from "@solana/wallet-adapter-react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getGoldNftsForOwner } from "@/services/nftService"
import NFTDetailModal from "@/components/nft-gallery/NFTDetailModal"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

export default function NFTGalleryGrid() {
  const { connection } = useConnection()
  const { publicKey, connected } = useWallet()
  const [nfts, setNfts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedNft, setSelectedNft] = useState<any | null>(null)

  useEffect(() => {
    async function fetchNfts() {
      if (!connected || !publicKey) return

      setLoading(true)
      try {
        const userNfts = await getGoldNftsForOwner(connection, publicKey)

        // Transform the NFTs into a more usable format
        const formattedNfts = userNfts.map((nft) => ({
          mint: nft.address.toString(),
          name: nft.name,
          symbol: nft.symbol,
          description: nft.json?.description || "No description",
          image: nft.json?.image || "/digital-art-collection.png",
          attributes: nft.json?.attributes || [],
          collection: nft.collection?.address.toString() || "Unknown Collection",
          collectionName: nft.collection?.name || "Unknown Collection",
        }))

        setNfts(formattedNfts)
      } catch (error) {
        console.error("Error fetching NFTs:", error)

        // For demo purposes, add some mock NFTs if none are found
        setNfts([
          {
            mint: "mock-mint-1",
            name: "Golden Egg #1",
            symbol: "GOLD",
            description: "A rare golden egg from the Goldium collection",
            image: "/placeholder.svg?key=dmy27",
            attributes: [
              { trait_type: "Background", value: "Cosmic" },
              { trait_type: "Shell", value: "Diamond" },
              { trait_type: "Glow", value: "Radiant Gold" },
              { trait_type: "Rarity", value: "Legendary" },
            ],
            collection: "GOLD-collection",
            collectionName: "Goldium Genesis",
          },
          {
            mint: "mock-mint-2",
            name: "Golden Egg #42",
            symbol: "GOLD",
            description: "A beautiful golden egg from the Goldium collection",
            image: "/placeholder.svg?key=s0zpi",
            attributes: [
              { trait_type: "Background", value: "Nebula" },
              { trait_type: "Shell", value: "Platinum" },
              { trait_type: "Glow", value: "Amber" },
              { trait_type: "Rarity", value: "Epic" },
            ],
            collection: "GOLD-collection",
            collectionName: "Goldium Genesis",
          },
          {
            mint: "mock-mint-3",
            name: "Golden Egg #78",
            symbol: "GOLD",
            description: "A shimmering golden egg from the Goldium collection",
            image: "/placeholder.svg?key=fgavg",
            attributes: [
              { trait_type: "Background", value: "Deep Space" },
              { trait_type: "Shell", value: "Gold" },
              { trait_type: "Glow", value: "Subtle" },
              { trait_type: "Rarity", value: "Rare" },
            ],
            collection: "GOLD-collection",
            collectionName: "Goldium Genesis",
          },
          {
            mint: "mock-mint-4",
            name: "Goldium Founder #5",
            symbol: "GOLD",
            description: "A legendary founder NFT granting governance rights",
            image: "/placeholder.svg?key=bnq6p",
            attributes: [
              { trait_type: "Background", value: "Void" },
              { trait_type: "Material", value: "Ancient Gold" },
              { trait_type: "Inscription", value: "Founder" },
              { trait_type: "Rarity", value: "Mythic" },
            ],
            collection: "GOLD-founders",
            collectionName: "Goldium Founders",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchNfts()
  }, [connection, publicKey, connected])

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8">Connect your wallet to view your NFTs from the Goldium collection</p>
          <div className="custom-wallet-button">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No NFTs Found</h2>
          <p className="text-gray-400 mb-8">You don't have any NFTs from the Goldium collection yet</p>
          <Button>Browse Marketplace</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {nfts.map((nft) => (
          <div
            key={nft.mint}
            className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden nft-card cursor-pointer"
            onClick={() => setSelectedNft(nft)}
          >
            <div className="relative aspect-square">
              <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-cover" />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white">{nft.name}</h3>
                  <p className="text-sm text-gray-400">{nft.collectionName}</p>
                </div>
                <div className="bg-gray-800 px-2 py-1 rounded text-xs font-medium text-gold-500">
                  {nft.attributes.find((attr: any) => attr.trait_type === "Rarity")?.value || "Common"}
                </div>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-sm text-gray-400">{nft.symbol}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 border-gold-500/30 text-gold-500 hover:bg-gold-500/10"
                >
                  View
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedNft && <NFTDetailModal nft={selectedNft} isOpen={!!selectedNft} onClose={() => setSelectedNft(null)} />}
    </div>
  )
}
