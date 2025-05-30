"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { useWalletBalance } from "@/hooks/useWalletBalance"
import { motion, AnimatePresence } from "framer-motion"
import { CopyableAddress } from "./CopyableAddress"
import { useWalletConnection } from "@/components/providers/WalletConnectionProvider"
import { Loader2, AlertCircle } from "lucide-react"
import ConnectWalletModal from "./ConnectWalletModal"
import { ConnectionErrorBoundary } from "./ConnectionErrorBoundary"

export function WalletConnect() {
  const { publicKey, connected } = useWallet()
  const { solBalance, goldBalance, isLoading, refreshBalances } = useWalletBalance()
  const { status, error, connect, disconnect } = useWalletConnection()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Refresh balances when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      refreshBalances()
    }
  }, [connected, publicKey, refreshBalances])

  const handleConnect = async () => {
    setIsModalOpen(true)
  }

  const handleDisconnect = async () => {
    await disconnect()
    setIsDropdownOpen(false)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev)
  }

  // Safely format balance with fallback to 0
  const formatBalance = (balance: number | undefined, decimals = 4) => {
    if (balance === undefined || balance === null || isNaN(balance)) {
      return "0.00"
    }
    return balance.toFixed(decimals)
  }

  // Render error state
  if (error) {
    return (
      <Button
        onClick={() => setIsModalOpen(true)}
        className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
      >
        <AlertCircle className="h-4 w-4 mr-2" />
        Connection Error
      </Button>
    )
  }

  // Render connecting state
  if (status === "connecting") {
    return (
      <Button disabled className="bg-amber-500/20 border border-amber-500/30 text-amber-400">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Connecting...
      </Button>
    )
  }

  // Render disconnected state
  if (!connected) {
    return (
      <>
        <Button
          onClick={handleConnect}
          className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold"
        >
          Connect Wallet
        </Button>

        <ConnectWalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    )
  }

  // Render connected state
  return (
    <ConnectionErrorBoundary>
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
                      key={isLoading ? "loading-sol" : `sol-${solBalance}`}
                      initial={{ opacity: 0.8, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isLoading ? "..." : formatBalance(solBalance)}
                    </motion.span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">GOLD Balance</span>
                    <motion.span
                      className="font-medium text-gold"
                      key={isLoading ? "loading-gold" : `gold-${goldBalance}`}
                      initial={{ opacity: 0.8, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isLoading ? "..." : formatBalance(goldBalance, 2)}
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
    </ConnectionErrorBoundary>
  )
}

export default WalletConnect
