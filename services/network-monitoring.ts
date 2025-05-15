"use client"

import { Connection } from "@solana/web3.js"
import { NetworkType } from "@/components/NetworkContextProvider"

// RPC endpoint configuration
export interface RpcEndpoint {
  url: string;
  name: string;
  network: NetworkType;
  priority: number;
  weight: number;
  isCustom?: boolean;
}

// Network performance metrics
export interface NetworkMetrics {
  latency: number; // milliseconds
  reliability: number; // 0-1
  tps: number; // transactions per second
  successRate: number; // 0-1
  congestion: number; // 0-1
  lastUpdated: number;
}

// Default RPC endpoints
export const DEFAULT_RPC_ENDPOINTS: RpcEndpoint[] = [
  // Devnet endpoints
  {
    url: 'https://api.devnet.solana.com',
    name: 'Solana Devnet',
    network: 'devnet',
    priority: 1,
    weight: 1,
  },
  {
    url: 'https://devnet.genesysgo.net',
    name: 'GenesysGo Devnet',
    network: 'devnet',
    priority: 2,
    weight: 1,
  },
  
  // Testnet endpoints
  {
    url: 'https://api.testnet.solana.com',
    name: 'Solana Testnet',
    network: 'testnet',
    priority: 1,
    weight: 1,
  },
  
  // Mainnet endpoints
  {
    url: 'https://api.mainnet-beta.solana.com',
    name: 'Solana Mainnet',
    network: 'mainnet-beta',
    priority: 1,
    weight: 1,
  },
  {
    url: 'https://solana-mainnet.g.alchemy.com/v2/demo',
    name: 'Alchemy Mainnet',
    network: 'mainnet-beta',
    priority: 2,
    weight: 1,
  },
  {
    url: 'https://rpc.ankr.com/solana',
    name: 'Ankr Mainnet',
    network: 'mainnet-beta',
    priority: 3,
    weight: 1,
  },
];

/**
 * Network monitoring service for tracking network performance
 */
export class NetworkMonitoringService {
  private endpoints: RpcEndpoint[] = [];
  private metrics: Record<string, NetworkMetrics> = {};
  private activeEndpoints: Record<NetworkType, string> = {
    'devnet': '',
    'testnet': '',
    'mainnet-beta': '',
  };
  private updateInterval: NodeJS.Timeout | null = null;
  private updateListeners: ((metrics: Record<string, NetworkMetrics>) => void)[] = [];
  
  constructor(customEndpoints: RpcEndpoint[] = []) {
    // Initialize endpoints with defaults and any custom endpoints
    this.endpoints = [...DEFAULT_RPC_ENDPOINTS];
    
    // Add custom endpoints
    customEndpoints.forEach(endpoint => {
      // Check if endpoint already exists
      const existingIndex = this.endpoints.findIndex(e => e.url === endpoint.url);
      if (existingIndex >= 0) {
        // Update existing endpoint
        this.endpoints[existingIndex] = {
          ...this.endpoints[existingIndex],
          ...endpoint,
          isCustom: true,
        };
      } else {
        // Add new endpoint
        this.endpoints.push({
          ...endpoint,
          isCustom: true,
        });
      }
    });
    
    // Initialize metrics for each endpoint
    this.endpoints.forEach(endpoint => {
      this.metrics[endpoint.url] = {
        latency: 0,
        reliability: 1,
        tps: 0,
        successRate: 1,
        congestion: 0,
        lastUpdated: 0,
      };
    });
    
    // Set initial active endpoints
    this.selectInitialEndpoints();
    
    // Start monitoring
    this.startMonitoring();
  }
  
  /**
   * Get all endpoints
   */
  public getEndpoints(): RpcEndpoint[] {
    return [...this.endpoints];
  }
  
  /**
   * Get endpoints for a specific network
   */
  public getEndpointsForNetwork(network: NetworkType): RpcEndpoint[] {
    return this.endpoints.filter(endpoint => endpoint.network === network);
  }
  
  /**
   * Get the active endpoint for a network
   */
  public getActiveEndpoint(network: NetworkType): RpcEndpoint | undefined {
    const url = this.activeEndpoints[network];
    return this.endpoints.find(endpoint => endpoint.url === url);
  }
  
  /**
   * Get metrics for all endpoints
   */
  public getMetrics(): Record<string, NetworkMetrics> {
    return { ...this.metrics };
  }
  
  /**
   * Get metrics for a specific endpoint
   */
  public getMetricsForEndpoint(url: string): NetworkMetrics | undefined {
    return this.metrics[url];
  }
  
  /**
   * Get metrics for a specific network
   */
  public getMetricsForNetwork(network: NetworkType): Record<string, NetworkMetrics> {
    const result: Record<string, NetworkMetrics> = {};
    
    this.endpoints
      .filter(endpoint => endpoint.network === network)
      .forEach(endpoint => {
        result[endpoint.url] = this.metrics[endpoint.url];
      });
    
    return result;
  }
  
  /**
   * Get the best endpoint for a network
   */
  public getBestEndpoint(network: NetworkType): RpcEndpoint | undefined {
    const networkEndpoints = this.getEndpointsForNetwork(network);
    
    if (networkEndpoints.length === 0) {
      return undefined;
    }
    
    // Calculate scores for each endpoint
    const scores = networkEndpoints.map(endpoint => {
      const metrics = this.metrics[endpoint.url];
      
      // Skip endpoints with no metrics
      if (!metrics || metrics.lastUpdated === 0) {
        return { endpoint, score: 0 };
      }
      
      // Calculate score based on metrics
      const latencyScore = Math.max(0, 1 - (metrics.latency / 1000)); // 0-1, lower is better
      const reliabilityScore = metrics.reliability; // 0-1, higher is better
      const successRateScore = metrics.successRate; // 0-1, higher is better
      const congestionScore = 1 - metrics.congestion; // 0-1, lower congestion is better
      
      // Combine scores with weights
      const score = (
        latencyScore * 0.3 +
        reliabilityScore * 0.3 +
        successRateScore * 0.3 +
        congestionScore * 0.1
      ) * endpoint.weight;
      
      return { endpoint, score };
    });
    
    // Sort by score (highest first)
    scores.sort((a, b) => b.score - a.score);
    
    // Return the endpoint with the highest score
    return scores[0]?.endpoint;
  }
  
  /**
   * Set the active endpoint for a network
   */
  public setActiveEndpoint(network: NetworkType, url: string): boolean {
    // Check if endpoint exists and belongs to the specified network
    const endpoint = this.endpoints.find(e => e.url === url && e.network === network);
    
    if (!endpoint) {
      return false;
    }
    
    this.activeEndpoints[network] = url;
    return true;
  }
  
  /**
   * Add a custom endpoint
   */
  public addEndpoint(endpoint: RpcEndpoint): boolean {
    // Check if endpoint already exists
    if (this.endpoints.some(e => e.url === endpoint.url)) {
      return false;
    }
    
    // Add endpoint
    this.endpoints.push({
      ...endpoint,
      isCustom: true,
    });
    
    // Initialize metrics
    this.metrics[endpoint.url] = {
      latency: 0,
      reliability: 1,
      tps: 0,
      successRate: 1,
      congestion: 0,
      lastUpdated: 0,
    };
    
    return true;
  }
  
  /**
   * Remove a custom endpoint
   */
  public removeEndpoint(url: string): boolean {
    // Find endpoint
    const index = this.endpoints.findIndex(e => e.url === url && e.isCustom);
    
    if (index < 0) {
      return false;
    }
    
    // Remove endpoint
    this.endpoints.splice(index, 1);
    
    // Remove metrics
    delete this.metrics[url];
    
    // Update active endpoints if needed
    Object.entries(this.activeEndpoints).forEach(([network, activeUrl]) => {
      if (activeUrl === url) {
        // Select a new active endpoint for this network
        const bestEndpoint = this.getBestEndpoint(network as NetworkType);
        if (bestEndpoint) {
          this.activeEndpoints[network as NetworkType] = bestEndpoint.url;
        }
      }
    });
    
    return true;
  }
  
  /**
   * Add a metrics update listener
   */
  public addUpdateListener(listener: (metrics: Record<string, NetworkMetrics>) => void): void {
    this.updateListeners.push(listener);
  }
  
  /**
   * Remove a metrics update listener
   */
  public removeUpdateListener(listener: (metrics: Record<string, NetworkMetrics>) => void): void {
    this.updateListeners = this.updateListeners.filter(l => l !== listener);
  }
  
  /**
   * Start monitoring network performance
   */
  public startMonitoring(): void {
    // Stop any existing interval
    this.stopMonitoring();
    
    // Start new interval
    this.updateInterval = setInterval(() => {
      this.updateMetrics();
    }, 60000); // Update every minute
    
    // Initial update
    this.updateMetrics();
  }
  
  /**
   * Stop monitoring network performance
   */
  public stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  
  /**
   * Update metrics for all endpoints
   */
  private async updateMetrics(): Promise<void> {
    // Update metrics for each endpoint
    const promises = this.endpoints.map(async endpoint => {
      try {
        // Create a connection to the endpoint
        const connection = new Connection(endpoint.url);
        
        // Measure latency
        const startTime = Date.now();
        await connection.getVersion();
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        // Get recent performance samples
        const perfSamples = await connection.getRecentPerformanceSamples(5);
        
        // Calculate TPS
        let tps = 0;
        if (perfSamples.length > 0) {
          tps = perfSamples.reduce((sum, sample) => sum + sample.numTransactions, 0) / perfSamples.length;
        }
        
        // Calculate congestion
        let congestion = 0;
        if (perfSamples.length > 0) {
          // Assuming 5000 tx/slot is high congestion
          congestion = Math.min(1, tps / 5000);
        }
        
        // Update metrics
        this.metrics[endpoint.url] = {
          latency,
          reliability: 1, // Successful connection
          tps,
          successRate: 1, // Successful connection
          congestion,
          lastUpdated: Date.now(),
        };
      } catch (error) {
        // Update reliability
        const currentMetrics = this.metrics[endpoint.url];
        this.metrics[endpoint.url] = {
          ...currentMetrics,
          reliability: Math.max(0, currentMetrics.reliability - 0.1), // Decrease reliability
          successRate: Math.max(0, currentMetrics.successRate - 0.1), // Decrease success rate
          lastUpdated: Date.now(),
        };
      }
    });
    
    // Wait for all updates to complete
    await Promise.all(promises);
    
    // Check if we need to switch endpoints
    this.checkEndpointSwitching();
    
    // Notify listeners
    this.notifyListeners();
  }
  
  /**
   * Check if we need to switch endpoints
   */
  private checkEndpointSwitching(): void {
    // Check each network
    Object.keys(this.activeEndpoints).forEach(networkKey => {
      const network = networkKey as NetworkType;
      const currentUrl = this.activeEndpoints[network];
      
      // Skip if no active endpoint
      if (!currentUrl) {
        // Select best endpoint
        const bestEndpoint = this.getBestEndpoint(network);
        if (bestEndpoint) {
          this.activeEndpoints[network] = bestEndpoint.url;
        }
        return;
      }
      
      // Get current metrics
      const currentMetrics = this.metrics[currentUrl];
      
      // Skip if no metrics
      if (!currentMetrics) {
        return;
      }
      
      // Check if current endpoint is performing poorly
      const isPoorPerformance = 
        currentMetrics.reliability < 0.8 || // Less than 80% reliability
        currentMetrics.successRate < 0.8 || // Less than 80% success rate
        currentMetrics.latency > 2000; // More than 2 seconds latency
      
      if (isPoorPerformance) {
        // Get best endpoint
        const bestEndpoint = this.getBestEndpoint(network);
        
        // Switch if best endpoint is different and has better metrics
        if (bestEndpoint && bestEndpoint.url !== currentUrl) {
          const bestMetrics = this.metrics[bestEndpoint.url];
          
          if (bestMetrics && 
              bestMetrics.reliability > currentMetrics.reliability &&
              bestMetrics.successRate > currentMetrics.successRate &&
              bestMetrics.latency < currentMetrics.latency) {
            this.activeEndpoints[network] = bestEndpoint.url;
          }
        }
      }
    });
  }
  
  /**
   * Select initial endpoints
   */
  private selectInitialEndpoints(): void {
    // Select best endpoint for each network
    Object.keys(this.activeEndpoints).forEach(networkKey => {
      const network = networkKey as NetworkType;
      
      // Get endpoints for this network
      const networkEndpoints = this.getEndpointsForNetwork(network);
      
      if (networkEndpoints.length > 0) {
        // Sort by priority (lowest first)
        networkEndpoints.sort((a, b) => a.priority - b.priority);
        
        // Select the endpoint with the highest priority
        this.activeEndpoints[network] = networkEndpoints[0].url;
      }
    });
  }
  
  /**
   * Notify all metrics update listeners
   */
  private notifyListeners(): void {
    this.updateListeners.forEach(listener => {
      try {
        listener(this.getMetrics());
      } catch (e) {
        console.error('Error in metrics update listener:', e);
      }
    });
  }
}

// Singleton instance
let monitoringService: NetworkMonitoringService | null = null;

/**
 * Get the network monitoring service instance
 */
export function getNetworkMonitoringService(
  customEndpoints: RpcEndpoint[] = []
): NetworkMonitoringService {
  if (!monitoringService) {
    monitoringService = new NetworkMonitoringService(customEndpoints);
  }
  
  return monitoringService;
}
