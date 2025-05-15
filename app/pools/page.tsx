"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowRight, Plus, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AVAILABLE_TOKENS } from "@/constants/tokens"

// Sample pool data
const POOLS = [
  {
    id: "pool1",
    name: "SOL-GOLD",
    token1: AVAILABLE_TOKENS[0], // SOL
    token2: AVAILABLE_TOKENS[1], // GOLD
    tvl: 500000,
    apr: 42.5,
    volume24h: 320000,
    myLiquidity: 5000,
    rewards: ["GOLD"],
  },
  {
    id: "pool2",
    name: "GOLD-USDC",
    token1: AVAILABLE_TOKENS[1], // GOLD
    token2: AVAILABLE_TOKENS[2], // USDC
    tvl: 300000,
    apr: 38.2,
    volume24h: 180000,
    myLiquidity: 2500,
    rewards: ["GOLD"],
  },
  {
    id: "pool3",
    name: "SOL-USDC",
    token1: AVAILABLE_TOKENS[0], // SOL
    token2: AVAILABLE_TOKENS[2], // USDC
    tvl: 1000000,
    apr: 28.7,
    volume24h: 950000,
    myLiquidity: 0,
    rewards: ["GOLD"],
  },
  {
    id: "pool4",
    name: "GOLD-BONK",
    token1: AVAILABLE_TOKENS[1], // GOLD
    token2: AVAILABLE_TOKENS[3], // BONK
    tvl: 200000,
    apr: 65.3,
    volume24h: 125000,
    myLiquidity: 1200,
    rewards: ["GOLD", "BONK"],
  },
]

export default function PoolsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [expandedPool, setExpandedPool] = useState<string | null>(null)

  const filteredPools = activeTab === "my" ? POOLS.filter((pool) => pool.myLiquidity > 0) : POOLS

  const togglePoolExpand = (poolId: string) => {
    setExpandedPool(expandedPool === poolId ? null : poolId)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">
              Liquidity Pools
            </h1>
            <p className="text-gray-400 mt-2">Provide liquidity to earn trading fees and GOLD rewards</p>
          </div>
          <Button className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 transition-all shadow-lg shadow-amber-900/20">
            <Plus className="h-4 w-4 mr-2" />
            Create New Pool
          </Button>
        </div>

        <div className="bg-gray-900 border border-gold/20 rounded-2xl shadow-lg shadow-gold/5 overflow-hidden backdrop-blur-sm mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-300">Total Value Locked</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gold">$2,000,000</p>
                  <p className="text-green-400 text-sm">+5.2% (24h)</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-300">24h Trading Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gold">$1,575,000</p>
                  <p className="text-green-400 text-sm">+12.8% (24h)</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-300">My Liquidity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gold">$8,700</p>
                  <p className="text-gray-400 text-sm">Across 3 pools</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-gray-800 border border-gray-700">
            <TabsTrigger value="all">All Pools</TabsTrigger>
            <TabsTrigger value="my">My Pools</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {filteredPools.length > 0 ? (
            filteredPools.map((pool) => (
              <div key={pool.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => togglePoolExpand(pool.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="relative w-10 h-10">
                          <Image
                            src={pool.token1.logoURI || "/placeholder.svg"}
                            alt={pool.token1.symbol}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        </div>
                        <div className="absolute -right-2 -bottom-2 w-8 h-8">
                          <Image
                            src={pool.token2.logoURI || "/placeholder.svg"}
                            alt={pool.token2.symbol}
                            width={32}
                            height={32}
                            className="rounded-full border-2 border-gray-900"
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{pool.name}</h3>
                        <p className="text-gray-400 text-sm">Jupiter LP</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                      <div>
                        <p className="text-gray-400 text-xs">TVL</p>
                        <p className="font-medium">${pool.tvl.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">APR</p>
                        <p className="font-medium text-green-400">{pool.apr}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">24h Volume</p>
                        <p className="font-medium">${pool.volume24h.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">My Liquidity</p>
                        <p className="font-medium">
                          {pool.myLiquidity > 0 ? `$${pool.myLiquidity.toLocaleString()}` : "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {expandedPool === pool.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedPool === pool.id && (
                  <div className="p-4 pt-0 border-t border-gray-800 bg-gray-800/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Pool Information</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Fee Tier</span>
                            <span>0.3%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Rewards</span>
                            <span className="flex items-center gap-1">
                              {pool.rewards.map((reward, i) => (
                                <span key={i} className="text-gold">
                                  {reward}
                                </span>
                              ))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total LP Tokens</span>
                            <span>1,245,678</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <Button className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 transition-all">
                          Add Liquidity
                        </Button>
                        {pool.myLiquidity > 0 && (
                          <Button
                            variant="outline"
                            className="border-gold/30 text-gold hover:bg-gold/10 hover:text-gold"
                          >
                            Remove Liquidity
                          </Button>
                        )}
                        <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800">
                          View Analytics
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">You don't have any active liquidity positions</p>
              <Button className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 transition-all">
                Explore Pools
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
