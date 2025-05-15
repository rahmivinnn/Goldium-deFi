"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ArrowRightIcon, InfoIcon } from "lucide-react"
import { motion } from "framer-motion"

// Define supported networks
const NETWORKS = [
  { id: "solana", name: "Solana", logo: "/solana-logo.png" },
  { id: "ethereum", name: "Ethereum", logo: "/ethereum-logo.png" },
  { id: "polygon", name: "Polygon", logo: "/polygon-logo.png" },
  { id: "avalanche", name: "Avalanche", logo: "/avalanche-logo-abstract.png" },
]

// Define supported tokens
const TOKENS = [
  { id: "gold", name: "GOLD", logo: "/goldium-logo.png", networks: ["solana", "ethereum", "polygon", "avalanche"] },
  { id: "usdc", name: "USDC", logo: "/usdc-logo.png", networks: ["solana", "ethereum", "polygon", "avalanche"] },
  { id: "sol", name: "SOL", logo: "/solana-logo.png", networks: ["solana"] },
  { id: "eth", name: "ETH", logo: "/ethereum-logo.png", networks: ["ethereum"] },
]

export function TokenBridge() {
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [sourceNetwork, setSourceNetwork] = useState("solana")
  const [targetNetwork, setTargetNetwork] = useState("ethereum")
  const [token, setToken] = useState("gold")
  const [isProcessing, setIsProcessing] = useState(false)

  // Filter tokens based on selected networks
  const availableTokens = TOKENS.filter((t) => t.networks.includes(sourceNetwork) && t.networks.includes(targetNetwork))

  // Get selected token details
  const selectedToken = TOKENS.find((t) => t.id === token)

  // Handle bridge transaction
  const handleBridge = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount to bridge",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Bridge initiated",
        description: `Bridging ${amount} ${selectedToken?.name} from ${
          NETWORKS.find((n) => n.id === sourceNetwork)?.name
        } to ${NETWORKS.find((n) => n.id === targetNetwork)?.name}`,
      })

      // Reset form
      setAmount("")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Bridge failed",
        description: "An error occurred while processing your bridge request",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-black border border-gold-500/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-gold-500">Cross-Chain Bridge</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Source Network</label>
            <Select value={sourceNetwork} onValueChange={setSourceNetwork}>
              <SelectTrigger className="bg-gray-900 border-gray-700">
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {NETWORKS.map((network) => (
                  <SelectItem key={network.id} value={network.id} className="text-white">
                    <div className="flex items-center gap-2">
                      <img
                        src={network.logo || "/placeholder.svg"}
                        alt={network.name}
                        className="w-5 h-5 rounded-full"
                      />
                      {network.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center">
            <div className="bg-gray-800 rounded-full p-2">
              <ArrowRightIcon className="h-5 w-5 text-gold-500" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Target Network</label>
            <Select value={targetNetwork} onValueChange={setTargetNetwork}>
              <SelectTrigger className="bg-gray-900 border-gray-700">
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {NETWORKS.map((network) => (
                  <SelectItem key={network.id} value={network.id} className="text-white">
                    <div className="flex items-center gap-2">
                      <img
                        src={network.logo || "/placeholder.svg"}
                        alt={network.name}
                        className="w-5 h-5 rounded-full"
                      />
                      {network.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Token</label>
            <Select value={token} onValueChange={setToken}>
              <SelectTrigger className="bg-gray-900 border-gray-700">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {availableTokens.map((token) => (
                  <SelectItem key={token.id} value={token.id} className="text-white">
                    <div className="flex items-center gap-2">
                      <img src={token.logo || "/placeholder.svg"} alt={token.name} className="w-5 h-5 rounded-full" />
                      {token.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Amount</label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gray-900 border-gray-700"
            />
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 flex items-start gap-3">
          <InfoIcon className="h-5 w-5 text-gold-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p>Bridge fees: 0.1% (min 1 {selectedToken?.name})</p>
            <p className="mt-1">Estimated time: 10-30 minutes</p>
          </div>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black font-semibold"
          disabled={isProcessing || !amount || Number.parseFloat(amount) <= 0}
          onClick={handleBridge}
        >
          {isProcessing ? (
            <div className="flex items-center">
              <span className="mr-2">Processing</span>
              <motion.div
                className="w-4 h-4 border-2 border-t-transparent border-black rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
            </div>
          ) : (
            "Bridge Tokens"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// Add default export
export default TokenBridge
