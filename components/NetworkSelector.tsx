"use client"

import { useState } from "react"
import { useNetwork } from "@/components/providers/NetworkContextProvider"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe, ChevronDown, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

export function NetworkSelector() {
  const { network, setNetwork, isTestEnvironment } = useNetwork()
  const [isOpen, setIsOpen] = useState(false)

  const networks = [
    { id: "devnet", name: "Devnet", color: "text-purple-400" },
    { id: "testnet", name: "Testnet", color: "text-blue-400" },
    { id: "mainnet-beta", name: "Mainnet Beta", color: "text-green-400" },
  ] as const

  const currentNetwork = networks.find((n) => n.id === network) || networks[0]

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 bg-black/20 border border-${currentNetwork.id === "mainnet-beta" ? "green" : "amber"}-500/30 hover:bg-${currentNetwork.id === "mainnet-beta" ? "green" : "amber"}-500/10`}
        >
          <Globe className={`h-4 w-4 ${currentNetwork.color}`} />
          <span className={currentNetwork.color}>{currentNetwork.name}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
          {isTestEnvironment && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] bg-gray-900 border border-gray-800">
        <div className="p-2">
          <p className="text-xs text-gray-400 mb-2">Select Network</p>
          {networks.map((item) => (
            <DropdownMenuItem
              key={item.id}
              className={`flex items-center justify-between rounded-md ${
                network === item.id ? "bg-gray-800" : "hover:bg-gray-800"
              } cursor-pointer`}
              onClick={() => {
                setNetwork(item.id)
                setIsOpen(false)
              }}
            >
              <div className="flex items-center gap-2">
                <Globe className={`h-4 w-4 ${item.color}`} />
                <span className={item.color}>{item.name}</span>
              </div>
              {network === item.id && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </DropdownMenuItem>
          ))}
        </div>
        {isTestEnvironment && (
          <div className="border-t border-gray-800 p-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-amber-500 p-2 bg-amber-500/10 rounded"
            >
              You are using a test network. Tokens have no real value.
            </motion.div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NetworkSelector
