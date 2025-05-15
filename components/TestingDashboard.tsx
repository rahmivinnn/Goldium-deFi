"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useNetwork } from "@/components/providers/NetworkContextProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { runAllTests, type TestResult } from "@/utils/testing"
import { NetworkSelector } from "@/components/NetworkSelector"

export function TestingDashboard() {
  const { connection, network } = useNetwork()
  const wallet = useWallet()
  const [results, setResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const runTests = async () => {
    setIsLoading(true)
    try {
      const testResults = await runAllTests(connection, wallet, network)
      setResults(testResults)
    } catch (error) {
      console.error("Error running tests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (wallet.connected) {
      runTests()
    } else {
      setResults([])
    }
  }, [wallet.connected, network])

  const getStatusIcon = (success: boolean) => {
    if (success) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getOverallStatus = () => {
    if (results.length === 0) return "unknown"
    if (results.every((result) => result.success)) return "success"
    if (results.every((result) => !result.success)) return "failure"
    return "partial"
  }

  const status = getOverallStatus()

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">DeFi Features Testing Dashboard</CardTitle>
            <CardDescription>Test and verify DeFi features across networks</CardDescription>
          </div>
          <NetworkSelector />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="staking">Staking</TabsTrigger>
            <TabsTrigger value="swapping">Swapping</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-4">
              <Alert
                variant={
                  status === "success"
                    ? "default"
                    : status === "failure"
                      ? "destructive"
                      : status === "partial"
                        ? "warning"
                        : "outline"
                }
              >
                <div className="flex items-center gap-2">
                  {status === "success" ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : status === "failure" ? (
                    <XCircle className="h-5 w-5" />
                  ) : status === "partial" ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                  <AlertTitle>
                    {status === "success"
                      ? "All tests passed"
                      : status === "failure"
                        ? "All tests failed"
                        : status === "partial"
                          ? "Some tests failed"
                          : "No tests run"}
                  </AlertTitle>
                </div>
                <AlertDescription className="mt-2">
                  {status === "success"
                    ? "All DeFi features are working correctly on the current network."
                    : status === "failure"
                      ? "All DeFi features are currently failing. Please check your connection and wallet."
                      : status === "partial"
                        ? "Some DeFi features are not working correctly. See details below."
                        : "Connect your wallet and run tests to verify DeFi features."}
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.success ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.success)}
                        <h3 className="font-medium">{result.feature}</h3>
                      </div>
                      <Badge variant={result.success ? "outline" : "destructive"}>
                        {result.success ? "Passed" : "Failed"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-gray-400">{result.message}</p>
                    {result.details && (
                      <pre className="mt-2 p-2 bg-black/50 rounded text-xs overflow-auto max-h-24">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}

                {results.length === 0 && !isLoading && (
                  <div className="p-8 text-center">
                    <p className="text-gray-400">No test results available. Connect your wallet and run tests.</p>
                  </div>
                )}

                {isLoading && (
                  <div className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-500" />
                    <p className="text-gray-400">Running tests...</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="staking">
            <div className="space-y-4">
              <Alert>
                <AlertTitle>Staking Tests</AlertTitle>
                <AlertDescription>
                  Test staking functionality including deposit, withdraw, and rewards claiming.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Stake Tokens</CardTitle>
                    <CardDescription>Test token staking functionality</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-4">
                      This test will verify that you can stake GOLD tokens on the current network.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={!wallet.connected || isLoading}
                      onClick={() => {
                        // Navigate to staking page
                        window.location.href = "/stake"
                      }}
                    >
                      Test Staking
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Claim Rewards</CardTitle>
                    <CardDescription>Test reward claiming functionality</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-4">
                      This test will verify that you can claim staking rewards on the current network.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={!wallet.connected || isLoading}
                      onClick={() => {
                        // Navigate to staking page
                        window.location.href = "/stake"
                      }}
                    >
                      Test Claiming
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="swapping">
            <div className="space-y-4">
              <Alert>
                <AlertTitle>Swapping Tests</AlertTitle>
                <AlertDescription>Test token swapping functionality between GOLD and other tokens.</AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Swap GOLD to SOL</CardTitle>
                    <CardDescription>Test GOLD to SOL swapping</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-4">
                      This test will verify that you can swap GOLD tokens for SOL on the current network.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={!wallet.connected || isLoading}
                      onClick={() => {
                        // Navigate to swap page
                        window.location.href = "/swap"
                      }}
                    >
                      Test Swapping
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Swap SOL to GOLD</CardTitle>
                    <CardDescription>Test SOL to GOLD swapping</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-4">
                      This test will verify that you can swap SOL for GOLD tokens on the current network.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={!wallet.connected || isLoading}
                      onClick={() => {
                        // Navigate to swap page
                        window.location.href = "/swap"
                      }}
                    >
                      Test Swapping
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="liquidity">
            <div className="space-y-4">
              <Alert>
                <AlertTitle>Liquidity Pool Tests</AlertTitle>
                <AlertDescription>
                  Test liquidity pool functionality including adding and removing liquidity.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add Liquidity</CardTitle>
                    <CardDescription>Test adding liquidity to pools</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-4">
                      This test will verify that you can add liquidity to GOLD/SOL pool on the current network.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={!wallet.connected || isLoading}
                      onClick={() => {
                        // Navigate to pools page
                        window.location.href = "/pools"
                      }}
                    >
                      Test Adding Liquidity
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Remove Liquidity</CardTitle>
                    <CardDescription>Test removing liquidity from pools</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-4">
                      This test will verify that you can remove liquidity from GOLD/SOL pool on the current network.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={!wallet.connected || isLoading}
                      onClick={() => {
                        // Navigate to pools page
                        window.location.href = "/pools"
                      }}
                    >
                      Test Removing Liquidity
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setActiveTab("overview")}>
          Back to Overview
        </Button>
        <Button onClick={runTests} disabled={!wallet.connected || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Run All Tests
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default TestingDashboard
