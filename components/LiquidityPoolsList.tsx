"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getLiquidityPools } from "@/utils/jupiter"
import { Loader2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { useTheme } from "@/components/WalletContextProvider"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface LiquidityPoolsListProps {
  mintAddress?: string
}

export default function LiquidityPoolsList({ mintAddress }: LiquidityPoolsListProps) {
  const [pools, setPools] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedPool, setExpandedPool] = useState<string | null>(null)
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  useEffect(() => {
    async function fetchPools() {
      setIsLoading(true)
      try {
        const poolsData = await getLiquidityPools(mintAddress || "")
        setPools(poolsData)
      } catch (error) {
        console.error("Error fetching liquidity pools:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPools()
  }, [mintAddress])

  const togglePoolExpand = (poolId: string) => {
    setExpandedPool(expandedPool === poolId ? null : poolId)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    )
  }

  if (pools.length === 0) {
    return (
      <div className={`text-center py-8 ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
        No liquidity pools found
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pools.map((pool) => (
        <div
          key={pool.id}
          className={`${isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} border rounded-xl overflow-hidden`}
        >
          <div
            className={`p-4 cursor-pointer ${isDarkTheme ? "hover:bg-gray-800/50" : "hover:bg-gray-50"} transition-colors`}
            onClick={() => togglePoolExpand(pool.id)}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="relative w-10 h-10">
                    <Image
                      src={pool.token1Info?.logoURI || "/placeholder.svg"}
                      alt={pool.token1Info?.symbol || "Token 1"}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </div>
                  <div className="absolute -right-2 -bottom-2 w-8 h-8">
                    <Image
                      src={pool.token2Info?.logoURI || "/placeholder.svg"}
                      alt={pool.token2Info?.symbol || "Token 2"}
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${isDarkTheme ? "text-white" : "text-gray-900"}`}>{pool.name}</h3>
                  <p className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>Jupiter LP</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                <div>
                  <p className={`text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>TVL</p>
                  <p className={`font-medium ${isDarkTheme ? "text-white" : "text-gray-900"}`}>
                    ${pool.tvl.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>APY</p>
                  <p className="font-medium text-green-500">{pool.apy}%</p>
                </div>
                <div>
                  <p className={`text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>24h Volume</p>
                  <p className={`font-medium ${isDarkTheme ? "text-white" : "text-gray-900"}`}>
                    ${pool.volume24h.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>Fee</p>
                  <p className={`font-medium ${isDarkTheme ? "text-white" : "text-gray-900"}`}>{pool.fee}%</p>
                </div>
              </div>

              <div className="flex items-center">
                {expandedPool === pool.id ? (
                  <ChevronUp className={`h-5 w-5 ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`} />
                ) : (
                  <ChevronDown className={`h-5 w-5 ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`} />
                )}
              </div>
            </div>
          </div>

          {expandedPool === pool.id && (
            <div
              className={`p-4 pt-0 border-t ${isDarkTheme ? "border-gray-800 bg-gray-800/30" : "border-gray-200 bg-gray-50/50"}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h4 className={`text-sm font-medium ${isDarkTheme ? "text-gray-400" : "text-gray-500"} mb-2`}>
                    Pool Information
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={isDarkTheme ? "text-gray-400" : "text-gray-500"}>Reserves</span>
                        <div className="text-right">
                          <div>
                            {pool.reserves.token1.toLocaleString()} {pool.token1Info?.symbol}
                          </div>
                          <div>
                            {pool.reserves.token2.toLocaleString()} {pool.token2Info?.symbol}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkTheme ? "text-gray-400" : "text-gray-500"}>Utilization</span>
                        <span>78%</span>
                      </div>
                      <div>
                        <Progress value={78} className="h-2 mt-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 transition-all">
                    Add Liquidity
                  </Button>
                  <Button
                    variant="outline"
                    className={`${isDarkTheme ? "border-gold/30 text-gold hover:bg-gold/10" : "border-amber-500/30 text-amber-600 hover:bg-amber-50"}`}
                  >
                    Remove Liquidity
                  </Button>
                  <Button
                    variant="ghost"
                    className={`${isDarkTheme ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
                  >
                    View Analytics
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
