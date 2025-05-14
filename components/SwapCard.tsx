"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { ArrowDownUp, Info, Loader2, AlertCircle, Settings } from "lucide-react"
import TokenSelector from "./TokenSelector"
import QuoteDisplay from "./QuoteDisplay"
import { getQuote, executeSwap } from "@/utils/jupiter"
import { SOL_TOKEN, GOLD_TOKEN } from "@/constants/tokens"
import { useWalletBalance } from "@/hooks/useWalletBalance"
import { useTransactions, useTheme, useLanguage } from "@/components/WalletContextProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function SwapCard() {
  const { connected, publicKey } = useWallet()
  const { connection } = useConnection()
  const [inputAmount, setInputAmount] = useState("")
  const [slippage, setSlippage] = useState(1)
  const [fromToken, setFromToken] = useState(SOL_TOKEN)
  const [toToken, setToToken] = useState(GOLD_TOKEN)
  const [quote, setQuote] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSwapping, setIsSwapping] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [autoAdjustSlippage, setAutoAdjustSlippage] = useState(false)
  const [gasEstimate, setGasEstimate] = useState("0.000005")
  const [priceImpact, setPriceImpact] = useState("< 0.01%")
  const { balance, isLoading: isBalanceLoading, refetch: refetchBalance } = useWalletBalance(fromToken.mint)
  const { addTransaction, updateTransaction } = useTransactions()
  const { toast } = useToast()
  const { theme } = useTheme()
  const { t } = useLanguage()
  const isDarkTheme = theme === "dark"

  // Ref to track if component is mounted
  const isMounted = useRef(true)

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  const fetchQuote = useCallback(async () => {
    if (!inputAmount || Number.parseFloat(inputAmount) <= 0) {
      setQuote(null)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const amount = Number.parseFloat(inputAmount) * 10 ** fromToken.decimals
      const quoteResponse = await getQuote({
        inputMint: fromToken.mint,
        outputMint: toToken.mint,
        amount: amount.toString(),
        slippageBps: slippage * 100, // Convert percentage to basis points
      })

      if (isMounted.current) {
        setQuote(quoteResponse)

        // Calculate price impact (simplified)
        const inAmount = Number(quoteResponse.inAmount) / 10 ** fromToken.decimals
        const outAmount = Number(quoteResponse.outAmount) / 10 ** toToken.decimals
        const marketPrice = inAmount / outAmount
        const executionPrice = inAmount / (outAmount * (1 - slippage / 100))
        const impact = ((executionPrice - marketPrice) / marketPrice) * 100

        if (impact < 0.01) {
          setPriceImpact("< 0.01%")
        } else if (impact < 0.1) {
          setPriceImpact("< 0.1%")
        } else if (impact < 1) {
          setPriceImpact(`~${impact.toFixed(2)}%`)
        } else {
          setPriceImpact(`${impact.toFixed(2)}%`)
        }

        // Auto-adjust slippage if enabled
        if (autoAdjustSlippage) {
          let recommendedSlippage = 0.5
          if (impact > 1) recommendedSlippage = 1.5
          if (impact > 3) recommendedSlippage = 3
          if (impact > 5) recommendedSlippage = 5

          if (recommendedSlippage !== slippage) {
            setSlippage(recommendedSlippage)
          }
        }
      }
    } catch (err) {
      console.error("Error fetching quote:", err)
      if (isMounted.current) {
        setError("Failed to fetch quote. Please try again.")
        setQuote(null)
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }, [inputAmount, fromToken, toToken, slippage, autoAdjustSlippage])

  useEffect(() => {
    if (connected && inputAmount && Number.parseFloat(inputAmount) > 0) {
      const debounce = setTimeout(() => {
        fetchQuote()
      }, 500)

      return () => clearTimeout(debounce)
    } else {
      setQuote(null)
    }
  }, [connected, inputAmount, fromToken, toToken, slippage, fetchQuote])

  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setInputAmount("")
    setQuote(null)
  }

  const handleInputChange = (value: string) => {
    // Only allow numbers and decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setInputAmount(value)
    }
  }

  const handleMaxClick = () => {
    if (balance) {
      // Set max amount with a small buffer for transaction fees if SOL
      const maxAmount = fromToken.mint === SOL_TOKEN.mint ? Math.max(0, balance - 0.01) : balance
      setInputAmount(maxAmount.toString())
    }
  }

  const handleSwap = async () => {
    if (!connected || !publicKey || !quote) return

    setIsSwapping(true)
    setError("")

    // Create a transaction record
    const txRecord = {
      fromToken: fromToken.symbol,
      toToken: toToken.symbol,
      fromAmount: Number(inputAmount),
      toAmount: Number(quote.outAmount) / 10 ** toToken.decimals,
      status: "pending" as const,
    }

    // Add to transaction history
    addTransaction(txRecord)

    try {
      // Execute the swap
      const result = await executeSwap({
        connection,
        wallet: { publicKey },
        fromToken,
        toToken,
        quote,
        slippageBps: slippage * 100,
      })

      if (result.success) {
        // Update transaction status
        updateTransaction(result.txId, {
          status: "confirmed",
          signature: result.signature,
        })

        // Show success toast
        toast({
          title: "Swap Successful",
          description: `Swapped ${inputAmount} ${fromToken.symbol} to ${(Number(quote.outAmount) / 10 ** toToken.decimals).toFixed(6)} ${toToken.symbol}`,
          variant: "default",
        })

        // Reset form
        setInputAmount("")
        setQuote(null)

        // Refresh balance
        setTimeout(() => {
          refetchBalance()
        }, 2000)
      } else {
        throw new Error(result.error || "Swap failed")
      }
    } catch (err) {
      console.error("Swap error:", err)

      // Update transaction status
      updateTransaction(txRecord.id, { status: "failed" })

      // Show error toast
      toast({
        title: "Swap Failed",
        description: err.message || "Failed to execute swap. Please try again.",
        variant: "destructive",
      })

      setError(err.message || "Failed to execute swap. Please try again.")
    } finally {
      setIsSwapping(false)
    }
  }

  const insufficientBalance =
    connected && balance !== null && inputAmount !== "" && Number.parseFloat(inputAmount) > balance

  const canSwap =
    connected &&
    inputAmount !== "" &&
    Number.parseFloat(inputAmount) > 0 &&
    !insufficientBalance &&
    quote &&
    !isLoading &&
    !isSwapping

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`${isDarkTheme ? "bg-gray-900" : "bg-white"} border ${isDarkTheme ? "border-gold/20" : "border-gold/30"} rounded-2xl shadow-lg ${isDarkTheme ? "shadow-gold/5" : "shadow-gold/10"} overflow-hidden backdrop-blur-sm`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-center bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
              {t("swap")}
            </h2>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className={`h-5 w-5 ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`} />
                </Button>
              </DialogTrigger>
              <DialogContent className={isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}>
                <DialogHeader>
                  <DialogTitle className={isDarkTheme ? "text-white" : "text-gray-900"}>Swap Settings</DialogTitle>
                  <DialogDescription className={isDarkTheme ? "text-gray-400" : "text-gray-500"}>
                    Customize your swap experience
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="slippage" className={isDarkTheme ? "text-white" : "text-gray-900"}>
                        Slippage Tolerance
                      </Label>
                      <span className={`text-sm font-medium ${isDarkTheme ? "text-gold" : "text-amber-600"}`}>
                        {slippage}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="slippage"
                        value={[slippage]}
                        min={0.1}
                        max={5}
                        step={0.1}
                        onValueChange={(value) => setSlippage(value[0])}
                        className="flex-1"
                        disabled={autoAdjustSlippage}
                      />
                      <div className="flex gap-1">
                        {[0.5, 1, 3].map((value) => (
                          <button
                            key={value}
                            onClick={() => setSlippage(value)}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                              slippage === value
                                ? `${isDarkTheme ? "bg-gold/20 text-gold" : "bg-amber-100 text-amber-600"}`
                                : `${isDarkTheme ? "bg-gray-800 text-gray-400 hover:bg-gray-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`
                            }`}
                            disabled={autoAdjustSlippage}
                          >
                            {value}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="auto-slippage" checked={autoAdjustSlippage} onCheckedChange={setAutoAdjustSlippage} />
                    <Label htmlFor="auto-slippage" className={isDarkTheme ? "text-white" : "text-gray-900"}>
                      Auto-adjust slippage based on price impact
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label className={isDarkTheme ? "text-white" : "text-gray-900"}>Transaction Speed</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger
                        className={isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                      >
                        <SelectValue placeholder="Select speed" />
                      </SelectTrigger>
                      <SelectContent
                        className={isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                      >
                        <SelectItem value="slow">Slow (Cheaper)</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="fast">Fast (Higher Priority)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400">
                      Save Changes
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* From Token Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>{t("from")}</label>
              {connected && !isBalanceLoading && (
                <div className={`text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
                  Balance: {balance !== null ? balance.toFixed(4) : "..."}
                  {balance !== null && (
                    <button
                      onClick={handleMaxClick}
                      className={`ml-1 ${isDarkTheme ? "text-gold hover:text-amber-400" : "text-amber-600 hover:text-amber-500"} transition-colors`}
                    >
                      MAX
                    </button>
                  )}
                </div>
              )}
            </div>
            <div
              className={`flex items-center gap-2 p-3 ${isDarkTheme ? "bg-black/40" : "bg-gray-50"} rounded-xl border ${isDarkTheme ? "border-gray-800" : "border-gray-200"}`}
            >
              <TokenSelector selectedToken={fromToken} onSelectToken={setFromToken} otherToken={toToken} />
              <Input
                type="text"
                value={inputAmount}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="0.0"
                className={`bg-transparent border-0 text-right text-lg focus-visible:ring-0 focus-visible:ring-offset-0 ${isDarkTheme ? "text-white" : "text-gray-900"}`}
              />
            </div>
            {insufficientBalance && <p className="text-red-500 text-xs mt-1">{t("insufficientBalance")}</p>}
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={handleSwapTokens}
              className={`${isDarkTheme ? "bg-gray-800" : "bg-gray-100"} p-2 rounded-full border ${isDarkTheme ? "border-gray-700" : "border-gray-300"} hover:border-gold/50 transition-all duration-200 hover:shadow-md hover:shadow-gold/20`}
            >
              <ArrowDownUp className={`h-4 w-4 ${isDarkTheme ? "text-gold" : "text-amber-600"}`} />
            </button>
          </div>

          {/* To Token Section */}
          <div className="mb-6 mt-4">
            <label className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"} mb-2 block`}>{t("to")}</label>
            <div
              className={`flex items-center gap-2 p-3 ${isDarkTheme ? "bg-black/40" : "bg-gray-50"} rounded-xl border ${isDarkTheme ? "border-gray-800" : "border-gray-200"}`}
            >
              <TokenSelector selectedToken={toToken} onSelectToken={setToToken} otherToken={fromToken} />
              <div className="flex-1 text-right">
                <QuoteDisplay quote={quote} isLoading={isLoading} toToken={toToken} />
              </div>
            </div>
          </div>

          {/* Slippage Settings */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1">
                <label className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
                  {t("slippageTolerance")}
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className={`h-3 w-3 ${isDarkTheme ? "text-gray-500" : "text-gray-400"}`} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">
                        Your transaction will revert if the price changes unfavorably by more than this percentage.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className={`text-sm font-medium ${isDarkTheme ? "text-gold" : "text-amber-600"}`}>{slippage}%</span>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                value={[slippage]}
                min={0.1}
                max={5}
                step={0.1}
                onValueChange={(value) => setSlippage(value[0])}
                className="flex-1"
                disabled={autoAdjustSlippage}
              />
              <div className="flex gap-1">
                {[0.5, 1, 3].map((value) => (
                  <button
                    key={value}
                    onClick={() => setSlippage(value)}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      slippage === value
                        ? `${isDarkTheme ? "bg-gold/20 text-gold" : "bg-amber-100 text-amber-600"}`
                        : `${isDarkTheme ? "bg-gray-800 text-gray-400 hover:bg-gray-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`
                    }`}
                    disabled={autoAdjustSlippage}
                  >
                    {value}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <Button
            disabled={!canSwap}
            className={`w-full h-12 text-base font-medium bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:from-gray-700 disabled:to-gray-600 disabled:text-gray-400 transition-all duration-200 shadow-lg shadow-amber-900/20 disabled:shadow-none`}
            onClick={handleSwap}
          >
            {!connected ? (
              t("connectWallet")
            ) : isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("fetchingQuote")}</span>
              </div>
            ) : isSwapping ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Swapping...</span>
              </div>
            ) : insufficientBalance ? (
              t("insufficientBalance")
            ) : inputAmount === "" || Number.parseFloat(inputAmount) <= 0 ? (
              t("enterAmount")
            ) : (
              "Swap"
            )}
          </Button>

          {error && (
            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {quote && !isLoading && (
            <div
              className={`mt-4 p-3 ${isDarkTheme ? "bg-gray-800/50" : "bg-gray-50"} rounded-lg border ${isDarkTheme ? "border-gray-700" : "border-gray-200"}`}
            >
              <div className={`flex justify-between text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-500"} mb-1`}>
                <span>Rate</span>
                <span>
                  1 {fromToken.symbol} ≈{" "}
                  {((quote.outAmount / quote.inAmount) * 10 ** (toToken.decimals - fromToken.decimals)).toFixed(6)}{" "}
                  {toToken.symbol}
                </span>
              </div>
              <div className={`flex justify-between text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-500"} mb-1`}>
                <span>Price Impact</span>
                <span className="text-green-400">{priceImpact}</span>
              </div>
              <div className={`flex justify-between text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-500"} mb-1`}>
                <span>Minimum Received</span>
                <span>
                  {(Number.parseFloat(quote.outAmountWithSlippage) / 10 ** toToken.decimals).toFixed(6)}{" "}
                  {toToken.symbol}
                </span>
              </div>
              <div className={`flex justify-between text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
                <span>Network Fee</span>
                <span>~{gasEstimate} SOL</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
