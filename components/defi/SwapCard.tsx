"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/components/providers/WalletContextProvider"
import { useNetwork } from "@/components/providers/NetworkContextProvider"
import { useToast } from "@/components/ui/use-toast"
import { ArrowDownUp, Info, Settings } from 'lucide-react'
import { delay } from "@/lib/utils"

type Token = {
  symbol: string
  name: string
  logo: string
  balance?: number
}

const tokens: Token[] = [
  { symbol: "GOLD", name: "Goldium Token", logo: "🔶", balance: 100 },
  { symbol: "SOL", name: "Solana", logo: "◎", balance: 5 },
  { symbol: "USDC", name: "USD Coin", logo: "💲", balance: 200 },
  { symbol: "BONK", name: "Bonk", logo: "🐕", balance: 1000000 },
]

export default function SwapCard() {
  const { status, balance, simulateTransaction } = useWallet()
  const { network } = useNetwork()
  const { toast } = useToast()
  
  const [fromToken, setFromToken] = useState<Token>(tokens[0])
  const [toToken, setToToken] = useState<Token>(tokens[2])
  const [fromAmount, setFromAmount] = useState<string>("")
  const [toAmount, setToAmount] = useState<string>("")
  const [slippage, setSlippage] = useState<number>(0.5)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [swapping, setSwapping] = useState<boolean>(false)
  
  const handleFromAmountChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value)
      
      // Simulate price calculation
      const numValue = Number.parseFloat(value) || 0
      const rate = getExchangeRate(fromToken.symbol, toToken.symbol)
      setToAmount((numValue * rate).toFixed(6))
    }
  }
  
  const handleToAmountChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setToAmount(value)
      
      // Simulate price calculation
      const numValue = Number.parseFloat(value) || 0
      const rate = getExchangeRate(toToken.symbol, fromToken.symbol)
      setFromAmount((numValue * rate).toFixed(6))
    }
  }
  
  const getExchangeRate = (from: string, to: string) => {
    // Simulated exchange rates
    const rates: Record<string, Record<string, number>> = {
      "GOLD": { "SOL": 0.05, "USDC": 2, "BONK": 100000 },
      "SOL": { "GOLD": 20, "USDC": 40, "BONK": 2000000 },
      "USDC": { "GOLD": 0.5, "SOL": 0.025, "BONK": 50000 },
      "BONK": { "GOLD": 0.00001, "SOL": 0.0000005, "USDC": 0.00002 }
    }
    
    return rates[from]?.[to] || 1
  }
  
  const switchTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
  }

  return (
    <motion.div
      className="flex flex-col rounded-3xl bg-zinc-900 p-6 dark:bg-zinc-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Swap</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="from" className="text-sm text-zinc-500 dark:text-zinc-400">
              From
            </label>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Balance: {(fromToken.balance || 0).toFixed(2)} {fromToken.symbol}
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              id="from"
              className="w-full rounded-2xl bg-zinc-800 py-3 px-4 text-sm text-white outline-none dark:bg-zinc-700"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button variant="secondary" className="gap-2 rounded-xl px-3">
                {fromToken.logo} {fromToken.symbol}
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto mb-4 w-fit rounded-full bg-zinc-800 p-2 dark:bg-zinc-700">
          <Button variant="ghost" size="icon" onClick={switchTokens}>
            <ArrowDownUp className="h-5 w-5" />
          </Button>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="to" className="text-sm text-zinc-500 dark:text-zinc-400">
              To
            </label>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Balance: {(toToken.balance || 0).toFixed(2)} {toToken.symbol}
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              id="to"
              className="w-full rounded-2xl bg-zinc-800 py-3 px-4 text-sm text-white outline-none dark:bg-zinc-700"
              placeholder="0.0"
              value={toAmount}
              onChange={(e) => handleToAmountChange(e.target.value)}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button variant="secondary" className="gap-2 rounded-xl px-3">
                {toToken.logo} {toToken.symbol}
              </Button>
            </div>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={async () => {
            setSwapping(true)
            toast({
              title: "Swapping...",
              description: "Please wait while we process your transaction.",
            })
            await delay(1500)
            setSwapping(false)
            toast({
              title: "Swap Successful!",
              description: `Successfully swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}.`,
            })
          }}
          disabled={swapping}
        >
          {swapping ? "Swapping..." : "Swap"}
        </Button>
      </div>
    </motion.div>
  )
}
