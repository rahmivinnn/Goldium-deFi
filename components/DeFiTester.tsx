"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "@/components/providers/WalletContextProvider"
import { useNetwork } from "@/components/providers/NetworkContextProvider"
import {
  testSwap,
  testLiquidityPool,
  testStaking,
  testBridge,
  testFaucet,
  initializeTestEnvironment,
  resetTestEnvironment,
  getUserBalances,
} from "@/utils/testing-utils"

export default function DeFiTester() {
  const { publicKey, connected } = useWallet()
  const { toast } = useToast()
  const { theme } = useTheme()
  const { network } = useNetwork()
  const isDarkTheme = theme === "dark"

  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<Array<{ feature: string; success: boolean; message: string }>>([])
  const [balances, setBalances] = useState<Record<string, number>>({})

  // Initialize test environment
  useEffect(() => {
    if (connected && publicKey) {
      initializeTestEnvironment(publicKey.toString())
      updateBalances()
    }
  }, [connected, publicKey])

  // Update balances
  const updateBalances = () => {
    if (connected && publicKey) {
      setBalances(getUserBalances(publicKey.toString()))
    }
  }

  // Run all tests
  const runAllTests = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Error",
        description: "Please connect your wallet to run tests",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setTestResults([])

    try {
      // Test swap
      const swapResult = await testSwap(publicKey.toString(), "GOLD", "USDC", 10)
      setTestResults((prev) => [...prev, { feature: "Swap", success: swapResult.success, message: swapResult.message }])

      // Test liquidity pool
      const addLiquidityResult = await testLiquidityPool(publicKey.toString(), "add", 10)
      setTestResults((prev) => [
        ...prev,
        { feature: "Add Liquidity", success: addLiquidityResult.success, message: addLiquidityResult.message },
      ])

      const claimFeesResult = await testLiquidityPool(publicKey.toString(), "claim")
      setTestResults((prev) => [
        ...prev,
        { feature: "Claim Fees", success: claimFeesResult.success, message: claimFeesResult.message },
      ])

      const removeLiquidityResult = await testLiquidityPool(publicKey.toString(), "remove", 5)
      setTestResults((prev) => [
        ...prev,
        { feature: "Remove Liquidity", success: removeLiquidityResult.success, message: removeLiquidityResult.message },
      ])

      // Test staking
      const stakeResult = await testStaking(publicKey.toString(), "stake", 10)
      setTestResults((prev) => [
        ...prev,
        { feature: "Stake", success: stakeResult.success, message: stakeResult.message },
      ])

      // Force stake time to be ready for unstaking (for testing purposes)
      const now = Math.floor(Date.now() / 1000)
      localStorage.setItem(`${publicKey.toString()}_stakeStartTime`, (now - 604800).toString())

      const claimRewardsResult = await testStaking(publicKey.toString(), "claim")
      setTestResults((prev) => [
        ...prev,
        { feature: "Claim Rewards", success: claimRewardsResult.success, message: claimRewardsResult.message },
      ])

      const unstakeResult = await testStaking(publicKey.toString(), "unstake", 5)
      setTestResults((prev) => [
        ...prev,
        { feature: "Unstake", success: unstakeResult.success, message: unstakeResult.message },
      ])

      // Test bridge
      const bridgeResult = await testBridge(publicKey.toString(), "solana", "ethereum", 10)
      setTestResults((prev) => [
        ...prev,
        { feature: "Bridge", success: bridgeResult.success, message: bridgeResult.message },
      ])

      // Test faucet
      // Reset last claim time for testing
      localStorage.removeItem(`${publicKey.toString()}_lastClaimTime`)

      const faucetResult = await testFaucet(publicKey.toString(), network)
      setTestResults((prev) => [
        ...prev,
        { feature: "Faucet", success: faucetResult.success, message: faucetResult.message },
      ])

      toast({
        title: "Tests completed",
        description: "All DeFi features have been tested",
      })
    } catch (error: any) {
      console.error("Test error:", error)
      toast({
        title: "Test error",
        description: error.message || "An error occurred while testing",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      updateBalances()
    }
  }

  // Reset test environment
  const handleReset = () => {
    if (connected && publicKey) {
      resetTestEnvironment(publicKey.toString())
      updateBalances()
      setTestResults([])
      toast({
        title: "Reset completed",
        description: "Test environment has been reset",
      })
    }
  }

  return (
    <Card
      className={`w-full max-w-3xl mx-auto ${isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-xl bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
          DeFi Feature Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balances */}
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(balances).map(([token, amount]) => (
            <div key={token} className={`${isDarkTheme ? "bg-gray-800" : "bg-gray-100"} p-3 rounded-lg`}>
              <p className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>{token}</p>
              <p className="text-lg font-bold">{amount.toFixed(token === "BONK" ? 0 : 2)}</p>
            </div>
          ))}
        </div>

        {/* Test buttons */}
        <div className="flex gap-4">
          <Button
            className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold"
            disabled={isLoading || !connected}
            onClick={runAllTests}
          >
            {isLoading ? (
              <div className="flex items-center">
                <span className="mr-2">Testing</span>
                <div className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin" />
              </div>
            ) : (
              "Run All Tests"
            )}
          </Button>
          <Button variant="outline" className="flex-1" disabled={isLoading || !connected} onClick={handleReset}>
            Reset Environment
          </Button>
        </div>

        {/* Test results */}
        {testResults.length > 0 && (
          <div className={`${isDarkTheme ? "bg-gray-800" : "bg-gray-100"} rounded-lg p-4 max-h-80 overflow-y-auto`}>
            <h3 className={`text-lg font-medium mb-4 ${isDarkTheme ? "text-white" : "text-gray-900"}`}>Test Results</h3>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${result.success ? (isDarkTheme ? "bg-green-900/20" : "bg-green-100") : isDarkTheme ? "bg-red-900/20" : "bg-red-100"}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-medium ${result.success ? "text-green-500" : "text-red-500"}`}>
                      {result.feature}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${result.success ? (isDarkTheme ? "bg-green-900/30 text-green-400" : "bg-green-200 text-green-800") : isDarkTheme ? "bg-red-900/30 text-red-400" : "bg-red-200 text-red-800"}`}
                    >
                      {result.success ? "Success" : "Failed"}
                    </span>
                  </div>
                  <p className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}>{result.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
