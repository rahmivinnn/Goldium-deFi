"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ArrowDownIcon, RefreshCwIcon, SettingsIcon, AlertCircle } from "lucide-react"
import { useJupiterSwap } from "@/hooks/useJupiterSwap"
import { useWalletBalance } from "@/hooks/useWalletBalance"
import { AVAILABLE_TOKENS } from "@/constants/tokens"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "@/components/providers/WalletContextProvider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function SwapCard() {
  const { connected, publicKey } = useWallet()
  const { balances, refreshBalances } = useWalletBalance()
  const { toast } = useToast()
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  const {
    routes,
    selectedRoute,
    isLoading,
    isSwapping,
    error,
    slippage,
    getRoutes,
    executeSwap,
    setSlippage,
    selectRoute,
  } = useJupiterSwap()

  // State
  const [inputToken, setInputToken] = useState(AVAILABLE_TOKENS[0]) // Default to first token
  const [outputToken, setOutputToken] = useState(AVAILABLE_TOKENS[1]) // Default to second token
  const [inputAmount, setInputAmount] = useState("")
  const [outputAmount, setOutputAmount] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [autoAdjustSlippage, setAutoAdjustSlippage] = useState(false)

  // Get routes when inputs change
  useEffect(() => {
    if (inputToken && outputToken && inputAmount && Number.parseFloat(inputAmount) > 0) {
      const debounce = setTimeout(() => {
        getRoutes(inputToken, outputToken, Number.parseFloat(inputAmount))
      }, 500)
      return () => clearTimeout(debounce)
    }
  }, [inputToken, outputToken, inputAmount, getRoutes])

  // Update output amount when route changes
  useEffect(() => {
    if (selectedRoute) {
      const outAmount = Number.parseFloat(selectedRoute.outAmount) / 10 ** outputToken.decimals
      setOutputAmount(outAmount.toFixed(outputToken.decimals > 6 ? 6 : outputToken.decimals))
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
      setTimeout(() => {
        refreshBalances()
      }, 2000)
    }
  }, [publicKey, selectedRoute, executeSwap, inputToken, outputToken, refreshBalances, toast])

  // Calculate max amount user can swap
  const maxAmount = balances[inputToken.symbol] || 0

  // Handle max button click
  const handleMaxClick = useCallback(() => {
    if (maxAmount > 0) {
      // If SOL, leave some for gas
      if (inputToken.symbol === "SOL") {
        setInputAmount(Math.max(0, maxAmount - 0.01).toString())
      } else {
        setInputAmount(maxAmount.toString())
      }
    }
  }, [maxAmount, inputToken.symbol])

  // Price impact calculation
  const priceImpact = selectedRoute ? Number.parseFloat(selectedRoute.priceImpactPct) : 0

  // Price display
  const price = selectedRoute
    ? Number.parseFloat(selectedRoute.outAmount) / Number.parseFloat(selectedRoute.inAmount)
    : 0

  const formattedPrice = price
    ? `1 ${inputToken.symbol} ≈ ${(price * Math.pow(10, inputToken.decimals - outputToken.decimals)).toFixed(6)} ${
        outputToken.symbol
      }`
    : "Loading price..."

  // Handle input change
  const handleInputChange = (value: string) => {
    // Only allow numbers and decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setInputAmount(value)
    }
  }

  const insufficientBalance =
    connected && maxAmount !== null && inputAmount !== "" && Number.parseFloat(inputAmount) > maxAmount

  const canSwap =
    connected &&
    inputAmount !== "" &&
    Number.parseFloat(inputAmount) > 0 &&
    !insufficientBalance &&
    selectedRoute &&
    !isLoading &&
    !isSwapping

  return (
    <Card
      className={`w-full max-w-md mx-auto ${isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex justify-between items-center">
          <span className={`bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent`}>
            Swap Tokens
          </span>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => getRoutes(inputToken, outputToken, Number.parseFloat(inputAmount))}
              disabled={isLoading || !inputAmount || Number.parseFloat(inputAmount) <= 0}
            >
              <RefreshCwIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className={isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}>
                <DialogHeader>
                  <DialogTitle>Swap Settings</DialogTitle>
                  <DialogDescription>Customize your swap experience</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="slippage">Slippage Tolerance</Label>
                      <span className="text-sm font-medium text-amber-500">{(slippage / 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="slippage"
                        value={[slippage]}
                        min={10}
                        max={500}
                        step={10}
                        onValueChange={(value) => setSlippage(value[0])}
                        className="flex-1"
                        disabled={autoAdjustSlippage}
                      />
                      <div className="flex gap-1">
                        {[50, 100, 300].map((value) => (
                          <button
                            key={value}
                            onClick={() => setSlippage(value)}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                              slippage === value
                                ? "bg-amber-100 text-amber-600"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                            disabled={autoAdjustSlippage}
                          >
                            {value / 100}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="auto-slippage" checked={autoAdjustSlippage} onCheckedChange={setAutoAdjustSlippage} />
                    <Label htmlFor="auto-slippage">Auto-Adjust Slippage</Label>
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Close
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input token */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>From</span>
            <span className={`text-xs ${isDarkTheme ? "text-gray-500" : "text-gray-600"}`}>
              Balance: {balances[inputToken.symbol]?.toFixed(4) || "0"} {inputToken.symbol}
            </span>
          </div>
          <div className="flex space-x-2">
            <Select
              value={inputToken.mint}
              onValueChange={(value) => {
                const token = AVAILABLE_TOKENS.find((t) => t.mint === value)
                if (token && token.mint !== outputToken.mint) setInputToken(token)
              }}
            >
              <SelectTrigger
                className={`w-[120px] ${isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"}`}
              >
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
              <SelectContent className={isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}>
                {AVAILABLE_TOKENS.filter((t) => t.mint !== outputToken.mint).map((token) => (
                  <SelectItem key={token.mint} value={token.mint}>
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
                type="text"
                placeholder="0.00"
                value={inputAmount}
                onChange={(e) => handleInputChange(e.target.value)}
                className={`${isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"} pr-16`}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-amber-500 h-6 px-2"
                onClick={handleMaxClick}
                disabled={maxAmount <= 0}
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
            className={`${isDarkTheme ? "bg-gray-800" : "bg-gray-100"} rounded-full h-8 w-8 border ${isDarkTheme ? "border-amber-500/30" : "border-amber-500/50"}`}
            onClick={handleSwapTokens}
          >
            <ArrowDownIcon className="h-4 w-4 text-amber-500" />
          </Button>
        </div>

        {/* Output token */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>To</span>
            <span className={`text-xs ${isDarkTheme ? "text-gray-500" : "text-gray-600"}`}>
              Balance: {balances[outputToken.symbol]?.toFixed(4) || "0"} {outputToken.symbol}
            </span>
          </div>
          <div className="flex space-x-2">
            <Select
              value={outputToken.mint}
              onValueChange={(value) => {
                const token = AVAILABLE_TOKENS.find((t) => t.mint === value)
                if (token && token.mint !== inputToken.mint) setOutputToken(token)
              }}
            >
              <SelectTrigger
                className={`w-[120px] ${isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"}`}
              >
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
              <SelectContent className={isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}>
                {AVAILABLE_TOKENS.filter((t) => t.mint !== inputToken.mint).map((token) => (
                  <SelectItem key={token.mint} value={token.mint}>
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
              type="text"
              placeholder="0.00"
              value={outputAmount}
              readOnly
              className={`${isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"}`}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-500 mt-2 p-2 bg-red-500/10 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Insufficient balance warning */}
        {insufficientBalance && (
          <div className="flex items-center gap-2 text-sm text-red-500 mt-2 p-2 bg-red-500/10 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>Insufficient balance</span>
          </div>
        )}

        {/* Price and route info */}
        {selectedRoute && (
          <div className={`${isDarkTheme ? "bg-gray-800" : "bg-gray-100"} rounded-lg p-3 space-y-2 text-sm`}>
            <div className="flex justify-between items-center">
              <span className={isDarkTheme ? "text-gray-400" : "text-gray-500"}>Price</span>
              <span className={isDarkTheme ? "text-gray-300" : "text-gray-700"}>{formattedPrice}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={isDarkTheme ? "text-gray-400" : "text-gray-500"}>Price Impact</span>
              <span
                className={`${
                  priceImpact > 5 ? "text-red-500" : priceImpact > 3 ? "text-yellow-500" : "text-green-500"
                }`}
              >
                {priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={isDarkTheme ? "text-gray-400" : "text-gray-500"}>Slippage Tolerance</span>
              <span className={isDarkTheme ? "text-gray-300" : "text-gray-700"}>{(slippage / 100).toFixed(2)}%</span>
            </div>
          </div>
        )}

        {/* Swap button */}
        <Button
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold"
          disabled={
            isSwapping ||
            isLoading ||
            !selectedRoute ||
            !inputAmount ||
            Number.parseFloat(inputAmount) <= 0 ||
            insufficientBalance
          }
          onClick={handleSwap}
        >
          {isSwapping ? (
            <div className="flex items-center">
              <span className="mr-2">Swapping</span>
              <div className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin" />
            </div>
          ) : !connected ? (
            "Connect Wallet"
          ) : !inputAmount || Number.parseFloat(inputAmount) <= 0 ? (
            "Enter an amount"
          ) : insufficientBalance ? (
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
