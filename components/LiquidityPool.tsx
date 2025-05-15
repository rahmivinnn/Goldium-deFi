"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { useLiquidityPool } from "@/hooks/useLiquidityPool"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { GOLD_TOKEN } from "@/constants/tokens"

export function LiquidityPool() {
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()
  const { poolData, userPoolShare, addLiquidity, removeLiquidity, isLoading, fetchPoolData } = useLiquidityPool(
    GOLD_TOKEN.mint,
  )

  const [amount, setAmount] = useState<string>("")
  const [isAdding, setIsAdding] = useState<boolean>(true)

  useEffect(() => {
    if (connected && publicKey) {
      fetchPoolData()
      const interval = setInterval(() => {
        fetchPoolData()
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [connected, publicKey, fetchPoolData])

  const handleSubmit = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to interact with liquidity pools",
        variant: "destructive",
      })
      return
    }

    if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    try {
      if (isAdding) {
        await addLiquidity(Number.parseFloat(amount))
        toast({
          title: "Liquidity added!",
          description: "You have successfully added liquidity to the pool",
          variant: "default",
        })
      } else {
        await removeLiquidity(Number.parseFloat(amount))
        toast({
          title: "Liquidity removed!",
          description: "You have successfully removed liquidity from the pool",
          variant: "default",
        })
      }
      setAmount("")
    } catch (error) {
      console.error("Liquidity operation error:", error)
      toast({
        title: "Operation failed",
        description: "There was an error processing your request",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-gold/30">
      <h2 className="text-2xl font-bold text-gold mb-4">GOLD Liquidity Pool</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/30 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Total Value Locked</p>
          <motion.p
            className="text-xl font-bold text-white"
            key={poolData?.tvl}
            initial={{ opacity: 0.8, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            ${poolData?.tvl.toLocaleString() || "0"}
          </motion.p>
        </div>
        <div className="bg-black/30 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Your Pool Share</p>
          <motion.p
            className="text-xl font-bold text-white"
            key={userPoolShare?.percentage}
            initial={{ opacity: 0.8, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {userPoolShare?.percentage.toFixed(4) || "0"}%
          </motion.p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <p className="text-sm text-gray-400">Your LP Tokens</p>
          <motion.p
            className="text-sm font-medium text-gold"
            key={userPoolShare?.lpTokens}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {userPoolShare?.lpTokens.toFixed(6) || "0"}
          </motion.p>
        </div>
        <div className="flex justify-between mb-2">
          <p className="text-sm text-gray-400">Earned Fees</p>
          <motion.p
            className="text-sm font-medium text-green-400"
            key={userPoolShare?.earnedFees}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            ${userPoolShare?.earnedFees.toFixed(2) || "0"}
          </motion.p>
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <Button
          onClick={() => setIsAdding(true)}
          variant={isAdding ? "default" : "outline"}
          className={`flex-1 ${isAdding ? "bg-amber-500 text-black" : "text-amber-500 border-amber-500"}`}
        >
          Add
        </Button>
        <Button
          onClick={() => setIsAdding(false)}
          variant={!isAdding ? "default" : "outline"}
          className={`flex-1 ${!isAdding ? "bg-amber-500 text-black" : "text-amber-500 border-amber-500"}`}
        >
          Remove
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={isAdding ? "Amount to add" : "Amount to remove"}
            className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <button
            onClick={() => {
              if (isAdding) {
                // Set max wallet balance
              } else {
                // Set max LP tokens
                setAmount(userPoolShare?.lpTokens.toString() || "0")
              }
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-amber-500 hover:text-amber-400"
          >
            MAX
          </button>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isLoading || !connected || !amount}
        className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
        ) : isAdding ? (
          "Add Liquidity"
        ) : (
          "Remove Liquidity"
        )}
      </Button>
    </div>
  )
}
