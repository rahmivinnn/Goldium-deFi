"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { useFaucet } from "@/hooks/useFaucet"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import Image from "next/image"

export function Faucet() {
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()
  const { claimGold, canClaim, timeUntilNextClaim, isLoading } = useFaucet()

  const [countdown, setCountdown] = useState<number>(0)

  useEffect(() => {
    if (!canClaim && timeUntilNextClaim > 0) {
      setCountdown(timeUntilNextClaim)
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [canClaim, timeUntilNextClaim])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleClaim = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to claim GOLD tokens",
        variant: "destructive",
      })
      return
    }

    if (!canClaim) {
      toast({
        title: "Cannot claim yet",
        description: `Please wait ${formatTime(countdown)} before claiming again`,
        variant: "destructive",
      })
      return
    }

    try {
      await claimGold()
      toast({
        title: "Claim successful!",
        description: "GOLD tokens have been sent to your wallet",
        variant: "default",
      })
    } catch (error) {
      console.error("Claim error:", error)
      toast({
        title: "Claim failed",
        description: "There was an error claiming your GOLD tokens",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-amber-500/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 relative">
          <Image src="/goldium-logo.png" alt="GOLD Token" fill className="object-contain" />
        </div>
        <h2 className="text-2xl font-bold text-amber-500">GOLD Token Faucet</h2>
      </div>

      <p className="text-gray-300 mb-6">Claim free GOLD tokens every 5 minutes to explore the Goldium ecosystem</p>

      {!canClaim && countdown > 0 ? (
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Next claim available in:</p>
          <motion.div
            className="text-xl font-mono text-amber-500"
            key={countdown}
            initial={{ opacity: 0.8, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {formatTime(countdown)}
          </motion.div>
        </div>
      ) : (
        <p className="text-sm text-green-400 mb-4">You can claim GOLD tokens now!</p>
      )}

      <Button
        onClick={handleClaim}
        disabled={!canClaim || isLoading || !connected}
        className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          "Claim GOLD Tokens"
        )}
      </Button>

      <div className="mt-4 text-xs text-gray-400">
        <p>GOLD Token Contract Address:</p>
        <code className="text-amber-300">ApkBg8kzMBpVKxvgrw67vkd5KuGWqSu2GVb19eK4pump</code>
      </div>
    </div>
  )
}

export default Faucet
