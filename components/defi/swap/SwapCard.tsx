"use client"

import { useState, useEffect, useCallback } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ArrowDownIcon, RefreshCwIcon, SettingsIcon } from "lucide-react"
import { useJupiterSwap } from "@/hooks/useJupiterSwap"
import { useWalletBalance } from "@/hooks/useWalletBalance"
import { GOLD_TOKEN } from "@/constants/tokens"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/components/ui/use-toast"

// Token list - in a real app, you would fetch this from an API
const tokens = [
  GOLD_TOKEN,
  {
    address: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logoURI: "/solana-logo.png",
  },
  {
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logoURI: "/usdc-logo.png",
  },
  {
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    logoURI: "/bonk-token-logo.png",
  },
]

export default function SwapCard() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const { balances, refreshBalances } = useWalletBalance()

  const { isLoading, routes, selectedRoute, isSwapping, slippage, getRoutes, executeSwap, setSlippage, selectRoute } =
    useJupiterSwap(connection)

  // State
  const [inputToken, setInputToken] = useState(tokens[0]) // GOLD
  const [outputToken, setOutputToken] = useState(tokens[1]) // SOL
  const [inputAmount, setInputAmount] = useState("")
  const [outputAmount, setOutputAmount] = useState("")
  const [showSettings, setShowSettings] = useState(false)

  // Get routes when inputs change
  useEffect(() => {
    if (inputToken && outputToken && inputAmount && Number.parseFloat(inputAmount) > 0) {
      getRoutes(inputToken, outputToken, Number.parseFloat(inputAmount), slippage)
    }
  }, [inputToken, outputToken, inputAmount, slippage, getRoutes])

  // Update output amount when route changes
  useEffect(() => {
    if (selectedRoute) {
      const outAmount = Number.parseFloat(selectedRoute.outAmount) / 10 ** outputToken.decimals
      setOutputAmount(outAmount.toFixed(outputToken.decimals))
    } else {
      setOutputAmount("")
    }
  }, [selectedRoute, outputToken.decimals])

  // Handle token swap
  const handleSwapTokens = useCallback(() => {
    const temp = inputToken
    setInputToken(outputToken)
    setOutputToken(temp)
    setInputAmount(outputAmount)
    // Routes will be updated by the useEffect
  }, [inputToken, outputToken, outputAmount])

  // Handle swap execution
  const handleSwap = useCallback(async () => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to swap tokens",
        variant: "destructive",
      })
      return
    }

    if (!selectedRoute) {
      toast({
        title: "No route available",
        description: "Please try a different amount or token pair",
        variant: "destructive",
      })
      return
    }

    const success = await executeSwap(inputToken, outputToken, selectedRoute)
    if (success) {
      setInputAmount("")
      setOutputAmount("")
      refreshBalances()
    }
  }, [publicKey, selectedRoute, executeSwap, inputToken, outputToken, refreshBalances])

  // Calculate max amount user can swap
  const maxAmount = balances[inputToken.symbol] || 0

  // Handle max button click
  const handleMaxClick = useCallback(() => {
    setInputAmount(maxAmount.toString())
  }, [maxAmount])

  // Price impact calculation
  const priceImpact = selectedRoute ? Number.parseFloat(selectedRoute.priceImpactPct) : 0

  // Price display
  const price = selectedRoute
    ? Number.parseFloat(selectedRoute.outAmount) / Number.parseFloat(selectedRoute.inAmount)
    : 0

  const formattedPrice = price
    ? `1 ${inputToken.symbol} ≈ ${price.toFixed(6)} ${outputToken.symbol}`
    : "Loading price..."

  return (
    <Card className="w-full max-w-md mx-auto bg-black border border-gold-500/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-gold-500 flex justify-between items-center">
          <span>Swap Tokens</span>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => getRoutes(inputToken, outputToken, Number.parseFloat(inputAmount), slippage)}
              disabled={isLoading || !inputAmount || Number.parseFloat(inputAmount) <= 0}
            >
              <RefreshCwIcon className={`h-4 w-4 text-gold-500 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
              <SettingsIcon className="h-4 w-4 text-gold-500" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Settings panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gray-900 rounded-lg p-4 overflow-hidden"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Slippage Tolerance</span>
                  <span className="text-sm text-gold-500">{(slippage / 100).toFixed(2)}%</span>
                </div>
                <Slider
                  value={[slippage]}
                  min={10}
                  max={500}
                  step={10}
                  onValueChange={(value) => setSlippage(value[0])}
                  className="my-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0.1%</span>
                  <span>5%</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input token */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">From</span>
            <span className="text-xs text-gray-500">
              Balance: {balances[inputToken.symbol]?.toFixed(4) || "0"} {inputToken.symbol}
            </span>
          </div>
          <div className="flex space-x-2">
            <Select
              value={inputToken.address}
              onValueChange={(value) => {
                const token = tokens.find((t) => t.address === value)
                if (token) setInputToken(token)
              }}
            >
              <SelectTrigger className="w-[120px] bg-gray-900 border-gray-700">
                <SelectValue>
                  <div className="flex items-center">
                    {inputToken.logoURI && (
                      <img
                        src={inputToken.logoURI || "/placeholder.svg"}
                        alt={inputToken.symbol}
                        className="w-5 h-5 mr-2 rounded-full"
                      />
                    )}
                    {inputToken.symbol}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {tokens
                  .filter((t) => t.address !== outputToken.address)
                  .map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      <div className="flex items-center">
                        {token.logoURI && (
                          <img
                            src={token.logoURI || "/placeholder.svg"}
                            alt={token.symbol}
                            className="w-5 h-5 mr-2 rounded-full"
                          />
                        )}
                        {token.symbol}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="0.00"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                className="bg-gray-900 border-gray-700 pr-16"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gold-500 h-6 px-2"
                onClick={handleMaxClick}
              >
                MAX
              </Button>
            </div>
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center -my-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-gray-900 rounded-full h-8 w-8 border border-gold-500/30"
            onClick={handleSwapTokens}
          >
            <ArrowDownIcon className="h-4 w-4 text-gold-500" />
          </Button>
        </div>

        {/* Output token */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">To</span>
            <span className="text-xs text-gray-500">
              Balance: {balances[outputToken.symbol]?.toFixed(4) || "0"} {outputToken.symbol}
            </span>
          </div>
          <div className="flex space-x-2">
            <Select
              value={outputToken.address}
              onValueChange={(value) => {
                const token = tokens.find((t) => t.address === value)
                if (token) setOutputToken(token)
              }}
            >
              <SelectTrigger className="w-[120px] bg-gray-900 border-gray-700">
                <SelectValue>
                  <div className="flex items-center">
                    {outputToken.logoURI && (
                      <img
                        src={outputToken.logoURI || "/placeholder.svg"}
                        alt={outputToken.symbol}
                        className="w-5 h-5 mr-2 rounded-full"
                      />
                    )}
                    {outputToken.symbol}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {tokens
                  .filter((t) => t.address !== inputToken.address)
                  .map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      <div className="flex items-center">
                        {token.logoURI && (
                          <img
                            src={token.logoURI || "/placeholder.svg"}
                            alt={token.symbol}
                            className="w-5 h-5 mr-2 rounded-full"
                          />
                        )}
                        {token.symbol}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.00"
              value={outputAmount}
              readOnly
              className="bg-gray-900 border-gray-700"
            />
          </div>
        </div>

        {/* Price and route info */}
        {selectedRoute && (
          <div className="bg-gray-900 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Price</span>
              <span className="text-gray-300">{formattedPrice}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Price Impact</span>
              <span
                className={`${
                  priceImpact > 5 ? "text-red-500" : priceImpact > 3 ? "text-yellow-500" : "text-green-500"
                }`}
              >
                {priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Slippage Tolerance</span>
              <span className="text-gray-300">{(slippage / 100).toFixed(2)}%</span>
            </div>
          </div>
        )}

        {/* Swap button */}
        <Button
          className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black font-semibold"
          disabled={
            isSwapping ||
            isLoading ||
            !selectedRoute ||
            !inputAmount ||
            Number.parseFloat(inputAmount) <= 0 ||
            Number.parseFloat(inputAmount) > maxAmount
          }
          onClick={handleSwap}
        >
          {isSwapping ? (
            <div className="flex items-center">
              <span className="mr-2">Swapping</span>
              <div className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin" />
            </div>
          ) : !publicKey ? (
            "Connect Wallet"
          ) : !inputAmount || Number.parseFloat(inputAmount) <= 0 ? (
            "Enter an amount"
          ) : Number.parseFloat(inputAmount) > maxAmount ? (
            "Insufficient balance"
          ) : isLoading ? (
            "Loading routes..."
          ) : !selectedRoute ? (
            "No route found"
          ) : (
            `Swap ${inputToken.symbol} for ${outputToken.symbol}`
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
