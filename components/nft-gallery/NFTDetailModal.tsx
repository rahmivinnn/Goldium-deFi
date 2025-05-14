"use client"
import Image from "next/image"
import { X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NFTDetailModalProps {
  nft: any
  isOpen: boolean
  onClose: () => void
}

export default function NFTDetailModal({ nft, isOpen, onClose }: NFTDetailModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-gray-900 border border-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={onClose}>
          <X className="h-6 w-6" />
        </button>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-800">
              <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-cover" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{nft.name}</h2>
                  <p className="text-gray-400">{nft.collectionName}</p>
                </div>
                <div className="bg-gray-800 px-3 py-1 rounded-full text-sm font-medium text-gold-500">
                  {nft.attributes.find((attr: any) => attr.trait_type === "Rarity")?.value || "Common"}
                </div>
              </div>

              <p className="text-gray-300 mb-6">{nft.description}</p>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">Attributes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {nft.attributes.map((attr: any, index: number) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <p className="text-xs text-gray-400">{attr.trait_type}</p>
                      <p className="font-medium text-white">{attr.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mint Address</span>
                    <span className="text-white">
                      {nft.mint.slice(0, 6)}...{nft.mint.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Token Standard</span>
                    <span className="text-white">Metaplex NFT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Blockchain</span>
                    <span className="text-white">Solana</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-black">
                  List for Sale
                </Button>
                <Button variant="outline" className="flex-1 border-gold-500/30 text-gold-500 hover:bg-gold-500/10">
                  Transfer
                </Button>
              </div>

              <div className="mt-4 text-center">
                <a
                  href={`https://explorer.solana.com/address/${nft.mint}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-gray-400 hover:text-gold-500"
                >
                  View on Solana Explorer
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
