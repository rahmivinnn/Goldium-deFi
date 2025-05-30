"use client"

import { useState, useCallback, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { GOLD_TOKEN } from "@/constants/tokens"
import { useWalletBalance } from "@/hooks/useWalletBalance"
import { useTheme } from "@/components/providers/WalletContextProvider"
import Image from "next/image"

// Network options
const NETWORKS = [
  {
    id: "solana",
    name: "Solana",
    logoURI: "/solana-logo.png",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    logoURI: "/ethereum-logo.png",
  },
  {
    id: "polygon",
    name: "Polygon",
    logoURI: "/polygon-logo.png",
  },
  {
    id: "avalanche",
    name: "Avalanche",
    logoURI: "/avalanche-logo-abstract.png",
  },
]

export default function TokenBridge() {
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()
  const { balances, refreshBalances } = useWalletBalance()
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  // State
  const [sourceNetwork, setSourceNetwork] = useState(NETWORKS[0])
  const [targetNetwork, setTargetNetwork] = useState(NETWORKS[1])
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [estimatedGas, setEstimatedGas] = useState("0.001")
  const [estimatedTime, setEstimatedTime] = useState("2-5 minutes")
  const [bridgeHistory, setBridgeHistory] = useState<any[]>([])

  // Handle network change
  const handleSourceNetworkChange = (networkId: string) => {
    const network = NETWORKS.find((n) => n.id === networkId)
    if (network) {
      setSourceNetwork(network)
      // If source and target are the same, change target
      if (network.id === targetNetwork.id) {
        const nextNetwork = NETWORKS.find((n) => n.id !== network.id)
        if (nextNetwork) setTargetNetwork(nextNetwork)
      }

      // Reset amount when changing networks
      setAmount("")
    }
  }

  const handleTargetNetworkChange = (networkId: string) => {
    const network = NETWORKS.find((n) => n.id === networkId)
    if (network) {
      setTargetNetwork(network)
      // If source and target are the same, change source
      if (network.id === sourceNetwork.id) {
        const nextNetwork = NETWORKS.find((n) => n.id !== network.id)
        if (nextNetwork) setSourceNetwork(nextNetwork)
      }

      // Update estimates when target network changes
      updateEstimates()
    }
  }

  // Handle max button click
  const handleMaxClick = useCallback(() => {
    if (sourceNetwork.id === "solana") {
      const maxAmount = balances[GOLD_TOKEN.symbol] || 0
      setAmount(maxAmount > 0 ? maxAmount.toString() : "0")
    } else {
      // For demo purposes, set a mock balance for other networks
      setAmount("1000")
    }
  }, [sourceNetwork.id, balances])

  // Handle bridge
  const handleBridge = async () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to use the bridge",
        variant: "destructive",
      })
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to bridge",
        variant: "destructive",
      })
      return
    }

    // Check if user has enough balance
    if (sourceNetwork.id === "solana") {
      const goldBalance = balances[GOLD_TOKEN.symbol] || 0
      if (goldBalance < Number(amount)) {
        toast({
          title: "Insufficient balance",
          description: `You don't have enough GOLD tokens on ${sourceNetwork.name}`,
          variant: "destructive",
        })
        return
      }
    }

    setIsProcessing(true)

    try {
      // Simulate bridge process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create a bridge transaction record
      const bridgeId = `bridge-${Date.now()}`
      const bridgeRecord = {
        id: bridgeId,
        sourceNetwork: sourceNetwork.name,
        targetNetwork: targetNetwork.name,
        amount: Number(amount),
        status: "pending",
        timestamp: Date.now(),
      }

      // Add to bridge history
      setBridgeHistory((prev) => [bridgeRecord, ...prev])

      toast({
        title: "Bridge initiated",
        description: `Bridging ${amount} GOLD from ${sourceNetwork.name} to ${targetNetwork.name}. This may take a few minutes.`,
      })

      // If source is Solana, update GOLD balance
      if (sourceNetwork.id === "solana") {
        const currentGoldBalance = localStorage.getItem(`${publicKey?.toString()}_goldBalance`) || "0"
        const newGoldBalance = Math.max(0, Number(currentGoldBalance) - Number(amount))
        localStorage.setItem(`${publicKey?.toString()}_goldBalance`, newGoldBalance.toString())

        // Refresh balances
        refreshBalances()
      }

      // Simulate completion after a delay
      setTimeout(() => {
        // Update bridge record status
        setBridgeHistory((prev) =>
          prev.map((record) => (record.id === bridgeId ? { ...record, status: "completed" } : record)),
        )

        toast({
          title: "Bridge completed",
          description: `Successfully bridged ${amount} GOLD to ${targetNetwork.name}`,
        })

        setAmount("")
      }, 5000)
    } catch (error: any) {
      console.error("Bridge error:", error)
      toast({
        title: "Bridge failed",
        description: error.message || "Failed to bridge tokens",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Update estimated gas and time when networks or amount changes
  const updateEstimates = useCallback(() => {
    // These would be calculated based on current network conditions in a real app
    if (targetNetwork.id === "ethereum") {
      setEstimatedGas("0.005")
      setEstimatedTime("5-10 minutes")
    } else if (targetNetwork.id === "polygon") {
      setEstimatedGas("0.001")
      setEstimatedTime("1-3 minutes")
    } else if (targetNetwork.id === "avalanche") {
      setEstimatedGas("0.002")
      setEstimatedTime("2-4 minutes")
    } else {
      setEstimatedGas("0.001")
      setEstimatedTime("2-5 minutes")
    }
  }, [targetNetwork.id])

  // Update estimates when networks change
  useEffect(() => {
    updateEstimates()
  }, [sourceNetwork, targetNetwork, updateEstimates])

  // Load bridge history from localStorage
  useEffect(() => {
    if (connected && publicKey) {
      const storedHistory = localStorage.getItem(`${publicKey.toString()}_bridgeHistory`)
      if (storedHistory) {
        setBridgeHistory(JSON.parse(storedHistory))
      }
    }
  }, [connected, publicKey])

  // Save bridge history to localStorage
  useEffect(() => {
    if (connected && publicKey && bridgeHistory.length > 0) {
      localStorage.setItem(`${publicKey.toString()}_bridgeHistory`, JSON.stringify(bridgeHistory))
    }
  }, [bridgeHistory, connected, publicKey])

  return (
    <Card
      className={`w-full max-w-md mx-auto ${isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-xl bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
          Cross-Chain Bridge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Source Network */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>From</span>
            {sourceNetwork.id === "solana" && (
              <span className={`text-xs ${isDarkTheme ? "text-gray-500" : "text-gray-600"}`}>
                Balance: {balances[GOLD_TOKEN.symbol]?.toFixed(4) || "0"} GOLD
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Select value={sourceNetwork.id} onValueChange={handleSourceNetworkChange}>
              <SelectTrigger
                className={`w-[140px] ${isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"}`}
              >
                <SelectValue>
                  <div className="flex items-center">
                    <Image
                      src={sourceNetwork.logoURI || "/placeholder.svg"}
                      alt={sourceNetwork.name}
                      width={20}
                      height={20}
                      className="mr-2 rounded-full"
                    />
                    {sourceNetwork.name}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className={isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}>
                {NETWORKS.filter((n) => n.id !== targetNetwork.id).map((network) => (
                  <SelectItem key={network.id} value={network.id}>
                    <div className="flex items-center">
                      <Image
                        src={network.logoURI || "/placeholder.svg"}
                        alt={network.name}
                        width={20}
                        height={20}
                        className="mr-2 rounded-full"
                      />
                      {network.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  // Only allow numbers and decimals
                  if (e.target.value === "" || /^\d*\.?\d*$/.test(e.target.value)) {
                    setAmount(e.target.value)
                  }
                }}
                className={`${isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"} pr-16`}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-amber-500 h-6 px-2"
                onClick={handleMaxClick}
              >
                MAX
              </Button>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkTheme ? "bg-gray-800" : "bg-gray-100"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-500"
            >
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Target Network */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>To</span>
          </div>
          <div className="flex space-x-2">
            <Select value={targetNetwork.id} onValueChange={handleTargetNetworkChange}>
              <SelectTrigger
                className={`w-[140px] ${isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"}`}
              >
                <SelectValue>
                  <div className="flex items-center">
                    <Image
                      src={targetNetwork.logoURI || "/placeholder.svg"}
                      alt={targetNetwork.name}
                      width={20}
                      height={20}
                      className="mr-2 rounded-full"
                    />
                    {targetNetwork.name}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className={isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}>
                {NETWORKS.filter((n) => n.id !== sourceNetwork.id).map((network) => (
                  <SelectItem key={network.id} value={network.id}>
                    <div className="flex items-center">
                      <Image
                        src={network.logoURI || "/placeholder.svg"}
                        alt={network.name}
                        width={20}
                        height={20}
                        className="mr-2 rounded-full"
                      />
                      {network.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="0.00"
              value={amount}
              readOnly
              className={`${isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"}`}
            />
          </div>
        </div>

        {/* Bridge Info */}
        <div className={`${isDarkTheme ? "bg-gray-800" : "bg-gray-100"} rounded-lg p-3 space-y-2 text-sm`}>
          <div className="flex justify-between items-center">
            <span className={isDarkTheme ? "text-gray-400" : "text-gray-500"}>Estimated Gas</span>
            <span className={isDarkTheme ? "text-gray-300" : "text-gray-700"}>
              {estimatedGas} {targetNetwork.id.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={isDarkTheme ? "text-gray-400" : "text-gray-500"}>Estimated Time</span>
            <span className={isDarkTheme ? "text-gray-300" : "text-gray-700"}>{estimatedTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={isDarkTheme ? "text-gray-400" : "text-gray-500"}>Bridge Fee</span>
            <span className={isDarkTheme ? "text-gray-300" : "text-gray-700"}>0.1%</span>
          </div>
        </div>

        {/* Bridge Button */}
        <Button
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold"
          disabled={isProcessing || !connected || !amount || Number.parseFloat(amount) <= 0}
          onClick={handleBridge}
        >
          {isProcessing ? (
            <div className="flex items-center">
              <span className="mr-2">Processing</span>
              <div className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin" />
            </div>
          ) : (
            `Bridge GOLD to ${targetNetwork.name}`
          )}
        </Button>

        {/* Recent Transactions */}
        {bridgeHistory.length > 0 && (
          <div className="mt-4">
            <h3 className={`text-sm font-medium mb-2 ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}>
              Recent Transactions
            </h3>
            <div
              className={`${isDarkTheme ? "bg-gray-800" : "bg-gray-100"} rounded-lg p-3 space-y-2 text-sm max-h-40 overflow-y-auto`}
            >
              {bridgeHistory.slice(0, 5).map((record) => (
                <div key={record.id} className="flex justify-between items-center">
                  <div>
                    <span className={isDarkTheme ? "text-gray-300" : "text-gray-700"}>
                      {record.amount} GOLD to {record.targetNetwork}
                    </span>
                  </div>
                  <span
                    className={
                      record.status === "completed"
                        ? "text-green-500"
                        : record.status === "pending"
                          ? "text-yellow-500"
                          : "text-red-500"
                    }
                  >
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
