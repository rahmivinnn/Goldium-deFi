"use client"

import { useState } from "react"
import { useNetwork, type NetworkType } from "@/components/NetworkContextProvider"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

export default function NetworkSelector() {
  const { network, setNetwork } = useNetwork()
  const [isOpen, setIsOpen] = useState(false)

  const networks: { id: NetworkType; name: string; color: string }[] = [
    { id: "devnet", name: "Devnet", color: "bg-purple-500" },
    { id: "testnet", name: "Testnet", color: "bg-blue-500" },
    { id: "mainnet-beta", name: "Mainnet", color: "bg-green-500" },
  ]

  const currentNetwork = networks.find((n) => n.id === network) || networks[0]

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 border-gold-500/20 text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`h-2 w-2 rounded-full ${currentNetwork.color}`} />
        <span>{currentNetwork.name}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-md bg-black/90 backdrop-blur-md border border-gold-500/20 shadow-lg shadow-gold-500/10 py-1 z-50">
          {networks.map((n) => (
            <button
              key={n.id}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left ${
                n.id === network
                  ? "text-gold-500 bg-gold-500/10"
                  : "text-gray-300 hover:text-gold-500 hover:bg-gold-500/5"
              }`}
              onClick={() => {
                setNetwork(n.id)
                setIsOpen(false)
              }}
            >
              <span className={`h-2 w-2 rounded-full ${n.color}`} />
              <span>{n.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
