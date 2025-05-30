"use client"

import { useEffect, useState } from "react"
import { useNetwork } from "@/components/providers/NetworkContextProvider"

export default function ClientNetworkBadge() {
  const { network } = useNetwork()
  const [mounted, setMounted] = useState(false)

  // Only render on client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything on server
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 bg-black/50 border border-amber-500/20 rounded-full px-3 py-1">
        <div className="h-2 w-2 rounded-full bg-gray-500"></div>
        <span className="text-xs text-gray-300">Loading...</span>
      </div>
    )
  }

  // Network-specific colors
  const getNetworkColor = () => {
    switch (network) {
      case "mainnet-beta":
        return "bg-green-500"
      case "testnet":
        return "bg-yellow-500"
      case "devnet":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="flex items-center gap-2 bg-black/50 border border-amber-500/20 rounded-full px-3 py-1">
      <div className={`h-2 w-2 rounded-full ${getNetworkColor()}`}></div>
      <span className="text-xs text-amber-300 capitalize">{network}</span>
    </div>
  )
}
