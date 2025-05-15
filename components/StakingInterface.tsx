"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStaking } from "@/hooks/useStaking"
import { useWalletBalance } from "@/hooks/useWalletBalance"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpIcon, ArrowDownIcon, CoinsIcon } from "lucide-react"

// Constants adjusted for 1M total supply
const STAKING_PROGRAM_ID = "99SzC9waY86s9JRPYJ9Fw9K6YVziw9L9z8L95WQWv7wn"
const STAKING_POOL_MINT = "Gh9Ly5t8LzVtdWq2rM3W5qTW52wX68yQ6rXdi9999999"
const STAKING_POOL_ATA = "9999999999999999999999999999999999999999999999999999999999999999"
const TREASURY_ATA = "9999999999999999999999999999999999999999999999999999999999999999"

export function StakingInterface() {
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()
  const { goldBalance } = useWalletBalance()
  const {
    stakedAmount,
    pendingRewards,
    apy,
    isStaking,
    isUnstaking,
    isClaimingRewards,
    stakeTokens,
    unstakeTokens,
    claimRewards,
    refreshStakingData,
    formattedTimeRemaining,
    isLoading,
    timeRemaining,
  } = useStaking()

  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [activeTab, setActiveTab] = useState("stake")

  const maxStakeAmount = goldBalance || 0
  const maxUnstakeAmount = stakedAmount

  const handleStakeMaxClick = () => {
    setStakeAmount(maxStakeAmount.toString())
  }

  const handleUnstakeMaxClick = () => {
    setUnstakeAmount(maxUnstakeAmount.toString())
  }

  const handleStake = async () => {
    if (!publicKey || !stakeAmount || Number.parseFloat(stakeAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid amount to stake.",
      })
      return
    }

    const amount = Number.parseFloat(stakeAmount)
    try {
      await stakeTokens(amount)
      setStakeAmount("")
      toast({
        title: "Stake Successful",
        description: `Successfully staked ${amount} GOLD.`,
      })
    } catch (error: any) {
      console.error("Stake failed:", error)
      toast({
        variant: "destructive",
        title: "Stake Failed",
        description: error.message || "An error occurred while staking.",
      })
    }
  }

  const handleUnstake = async () => {
    if (!publicKey || !unstakeAmount || Number.parseFloat(unstakeAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid amount to unstake.",
      })
      return
    }

    const amount = Number.parseFloat(unstakeAmount)
    try {
      await unstakeTokens(amount)
      setUnstakeAmount("")
      toast({
        title: "Unstake Successful",
        description: `Successfully unstaked ${amount} GOLD.`,
      })
    } catch (error: any) {
      console.error("Unstake failed:", error)
      toast({
        variant: "destructive",
        title: "Unstake Failed",
        description: error.message || "An error occurred while unstaking.",
      })
    }
  }

  const handleClaimRewards = async () => {
    try {
      await claimRewards()
      toast({
        title: "Claim Successful",
        description: `Successfully claimed ${pendingRewards} GOLD rewards.`,
      })
    } catch (error: any) {
      console.error("Claim failed:", error)
      toast({
        variant: "destructive",
        title: "Claim Failed",
        description: error.message || "An error occurred while claiming rewards.",
      })
    }
  }

  useEffect(() => {
    refreshStakingData()
  }, [refreshStakingData])

  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshStakingData()
    }, 10000)

    return () => clearInterval(intervalId)
  }, [refreshStakingData])

  return (
    <Card className="w-full max-w-md mx-auto bg-black border border-gold-500/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-gold-500">GOLD Staking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Staked GOLD</div>
            <div className="text-xl font-bold text-gold-500">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stakedAmount}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLoading ? <div className="h-6 w-20 bg-gray-800 animate-pulse rounded" /> : stakedAmount.toFixed(2)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">APY</div>
            <div className="text-xl font-bold text-green-500">
              <AnimatePresence mode="wait">
                <motion.div
                  key={apy}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLoading ? <div className="h-6 w-16 bg-gray-800 animate-pulse rounded" /> : `${apy.toFixed(2)}%`}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Pending Rewards</div>
            <div className="text-xl font-bold text-gold-500">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pendingRewards}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLoading ? (
                    <div className="h-6 w-20 bg-gray-800 animate-pulse rounded" />
                  ) : (
                    pendingRewards.toFixed(4)
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Time Remaining</div>
            <div className="text-xl font-bold text-gray-300">
              <AnimatePresence mode="wait">
                <motion.div
                  key={timeRemaining}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLoading ? (
                    <div className="h-6 w-24 bg-gray-800 animate-pulse rounded" />
                  ) : (
                    formattedTimeRemaining()
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black font-semibold"
          disabled={isClaimingRewards || pendingRewards <= 0 || !connected}
          onClick={handleClaimRewards}
        >
          {isClaimingRewards ? (
            <div className="flex items-center">
              <span className="mr-2">Claiming</span>
              <div className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex items-center">
              <CoinsIcon className="mr-2 h-4 w-4" />
              <span>Claim {pendingRewards.toFixed(4)} GOLD Rewards</span>
            </div>
          )}
        </Button>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-gray-900">
            <TabsTrigger value="stake" className="data-[state=active]:bg-gold-500 data-[state=active]:text-black">
              <ArrowUpIcon className="mr-2 h-4 w-4" />
              Stake
            </TabsTrigger>
            <TabsTrigger value="unstake" className="data-[state=active]:bg-gold-500 data-[state=active]:text-black">
              <ArrowDownIcon className="mr-2 h-4 w-4" />
              Unstake
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stake" className="mt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Amount to Stake</span>
                <span className="text-xs text-gray-500">Balance: {maxStakeAmount.toFixed(4)} GOLD</span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="bg-gray-900 border-gray-700 pr-16"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gold-500 h-6 px-2"
                  onClick={handleStakeMaxClick}
                >
                  MAX
                </Button>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black font-semibold"
              disabled={
                isStaking ||
                !stakeAmount ||
                Number.parseFloat(stakeAmount) <= 0 ||
                Number.parseFloat(stakeAmount) > maxStakeAmount ||
                !connected
              }
              onClick={handleStake}
            >
              {isStaking ? (
                <div className="flex items-center">
                  <span className="mr-2">Staking</span>
                  <div className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin" />
                </div>
              ) : !connected ? (
                "Connect Wallet"
              ) : !stakeAmount || Number.parseFloat(stakeAmount) <= 0 ? (
                "Enter an amount"
              ) : Number.parseFloat(stakeAmount) > maxStakeAmount ? (
                "Insufficient balance"
              ) : (
                `Stake ${Number.parseFloat(stakeAmount).toFixed(2)} GOLD`
              )}
            </Button>
          </TabsContent>

          <TabsContent value="unstake" className="mt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Amount to Unstake</span>
                <span className="text-xs text-gray-500">Staked: {maxUnstakeAmount.toFixed(4)} GOLD</span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  className="bg-gray-900 border-gray-700 pr-16"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gold-500 h-6 px-2"
                  onClick={handleUnstakeMaxClick}
                >
                  MAX
                </Button>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black font-semibold"
              disabled={
                isUnstaking ||
                !unstakeAmount ||
                Number.parseFloat(unstakeAmount) <= 0 ||
                Number.parseFloat(unstakeAmount) > maxUnstakeAmount ||
                !connected
              }
              onClick={handleUnstake}
            >
              {isUnstaking ? (
                <div className="flex items-center">
                  <span className="mr-2">Unstaking</span>
                  <div className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin" />
                </div>
              ) : !connected ? (
                "Connect Wallet"
              ) : !unstakeAmount || Number.parseFloat(unstakeAmount) <= 0 ? (
                "Enter an amount"
              ) : Number.parseFloat(unstakeAmount) > maxUnstakeAmount ? (
                "Insufficient staked balance"
              ) : (
                `Unstake ${Number.parseFloat(unstakeAmount).toFixed(2)} GOLD`
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Add default export
export default StakingInterface
