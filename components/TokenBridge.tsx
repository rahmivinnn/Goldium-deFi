"use client"

import { useState } from "react"
import { ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { bridgeTokens, type BridgeParams } from "@/utils/jupiter"
import { useTheme } from "@/components/WalletContextProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { AVAILABLE_TOKENS } from "@/constants/tokens"

export default function TokenBridge() {
  const { connected, publicKey } = useWallet()
  const { theme } = useTheme()
  const { toast } = useToast()
  const isDarkTheme = theme === "dark"

  const [fromChain, setFromChain] = useState<"solana" | "ethereum" | "polygon" | "binance">("solana")
  const [toChain, setToChain] = useState<"solana" | "ethereum" | "polygon" | "binance">("ethereum")
  const [token, setToken] = useState(AVAILABLE_TOKENS[0].symbol)
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleBridge = async () => {
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

    if (!recipient) {
      setRecipient(publicKey.toString())
    }

    setIsLoading(true)
    setError("")

    try {
      const params: BridgeParams = {
        fromChain,
        toChain,
        token,
        amount,
        recipient: recipient || publicKey.toString(),
      }

      const result = await bridgeTokens(params)

      if (result.success) {
        toast({
          title: "Bridge Initiated",
          description: `Your ${amount} ${token} is being bridged from ${fromChain} to ${toChain}`,
          variant: "default",
        })
        setAmount("")
      } else {
        throw new Error(result.error || "Bridge operation failed")
      }
    } catch (err) {
      console.error("Bridge error:", err)
      setError(err.message || "Failed to bridge tokens. Please try again.")
      toast({
        title: "Bridge Failed",
        description: err.message || "Failed to bridge tokens. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={`p-6 rounded-xl ${isDarkTheme ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"} shadow-lg`}
    >
      <h2 className="text-xl font-bold text-center mb-6 bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
        Cross-Chain Bridge
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"} mb-1 block`}>
              From Chain
            </label>
            <Select value={fromChain} onValueChange={(value: any) => setFromChain(value)}>
              <SelectTrigger className={isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}>
                <SelectValue placeholder="Select chain" />
              </SelectTrigger>
              <SelectContent className={isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}>
                <SelectItem value="solana">Solana</SelectItem>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="polygon">Polygon</SelectItem>
                <SelectItem value="binance">BNB Chain</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"} mb-1 block`}>To Chain</label>
            <Select value={toChain} onValueChange={(value: any) => setToChain(value)}>
              <SelectTrigger className={isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}>
                <SelectValue placeholder="Select chain" />
              </SelectTrigger>
              <SelectContent className={isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}>
                <SelectItem value="solana">Solana</SelectItem>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="polygon">Polygon</SelectItem>
                <SelectItem value="binance">BNB Chain</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"} mb-1 block`}>Token</label>
          <Select value={token} onValueChange={setToken}>
            <SelectTrigger className={isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}>
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent className={isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}>
              {AVAILABLE_TOKENS.map((token) => (
                <SelectItem key={token.mint} value={token.symbol}>
                  {token.symbol}
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

        <div>
          <label className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"} mb-1 block`}>
            Recipient Address (Optional)
          </label>
          <Input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={publicKey ? publicKey.toString() : "Enter recipient address"}
            className={isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
          />
          <p className={`text-xs mt-1 ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
            Leave empty to use your connected wallet address
          </p>
        </div>

        {error && (
          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between py-2">
          <div className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>Bridge Fee</div>
          <div className={isDarkTheme ? "text-white" : "text-gray-900"}>0.1%</div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>Estimated Time</div>
          <div className={isDarkTheme ? "text-white" : "text-gray-900"}>~15 minutes</div>
        </div>

        <Button
          disabled={!connected || isLoading || !amount || Number.parseFloat(amount) <= 0 || fromChain === toChain}
          className="w-full h-12 text-base font-medium bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:from-gray-700 disabled:to-gray-600 disabled:text-gray-400 transition-all duration-200 shadow-lg shadow-amber-900/20 disabled:shadow-none"
          onClick={handleBridge}
        >
          {!connected ? (
            "Connect Wallet"
          ) : isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing</span>
            </div>
          ) : fromChain === toChain ? (
            "Select Different Chains"
          ) : (
            <div className="flex items-center gap-2 justify-center">
              <span>Bridge</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}
