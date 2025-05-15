"use client"
import { X } from "lucide-react"
import Image from "next/image"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (walletType: string) => void
}

export default function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  if (!isOpen) return null

  const wallets = [
    {
      name: "Phantom",
      icon: "/phantom-wallet-logo.png",
      type: "Solana",
      color: "bg-purple-600",
    },
    {
      name: "Solflare",
      icon: "/solflare-wallet-logo.png",
      type: "Solana",
      color: "bg-orange-500",
    },
    {
      name: "MetaMask",
      icon: "/images/metamask.png",
      type: "EVM",
      color: "bg-yellow-500",
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-yellow-600 rounded-lg w-full max-w-md p-6 shadow-xl shadow-yellow-600/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              className="flex items-center w-full p-4 rounded-lg border border-gray-700 hover:border-yellow-600 bg-gray-800 hover:bg-gray-700 transition-all"
              onClick={() => onConnect(wallet.name)}
            >
              <div className={`${wallet.color} p-2 rounded-full mr-4`}>
                <Image src={wallet.icon || "/placeholder.svg"} alt={`${wallet.name} logo`} width={24} height={24} />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">{wallet.name}</p>
                <p className="text-sm text-gray-400">{wallet.type}</p>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-gray-400 text-center">
          By connecting your wallet, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
