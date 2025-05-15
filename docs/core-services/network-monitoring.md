# Network Monitoring Service

## Overview

The Network Monitoring Service provides real-time monitoring of Solana RPC endpoints, tracking performance metrics such as latency, reliability, and congestion. It enables automatic endpoint switching based on performance, ensuring optimal connectivity for the Goldium DeFi platform.

## Key Features

- **Performance Metrics**: Tracks latency, reliability, TPS, and congestion
- **Multi-Endpoint Support**: Monitors multiple RPC endpoints per network
- **Automatic Endpoint Switching**: Switches to the best-performing endpoint
- **Custom Endpoint Management**: Allows adding and removing custom endpoints
- **Cross-Network Support**: Works across Mainnet, Testnet, and Devnet
- **Real-time Updates**: Continuously monitors endpoint performance
- **Network Health Assessment**: Provides overall network health status

## Installation

The Network Monitoring Service is included in the Goldium DeFi platform. To use it, import the service or the associated hook:

```typescript
// Import the service directly
import { 
  getNetworkMonitoringService, 
  RpcEndpoint, 
  NetworkMetrics 
} from "@/services/network-monitoring";

// Or use the hook (recommended)
import { useNetworkMonitoring } from "@/hooks/useNetworkMonitoring";
```

## API Reference

### Interfaces

#### `RpcEndpoint`

Represents an RPC endpoint configuration:

```typescript
export interface RpcEndpoint {
  url: string;           // The endpoint URL
  name: string;          // Display name for the endpoint
  network: NetworkType;  // Network the endpoint belongs to
  priority: number;      // Priority (lower is higher priority)
  weight: number;        // Weight for load balancing
  isCustom?: boolean;    // Whether this is a custom endpoint
}
```

#### `NetworkMetrics`

Contains performance metrics for an endpoint:

```typescript
export interface NetworkMetrics {
  latency: number;       // Response time in milliseconds
  reliability: number;   // Reliability score (0-1)
  tps: number;           // Transactions per second
  successRate: number;   // Success rate for requests (0-1)
  congestion: number;    // Network congestion level (0-1)
  lastUpdated: number;   // Timestamp of last update
}
```

### Constants

#### `DEFAULT_RPC_ENDPOINTS`

Default RPC endpoints for each network:

```typescript
export const DEFAULT_RPC_ENDPOINTS: RpcEndpoint[] = [
  // Devnet endpoints
  {
    url: 'https://api.devnet.solana.com',
    name: 'Solana Devnet',
    network: 'devnet',
    priority: 1,
    weight: 1,
  },
  // ... more endpoints for each network
];
```

### Service Methods

#### `getEndpoints`

Gets all configured endpoints:

```typescript
getEndpoints(): RpcEndpoint[]
```

**Returns:** An array of all configured `RpcEndpoint` objects

#### `getEndpointsForNetwork`

Gets endpoints for a specific network:

```typescript
getEndpointsForNetwork(network: NetworkType): RpcEndpoint[]
```

**Parameters:**
- `network`: The network to get endpoints for

**Returns:** An array of `RpcEndpoint` objects for the specified network

#### `getActiveEndpoint`

Gets the active endpoint for a network:

```typescript
getActiveEndpoint(network: NetworkType): RpcEndpoint | undefined
```

**Parameters:**
- `network`: The network to get the active endpoint for

**Returns:** The active `RpcEndpoint` for the network, or `undefined` if none is active

#### `getMetrics`

Gets metrics for all endpoints:

```typescript
getMetrics(): Record<string, NetworkMetrics>
```

**Returns:** An object mapping endpoint URLs to their metrics

#### `getMetricsForEndpoint`

Gets metrics for a specific endpoint:

```typescript
getMetricsForEndpoint(url: string): NetworkMetrics | undefined
```

**Parameters:**
- `url`: The endpoint URL

**Returns:** The `NetworkMetrics` for the endpoint, or `undefined` if not available

#### `getMetricsForNetwork`

Gets metrics for all endpoints in a network:

```typescript
getMetricsForNetwork(network: NetworkType): Record<string, NetworkMetrics>
```

**Parameters:**
- `network`: The network to get metrics for

**Returns:** An object mapping endpoint URLs to their metrics for the specified network

#### `getBestEndpoint`

Gets the best-performing endpoint for a network:

```typescript
getBestEndpoint(network: NetworkType): RpcEndpoint | undefined
```

**Parameters:**
- `network`: The network to get the best endpoint for

**Returns:** The best-performing `RpcEndpoint` for the network, or `undefined` if none is available

#### `setActiveEndpoint`

Sets the active endpoint for a network:

```typescript
setActiveEndpoint(network: NetworkType, url: string): boolean
```

**Parameters:**
- `network`: The network to set the active endpoint for
- `url`: The URL of the endpoint to set as active

**Returns:** `true` if the endpoint was found and set as active, `false` otherwise

#### `addEndpoint`

Adds a custom endpoint:

```typescript
addEndpoint(endpoint: RpcEndpoint): boolean
```

**Parameters:**
- `endpoint`: The endpoint configuration to add

**Returns:** `true` if the endpoint was added, `false` if it already exists

#### `removeEndpoint`

Removes a custom endpoint:

```typescript
removeEndpoint(url: string): boolean
```

**Parameters:**
- `url`: The URL of the endpoint to remove

**Returns:** `true` if the endpoint was found and removed, `false` otherwise

#### `addUpdateListener`

Adds a listener for metrics updates:

```typescript
addUpdateListener(listener: (metrics: Record<string, NetworkMetrics>) => void): void
```

**Parameters:**
- `listener`: The callback function to call when metrics are updated

#### `removeUpdateListener`

Removes a metrics update listener:

```typescript
removeUpdateListener(listener: (metrics: Record<string, NetworkMetrics>) => void): void
```

**Parameters:**
- `listener`: The callback function to remove

#### `startMonitoring`

Starts monitoring network performance:

```typescript
startMonitoring(): void
```

#### `stopMonitoring`

Stops monitoring network performance:

```typescript
stopMonitoring(): void
```

### useNetworkMonitoring Hook

The `useNetworkMonitoring` hook provides a convenient interface to the Network Monitoring Service:

```typescript
function useNetworkMonitoring() {
  // State
  const metrics: Record<string, NetworkMetrics>;
  const endpoints: RpcEndpoint[];
  const activeEndpoint: RpcEndpoint | undefined;
  const isAutoSwitchEnabled: boolean;
  
  // Endpoint management
  const getEndpointsForCurrentNetwork: () => RpcEndpoint[];
  const getMetricsForCurrentNetwork: () => Record<string, NetworkMetrics>;
  const getBestEndpointForCurrentNetwork: () => RpcEndpoint | undefined;
  const switchEndpoint: (url: string) => boolean;
  const switchToBestEndpoint: () => boolean;
  const addCustomEndpoint: (endpoint: RpcEndpoint) => boolean;
  const removeCustomEndpoint: (url: string) => boolean;
  const toggleAutoSwitch: () => void;
  
  // Formatting helpers
  const formatLatency: (latency: number) => string;
  const formatTPS: (tps: number) => string;
  const formatReliability: (reliability: number) => string;
  const formatSuccessRate: (successRate: number) => string;
  const formatCongestion: (congestion: number) => string;
  const getCongestionColor: (congestion: number) => string;
  const getNetworkHealth: (networkType?: NetworkType) => { status: string; color: string };
}
```

## Usage Examples

### Basic Monitoring

```typescript
import { getNetworkMonitoringService } from "@/services/network-monitoring";
import { NetworkType } from "@/components/NetworkContextProvider";

// Initialize the service
const monitoringService = getNetworkMonitoringService();

// Get endpoints for a network
const network: NetworkType = "mainnet-beta";
const endpoints = monitoringService.getEndpointsForNetwork(network);
console.log(`Available endpoints for ${network}:`, endpoints.map(e => e.name));

// Get the active endpoint
const activeEndpoint = monitoringService.getActiveEndpoint(network);
console.log(`Active endpoint: ${activeEndpoint?.name} (${activeEndpoint?.url})`);

// Get metrics for the active endpoint
if (activeEndpoint) {
  const metrics = monitoringService.getMetricsForEndpoint(activeEndpoint.url);
  if (metrics) {
    console.log(`Latency: ${metrics.latency}ms`);
    console.log(`Reliability: ${metrics.reliability * 100}%`);
    console.log(`TPS: ${metrics.tps}`);
    console.log(`Congestion: ${metrics.congestion * 100}%`);
  }
}

// Switch to the best endpoint
const bestEndpoint = monitoringService.getBestEndpoint(network);
if (bestEndpoint && bestEndpoint.url !== activeEndpoint?.url) {
  console.log(`Switching to better endpoint: ${bestEndpoint.name}`);
  monitoringService.setActiveEndpoint(network, bestEndpoint.url);
}
```

### Using the Hook

```tsx
import { useNetworkMonitoring } from "@/hooks/useNetworkMonitoring";
import { useState } from "react";

function NetworkStatus() {
  const { 
    metrics, 
    endpoints, 
    activeEndpoint,
    switchEndpoint,
    switchToBestEndpoint,
    formatLatency,
    formatReliability,
    getNetworkHealth
  } = useNetworkMonitoring();
  
  // Get network health
  const health = getNetworkHealth();
  
  return (
    <div>
      <h2>Network Status</h2>
      <div>
        <span>Health: </span>
        <span style={{ color: health.color }}>{health.status}</span>
      </div>
      
      <h3>Active Endpoint</h3>
      {activeEndpoint ? (
        <div>
          <div>{activeEndpoint.name} ({activeEndpoint.url})</div>
          {metrics[activeEndpoint.url] && (
            <div>
              <div>Latency: {formatLatency(metrics[activeEndpoint.url].latency)}</div>
              <div>Reliability: {formatReliability(metrics[activeEndpoint.url].reliability)}</div>
            </div>
          )}
          <button onClick={switchToBestEndpoint}>
            Switch to Best Endpoint
          </button>
        </div>
      ) : (
        <div>No active endpoint</div>
      )}
      
      <h3>Available Endpoints</h3>
      <ul>
        {endpoints.map(endpoint => (
          <li key={endpoint.url}>
            <div>{endpoint.name}</div>
            <div>{endpoint.url}</div>
            {metrics[endpoint.url] && (
              <div>Latency: {formatLatency(metrics[endpoint.url].latency)}</div>
            )}
            {endpoint.url !== activeEndpoint?.url && (
              <button onClick={() => switchEndpoint(endpoint.url)}>
                Use This Endpoint
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Custom Endpoint Management

```tsx
import { useNetworkMonitoring } from "@/hooks/useNetworkMonitoring";
import { useState } from "react";
import { NetworkType } from "@/components/NetworkContextProvider";

function EndpointManager() {
  const { 
    endpoints, 
    addCustomEndpoint, 
    removeCustomEndpoint 
  } = useNetworkMonitoring();
  
  const [newEndpoint, setNewEndpoint] = useState({
    name: "",
    url: "",
    priority: 1
  });
  
  const handleAddEndpoint = () => {
    if (!newEndpoint.name || !newEndpoint.url) return;
    
    addCustomEndpoint({
      name: newEndpoint.name,
      url: newEndpoint.url,
      network: "mainnet-beta" as NetworkType,
      priority: newEndpoint.priority,
      weight: 1
    });
    
    // Reset form
    setNewEndpoint({
      name: "",
      url: "",
      priority: 1
    });
  };
  
  return (
    <div>
      <h2>Custom Endpoints</h2>
      
      <div>
        <h3>Add New Endpoint</h3>
        <div>
          <label>
            Name:
            <input
              value={newEndpoint.name}
              onChange={e => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
            />
          </label>
        </div>
        <div>
          <label>
            URL:
            <input
              value={newEndpoint.url}
              onChange={e => setNewEndpoint({ ...newEndpoint, url: e.target.value })}
            />
          </label>
        </div>
        <div>
          <label>
            Priority:
            <select
              value={newEndpoint.priority}
              onChange={e => setNewEndpoint({ ...newEndpoint, priority: Number(e.target.value) })}
            >
              <option value={1}>1 (Highest)</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5 (Lowest)</option>
            </select>
          </label>
        </div>
        <button onClick={handleAddEndpoint}>Add Endpoint</button>
      </div>
      
      <h3>Custom Endpoints</h3>
      <ul>
        {endpoints.filter(e => e.isCustom).map(endpoint => (
          <li key={endpoint.url}>
            <div>{endpoint.name}</div>
            <div>{endpoint.url}</div>
            <button onClick={() => removeCustomEndpoint(endpoint.url)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Integration with Other Services

The Network Monitoring Service integrates with several other services in the Goldium DeFi platform:

- **Transaction Service**: Uses network performance data to optimize transaction sending
- **Error Monitoring Service**: Provides context for network-related errors
- **Caching Service**: Helps determine cache invalidation strategies based on network conditions
- **Security Services**: Uses network reliability data for risk assessment

## Best Practices

1. **Enable auto-switching**: Allow the service to automatically switch to the best endpoint
2. **Monitor network health**: Regularly check network health status and alert users of issues
3. **Add fallback endpoints**: Configure multiple endpoints for each network for redundancy
4. **Customize for your needs**: Add custom endpoints that work well for your specific use case
5. **Handle endpoint switching**: Be prepared to handle connection changes when endpoints switch
6. **Respect rate limits**: Be mindful of rate limits when monitoring multiple endpoints
7. **Provide user feedback**: Inform users of network status and endpoint changes
