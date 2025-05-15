"use client"

import React, { useState, useEffect } from "react"
import { useNetworkMonitoring } from "@/hooks/useNetworkMonitoring"
import { useNetwork } from "@/components/NetworkContextProvider"
import { CardContainer } from "@/components/ui/card-container"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NetworkType } from "@/components/NetworkContextProvider"
import { RpcEndpoint } from "@/services/network-monitoring"
import { 
  RefreshCw, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  BarChart4,
  Settings,
  Plus,
  Trash2
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface NetworkStatusDashboardProps {
  showControls?: boolean
  showEndpointManagement?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function NetworkStatusDashboard({
  showControls = true,
  showEndpointManagement = true,
  autoRefresh = true,
  refreshInterval = 60000, // 1 minute
}: NetworkStatusDashboardProps) {
  const { 
    metrics, 
    endpoints, 
    activeEndpoint,
    getEndpointsForCurrentNetwork,
    getMetricsForCurrentNetwork,
    getBestEndpointForCurrentNetwork,
    switchEndpoint,
    switchToBestEndpoint,
    addCustomEndpoint,
    removeCustomEndpoint,
    formatLatency,
    formatTPS,
    formatReliability,
    formatSuccessRate,
    formatCongestion,
    getCongestionColor,
    getNetworkHealth
  } = useNetworkMonitoring()
  
  const { network } = useNetwork()
  
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>(network)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [newEndpoint, setNewEndpoint] = useState({
    name: "",
    url: "",
    priority: 1,
  })
  
  // Get network endpoints
  const networkEndpoints = endpoints.filter(endpoint => endpoint.network === selectedNetwork)
  
  // Get active endpoint for selected network
  const currentActiveEndpoint = endpoints.find(
    endpoint => endpoint.network === selectedNetwork && endpoint.url === activeEndpoint?.url
  )
  
  // Get network health
  const networkHealth = getNetworkHealth(selectedNetwork)
  
  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      handleRefresh()
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])
  
  // Update selected network when network changes
  useEffect(() => {
    setSelectedNetwork(network)
  }, [network])
  
  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }
  
  // Handle switch to best endpoint
  const handleSwitchToBest = () => {
    switchToBestEndpoint()
  }
  
  // Handle add custom endpoint
  const handleAddEndpoint = () => {
    if (!newEndpoint.name || !newEndpoint.url) return
    
    addCustomEndpoint({
      name: newEndpoint.name,
      url: newEndpoint.url,
      network: selectedNetwork,
      priority: newEndpoint.priority,
      weight: 1,
      isCustom: true,
    })
    
    // Reset form
    setNewEndpoint({
      name: "",
      url: "",
      priority: 1,
    })
  }
  
  // Render metric card
  const renderMetricCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    description?: string,
    color?: string
  ) => {
    return (
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h4 
              className="mt-1 text-2xl font-bold"
              style={{ color: color ? color : "inherit" }}
            >
              {value}
            </h4>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            {icon}
          </div>
        </div>
      </div>
    )
  }
  
  // Render endpoint card
  const renderEndpointCard = (endpoint: RpcEndpoint) => {
    const endpointMetrics = metrics[endpoint.url]
    const isActive = endpoint.url === currentActiveEndpoint?.url
    
    return (
      <div 
        className={`relative rounded-lg border p-4 shadow-sm ${
          isActive ? "border-primary bg-primary/5" : "bg-card"
        }`}
      >
        {isActive && (
          <div className="absolute right-2 top-2">
            <StatusBadge variant="success" size="sm">Active</StatusBadge>
          </div>
        )}
        
        <h4 className="font-medium">{endpoint.name}</h4>
        <p className="mt-1 truncate text-xs text-muted-foreground">{endpoint.url}</p>
        
        {endpointMetrics ? (
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Latency:</span>{" "}
              {formatLatency(endpointMetrics.latency)}
            </div>
            <div>
              <span className="text-muted-foreground">Reliability:</span>{" "}
              {formatReliability(endpointMetrics.reliability)}
            </div>
            <div>
              <span className="text-muted-foreground">TPS:</span>{" "}
              {formatTPS(endpointMetrics.tps)}
            </div>
            <div>
              <span className="text-muted-foreground">Congestion:</span>{" "}
              <span style={{ color: getCongestionColor(endpointMetrics.congestion) }}>
                {formatCongestion(endpointMetrics.congestion)}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-xs text-muted-foreground">No metrics available</div>
        )}
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Priority: {endpoint.priority}
          </div>
          
          <div className="flex items-center gap-2">
            {!isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => switchEndpoint(endpoint.url)}
              >
                Use
              </Button>
            )}
            
            {endpoint.isCustom && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCustomEndpoint(endpoint.url)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <CardContainer
      title="Network Status"
      description="Real-time network performance metrics"
      headerAction={
        showControls ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={handleSwitchToBest}
            >
              <Zap className="mr-2 h-4 w-4" />
              Use Best Endpoint
            </Button>
          </div>
        ) : null
      }
    >
      <Tabs defaultValue={network} onValueChange={(value) => setSelectedNetwork(value as NetworkType)}>
        <TabsList className="mb-4">
          <TabsTrigger value="devnet">Devnet</TabsTrigger>
          <TabsTrigger value="testnet">Testnet</TabsTrigger>
          <TabsTrigger value="mainnet-beta">Mainnet</TabsTrigger>
        </TabsList>
        
        {["devnet", "testnet", "mainnet-beta"].map((networkType) => (
          <TabsContent key={networkType} value={networkType}>
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-medium">Network Health</h3>
                <StatusBadge
                  variant={
                    networkHealth.status === "Excellent" || networkHealth.status === "Good"
                      ? "success"
                      : networkHealth.status === "Fair"
                      ? "warning"
                      : "error"
                  }
                >
                  {networkHealth.status}
                </StatusBadge>
              </div>
              
              <Progress
                value={
                  networkHealth.status === "Excellent"
                    ? 90
                    : networkHealth.status === "Good"
                    ? 75
                    : networkHealth.status === "Fair"
                    ? 50
                    : networkHealth.status === "Poor"
                    ? 25
                    : 10
                }
                className="h-2"
              />
            </div>
            
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {renderMetricCard(
                "Average Latency",
                formatLatency(
                  Object.values(metrics)
                    .filter(m => m.lastUpdated > 0)
                    .reduce((sum, m) => sum + m.latency, 0) /
                    Math.max(
                      1,
                      Object.values(metrics).filter(m => m.lastUpdated > 0).length
                    )
                ),
                <Clock className="h-4 w-4" />,
                "Response time"
              )}
              
              {renderMetricCard(
                "Reliability",
                formatReliability(
                  Object.values(metrics)
                    .filter(m => m.lastUpdated > 0)
                    .reduce((sum, m) => sum + m.reliability, 0) /
                    Math.max(
                      1,
                      Object.values(metrics).filter(m => m.lastUpdated > 0).length
                    )
                ),
                <CheckCircle2 className="h-4 w-4" />,
                "Connection success rate"
              )}
              
              {renderMetricCard(
                "Average TPS",
                formatTPS(
                  Object.values(metrics)
                    .filter(m => m.lastUpdated > 0)
                    .reduce((sum, m) => sum + m.tps, 0) /
                    Math.max(
                      1,
                      Object.values(metrics).filter(m => m.lastUpdated > 0).length
                    )
                ),
                <BarChart4 className="h-4 w-4" />,
                "Transactions per second"
              )}
              
              {renderMetricCard(
                "Network Congestion",
                formatCongestion(
                  Object.values(metrics)
                    .filter(m => m.lastUpdated > 0)
                    .reduce((sum, m) => sum + m.congestion, 0) /
                    Math.max(
                      1,
                      Object.values(metrics).filter(m => m.lastUpdated > 0).length
                    )
                ),
                <AlertTriangle className="h-4 w-4" />,
                "Current network load",
                getCongestionColor(
                  Object.values(metrics)
                    .filter(m => m.lastUpdated > 0)
                    .reduce((sum, m) => sum + m.congestion, 0) /
                    Math.max(
                      1,
                      Object.values(metrics).filter(m => m.lastUpdated > 0).length
                    )
                )
              )}
            </div>
            
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">RPC Endpoints</h3>
              
              {showEndpointManagement && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Endpoint
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Custom RPC Endpoint</DialogTitle>
                      <DialogDescription>
                        Add a custom RPC endpoint for {selectedNetwork}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Endpoint Name</Label>
                        <Input
                          id="name"
                          value={newEndpoint.name}
                          onChange={(e) => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
                          placeholder="My Custom Endpoint"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="url">Endpoint URL</Label>
                        <Input
                          id="url"
                          value={newEndpoint.url}
                          onChange={(e) => setNewEndpoint({ ...newEndpoint, url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={newEndpoint.priority.toString()}
                          onValueChange={(value) => 
                            setNewEndpoint({ ...newEndpoint, priority: parseInt(value) })
                          }
                        >
                          <SelectTrigger id="priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 (Highest)</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5 (Lowest)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button onClick={handleAddEndpoint}>Add Endpoint</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {networkEndpoints.map((endpoint) => renderEndpointCard(endpoint))}
              
              {networkEndpoints.length === 0 && (
                <div className="col-span-full rounded-lg border p-4 text-center text-muted-foreground">
                  No endpoints available for {selectedNetwork}
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </CardContainer>
  )
}
