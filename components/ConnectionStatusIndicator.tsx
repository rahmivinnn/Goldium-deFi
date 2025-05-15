"use client"

import { useEffect, useState } from "react"
import { Wifi, WifiOff, AlertCircle, Check, Loader2 } from "lucide-react"
import { useWallet } from "@/components/providers/WalletContextProvider"
import { cn } from "@/lib/utils"

interface ConnectionStatusIndicatorProps {
  className?: string
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
}

export default function ConnectionStatusIndicator({
  className,
  showLabel = false,
  size = "md",
}: ConnectionStatusIndicatorProps) {
  const { status, error } = useWallet()
  const [networkLatency, setNetworkLatency] = useState<number | null>(null)
  const [networkStatus, setNetworkStatus] = useState<"online" | "offline">("online")

  // Check network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus("online")
    const handleOffline = () => setNetworkStatus("offline")

    // Set initial status
    setNetworkStatus(navigator.onLine ? "online" : "offline")

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check network latency
    const checkLatency = async () => {
      try {
        const start = Date.now()
        await fetch("https://api.mainnet-beta.solana.com", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getHealth",
          }),
        })
        const latency = Date.now() - start
        setNetworkLatency(latency)
      } catch (err) {
        setNetworkLatency(null)
      }
    }

    // Check latency initially and every 30 seconds
    checkLatency()
    const interval = setInterval(checkLatency, 30000)

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }
  }, [])

  // Determine icon and color based on status
  const getStatusDetails = () => {
    if (networkStatus === "offline") {
      return {
        icon: (
          <WifiOff className={cn("text-red-500", size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4")} />
        ),
        label: "Offline",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20",
      }
    }

    switch (status) {
      case "connected":
        return {
          icon: (
            <Check
              className={cn("text-green-500", size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4")}
            />
          ),
          label: "Connected",
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/20",
        }
      case "connecting":
        return {
          icon: (
            <Loader2
              className={cn(
                "text-amber-500 animate-spin",
                size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4",
              )}
            />
          ),
          label: "Connecting",
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/20",
        }
      case "error":
        return {
          icon: (
            <AlertCircle
              className={cn("text-red-500", size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4")}
            />
          ),
          label: "Error",
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/20",
        }
      default:
        return {
          icon: (
            <Wifi className={cn("text-gray-400", size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4")} />
          ),
          label: "Disconnected",
          color: "text-gray-400",
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500/20",
        }
    }
  }

  const { icon, label, color, bgColor, borderColor } = getStatusDetails()

  return (
    <div
      className={cn("flex items-center gap-1.5 rounded-full px-2 py-1 border", bgColor, borderColor, className)}
      title={`Status: ${label}${networkLatency ? ` (${networkLatency}ms)` : ""}`}
    >
      {icon}
      {showLabel && <span className={cn("text-xs font-medium", color)}>{label}</span>}
      {showLabel && networkLatency && status === "connected" && (
        <span className="text-xs text-gray-400">{networkLatency}ms</span>
      )}
    </div>
  )
}
