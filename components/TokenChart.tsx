"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getTokenPriceHistory } from "@/utils/jupiter"
import { Loader2 } from "lucide-react"
import { useTheme } from "@/components/WalletContextProvider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TokenChartProps {
  mintAddress: string
  symbol: string
}

export default function TokenChart({ mintAddress, symbol }: TokenChartProps) {
  const [priceHistory, setPriceHistory] = useState<{ timestamp: number; price: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7")
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  useEffect(() => {
    async function fetchPriceHistory() {
      setIsLoading(true)
      try {
        const history = await getTokenPriceHistory(mintAddress, Number.parseInt(timeRange, 10))
        setPriceHistory(history)
      } catch (error) {
        console.error("Error fetching price history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPriceHistory()
  }, [mintAddress, timeRange])

  // Format date for tooltip
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  // Calculate price change
  const calculatePriceChange = () => {
    if (priceHistory.length < 2) return { change: 0, percentage: 0 }

    const firstPrice = priceHistory[0].price
    const lastPrice = priceHistory[priceHistory.length - 1].price
    const change = lastPrice - firstPrice
    const percentage = (change / firstPrice) * 100

    return { change, percentage }
  }

  const { change, percentage } = calculatePriceChange()
  const isPositive = percentage >= 0

  return (
    <div
      className={`p-4 rounded-lg ${isDarkTheme ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"}`}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className={`font-medium ${isDarkTheme ? "text-white" : "text-gray-900"}`}>{symbol} Price Chart</h3>
          {!isLoading && (
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${isDarkTheme ? "text-white" : "text-gray-900"}`}>
                ${priceHistory.length > 0 ? priceHistory[priceHistory.length - 1].price.toFixed(6) : "0.00"}
              </span>
              <span className={isPositive ? "text-green-500" : "text-red-500"}>
                {isPositive ? "+" : ""}
                {percentage.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className={`w-[100px] ${isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}
          >
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent className={isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}>
            <SelectItem value="1">24h</SelectItem>
            <SelectItem value="7">7d</SelectItem>
            <SelectItem value="30">30d</SelectItem>
            <SelectItem value="90">90d</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkTheme ? "#333" : "#eee"} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) =>
                  new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                }
                stroke={isDarkTheme ? "#888" : "#666"}
              />
              <YAxis
                domain={["auto", "auto"]}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                stroke={isDarkTheme ? "#888" : "#666"}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(6)}`, "Price"]}
                labelFormatter={(timestamp) => formatDate(timestamp as number)}
                contentStyle={{
                  backgroundColor: isDarkTheme ? "#222" : "#fff",
                  borderColor: isDarkTheme ? "#444" : "#ddd",
                }}
              />
              <Line type="monotone" dataKey="price" stroke="#FFD700" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
