"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { useWalletBalance } from "@/hooks/useWalletBalance"
import { motion, AnimatePresence } from "framer-motion"
import { CopyableAddress } from "./CopyableAddress"

export function WalletConnect() {
  const { publicKey, connected, connecting, disconnect, connect } = useWallet()
  const { solBalance, goldBalance, isLoading, refreshBalances } = useWalletBalance()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Refresh balances when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      refreshBalances()
    }
  }, [connected, publicKey, refreshBalances])

  const handleConnect = async () => {
    try {
      await connect()
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setIsDropdownOpen(false)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev)
  }

  if (!connected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={connecting}
        className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold"
      >
        {connecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <div className="relative">
      <Button
        onClick={toggleDropdown}
        className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold"
      >
        {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
      </Button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 bg-black/90 backdrop-blur-md border border-gold/30 rounded-xl shadow-xl z-50"
          >
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-400">Wallet Address</h3>
                <CopyableAddress address={publicKey?.toString() || ""} />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">SOL Balance</span>
                  <motion.span
                    className="font-medium text-white"
                    key={solBalance}
                    initial={{ opacity: 0.8, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isLoading ? "..." : solBalance.toFixed(4)}
                  </motion.span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">GOLD Balance</span>
                  <motion.span
                    className="font-medium text-gold"
                    key={goldBalance}
                    initial={{ opacity: 0.8, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isLoading ? "..." : goldBalance.toFixed(2)}
                  </motion.span>
                </div>
              </div>

              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="w-full border-red-500 text-red-500 hover:bg-red-500/10"
              >
                Disconnect
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WalletConnect
