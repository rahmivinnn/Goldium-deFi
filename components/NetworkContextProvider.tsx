"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { clusterApiUrl, Connection } from "@solana/web3.js"
import { useToast } from "@/components/ui/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { getNetworkMonitoringService } from "@/services/network-monitoring"

export type NetworkType = "devnet" | "testnet" | "mainnet-beta"

interface NetworkContextType {
  network: NetworkType
  setNetwork: (network: NetworkType) => void
  connection: Connection
  endpoint: string
  walletAdapterNetwork: WalletAdapterNetwork
  isChangingNetwork: boolean
  switchEndpoint: (url: string) => boolean
  getNetworkHealth: () => { status: string; color: string }
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export function useNetwork() {
  const context = useContext(NetworkContext)
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkContextProvider")
  }
  return context
}

interface NetworkContextProviderProps {
  children: ReactNode
}

export function NetworkContextProvider({ children }: NetworkContextProviderProps) {
  // Persist network selection in local storage
  const [network, setNetworkState] = useLocalStorage<NetworkType>("goldium-network", "devnet")
  const [isChangingNetwork, setIsChangingNetwork] = useState(false)
  const { toast } = useToast()

  // Get the network monitoring service
  const monitoringService = getNetworkMonitoringService()

  // Get the active endpoint for the current network
  const activeEndpoint = monitoringService.getActiveEndpoint(network)

  // Convert network type to WalletAdapterNetwork
  const walletAdapterNetwork =
    network === "mainnet-beta"
      ? WalletAdapterNetwork.Mainnet
      : network === "testnet"
        ? WalletAdapterNetwork.Testnet
        : WalletAdapterNetwork.Devnet

  // Get endpoint URL for the selected network
  const endpoint = activeEndpoint?.url || clusterApiUrl(walletAdapterNetwork)

  // Create connection to the Solana cluster with optimized settings
  const connection = new Connection(endpoint, {
    commitment: "confirmed",
    disableRetryOnRateLimit: false,
    confirmTransactionInitialTimeout: 60000, // 60 seconds
  })

  // Switch to a different endpoint
  const switchEndpoint = useCallback((url: string): boolean => {
    const success = monitoringService.setActiveEndpoint(network, url)

    if (success) {
      toast({
        title: "Endpoint Changed",
        description: `Switched to a different RPC endpoint for ${network}`,
        variant: "default",
      })

      // Force reload to apply the new endpoint
      window.location.reload()
    }

    return success
  }, [monitoringService, network, toast])

  // Get network health status
  const getNetworkHealth = useCallback((): { status: string; color: string } => {
    const networkMetrics = monitoringService.getMetricsForNetwork(network)

    // Calculate average metrics
    let totalLatency = 0
    let totalReliability = 0
    let totalSuccessRate = 0
    let totalCongestion = 0
    let count = 0

    Object.values(networkMetrics).forEach(metrics => {
      if (metrics.lastUpdated > 0) {
        totalLatency += metrics.latency
        totalReliability += metrics.reliability
        totalSuccessRate += metrics.successRate
        totalCongestion += metrics.congestion
        count++
      }
    })

    if (count === 0) {
      return { status: "Unknown", color: "gray" }
    }

    const avgLatency = totalLatency / count
    const avgReliability = totalReliability / count
    const avgSuccessRate = totalSuccessRate / count
    const avgCongestion = totalCongestion / count

    // Calculate health score (0-1)
    const latencyScore = Math.max(0, 1 - (avgLatency / 2000)) // 0-1, lower is better
    const reliabilityScore = avgReliability // 0-1, higher is better
    const successRateScore = avgSuccessRate // 0-1, higher is better
    const congestionScore = 1 - avgCongestion // 0-1, lower congestion is better

    const healthScore = (
      latencyScore * 0.3 +
      reliabilityScore * 0.3 +
      successRateScore * 0.3 +
      congestionScore * 0.1
    )

    // Determine status and color
    if (healthScore > 0.8) {
      return { status: "Excellent", color: "green" }
    } else if (healthScore > 0.6) {
      return { status: "Good", color: "lightgreen" }
    } else if (healthScore > 0.4) {
      return { status: "Fair", color: "yellow" }
    } else if (healthScore > 0.2) {
      return { status: "Poor", color: "orange" }
    } else {
      return { status: "Critical", color: "red" }
    }
  }, [monitoringService, network])

  // Handle network change
  const handleNetworkChange = useCallback((newNetwork: NetworkType) => {
    if (newNetwork === network) return

    setIsChangingNetwork(true)
    setNetworkState(newNetwork)

    toast({
      title: "Network Changed",
      description: `Switching to ${newNetwork}...`,
      variant: "default",
    })

    // Allow time for UI to update before completing the change
    setTimeout(() => {
      setIsChangingNetwork(false)

      toast({
        title: "Network Ready",
        description: `Now connected to ${newNetwork}`,
        variant: "default",
      })
    }, 1000)
  }, [network, setNetworkState, toast])

  // Expose the network context
  const value = {
    network,
    setNetwork: handleNetworkChange,
    connection,
    endpoint,
    walletAdapterNetwork,
    isChangingNetwork,
    switchEndpoint,
    getNetworkHealth
  }

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
}
