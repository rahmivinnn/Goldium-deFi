"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { stakeTokens, getStakingRewards } from "@/utils/jupiter"
import { useTheme } from "@/components/WalletContextProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

// Mock staking pools
const STAKING_POOLS = [
  {
    id: "pool1",
    name: "GOLD Staking",
    token: "GOLD",
    apy: 12.5,
    totalStaked: 1250000,
    lockPeriod: 0, // 0 means flexible
  },
  {
    id: "pool2",
    name: "SOL Staking",
    token: "SOL",
    apy: 6.2,
    totalStaked: 50000,
    lockPeriod: 0,
  },
  {
    id: "pool3",
    name: "GOLD 30-Day Lock",
    token: "GOLD",
    apy: 18.5,
    totalStaked: 750000,
    lockPeriod: 30,
  },
  {
    id: "pool4",
    name: "SOL 30-Day Lock",
    token: "SOL",
    apy: 9.8,
    totalStaked: 25000,
    lockPeriod: 30,
  },
]

export default function StakingInterface() {
  const { connected, publicKey } = useWallet()
  const { theme } = useTheme()
  const { toast } = useToast()
  const isDarkTheme = theme === "dark"

  const [selectedPool, setSelectedPool] = useState(STAKING_POOLS[0].id)
  const [amount, setAmount] = useState("")
  const [isStaking, setIsStaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rewards, setRewards] = useState<{ token: string; amount: string }[]>([])
  const [error, setError] = useState("")

  // Get the selected pool details
  const pool = STAKING_POOLS.find((p) => p.id === selectedPool) || STAKING_POOLS[0]

  useEffect(() => {
    if (connected && publicKey) {
      fetchRewards()
    }
  }, [connected, publicKey])

  const fetchRewards = async () => {
    if (!connected || !publicKey) return

    setIsLoading(true)
    try {
      const rewardsData = await getStakingRewards(publicKey.toString())
      setRewards(rewardsData)
    } catch (error) {
      console.error("Error fetching staking rewards:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleStake = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to continue",
        variant: "destructive",
      })
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setIsStaking(true)
    setError("")

    try {
      const result = await stakeTokens({
        pool: selectedPool,
        token: pool.token,
        amount,
      })

      if (result.success) {
        toast({
          title: "Staking Successful",
          description: `You have staked ${amount} ${pool.token} in ${pool.name}`,
          variant: "default",
        })
        setAmount("")
        fetchRewards()
      } else {
        throw new Error(result.error || "Staking operation failed")
      }
    } catch (err) {
      console.error("Staking error:", err)
      setError(err.message || "Failed to stake tokens. Please try again.")
      toast({
        title: "Staking Failed",
        description: err.message || "Failed to stake tokens. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsStaking(false)
    }
  }

  const handleClaim = async () => {
    toast({
      title: "Rewards Claimed",
      description: "Your staking rewards have been claimed successfully",
      variant: "default",
    })
    fetchRewards()
  }

  return (
    <div
      className={`p-6 rounded-xl ${isDarkTheme ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"} shadow-lg`}
    >
      <h2 className="text-xl font-bold text-center mb-6 bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
        Staking
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className={`font-medium mb-4 ${isDarkTheme ? "text-white" : "text-gray-900"}`}>Stake Tokens</h3>

          <div className="space-y-4">
            <div>
              <label className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"} mb-1 block`}>
                Staking Pool
              </label>
              <Select value={selectedPool} onValueChange={setSelectedPool}>
                <SelectTrigger className={isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}>
                  <SelectValue placeholder="Select pool" />
                </SelectTrigger>
                <SelectContent className={isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}>
                  {STAKING_POOLS.map((pool) => (
                    <SelectItem key={pool.id} value={pool.id}>
                      {pool.name} - {pool.apy}% APY
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"} mb-1 block`}>Amount</label>
              <Input
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.0"
                className={isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
              />
            </div>

            <div className={`p-3 rounded-lg ${isDarkTheme ? "bg-gray-800" : "bg-gray-100"}`}>
              <div className="flex justify-between mb-1">
                <span className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>Pool</span>
                <span className={isDarkTheme ? "text-white" : "text-gray-900"}>{pool.name}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>APY</span>
                <span className="text-green-500">{pool.apy}%</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>Lock Period</span>
                <span className={isDarkTheme ? "text-white" : "text-gray-900"}>
                  {pool.lockPeriod === 0 ? "Flexible" : `${pool.lockPeriod} days`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>Total Staked</span>
                <span className={isDarkTheme ? "text-white" : "text-gray-900"}>
                  {pool.totalStaked.toLocaleString()} {pool.token}
                </span>
              </div>
            </div>

            {error && (
              <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <Button
              disabled={!connected || isStaking || !amount || Number.parseFloat(amount) <= 0}
              className="w-full h-10 text-base font-medium bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:from-gray-700 disabled:to-gray-600 disabled:text-gray-400 transition-all duration-200 shadow-lg shadow-amber-900/20 disabled:shadow-none"
              onClick={handleStake}
            >
              {!connected ? (
                "Connect Wallet"
              ) : isStaking ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Staking...</span>
                </div>
              ) : (
                "Stake"
              )}
            </Button>
          </div>
        </div>

        <div>
          <h3 className={`font-medium mb-4 ${isDarkTheme ? "text-white" : "text-gray-900"}`}>Your Staking Rewards</h3>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : rewards.length > 0 ? (
            <div className="space-y-4">
              {rewards.map((reward, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}
                >
                  <div className="flex justify-between mb-2">
                    <span className={`font-medium ${isDarkTheme ? "text-white" : "text-gray-900"}`}>
                      {reward.token} Rewards
                    </span>
                    <span className="text-green-500">
                      {reward.amount} {reward.token}
                    </span>
                  </div>
                  <Progress value={75} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Next reward: 12h 34m</span>
                    <span>Vesting: 75%</span>
                  </div>
                </div>
              ))}

              <Button
                className="w-full h-10 text-base font-medium bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 transition-all duration-200 shadow-lg shadow-amber-900/20"
                onClick={handleClaim}
              >
                Claim All Rewards
              </Button>
            </div>
          ) : (
            <div className={`text-center py-8 ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
              <div className="mb-4">No staking rewards found</div>
              <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p>Stake tokens to start earning rewards</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
