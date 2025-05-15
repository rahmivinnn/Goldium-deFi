"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function DeployPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
        Goldium DeFi Platform
      </h1>
      
      <div className="max-w-2xl text-center mb-8">
        <p className="text-xl mb-4">
          Welcome to the Goldium DeFi platform - your gateway to decentralized finance on Solana.
        </p>
        <p className="text-gray-400">
          This deployment includes 3D animated backgrounds, updated TVL values from 2.5M to 1M, 
          and comprehensive DeFi functionality testing across all supported networks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 p-6 rounded-lg border border-gold-500/20">
          <h2 className="text-xl font-bold text-gold-500 mb-2">Swap</h2>
          <p className="text-gray-400">Trade tokens with minimal slippage and low fees</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg border border-gold-500/20">
          <h2 className="text-xl font-bold text-gold-500 mb-2">Stake</h2>
          <p className="text-gray-400">Earn rewards by staking your GOLD tokens</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg border border-gold-500/20">
          <h2 className="text-xl font-bold text-gold-500 mb-2">Liquidity</h2>
          <p className="text-gray-400">Provide liquidity and earn trading fees</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link 
          href="https://github.com/rahmivinnn/Goldium-deFi" 
          target="_blank"
          className="px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black font-semibold rounded-lg"
        >
          GitHub Repository
        </Link>
        <Link 
          href="https://goldium.io" 
          target="_blank"
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg border border-gold-500/20"
        >
          Main Website
        </Link>
      </div>
    </div>
  )
}
