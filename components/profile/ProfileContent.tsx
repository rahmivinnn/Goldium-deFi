"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useWallet } from "@solana/wallet-adapter-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, ExternalLink, Edit, ImageIcon, Zap, Award, History } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ProfileContent() {
  const { publicKey, connected } = useWallet()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!publicKey) return
    navigator.clipboard.writeText(publicKey.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="relative">
          {/* Banner */}
          <div className="h-48 rounded-xl overflow-hidden bg-gradient-to-r from-amber-900/30 to-yellow-900/30 relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <Image
              src="/placeholder.svg?key=k7bp6"
              alt="Profile Banner"
              width={1200}
              height={400}
              className="w-full h-full object-cover"
            />

            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-black/50 border-amber-500/50 text-white hover:bg-black/70"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Banner
            </Button>
          </div>

          {/* Avatar */}
          <motion.div className="absolute -bottom-16 left-8" whileHover={{ scale: 1.05 }}>
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-300 p-1 rotate-45 transform-gpu">
                <div className="absolute inset-0 bg-black rounded-lg"></div>
              </div>

              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-300 p-1">
                <div className="w-full h-full rounded-lg overflow-hidden bg-black">
                  <Image
                    src="/placeholder.svg?key=h3gel"
                    alt="Profile Avatar"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-2 border-black flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Profile Info */}
        <div className="mt-20 ml-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Gold Trader</h1>

              {connected && publicKey ? (
                <div className="flex items-center mt-1">
                  <span className="text-gray-400 text-sm">{truncateAddress(publicKey.toString())}</span>
                  <button onClick={handleCopy} className="ml-2 text-amber-500 hover:text-amber-400 transition-colors">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <a
                    href={`https://explorer.solana.com/address/${publicKey.toString()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ) : (
                <p className="text-gray-400 text-sm mt-1">Connect your wallet to view your profile</p>
              )}
            </div>

            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button variant="outline" className="border-amber-500/50 text-white hover:bg-amber-500/10">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black">
                <Zap className="h-4 w-4 mr-2" />
                Claim Rewards
              </Button>
            </div>
          </div>

          <div className="mt-6 flex space-x-6">
            <div>
              <span className="text-white font-bold">245</span>
              <span className="text-gray-400 ml-1">Following</span>
            </div>
            <div>
              <span className="text-white font-bold">1.2K</span>
              <span className="text-gray-400 ml-1">Followers</span>
            </div>
            <div>
              <span className="text-white font-bold">36</span>
              <span className="text-gray-400 ml-1">NFTs</span>
            </div>
          </div>

          <p className="mt-4 text-gray-300 max-w-2xl">
            Passionate crypto enthusiast and NFT collector. Building the future of decentralized finance on Solana. GOLD
            token maximalist since 2023.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="nfts" className="mt-8">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="nfts" className="data-[state=active]:text-amber-500">
            <ImageIcon className="h-4 w-4 mr-2" />
            NFTs
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:text-amber-500">
            <History className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="staking" className="data-[state=active]:text-amber-500">
            <Zap className="h-4 w-4 mr-2" />
            Staking
          </TabsTrigger>
          <TabsTrigger value="rewards" className="data-[state=active]:text-amber-500">
            <Award className="h-4 w-4 mr-2" />
            Rewards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nfts">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <NFTCard key={i} index={i} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <ActivityList />
        </TabsContent>

        <TabsContent value="staking">
          <StakingInfo />
        </TabsContent>

        <TabsContent value="rewards">
          <RewardsInfo />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NFTCard({ index }: { index: number }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="rounded-xl overflow-hidden bg-gradient-to-r from-amber-500 to-yellow-300 p-0.5"
    >
      <Card className="bg-black border-0 overflow-hidden h-full">
        <div className="relative aspect-square">
          <Image
            src={`/placeholder.svg?key=csty0&height=400&width=400&query=crypto nft ${index} gold themed`}
            alt={`NFT #${index}`}
            width={400}
            height={400}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-white">Gold Collection #{index}00</h3>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-400 text-sm">Floor: 2.5 SOL</span>
            <span className="text-amber-500 text-sm font-medium">Rare</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ActivityList() {
  const activities = [
    { type: "Mint", item: "Gold Collection #300", time: "2 hours ago", amount: "1.2 SOL" },
    { type: "Stake", item: "100 GOLD", time: "1 day ago", amount: "100 GOLD" },
    { type: "Swap", item: "SOL to GOLD", time: "3 days ago", amount: "5 SOL" },
    { type: "Claim", item: "Staking Rewards", time: "1 week ago", amount: "25 GOLD" },
    { type: "Transfer", item: "To Wallet", time: "2 weeks ago", amount: "50 GOLD" },
  ]

  return (
    <Card className="bg-black/50 border-amber-900/20">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your recent transactions and activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-black/50 border border-amber-900/10"
            >
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mr-4",
                    activity.type === "Mint"
                      ? "bg-green-500/20"
                      : activity.type === "Stake"
                        ? "bg-blue-500/20"
                        : activity.type === "Swap"
                          ? "bg-purple-500/20"
                          : activity.type === "Claim"
                            ? "bg-amber-500/20"
                            : "bg-gray-500/20",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-medium",
                      activity.type === "Mint"
                        ? "text-green-500"
                        : activity.type === "Stake"
                          ? "text-blue-500"
                          : activity.type === "Swap"
                            ? "text-purple-500"
                            : activity.type === "Claim"
                              ? "text-amber-500"
                              : "text-gray-500",
                    )}
                  >
                    {activity.type.substring(0, 1)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">{activity.type}</p>
                  <p className="text-sm text-gray-400">{activity.item}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-white">{activity.amount}</p>
                <p className="text-sm text-gray-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full border-amber-500/50 text-white hover:bg-amber-500/10">
          View All Activity
        </Button>
      </CardFooter>
    </Card>
  )
}

function StakingInfo() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-black/50 border-amber-900/20">
        <CardHeader>
          <CardTitle>Active Staking</CardTitle>
          <CardDescription>Your current staking positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center mr-3">
                    <span className="text-black font-bold">G</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">GOLD Staking</h4>
                    <p className="text-sm text-gray-400">30 day lock</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-amber-500">18% APY</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-amber-500/20">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Staked Amount</span>
                  <span className="text-white font-medium">500 GOLD</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Rewards Earned</span>
                  <span className="text-white font-medium">23.5 GOLD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Unlock Date</span>
                  <span className="text-white font-medium">June 15, 2025</span>
                </div>
              </div>

              <div className="mt-4 flex space-x-3">
                <Button className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black">
                  Claim Rewards
                </Button>
                <Button variant="outline" className="flex-1 border-amber-500/50 text-white hover:bg-amber-500/10">
                  Unstake
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black">
            Stake More GOLD
          </Button>
        </CardFooter>
      </Card>

      <Card className="bg-black/50 border-amber-900/20">
        <CardHeader>
          <CardTitle>Staking Stats</CardTitle>
          <CardDescription>Overview of your staking performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-black/50 border border-amber-900/10">
              <p className="text-gray-400 text-sm">Total Staked</p>
              <p className="text-2xl font-bold text-white mt-1">500 GOLD</p>
              <p className="text-xs text-green-500 mt-1">+25% from last month</p>
            </div>
            <div className="p-4 rounded-lg bg-black/50 border border-amber-900/10">
              <p className="text-gray-400 text-sm">Total Rewards</p>
              <p className="text-2xl font-bold text-white mt-1">78.5 GOLD</p>
              <p className="text-xs text-green-500 mt-1">+12% from last month</p>
            </div>
            <div className="p-4 rounded-lg bg-black/50 border border-amber-900/10">
              <p className="text-gray-400 text-sm">Current APY</p>
              <p className="text-2xl font-bold text-amber-500 mt-1">18%</p>
              <p className="text-xs text-green-500 mt-1">+2% from last month</p>
            </div>
            <div className="p-4 rounded-lg bg-black/50 border border-amber-900/10">
              <p className="text-gray-400 text-sm">Lock Period</p>
              <p className="text-2xl font-bold text-white mt-1">30 days</p>
              <p className="text-xs text-gray-400 mt-1">15 days remaining</p>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-black/50 border border-amber-900/10">
            <h4 className="font-medium text-white mb-3">Rewards History</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">May 2025</span>
                <span className="text-white">23.5 GOLD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">April 2025</span>
                <span className="text-white">21.0 GOLD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">March 2025</span>
                <span className="text-white">19.5 GOLD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">February 2025</span>
                <span className="text-white">14.5 GOLD</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RewardsInfo() {
  return (
    <Card className="bg-black/50 border-amber-900/20">
      <CardHeader>
        <CardTitle>Rewards Program</CardTitle>
        <CardDescription>Earn rewards for your activity on Goldium.io</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-3">
              <Award className="h-6 w-6 text-amber-500" />
            </div>
            <h4 className="font-medium text-white text-center">Level 3</h4>
            <p className="text-sm text-gray-400 text-center mt-1">Gold Tier</p>
            <div className="w-full mt-3 bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full"
                style={{ width: "65%" }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">650 / 1000 XP to Level 4</p>
          </div>

          <div className="p-4 rounded-lg bg-black/50 border border-amber-900/10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
              <Zap className="h-6 w-6 text-green-500" />
            </div>
            <h4 className="font-medium text-white text-center">Available</h4>
            <p className="text-2xl font-bold text-green-500 mt-1">75 GOLD</p>
            <Button className="mt-3 w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black">
              Claim Now
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-black/50 border border-amber-900/10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
              <History className="h-6 w-6 text-blue-500" />
            </div>
            <h4 className="font-medium text-white text-center">Total Earned</h4>
            <p className="text-2xl font-bold text-white mt-1">325 GOLD</p>
            <p className="text-xs text-green-500 mt-2">+125 GOLD this month</p>
          </div>
        </div>

        <h4 className="font-medium text-white mb-4">Earn More Rewards</h4>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-black/50 border border-amber-900/10">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                  <Zap className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Swap Tokens</h4>
                  <p className="text-sm text-gray-400">Earn 5 GOLD per swap</p>
                </div>
              </div>
              <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white">
                Swap Now
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-black/50 border border-amber-900/10">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Mint an NFT</h4>
                  <p className="text-sm text-gray-400">Earn 20 GOLD per mint</p>
                </div>
              </div>
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                Explore NFTs
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-black/50 border border-amber-900/10">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mr-3">
                  <Award className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Refer a Friend</h4>
                  <p className="text-sm text-gray-400">Earn 50 GOLD per referral</p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black"
              >
                Get Link
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
