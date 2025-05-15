"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { ArrowDownUp, Loader2, AlertCircle, Settings } from "lucide-react"
import TokenSelector from "./TokenSelector"
import QuoteDisplay from "./QuoteDisplay"
import { getQuote, executeSwap } from "@/utils/jupiter"
import { SOL_TOKEN, GOLD_TOKEN } from "@/constants/tokens"
import { useWalletBalance } from "@/components/providers/WalletContextProvider"
import { useTransactions, useTheme, useLanguage } from "@/components/providers/WalletContextProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
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
import { motion } from "framer-motion"

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
  const { refreshBalances } = useWalletBalance()
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

        // Calculate price impact from the quote response
        if (quoteResponse.priceImpactPct) {
          const impact = Number.parseFloat(quoteResponse.priceImpactPct)
          if (impact < 0.01) {
            setPriceImpact("< 0.01%")
          } else if (impact < 0.1) {
            setPriceImpact("< 0.1%")
          } else if (impact < 1) {
            setPriceImpact(`~${impact.toFixed(2)}%`)
          } else {
            setPriceImpact(`${impact.toFixed(2)}%`)
          }
        } else {
          // Fallback calculation if priceImpactPct is not provided
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
        }

        // Auto-adjust slippage if enabled
        if (autoAdjustSlippage) {
          let recommendedSlippage = 0.5
          const impact = Number.parseFloat(quoteResponse.priceImpactPct || "0")
          if (impact > 1) recommendedSlippage = 1.5
          if (impact > 3) recommendedSlippage = 3
          if (impact > 5) recommendedSlippage = 5

          if (recommendedSlippage !== slippage) {
            setSlippage(recommendedSlippage)
          }
        }

        // Estimate gas cost
        setGasEstimate("0.000005") // Fixed estimate for now
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
    if (fromToken.balance) {
      // Set max amount with a small buffer for transaction fees if SOL
      const maxAmount = fromToken.mint === SOL_TOKEN.mint ? Math.max(0, fromToken.balance - 0.01) : fromToken.balance
      setInputAmount(maxAmount.toString())
    }
  }

  const handleSwap = async () => {
    if (!connected || !publicKey || !quote) return

    setIsSwapping(true)
    setError("")

    // Create a transaction record
    const txId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const txRecord = {
      id: txId,
      fromToken: fromToken.symbol,
      toToken: toToken.symbol,
      fromAmount: Number(inputAmount),
      toAmount: Number(quote.outAmount) / 10 ** toToken.decimals,
      status: "pending" as const,
      timestamp: Date.now(),
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
        updateTransaction(txId, {
          status: "confirmed",
          signature: result.signature,
        })

        // Show success toast with animation
        toast({
          title: "Swap Successful",
          description: (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              Swapped {inputAmount} {fromToken.symbol} to{" "}
              <motion.span
                initial={{ color: "#10B981" }}
                animate={{ color: "white" }}
                transition={{ duration: 2 }}
                className="font-bold"
              >
                {(Number(quote.outAmount) / 10 ** toToken.decimals).toFixed(6)} {toToken.symbol}
              </motion.span>
            </motion.div>
          ),
          variant: "default",
        })

        // Reset form
        setInputAmount("")
        setQuote(null)

        // Refresh balance
        setTimeout(() => {
          refreshBalances()
        }, 2000)
      } else {
        throw new Error(result.error || "Swap failed")
      }
    } catch (err) {
      console.error("Swap error:", err)

      // Update transaction status
      updateTransaction(txId, { status: "failed" })

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
    connected && fromToken.balance !== null && inputAmount !== "" && Number.parseFloat(inputAmount) > fromToken.balance

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
                      Auto-Adjust Slippage
                    </Label>
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

          <div className="mb-4">
            <TokenSelector
              selectedToken={fromToken}
              onSelectToken={setFromToken}
              balance={fromToken.balance}
              onMaxClick={handleMaxClick}
              label={t("pay_with")}
            />
            <div className="relative flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute -translate-y-1/2 rounded-full shadow-md border border-gold/30 hover:border-gold/50 transition-colors"
                onClick={handleSwapTokens}
              >
                <ArrowDownUp className="h-5 w-5 text-gold" />
              </Button>
            </div>
            <TokenSelector selectedToken={toToken} onSelectToken={setToToken} label={t("you_receive")} />
            <Input
              type="text"
              placeholder="0.0"
              value={inputAmount}
              onChange={(e) => handleInputChange(e.target.value)}
              className="mt-2 text-right"
            />
          </div>

          {insufficientBalance && (
            <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
              <AlertCircle className="h-4 w-4" />
              {t("insufficient_balance")}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {quote && (
            <div className="mt-4">
              <QuoteDisplay
                bestRoute={quote.routes[0]}
                gasEstimate={gasEstimate}
                priceImpact={priceImpact}
                toToken={toToken}
              />
            </div>
          )}

          <Button className="w-full mt-4" onClick={handleSwap} disabled={!canSwap} isLoading={isLoading || isSwapping}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("getting_quote")}
              </>
            ) : isSwapping ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("swapping")}
              </>
            ) : (
              t("swap")
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
