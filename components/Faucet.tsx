"use client"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "@/components/providers/WalletContextProvider"
import { useFaucet } from "@/hooks/useFaucet"
import { GOLD_TOKEN } from "@/constants/tokens"
import Image from "next/image"

export default function Faucet() {
  const { connected } = useWallet()
  const { toast } = useToast()
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"
  const { isLoading, canClaim, timeUntilNextClaim, claimGold, airdropAmount } = useFaucet()

  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) return "Ready"

    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  return (
    <Card
      className={`w-full max-w-md mx-auto ${isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-xl bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
          GOLD Token Faucet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={`${isDarkTheme ? "bg-gray-800" : "bg-gray-100"} rounded-lg p-6 text-center`}>
          <div className="mb-4">
            <Image
              src={GOLD_TOKEN.logoURI || "/placeholder.svg"}
              alt="GOLD Token"
              width={96}
              height={96}
              className="mx-auto"
            />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDarkTheme ? "text-white" : "text-gray-900"}`}>
            Get {airdropAmount} GOLD Tokens
          </h3>
          <p className={`text-sm mb-4 ${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}>
            Use this faucet to get GOLD tokens for testing
          </p>
          <Button
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold"
            disabled={isLoading || !connected || !canClaim}
            onClick={claimGold}
          >
            {isLoading ? (
              <div className="flex items-center">
                <span className="mr-2">Processing</span>
                <div className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin" />
              </div>
            ) : !canClaim ? (
              `Available in ${formatTimeRemaining(timeUntilNextClaim)}`
            ) : (
              "Request GOLD Tokens"
            )}
          </Button>
        </div>

        <div className={`${isDarkTheme ? "bg-gray-800" : "bg-gray-100"} rounded-lg p-3 space-y-2 text-sm`}>
          <div className="flex justify-between items-center">
            <span className={isDarkTheme ? "text-gray-400" : "text-gray-500"}>Amount</span>
            <span className={isDarkTheme ? "text-gray-300" : "text-gray-700"}>{airdropAmount} GOLD</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={isDarkTheme ? "text-gray-400" : "text-gray-500"}>Cooldown</span>
            <span className={isDarkTheme ? "text-gray-300" : "text-gray-700"}>24 hours</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={isDarkTheme ? "text-gray-400" : "text-gray-500"}>Status</span>
            <span className={canClaim ? "text-green-500" : "text-yellow-500"}>
              {canClaim ? "Available" : "Cooldown"}
            </span>
          </div>
        </div>

        <div className="text-center">
          <p className={`text-xs ${isDarkTheme ? "text-gray-500" : "text-gray-600"}`}>
            GOLD tokens are for testing purposes only and have no real value.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
