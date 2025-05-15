"use client"

import { useState, useEffect } from "react"
import { Check, X, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/components/providers/WalletContextProvider"
import { useNetwork } from "@/components/providers/NetworkContextProvider"
import { getInstalledWallets } from "@/utils/wallet-detection"
import { detectBrowser } from "@/utils/browser-detection"

export default function ConnectionTest() {
  const { status, connect, disconnect, address } = useWallet()
  const { network } = useNetwork()
  const [tests, setTests] = useState({
    browser: { status: "pending", message: "Checking browser compatibility..." },
    wallet: { status: "pending", message: "Checking wallet installation..." },
    connection: { status: "pending", message: "Checking wallet connection..." },
    network: { status: "pending", message: "Checking network connection..." },
  })
  const [isRunningTests, setIsRunningTests] = useState(false)

  // Run tests
  const runTests = async () => {
    setIsRunningTests(true)

    // Reset tests
    setTests({
      browser: { status: "pending", message: "Checking browser compatibility..." },
      wallet: { status: "pending", message: "Checking wallet installation..." },
      connection: { status: "pending", message: "Checking wallet connection..." },
      network: { status: "pending", message: "Checking network connection..." },
    })

    // Test browser compatibility
    const browserInfo = detectBrowser()
    if (browserInfo.isSupported) {
      setTests((prev) => ({
        ...prev,
        browser: {
          status: "success",
          message: `${browserInfo.name} ${browserInfo.version} is supported.`,
        },
      }))
    } else {
      setTests((prev) => ({
        ...prev,
        browser: {
          status: "warning",
          message: `${browserInfo.name} ${browserInfo.version} has limited wallet compatibility.`,
        },
      }))
    }

    // Wait a bit for visual effect
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Test wallet installation
    const installedWallets = getInstalledWallets()
    if (installedWallets.length > 0) {
      setTests((prev) => ({
        ...prev,
        wallet: {
          status: "success",
          message: `Found ${installedWallets.join(", ")} wallet(s).`,
        },
      }))
    } else {
      setTests((prev) => ({
        ...prev,
        wallet: {
          status: "error",
          message: "No compatible wallets found. Please install a wallet.",
        },
      }))
    }

    // Wait a bit for visual effect
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Test wallet connection
    if (status === "connected" && address) {
      setTests((prev) => ({
        ...prev,
        connection: {
          status: "success",
          message: `Connected to wallet: ${address.slice(0, 4)}...${address.slice(-4)}`,
        },
      }))
    } else {
      setTests((prev) => ({
        ...prev,
        connection: {
          status: "warning",
          message: "Not connected to a wallet. Try connecting first.",
        },
      }))
    }

    // Wait a bit for visual effect
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Test network connection
    try {
      const start = Date.now()
      const response = await fetch("https://api.mainnet-beta.solana.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getHealth",
        }),
      })

      const latency = Date.now() - start
      const data = await response.json()

      if (data.result === "ok") {
        setTests((prev) => ({
          ...prev,
          network: {
            status: "success",
            message: `Connected to Solana network (${latency}ms latency).`,
          },
        }))
      } else {
        setTests((prev) => ({
          ...prev,
          network: {
            status: "warning",
            message: "Network response received but status is not optimal.",
          },
        }))
      }
    } catch (err) {
      setTests((prev) => ({
        ...prev,
        network: {
          status: "error",
          message: "Failed to connect to Solana network.",
        },
      }))
    }

    setIsRunningTests(false)
  }

  // Run tests on mount
  useEffect(() => {
    runTests()
  }, [])

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <Check className="h-5 w-5 text-green-500" />
      case "error":
        return <X className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "pending":
        return <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
      default:
        return null
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-white">Connection Test</h2>

      <div className="space-y-4 mb-6">
        {Object.entries(tests).map(([key, { status, message }]) => (
          <div key={key} className="flex items-start gap-3">
            <div className="mt-0.5">{getStatusIcon(status)}</div>
            <div>
              <h3 className="font-medium text-white capitalize">{key} Test</h3>
              <p className="text-sm text-gray-400">{message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={runTests} disabled={isRunningTests} className="w-full">
          {isRunningTests ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            "Run Tests Again"
          )}
        </Button>

        {status !== "connected" ? (
          <Button onClick={() => connect("phantom")} variant="outline" className="w-full">
            Connect Wallet
          </Button>
        ) : (
          <Button onClick={() => disconnect()} variant="outline" className="w-full">
            Disconnect Wallet
          </Button>
        )}
      </div>
    </div>
  )
}
