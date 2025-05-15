"use client"

import { useState, useEffect, useCallback } from "react"
import { useNetwork } from "@/components/NetworkContextProvider"
import { useConnection } from "@solana/wallet-adapter-react"
import { 
  getNetworkMonitoringService, 
  NetworkMetrics, 
  RpcEndpoint,
  NetworkType
} from "@/services/network-monitoring"
import { useToast } from "@/components/ui/use-toast"

export function useNetworkMonitoring() {
  const { network, setNetwork } = useNetwork()
  const { connection } = useConnection()
  const { toast } = useToast()
  const [metrics, setMetrics] = useState<Record<string, NetworkMetrics>>({})
  const [endpoints, setEndpoints] = useState<RpcEndpoint[]>([])
  const [activeEndpoint, setActiveEndpoint] = useState<RpcEndpoint | undefined>(undefined)
  const [isAutoSwitchEnabled, setIsAutoSwitchEnabled] = useState<boolean>(true)
  
  // Get the network monitoring service
  const monitoringService = getNetworkMonitoringService()
  
  // Update metrics when they change
  useEffect(() => {
    const handleMetricsUpdate = (newMetrics: Record<string, NetworkMetrics>) => {
      setMetrics(newMetrics)
    }
    
    // Add metrics update listener
    monitoringService.addUpdateListener(handleMetricsUpdate)
    
    // Initial load
    setMetrics(monitoringService.getMetrics())
    setEndpoints(monitoringService.getEndpoints())
    setActiveEndpoint(monitoringService.getActiveEndpoint(network))
    
    return () => {
      // Remove metrics update listener
      monitoringService.removeUpdateListener(handleMetricsUpdate)
    }
  }, [monitoringService, network])
  
  // Update active endpoint when network changes
  useEffect(() => {
    setActiveEndpoint(monitoringService.getActiveEndpoint(network))
  }, [monitoringService, network])
  
  // Get endpoints for the current network
  const getEndpointsForCurrentNetwork = useCallback(() => {
    return monitoringService.getEndpointsForNetwork(network)
  }, [monitoringService, network])
  
  // Get metrics for the current network
  const getMetricsForCurrentNetwork = useCallback(() => {
    return monitoringService.getMetricsForNetwork(network)
  }, [monitoringService, network])
  
  // Get the best endpoint for the current network
  const getBestEndpointForCurrentNetwork = useCallback(() => {
    return monitoringService.getBestEndpoint(network)
  }, [monitoringService, network])
  
  // Switch to a different endpoint
  const switchEndpoint = useCallback(
    (url: string) => {
      const success = monitoringService.setActiveEndpoint(network, url)
      
      if (success) {
        setActiveEndpoint(monitoringService.getActiveEndpoint(network))
        
        toast({
          title: "Endpoint Changed",
          description: `Switched to a different RPC endpoint for ${network}`,
          variant: "default",
        })
        
        // Force reload to apply the new endpoint
        window.location.reload()
      }
      
      return success
    },
    [monitoringService, network, toast]
  )
  
  // Switch to the best endpoint
  const switchToBestEndpoint = useCallback(() => {
    const bestEndpoint = getBestEndpointForCurrentNetwork()
    
    if (bestEndpoint && (!activeEndpoint || bestEndpoint.url !== activeEndpoint.url)) {
      return switchEndpoint(bestEndpoint.url)
    }
    
    return false
  }, [getBestEndpointForCurrentNetwork, activeEndpoint, switchEndpoint])
  
  // Add a custom endpoint
  const addCustomEndpoint = useCallback(
    (endpoint: RpcEndpoint) => {
      const success = monitoringService.addEndpoint(endpoint)
      
      if (success) {
        setEndpoints(monitoringService.getEndpoints())
        
        toast({
          title: "Endpoint Added",
          description: `Added custom RPC endpoint: ${endpoint.name}`,
          variant: "default",
        })
      }
      
      return success
    },
    [monitoringService, toast]
  )
  
  // Remove a custom endpoint
  const removeCustomEndpoint = useCallback(
    (url: string) => {
      const success = monitoringService.removeEndpoint(url)
      
      if (success) {
        setEndpoints(monitoringService.getEndpoints())
        setActiveEndpoint(monitoringService.getActiveEndpoint(network))
        
        toast({
          title: "Endpoint Removed",
          description: "Removed custom RPC endpoint",
          variant: "default",
        })
      }
      
      return success
    },
    [monitoringService, network, toast]
  )
  
  // Toggle auto-switching
  const toggleAutoSwitch = useCallback(() => {
    setIsAutoSwitchEnabled(prev => !prev)
  }, [])
  
  // Format latency for display
  const formatLatency = useCallback((latency: number): string => {
    if (latency < 1000) {
      return `${latency}ms`
    } else {
      return `${(latency / 1000).toFixed(1)}s`
    }
  }, [])
  
  // Format TPS for display
  const formatTPS = useCallback((tps: number): string => {
    return tps.toFixed(0)
  }, [])
  
  // Format reliability for display
  const formatReliability = useCallback((reliability: number): string => {
    return `${(reliability * 100).toFixed(0)}%`
  }, [])
  
  // Format success rate for display
  const formatSuccessRate = useCallback((successRate: number): string => {
    return `${(successRate * 100).toFixed(0)}%`
  }, [])
  
  // Format congestion for display
  const formatCongestion = useCallback((congestion: number): string => {
    if (congestion < 0.3) {
      return "Low"
    } else if (congestion < 0.7) {
      return "Medium"
    } else {
      return "High"
    }
  }, [])
  
  // Get congestion color
  const getCongestionColor = useCallback((congestion: number): string => {
    if (congestion < 0.3) {
      return "green"
    } else if (congestion < 0.7) {
      return "yellow"
    } else {
      return "red"
    }
  }, [])
  
  // Get network health status
  const getNetworkHealth = useCallback(
    (networkType: NetworkType = network): { status: string; color: string } => {
      const networkMetrics = monitoringService.getMetricsForNetwork(networkType)
      
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
    },
    [monitoringService, network]
  )
  
  return {
    metrics,
    endpoints,
    activeEndpoint,
    isAutoSwitchEnabled,
    getEndpointsForCurrentNetwork,
    getMetricsForCurrentNetwork,
    getBestEndpointForCurrentNetwork,
    switchEndpoint,
    switchToBestEndpoint,
    addCustomEndpoint,
    removeCustomEndpoint,
    toggleAutoSwitch,
    formatLatency,
    formatTPS,
    formatReliability,
    formatSuccessRate,
    formatCongestion,
    getCongestionColor,
    getNetworkHealth,
  }
}
