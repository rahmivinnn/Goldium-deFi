"use client"

import { Loader2 } from "lucide-react"
import type { Token } from "@/constants/tokens"
import { useTheme } from "@/components/WalletContextProvider"

interface QuoteDisplayProps {
  quote: any
  isLoading: boolean
  toToken: Token
}

export default function QuoteDisplay({ quote, isLoading, toToken }: QuoteDisplayProps) {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  if (isLoading) {
    return (
      <div className="flex justify-end items-center h-8">
        <Loader2 className={`h-5 w-5 animate-spin ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`} />
      </div>
    )
  }

  if (!quote) {
    return <div className={`text-lg font-medium ${isDarkTheme ? "text-gray-500" : "text-gray-400"}`}>0.0</div>
  }

  const formattedAmount = (Number.parseFloat(quote.outAmount) / 10 ** toToken.decimals).toFixed(6)

  return <div className={`text-lg font-medium ${isDarkTheme ? "text-white" : "text-gray-900"}`}>{formattedAmount}</div>
}
