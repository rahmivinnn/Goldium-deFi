"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStaking } from "@/hooks/useStaking"
import { useWalletBalance } from "@/hooks/useWalletBalance"
import { useWallet } from "@solana/wallet-adapter-react"
import { GOLD_TOKEN } from "@/constants/tokens"
import { useTheme } from "@/components/providers/WalletContextProvider"
import { useToast } from "@/components/ui/use-toast"

export default function StakingInterface() {
  const { connected, publicKey } = useWallet()
  const { theme } = useTheme()
  const { toast } = useToast()
  const isDarkTheme = theme === "dark"

  const {
    stakedAmount,
    pendingRewards,
    apy,
    timeRemaining,
    isStaking,
    isUnstaking,
    isClaimingRewards,
    isLoading,
    stakeTokens,
    unstakeTokens,
    claimRewards,
    formattedTimeRemaining,
    refreshStakingData,
  } = useStaking()

  const { balances, refreshBalances } = useWalletBalance()

  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [activeTab, setActiveTab] = useState("stake")
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize component
  useEffect(() => {
    if (connected && publicKey) {
      // Initialize local storage for testing if needed
      if (!localStorage.getItem(`${publicKey.toString()}_goldBalance`)) {
        localStorage.setItem(`${publicKey.toString()}_goldBalance`, "1000")
      }

      refreshBalances()
      refreshStakingData()
      setIsInitialized(true)
    }
  }, [connected, publicKey, refreshBalances, refreshStakingData])

  // Reset input fields when tab changes
  useEffect(() => {
    setStakeAmount("")
    setUnstakeAmount("")
  }, [activeTab])

  // Handle stake
  const handleStake = async () => {
    if (!stakeAmount || Number(stakeAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to stake",
        variant: "destructive",
      })
      return
    }

    try {
      const amount = Number(stakeAmount)
      const success = await stakeTokens(amount)

      if (success) {
        setStakeAmount("")
        toast({
          title: "Success",
          description: `Successfully staked ${amount} GOLD`,
        })
      }
    } catch (error) {
      console.error("Staking error:", error)
      toast({
        title: "Staking failed",
        description: error instanceof Error ? error.message : "Failed to stake tokens",
        variant: "destructive",
      })
    }
  }

  // Handle unstake
  const handleUnstake = async () => {
    if (!unstakeAmount || Number(unstakeAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to unstake",
        variant: "destructive",
      })
      return
    }

    try {
      const amount = Number(unstakeAmount)
      const success = await unstakeTokens(amount)

      if (success) {
        setUnstakeAmount("")
        toast({
          title: "Success",
          description: `Successfully unstaked ${amount} GOLD`,
        })
      }
    } catch (error) {
      console.error("Unstaking error:", error)
      toast({
        title: "Unstaking failed",
        description: error instanceof Error ? error.message : "Failed to unstake tokens",
        variant: "destructive",
      })
    }
  }

  // Handle claim rewards
  const handleClaimRewards = async () => {
    try {
      const success = await claimRewards()

      if (success) {
        toast({
          title: "Success",
          description: `Successfully claimed your rewards`,
        })
      }
    } catch (error) {
      console.error("Claim rewards error:", error)
      toast({
        title: "Claim failed",
        description: error instanceof Error ? error.message : "Failed to claim rewards",
        variant: "destructive",
      })
    }
  }

  // Handle max stake
  const handleMaxStake = () => {
    const goldBalance = balances[GOLD_TOKEN.symbol] || 0
    setStakeAmount(goldBalance.toString())
  }

  // Handle max unstake
  const handleMaxUnstake = () => {
    setUnstakeAmount(stakedAmount.toString())
  }

  // Show loading state
  if (!isInitialized || isLoading) {
    return (
      <Card
        className={`w-full max-w-md mx-auto ${isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
      >
        <CardContent className="p-6 flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-t-transparent border-amber-500 rounded-full animate-spin mb-4"></div>
            <p className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>Loading staking data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show connect wallet message if not connected
  if (!connected) {
    return (
      <Card
        className={`w-full max-w-md mx-auto ${isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
      >
        <CardContent className="p-6 flex justify-center items-center h-64">
          <div className="flex flex-col items-center text-center">
            <p className={`text-lg font-medium mb-4 ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}>
              Connect your wallet to start staking
            </p>
            <p className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"} mb-6`}>
              You need to connect your wallet to stake GOLD tokens and earn rewards.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`w-full max-w-md mx-auto ${isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
    >
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`${isDarkTheme ? "bg-gray-800" : "bg-gray-100"} p-4 rounded-lg`}>
            <p className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>Staked GOLD</p>
            <p className="text-xl font-bold">{stakedAmount.toFixed(2)}</p>
          </div>
          <div className={`${isDarkTheme ? "bg-gray-800" : "bg-gray-100"} p-4 rounded-lg`}>
            <p className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>Pending Rewards</p>
            <p className="text-xl font-bold text-amber-500">{pendingRewards.toFixed(4)}</p>
          </div>
          <div className={`${isDarkTheme ? "bg-gray-800" : "bg-gray-100"} p-4 rounded-lg`}>
            <p className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>APY</p>
            <p className="text-xl font-bold text-green-500">{apy}%</p>
          </div>
          <div className={`${isDarkTheme ? "bg-gray-800" : "bg-gray-100"} p-4 rounded-lg`}>
            <p className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>Lock Time</p>
            <p className="text-xl font-bold">{formattedTimeRemaining()}</p>
          </div>
        </div>

        {pendingRewards > 0 && (
          <Button
            onClick={handleClaimRewards}
            disabled={isClaimingRewards || pendingRewards <= 0}
            className="w-full mb-6 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold"
          >
            {isClaimingRewards ? (
              <div className="flex items-center">
                <span className="mr-2">Claiming</span>
                <div className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin" />
              </div>
            ) : (
              `Claim ${pendingRewards.toFixed(4)} GOLD`
            )}
          </Button>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="stake">Stake</TabsTrigger>
            <TabsTrigger value="unstake">Unstake</TabsTrigger>
          </TabsList>
          <TabsContent value="stake">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>Available GOLD</span>
                <span className={`text-sm ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}>
                  {balances[GOLD_TOKEN.symbol]?.toFixed(4) || "0"}
                </span>
              </div>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="0.00"
                  value={stakeAmount}
                  onChange={(e) => {
                    // Only allow numbers and decimals
                    if (e.target.value === "" || /^\d*\.?\d*$/.test(e.target.value)) {
                      setStakeAmount(e.target.value)
                    }
                  }}
                  className={`${isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"} pr-16`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-amber-500 h-6 px-2"
                  onClick={handleMaxStake}
                >
                  MAX
                </Button>
              </div>
              <Button
                onClick={handleStake}
                disabled={
                  isStaking ||
                  !connected ||
                  !stakeAmount ||
                  Number(stakeAmount) <= 0 ||
                  Number(stakeAmount) > (balances[GOLD_TOKEN.symbol] || 0)
                }
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold"
              >
                {isStaking ? (
                  <div className="flex items-center">
                    <span className="mr-2">Staking</span>
                    <div className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin" />
                  </div>
                ) : (
                  "Stake GOLD"
                )}
              </Button>
              <p className={`text-xs ${isDarkTheme ? "text-gray-500" : "text-gray-600"}`}>
                Note: Staked GOLD is locked for 7 days. You will earn {apy}% APY during this period.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="unstake">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>Staked GOLD</span>
                <span className={`text-sm ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}>
                  {stakedAmount.toFixed(4)}
                </span>
              </div>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="0.00"
                  value={unstakeAmount}
                  onChange={(e) => {
                    // Only allow numbers and decimals
                    if (e.target.value === "" || /^\d*\.?\d*$/.test(e.target.value)) {
                      setUnstakeAmount(e.target.value)
                    }
                  }}
                  className={`${isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"} pr-16`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-amber-500 h-6 px-2"
                  onClick={handleMaxUnstake}
                >
                  MAX
                </Button>
              </div>
              <Button
                onClick={handleUnstake}
                disabled={
                  isUnstaking ||
                  !connected ||
                  !unstakeAmount ||
                  Number(unstakeAmount) <= 0 ||
                  Number(unstakeAmount) > stakedAmount ||
                  timeRemaining > 0
                }
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold"
              >
                {isUnstaking ? (
                  <div className="flex items-center">
                    <span className="mr-2">Unstaking</span>
                    <div className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin" />
                  </div>
                ) : timeRemaining > 0 ? (
                  `Locked for ${formattedTimeRemaining()}`
                ) : (
                  "Unstake GOLD"
                )}
              </Button>
              <p className={`text-xs ${isDarkTheme ? "text-gray-500" : "text-gray-600"}`}>
                Note: You can only unstake after the 7-day lock period. Make sure to claim your rewards before
                unstaking.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
