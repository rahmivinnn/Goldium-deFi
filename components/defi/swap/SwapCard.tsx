"use client"

import { useState, useEffect } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useNetwork } from "@/components/NetworkContextProvider"
import { GOLD_MINT_ADDRESS, GOLD_TOKEN_METADATA } from "@/services/tokenService"
import { Button } from "@/components/ui/button"
import { ArrowDownUp, Settings, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import TokenChart from "./TokenChart"
import RecentTransactions from "./RecentTransactions"

// Define token types
interface Token {
  name: string
  symbol: string
  mint: string
  decimals: number
  logoURI: string
}

// Available tokens
const AVAILABLE_TOKENS: Token[] = [
  {
    name: "Solana",
    symbol: "SOL",
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
    logoURI: "/solana-logo.png",
  },
  {
    name: GOLD_TOKEN_METADATA.name,
    symbol: GOLD_TOKEN_METADATA.symbol,
    mint: GOLD_MINT_ADDRESS.devnet,
    decimals: GOLD_TOKEN_METADATA.decimals,
    logoURI: GOLD_TOKEN_METADATA.image || "/logo.png",
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    logoURI: "/usdc-logo.png",
  },
  {
    name: "Bonk",
    symbol: "BONK",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    decimals: 5,
    logoURI: "/bonk-token-logo.png",
  },
]

export default function SwapCard() {
  const { connection } = useConnection()
  const { publicKey, connected, signTransaction } = useWallet()
  const { network } = useNetwork()
  const { toast } = useToast()

  const [fromToken, setFromToken] = useState<Token>(AVAILABLE_TOKENS[0])
  const [toToken, setToToken] = useState<Token>(AVAILABLE_TOKENS[1])
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [slippage, setSlippage] = useState(0.5)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSwapping, setIsSwapping] = useState(false)
  const [showChart, setShowChart] = useState(true)
  const [showTransactions, setShowTransactions] = useState(false)
  const [priceImpact, setPriceImpact] = useState("0.05")
  const [route, setRoute] = useState<any>(null)

  // Calculate estimated price
  const estimatedPrice =
    fromAmount && toAmount ? (Number.parseFloat(toAmount) / Number.parseFloat(fromAmount)).toFixed(6) : "0.00"

  // Fetch quote when inputs change
  useEffect(() => {
    if (!fromAmount || Number.parseFloat(fromAmount) <= 0) {
      setToAmount("")
      return
    }

    const fetchQuote = async () => {
      try {
        setIsLoading(true)
        setError("")

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock quote calculation
        const mockRate =
          fromToken.symbol === "SOL" && toToken.symbol === "GOLD"
            ? 15.5
            : fromToken.symbol === "GOLD" && toToken.symbol === "SOL"
              ? 0.065
              : fromToken.symbol === "USDC" && toToken.symbol === "GOLD"
                ? 0.5
                : fromToken.symbol === "GOLD" && toToken.symbol === "USDC"
                  ? 2
                  : 1.2

        const calculatedAmount = (Number.parseFloat(fromAmount) * mockRate).toFixed(toToken.decimals)
        setToAmount(calculatedAmount)

        // Mock route data
        setRoute({
          marketInfos: [
            {
              amm: { label: "Jupiter", id: "jupiter" },
              inputMint: fromToken.mint,
              outputMint: toToken.mint,
              notEnoughLiquidity: false,
              liquidityFee: 0.0003,
            },
          ],
          amount: fromAmount,
          outAmount: calculatedAmount,
          priceImpactPct: 0.05,
          slippageBps: slippage * 100,
        })

        setPriceImpact((Math.random() * 0.2).toFixed(2))
      } catch (err) {
        console.error("Error fetching quote:", err)
        setError("Failed to fetch quote. Please try again.")
        setToAmount("")
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch if we have a valid amount and both tokens selected
    if (fromAmount && Number.parseFloat(fromAmount) > 0 && fromToken && toToken) {
      fetchQuote()
    }
  }, [fromAmount, fromToken, toToken, slippage])

  // Swap tokens function
  const handleSwapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  // Execute swap function
  const executeSwap = async () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to execute a swap",
        variant: "destructive",
      })
      return
    }

    if (!fromAmount || !toAmount || Number.parseFloat(fromAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to swap",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSwapping(true)

      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Success toast
      toast({
        title: "Swap successful!",
        description: `Swapped ${fromAmount} ${fromToken.symbol} to ${toAmount} ${toToken.symbol}`,
        variant: "default",
      })

      // Reset form
      setFromAmount("")
      setToAmount("")
    } catch (err) {
      console.error("Swap error:", err)
      toast({
        title: "Swap failed",
        description: "There was an error executing your swap. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSwapping(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* Swap Card */}
        <div className="bg-black/60 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-6 shadow-lg flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Swap Tokens</h2>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 rounded-full hover:bg-yellow-500/10 transition-colors"
            >
              <Settings className="w-5 h-5 text-yellow-500" />
            </button>
          </div>

          {/* Settings panel */}
          {isSettingsOpen && (
            <div className="mb-4 p-4 bg-black/40 border border-yellow-500/20 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-500 mb-2">Slippage Tolerance</h3>
              <div className="flex gap-2">
                {[0.1, 0.5, 1.0, 2.0].map((value) => (
                  <button
                    key={value}
                    onClick={() => setSlippage(value)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      slippage === value
                        ? "bg-yellow-500 text-black font-medium"
                        : "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                    }`}
                  >
                    {value}%
                  </button>
                ))}
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(Number.parseFloat(e.target.value) || 0.1)}
                    className="w-full px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-yellow-500 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    min="0.1"
                    step="0.1"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-500 text-sm">%</span>
                </div>
              </div>
            </div>
          )}

          {/* From token */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>From</span>
              <span>Balance: {connected ? "0.00" : "—"}</span>
            </div>
            <div className="flex items-center gap-2 p-4 bg-black/40 border border-yellow-500/20 rounded-lg">
              <div className="flex-1">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-xl text-white focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-2 rounded-lg cursor-pointer hover:bg-yellow-500/20 transition-colors">
                <img
                  src={fromToken.logoURI || "/placeholder.svg"}
                  alt={fromToken.symbol}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = "/logo.png"
                  }}
                />
                <span className="font-medium text-white">{fromToken.symbol}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Swap button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={handleSwapTokens}
              className="bg-black border border-yellow-500/20 rounded-full p-2 hover:bg-yellow-500/10 transition-colors"
            >
              <ArrowDownUp className="w-5 h-5 text-yellow-500" />
            </button>
          </div>

          {/* To token */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>To</span>
              <span>Balance: {connected ? "0.00" : "—"}</span>
            </div>
            <div className="flex items-center gap-2 p-4 bg-black/40 border border-yellow-500/20 rounded-lg">
              <div className="flex-1">
                <input
                  type="number"
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-xl text-white focus:outline-none"
                  readOnly
                />
              </div>
              <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-2 rounded-lg cursor-pointer hover:bg-yellow-500/20 transition-colors">
                <img
                  src={toToken.logoURI || "/placeholder.svg"}
                  alt={toToken.symbol}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = "/logo.png"
                  }}
                />
                <span className="font-medium text-white">{toToken.symbol}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Price and route info */}
          {fromAmount && toAmount && Number.parseFloat(fromAmount) > 0 && (
            <div className="mb-4 p-3 bg-black/40 border border-yellow-500/20 rounded-lg text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Price</span>
                <span className="text-white">
                  1 {fromToken.symbol} ≈ {estimatedPrice} {toToken.symbol}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Route</span>
                <span className="text-white">Jupiter</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Price Impact</span>
                <span className={`${Number.parseFloat(priceImpact) > 1 ? "text-red-500" : "text-green-500"}`}>
                  {priceImpact}%
                </span>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Swap button */}
          <Button
            onClick={executeSwap}
            disabled={
              !connected || !fromAmount || !toAmount || Number.parseFloat(fromAmount) <= 0 || isLoading || isSwapping
            }
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!connected ? "Connect Wallet" : isLoading ? "Fetching Quote..." : isSwapping ? "Swapping..." : "Swap"}
          </Button>
        </div>

        {/* Chart and Transactions */}
        <div className="flex-1">
          <div className="bg-black/60 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-6 shadow-lg h-full">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowChart(true)
                    setShowTransactions(false)
                  }}
                  className={`text-sm font-medium ${
                    showChart ? "text-yellow-500 border-b-2 border-yellow-500" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Price Chart
                </button>
                <button
                  onClick={() => {
                    setShowChart(false)
                    setShowTransactions(true)
                  }}
                  className={`text-sm font-medium ${
                    showTransactions ? "text-yellow-500 border-b-2 border-yellow-500" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Transactions
                </button>
              </div>
              <button className="p-1 rounded-full hover:bg-yellow-500/10 transition-colors">
                <RefreshCw className="w-4 h-4 text-yellow-500" />
              </button>
            </div>

            {showChart && (
              <div className="h-[350px]">
                <TokenChart />
              </div>
            )}

            {showTransactions && (
              <div className="h-[350px] overflow-y-auto">
                <RecentTransactions />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
