"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet, type WalletType } from "@/components/providers/WalletContextProvider"

interface ConnectWalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const { connect, status } = useWallet()
  const [connecting, setConnecting] = useState(false)
  const [walletDetected, setWalletDetected] = useState({
    phantom: false,
    solflare: false,
    metamask: false,
  })

  useEffect(() => {
    // Check for installed wallets
    setWalletDetected({
      phantom: !!window.solana?.isPhantom,
      solflare: !!window.solflare,
      metamask: !!window.ethereum?.isMetaMask,
    })
  }, [])

  if (!isOpen) return null

  const handleConnect = async (walletType: WalletType) => {
    setConnecting(true)
    await connect(walletType)
    setConnecting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden border border-amber-500/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-300">
              Connect Wallet
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white focus:outline-none">
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-gray-400 mb-6">
            Connect your wallet to access Goldium.io features. Currently in Devnet/Testnet mode.
          </p>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full py-6 flex items-center justify-between hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
              onClick={() => handleConnect("phantom")}
              disabled={connecting || !walletDetected.phantom}
            >
              <span className="text-lg font-medium">Phantom</span>
              <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                <span className="text-white font-bold">Ph</span>
              </div>
              {!walletDetected.phantom && <span className="absolute right-16 text-xs text-red-400">Not detected</span>}
            </Button>

            <Button
              variant="outline"
              className="w-full py-6 flex items-center justify-between hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
              onClick={() => handleConnect("solflare")}
              disabled={connecting || !walletDetected.solflare}
            >
              <span className="text-lg font-medium">Solflare</span>
              <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-white font-bold">Sf</span>
              </div>
              {!walletDetected.solflare && <span className="absolute right-16 text-xs text-red-400">Not detected</span>}
            </Button>

            <Button
              variant="outline"
              className="w-full py-6 flex items-center justify-between hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
              onClick={() => handleConnect("metamask")}
              disabled={connecting || !walletDetected.metamask}
            >
              <span className="text-lg font-medium">MetaMask</span>
              <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              {!walletDetected.metamask && <span className="absolute right-16 text-xs text-red-400">Not detected</span>}
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            By connecting, you agree to Goldium.io&apos;s Terms of Service
          </div>
        </div>

        <div className="bg-amber-500/10 p-4 text-center">
          <div className="text-amber-300 text-sm">
            Currently in <span className="font-bold">Devnet/Testnet Mode</span> - Test tokens only
          </div>
        </div>
      </div>
    </div>
  )
}
