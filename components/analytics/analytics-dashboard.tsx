"use client"

import React, { useState, useEffect } from "react"
import { useAnalytics } from "@/hooks/useAnalytics"
import { CardContainer } from "@/components/ui/card-container"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  EventCategory, 
  EventAction,
  EventData,
  PerformanceMetricData,
  FunnelStepData,
} from "@/services/analytics"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { 
  Download, 
  RefreshCw, 
  BarChart3, 
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Settings,
  Trash2,
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
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

interface AnalyticsDashboardProps {
  showControls?: boolean
  showSettings?: boolean
  showExport?: boolean
  showClear?: boolean
}

export function AnalyticsDashboard({
  showControls = true,
  showSettings = true,
  showExport = true,
  showClear = true,
}: AnalyticsDashboardProps) {
  const { 
    isEnabled,
    getEvents,
    getEventsByCategory,
    getEventsByAction,
    getPerformanceMetrics,
    getFunnelSteps,
    getFunnelCompletionRate,
    enableAnalytics,
    disableAnalytics,
    updateAnalyticsConfig,
    clearAnalyticsData,
  } = useAnalytics()
  
  const [events, setEvents] = useState<EventData[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetricData[]>([])
  const [funnelSteps, setFunnelSteps] = useState<FunnelStepData[]>([])
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("7d")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedChartType, setSelectedChartType] = useState<string>("bar")
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [analyticsConfig, setAnalyticsConfig] = useState({
    enabled: isEnabled,
    anonymizeIp: true,
    trackWalletAddresses: false,
    samplingRate: 1.0,
  })
  
  // Load data
  useEffect(() => {
    loadData()
  }, [selectedTimeRange, selectedCategory])
  
  // Load data function
  const loadData = () => {
    setIsRefreshing(true)
    
    // Get time range filter
    const now = Date.now()
    let startTime = 0
    
    switch (selectedTimeRange) {
      case "1d":
        startTime = now - 24 * 60 * 60 * 1000 // 1 day
        break
      case "7d":
        startTime = now - 7 * 24 * 60 * 60 * 1000 // 7 days
        break
      case "30d":
        startTime = now - 30 * 24 * 60 * 60 * 1000 // 30 days
        break
      case "90d":
        startTime = now - 90 * 24 * 60 * 60 * 1000 // 90 days
        break
      case "all":
      default:
        startTime = 0
        break
    }
    
    // Get events
    let filteredEvents = getEvents().filter(event => event.timestamp >= startTime)
    
    // Apply category filter
    if (selectedCategory !== "all") {
      filteredEvents = filteredEvents.filter(event => event.category === selectedCategory)
    }
    
    setEvents(filteredEvents)
    
    // Get performance metrics
    setPerformanceMetrics(
      getPerformanceMetrics().filter(metric => metric.timestamp >= startTime)
    )
    
    // Get funnel steps
    setFunnelSteps(
      getFunnelSteps().filter(step => step.timestamp >= startTime)
    )
    
    setIsRefreshing(false)
  }
  
  // Handle refresh
  const handleRefresh = () => {
    loadData()
  }
  
  // Handle export
  const handleExport = () => {
    // Create export data
    const exportData = {
      events,
      performanceMetrics,
      funnelSteps,
      exportDate: new Date().toISOString(),
    }
    
    // Convert to JSON
    const jsonData = JSON.stringify(exportData, null, 2)
    
    // Create download link
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `goldium-analytics-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Handle clear data
  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all analytics data? This action cannot be undone.")) {
      clearAnalyticsData()
      loadData()
    }
  }
  
  // Handle settings change
  const handleSettingsChange = (key: string, value: any) => {
    setAnalyticsConfig(prev => ({
      ...prev,
      [key]: value,
    }))
    
    updateAnalyticsConfig({
      [key]: value,
    })
  }
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }
  
  // Format category
  const formatCategory = (category: string) => {
    return category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
  }
  
  // Get chart colors
  const getChartColors = () => {
    return [
      "#3498db", // Blue
      "#2ecc71", // Green
      "#e74c3c", // Red
      "#f39c12", // Orange
      "#9b59b6", // Purple
      "#1abc9c", // Teal
      "#34495e", // Dark Blue
      "#e67e22", // Dark Orange
      "#27ae60", // Dark Green
      "#c0392b", // Dark Red
    ]
  }
  
  // Prepare event data for charts
  const prepareEventData = () => {
    // Group by category
    const categoryData = events.reduce((acc, event) => {
      const category = event.category
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category]++
      return acc
    }, {} as Record<string, number>)
    
    // Convert to array
    return Object.entries(categoryData).map(([category, count]) => ({
      name: formatCategory(category),
      value: count,
    }))
  }
  
  // Prepare action data for charts
  const prepareActionData = () => {
    // Group by action
    const actionData = events.reduce((acc, event) => {
      const action = event.action
      if (!acc[action]) {
        acc[action] = 0
      }
      acc[action]++
      return acc
    }, {} as Record<string, number>)
    
    // Convert to array
    return Object.entries(actionData)
      .map(([action, count]) => ({
        name: action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        value: count,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10
  }
  
  // Prepare time series data
  const prepareTimeSeriesData = () => {
    // Group by day
    const timeData = events.reduce((acc, event) => {
      const date = new Date(event.timestamp).toISOString().split("T")[0]
      if (!acc[date]) {
        acc[date] = 0
      }
      acc[date]++
      return acc
    }, {} as Record<string, number>)
    
    // Convert to array
    return Object.entries(timeData)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }
  
  // Prepare performance data
  const preparePerformanceData = () => {
    // Group by name
    const perfData = performanceMetrics.reduce((acc, metric) => {
      const name = metric.name
      if (!acc[name]) {
        acc[name] = []
      }
      acc[name].push(metric)
      return acc
    }, {} as Record<string, PerformanceMetricData[]>)
    
    // Calculate averages
    return Object.entries(perfData).map(([name, metrics]) => {
      const avg = metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length
      return {
        name: name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        value: Math.round(avg * 100) / 100,
        unit: metrics[0].unit,
      }
    })
  }
  
  // Prepare funnel data
  const prepareFunnelData = () => {
    // Get unique funnel IDs
    const funnelIds = [...new Set(funnelSteps.map(step => step.funnelId))]
    
    // Calculate completion rates
    return funnelIds.map(funnelId => {
      const steps = funnelSteps.filter(step => step.funnelId === funnelId)
      const completionRate = getFunnelCompletionRate(funnelId)
      
      // Get funnel name from metadata
      const funnelName = steps[0]?.metadata?.funnelName || funnelId
      
      return {
        id: funnelId,
        name: funnelName,
        completionRate: Math.round(completionRate * 100),
        totalSessions: new Set(steps.map(step => step.sessionId)).size,
      }
    })
  }
  
  // Render chart
  const renderChart = () => {
    const colors = getChartColors()
    
    switch (selectedChartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareActionData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={colors[0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        )
      
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={prepareEventData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {prepareEventData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
      
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prepareTimeSeriesData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke={colors[0]} name="Events" />
            </LineChart>
          </ResponsiveContainer>
        )
      
      default:
        return null
    }
  }
  
  return (
    <CardContainer
      title="Analytics Dashboard"
      description="User interactions and performance metrics"
      headerAction={
        showControls ? (
          <div className="flex items-center gap-2">
            <Select
              value={selectedTimeRange}
              onValueChange={setSelectedTimeRange}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            
            {showExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            )}
            
            {showClear && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearData}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
            
            {showSettings && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Analytics Settings</DialogTitle>
                    <DialogDescription>
                      Configure analytics collection settings
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="analytics-enabled">Enable Analytics</Label>
                      <Switch
                        id="analytics-enabled"
                        checked={analyticsConfig.enabled}
                        onCheckedChange={(checked) => handleSettingsChange("enabled", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="anonymize-ip">Anonymize IP Addresses</Label>
                      <Switch
                        id="anonymize-ip"
                        checked={analyticsConfig.anonymizeIp}
                        onCheckedChange={(checked) => handleSettingsChange("anonymizeIp", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="track-wallets">Track Wallet Addresses</Label>
                      <Switch
                        id="track-wallets"
                        checked={analyticsConfig.trackWalletAddresses}
                        onCheckedChange={(checked) => handleSettingsChange("trackWalletAddresses", checked)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="sampling-rate">Sampling Rate: {analyticsConfig.samplingRate * 100}%</Label>
                      <Slider
                        id="sampling-rate"
                        min={0.1}
                        max={1}
                        step={0.1}
                        value={[analyticsConfig.samplingRate]}
                        onValueChange={(value) => handleSettingsChange("samplingRate", value[0])}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        ) : null
      }
    >
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="funnels">Funnels</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium">Total Events</h3>
              <p className="mt-2 text-3xl font-bold">{events.length}</p>
            </div>
            
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium">Unique Sessions</h3>
              <p className="mt-2 text-3xl font-bold">
                {new Set(events.map(event => event.sessionId)).size}
              </p>
            </div>
            
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium">Avg. Performance</h3>
              <p className="mt-2 text-3xl font-bold">
                {performanceMetrics.length > 0
                  ? `${Math.round(
                      performanceMetrics
                        .filter(m => m.name === "page_load_time")
                        .reduce((sum, m) => sum + m.value, 0) /
                        Math.max(
                          1,
                          performanceMetrics.filter(m => m.name === "page_load_time").length
                        )
                    )} ms`
                  : "N/A"}
              </p>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-medium">Event Distribution</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant={selectedChartType === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedChartType("bar")}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedChartType === "pie" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedChartType("pie")}
                >
                  <PieChartIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedChartType === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedChartType("line")}
                >
                  <LineChartIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {renderChart()}
          </div>
        </TabsContent>
        
        <TabsContent value="events">
          <div className="mb-4">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value={EventCategory.TRANSACTION}>Transaction</SelectItem>
                <SelectItem value={EventCategory.USER_ACTION}>User Action</SelectItem>
                <SelectItem value={EventCategory.SYSTEM}>System</SelectItem>
                <SelectItem value={EventCategory.ERROR}>Error</SelectItem>
                <SelectItem value={EventCategory.PERFORMANCE}>Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Network</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.slice(0, 100).map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{formatDate(event.timestamp)}</TableCell>
                    <TableCell>{formatCategory(event.category)}</TableCell>
                    <TableCell>{event.action.replace(/_/g, " ")}</TableCell>
                    <TableCell>{event.label || "-"}</TableCell>
                    <TableCell>{event.network || "-"}</TableCell>
                  </TableRow>
                ))}
                
                {events.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No events found
                    </TableCell>
                  </TableRow>
                )}
                
                {events.length > 100 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Showing 100 of {events.length} events
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="performance">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Performance Metrics</h3>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Average</TableHead>
                  <TableHead>Min</TableHead>
                  <TableHead>Max</TableHead>
                  <TableHead>Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(
                  performanceMetrics.reduce((acc, metric) => {
                    if (!acc[metric.name]) {
                      acc[metric.name] = {
                        values: [],
                        unit: metric.unit,
                      }
                    }
                    acc[metric.name].values.push(metric.value)
                    return acc
                  }, {} as Record<string, { values: number[]; unit: string }>)
                ).map(([name, { values, unit }]) => (
                  <TableRow key={name}>
                    <TableCell>{name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</TableCell>
                    <TableCell>
                      {Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 100) / 100} {unit}
                    </TableCell>
                    <TableCell>
                      {Math.min(...values)} {unit}
                    </TableCell>
                    <TableCell>
                      {Math.max(...values)} {unit}
                    </TableCell>
                    <TableCell>{values.length}</TableCell>
                  </TableRow>
                ))}
                
                {performanceMetrics.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No performance metrics found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="funnels">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Conversion Funnels</h3>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funnel</TableHead>
                  <TableHead>Completion Rate</TableHead>
                  <TableHead>Total Sessions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prepareFunnelData().map((funnel) => (
                  <TableRow key={funnel.id}>
                    <TableCell>{funnel.name}</TableCell>
                    <TableCell>{funnel.completionRate}%</TableCell>
                    <TableCell>{funnel.totalSessions}</TableCell>
                  </TableRow>
                ))}
                
                {funnelSteps.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No funnel data found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </CardContainer>
  )
}
