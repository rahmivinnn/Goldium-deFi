"use client"

import { useState } from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample data - in a real app, this would come from an API
const sampleData = {
  "1D": [
    { time: "00:00", price: 1.94 },
    { time: "04:00", price: 1.97 },
    { time: "08:00", price: 1.91 },
    { time: "12:00", price: 2.01 },
    { time: "16:00", price: 2.06 },
    { time: "20:00", price: 2.09 },
    { time: "24:00", price: 2.11 },
  ],
  "1W": [
    { time: "Mon", price: 1.94 },
    { time: "Tue", price: 2.02 },
    { time: "Wed", price: 1.96 },
    { time: "Thu", price: 2.01 },
    { time: "Fri", price: 2.06 },
    { time: "Sat", price: 2.09 },
    { time: "Sun", price: 2.11 },
  ],
  "1M": [
    { time: "Week 1", price: 1.85 },
    { time: "Week 2", price: 1.92 },
    { time: "Week 3", price: 2.01 },
    { time: "Week 4", price: 2.11 },
  ],
  "3M": [
    { time: "Jan", price: 1.75 },
    { time: "Feb", price: 1.95 },
    { time: "Mar", price: 2.11 },
  ],
}

interface TokenChartProps {
  tokenSymbol?: string
  tokenName?: string
}

export default function TokenChart({ tokenSymbol = "GOLD", tokenName = "Goldium" }: TokenChartProps) {
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "3M">("1D")
  const data = sampleData[timeframe]

  // Calculate price change
  const priceChange = data[data.length - 1].price - data[0].price
  const priceChangePercent = (priceChange / data[0].price) * 100
  const isPositive = priceChange >= 0

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {tokenName} ({tokenSymbol})
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              <span className="text-lg font-medium">${data[data.length - 1].price.toFixed(2)}</span>
              <span className={`ml-2 text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
                {isPositive ? "+" : ""}
                {priceChange.toFixed(2)} ({isPositive ? "+" : ""}
                {priceChangePercent.toFixed(2)}%)
              </span>
            </CardDescription>
          </div>
          <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
            <TabsList>
              <TabsTrigger value="1D">1D</TabsTrigger>
              <TabsTrigger value="1W">1W</TabsTrigger>
              <TabsTrigger value="1M">1M</TabsTrigger>
              <TabsTrigger value="3M">3M</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            price: {
              label: "Price",
              color: isPositive ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))",
            },
          }}
          className="h-[200px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickMargin={8} />
              <YAxis
                domain={["dataMin - 0.05", "dataMax + 0.05"]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                tickMargin={8}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="price" stroke={`var(--color-price)`} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
