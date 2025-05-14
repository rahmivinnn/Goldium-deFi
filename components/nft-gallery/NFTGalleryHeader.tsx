"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Search, Filter, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NFTGalleryHeader() {
  const { connected } = useWallet()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold gold-gradient-text mb-2">NFT Gallery</h1>
            <p className="text-gray-400">Browse and collect unique Goldium NFTs</p>
          </div>

          {!connected && (
            <div className="custom-wallet-button">
              <WalletMultiButton />
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, collection, or traits"
              className="pl-10 bg-gray-900 border-gray-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="border-gray-800 text-gray-400">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>

            <div className="flex bg-gray-900 rounded-md overflow-hidden border border-gray-800">
              <button
                className={`p-2 ${viewMode === "grid" ? "bg-gray-800 text-gold-500" : "text-gray-400 hover:bg-gray-800"}`}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                className={`p-2 ${viewMode === "list" ? "bg-gray-800 text-gold-500" : "text-gray-400 hover:bg-gray-800"}`}
                onClick={() => setViewMode("list")}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
