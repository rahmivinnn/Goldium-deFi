"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowRight, Plus, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { AVAILABLE_TOKENS } from "@/constants/tokens"

// Sample farm data
const FARMS = [
  {
    id: "farm1",
    name: "SOL-GOLD Farm",
    token1: AVAILABLE_TOKENS[0], // SOL
    token2: AVAILABLE_TOKENS[1], // GOLD
    tvl: 950000,
    apr: 85.2,
    rewardToken: AVAILABLE_TOKENS[1], // GOLD
    myStake: 3500,
    pendingRewards: 125.5,
    endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    totalAllocation: 500000,
    remainingAllocation: 320000,
  },
  {
    id: "farm2",
    name: "GOLD-USDC Farm",
    token1: AVAILABLE_TOKENS[1], // GOLD
    token2: AVAILABLE_TOKENS[2], // USDC
    tvl: 720000,
    apr: 68.7,
    rewardToken: AVAILABLE_TOKENS[1], // GOLD
    myStake: 1800,
    pendingRewards: 42.3,
    endTime: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    totalAllocation: 300000,
    remainingAllocation: 210000,
  },
  {
    id: "farm3",
    name: "GOLD-BONK Farm",
    token1: AVAILABLE_TOKENS[1], // GOLD
    token2: AVAILABLE_TOKENS[3], // BONK
    tvl: 350000,
    apr: 120.5,
    rewardToken: AVAILABLE_TOKENS[1], // GOLD
    myStake: 0,
    pendingRewards: 0,
    endTime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    totalAllocation: 250000,
    remainingAllocation: 200000,
  },
]

export default function FarmsPage() {
  const [activeTab, setActiveTab] = useState("active")
  const [expandedFarm, setExpandedFarm] = useState<string | null>(null)

  const filteredFarms = activeTab === "my" ? FARMS.filter((farm) => farm.myStake > 0) : FARMS

  const toggleFarmExpand = (farmId: string) => {
    setExpandedFarm(expandedFarm === farmId ? null : farmId)
  }

  // Calculate days remaining
  const getDaysRemaining = (endTime: Date) => {
    const now = new Date()
    const diffTime = endTime.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Calculate allocation percentage remaining
  const getAllocationPercentage = (farm: (typeof FARMS)[0]) => {
    return (farm.remainingAllocation / farm.totalAllocation) * 100
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">
              Yield Farms
            </h1>
            <p className="text-gray-400 mt-2">Stake your LP tokens to earn GOLD rewards</p>
          </div>
          <Button className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 transition-all shadow-lg shadow-amber-900/20">
            <Plus className="h-4 w-4 mr-2" />
            Create New Farm
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
                  <p className="text-2xl font-bold text-gold">$2,020,000</p>
                  <p className="text-green-400 text-sm">+8.7% (24h)</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-300">GOLD Rewards Remaining</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gold">730,000 GOLD</p>
                  <p className="text-gray-400 text-sm">≈ $730,000</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-300">My Staked Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gold">$5,300</p>
                  <p className="text-gray-400 text-sm">Pending: 167.8 GOLD</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-gray-800 border border-gray-700">
            <TabsTrigger value="active">Active Farms</TabsTrigger>
            <TabsTrigger value="my">My Farms</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {filteredFarms.length > 0 ? (
            filteredFarms.map((farm) => (
              <div key={farm.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => toggleFarmExpand(farm.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="relative w-10 h-10">
                          <Image
                            src={farm.token1.logoURI || "/placeholder.svg"}
                            alt={farm.token1.symbol}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        </div>
                        <div className="absolute -right-2 -bottom-2 w-8 h-8">
                          <Image
                            src={farm.token2.logoURI || "/placeholder.svg"}
                            alt={farm.token2.symbol}
                            width={32}
                            height={32}
                            className="rounded-full border-2 border-gray-900"
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{farm.name}</h3>
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                          <span>Rewards:</span>
                          <Image
                            src={farm.rewardToken.logoURI || "/placeholder.svg"}
                            alt={farm.rewardToken.symbol}
                            width={16}
                            height={16}
                            className="rounded-full"
                          />
                          <span>{farm.rewardToken.symbol}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                      <div>
                        <p className="text-gray-400 text-xs">TVL</p>
                        <p className="font-medium">${farm.tvl.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">APR</p>
                        <p className="font-medium text-green-400">{farm.apr}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Ends In</p>
                        <p className="font-medium">{getDaysRemaining(farm.endTime)} days</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">My Stake</p>
                        <p className="font-medium">{farm.myStake > 0 ? `$${farm.myStake.toLocaleString()}` : "-"}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {expandedFarm === farm.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedFarm === farm.id && (
                  <div className="p-4 pt-0 border-t border-gray-800 bg-gray-800/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Farm Information</h4>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Total Allocation</span>
                              <span>{farm.totalAllocation.toLocaleString()} GOLD</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Remaining Rewards</span>
                              <span>{farm.remainingAllocation.toLocaleString()} GOLD</span>
                            </div>
                            <div>
                              <Progress value={getAllocationPercentage(farm)} className="h-2 mt-1" />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0%</span>
                                <span>{Math.round(getAllocationPercentage(farm))}% remaining</span>
                                <span>100%</span>
                              </div>
                            </div>
                          </div>

                          {farm.myStake > 0 && (
                            <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                              <h5 className="text-sm font-medium text-gold mb-2">My Rewards</h5>
                              <div className="flex justify-between mb-2">
                                <span className="text-gray-400">Pending Rewards</span>
                                <div className="flex items-center gap-1">
                                  <Image
                                    src={farm.rewardToken.logoURI || "/placeholder.svg"}
                                    alt={farm.rewardToken.symbol}
                                    width={16}
                                    height={16}
                                    className="rounded-full"
                                  />
                                  <span>
                                    {farm.pendingRewards.toFixed(2)} {farm.rewardToken.symbol}
                                  </span>
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Daily Earnings</span>
                                <span>≈ {((farm.myStake * farm.apr) / 100 / 365).toFixed(2)} GOLD/day</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        {farm.myStake > 0 ? (
                          <>
                            <Button className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 transition-all">
                              Harvest Rewards
                            </Button>
                            <div className="grid grid-cols-2 gap-3">
                              <Button
                                variant="outline"
                                className="border-gold/30 text-gold hover:bg-gold/10 hover:text-gold"
                              >
                                Add Stake
                              </Button>
                              <Button
                                variant="outline"
                                className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                              >
                                Unstake
                              </Button>
                            </div>
                          </>
                        ) : (
                          <Button className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 transition-all">
                            Stake LP Tokens
                          </Button>
                        )}
                        <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800">
                          Get LP Tokens
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <a
                          href="#"
                          className="text-gray-400 hover:text-gold text-sm flex items-center justify-center mt-2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Contract
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">You don't have any active farm positions</p>
              <Button className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 transition-all">
                Explore Farms
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
