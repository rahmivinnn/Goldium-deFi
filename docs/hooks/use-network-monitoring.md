# useNetworkMonitoring Hook

## Overview

The `useNetworkMonitoring` hook provides a React interface to the Goldium platform's network monitoring service, enabling components to track and respond to network performance metrics. It helps optimize the user experience by monitoring RPC endpoint performance and automatically switching to the best-performing endpoint when needed.

## Key Features

- **Performance Metrics**: Track latency, reliability, TPS, and congestion
- **Multi-Endpoint Support**: Monitor multiple RPC endpoints per network
- **Automatic Endpoint Switching**: Switch to the best-performing endpoint
- **Custom Endpoint Management**: Add and remove custom endpoints
- **Cross-Network Support**: Works across Mainnet, Testnet, and Devnet
- **Real-time Updates**: Continuously monitor endpoint performance
- **Network Health Assessment**: Provide overall network health status

## Installation

The `useNetworkMonitoring` hook is included in the Goldium DeFi platform. To use it, import it in your component:

```typescript
import { useNetworkMonitoring } from "@/hooks/useNetworkMonitoring";
```

## API Reference

### Hook Return Value

The `useNetworkMonitoring` hook returns an object with the following properties and methods:

#### State

##### `metrics`

Performance metrics for all endpoints:

```typescript
metrics: Record<string, NetworkMetrics>
```

##### `endpoints`

All configured endpoints:

```typescript
endpoints: RpcEndpoint[]
```

##### `activeEndpoint`

The currently active endpoint:

```typescript
activeEndpoint: RpcEndpoint | undefined
```

##### `isAutoSwitchEnabled`

Whether automatic endpoint switching is enabled:

```typescript
isAutoSwitchEnabled: boolean
```

#### Endpoint Management

##### `getEndpointsForCurrentNetwork`

Gets endpoints for the current network:

```typescript
getEndpointsForCurrentNetwork(): RpcEndpoint[]
```

**Returns:** An array of `RpcEndpoint` objects for the current network

##### `getMetricsForCurrentNetwork`

Gets metrics for all endpoints in the current network:

```typescript
getMetricsForCurrentNetwork(): Record<string, NetworkMetrics>
```

**Returns:** An object mapping endpoint URLs to their metrics for the current network

##### `getBestEndpointForCurrentNetwork`

Gets the best-performing endpoint for the current network:

```typescript
getBestEndpointForCurrentNetwork(): RpcEndpoint | undefined
```

**Returns:** The best-performing `RpcEndpoint` for the current network, or `undefined` if none is available

##### `switchEndpoint`

Switches to a specific endpoint:

```typescript
switchEndpoint(url: string): boolean
```

**Parameters:**
- `url`: The URL of the endpoint to switch to

**Returns:** `true` if the endpoint was found and set as active, `false` otherwise

##### `switchToBestEndpoint`

Switches to the best-performing endpoint:

```typescript
switchToBestEndpoint(): boolean
```

**Returns:** `true` if a better endpoint was found and set as active, `false` otherwise

##### `addCustomEndpoint`

Adds a custom endpoint:

```typescript
addCustomEndpoint(endpoint: RpcEndpoint): boolean
```

**Parameters:**
- `endpoint`: The endpoint configuration to add

**Returns:** `true` if the endpoint was added, `false` if it already exists

##### `removeCustomEndpoint`

Removes a custom endpoint:

```typescript
removeCustomEndpoint(url: string): boolean
```

**Parameters:**
- `url`: The URL of the endpoint to remove

**Returns:** `true` if the endpoint was found and removed, `false` otherwise

##### `toggleAutoSwitch`

Toggles automatic endpoint switching:

```typescript
toggleAutoSwitch(): void
```

#### Formatting Helpers

##### `formatLatency`

Formats a latency value:

```typescript
formatLatency(latency: number): string
```

**Parameters:**
- `latency`: The latency in milliseconds

**Returns:** A formatted latency string (e.g., "150 ms")

##### `formatTPS`

Formats a TPS (transactions per second) value:

```typescript
formatTPS(tps: number): string
```

**Parameters:**
- `tps`: The TPS value

**Returns:** A formatted TPS string (e.g., "1,500 TPS")

##### `formatReliability`

Formats a reliability value:

```typescript
formatReliability(reliability: number): string
```

**Parameters:**
- `reliability`: The reliability as a number between 0 and 1

**Returns:** A formatted reliability string (e.g., "99.5%")

##### `formatSuccessRate`

Formats a success rate value:

```typescript
formatSuccessRate(successRate: number): string
```

**Parameters:**
- `successRate`: The success rate as a number between 0 and 1

**Returns:** A formatted success rate string (e.g., "98.7%")

##### `formatCongestion`

Formats a congestion value:

```typescript
formatCongestion(congestion: number): string
```

**Parameters:**
- `congestion`: The congestion as a number between 0 and 1

**Returns:** A formatted congestion string (e.g., "Low (25%)")

##### `getCongestionColor`

Gets a color for a congestion level:

```typescript
getCongestionColor(congestion: number): string
```

**Parameters:**
- `congestion`: The congestion as a number between 0 and 1

**Returns:** A color string (e.g., "green", "yellow", "red")

##### `getNetworkHealth`

Gets the overall health status of a network:

```typescript
getNetworkHealth(networkType?: NetworkType): { status: string; color: string }
```

**Parameters:**
- `networkType`: Optional network type (defaults to current network)

**Returns:** An object with status and color properties

## Usage Examples

### Network Status Display

```tsx
import { useNetworkMonitoring } from "@/hooks/useNetworkMonitoring";

function NetworkStatus() {
  const { 
    metrics, 
    activeEndpoint,
    formatLatency,
    formatReliability,
    formatCongestion,
    getCongestionColor,
    getNetworkHealth
  } = useNetworkMonitoring();
  
  // Get network health
  const health = getNetworkHealth();
  
  return (
    <div>
      <h2>Network Status</h2>
      
      <div className="network-health">
        <span>Health: </span>
        <span style={{ color: health.color }}>{health.status}</span>
      </div>
      
      {activeEndpoint && (
        <div className="active-endpoint">
          <h3>Active Endpoint</h3>
          <div className="endpoint-name">{activeEndpoint.name}</div>
          <div className="endpoint-url">{activeEndpoint.url}</div>
          
          {metrics[activeEndpoint.url] && (
            <div className="endpoint-metrics">
              <div>
                <span>Latency: </span>
                <span>{formatLatency(metrics[activeEndpoint.url].latency)}</span>
              </div>
              <div>
                <span>Reliability: </span>
                <span>{formatReliability(metrics[activeEndpoint.url].reliability)}</span>
              </div>
              <div>
                <span>Congestion: </span>
                <span style={{ color: getCongestionColor(metrics[activeEndpoint.url].congestion) }}>
                  {formatCongestion(metrics[activeEndpoint.url].congestion)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Endpoint Switcher

```tsx
import { useNetworkMonitoring } from "@/hooks/useNetworkMonitoring";

function EndpointSwitcher() {
  const { 
    endpoints, 
    activeEndpoint,
    metrics,
    switchEndpoint,
    switchToBestEndpoint,
    formatLatency,
    isAutoSwitchEnabled,
    toggleAutoSwitch
  } = useNetworkMonitoring();
  
  return (
    <div>
      <h2>RPC Endpoints</h2>
      
      <div className="auto-switch">
        <label>
          <input
            type="checkbox"
            checked={isAutoSwitchEnabled}
            onChange={toggleAutoSwitch}
          />
          Auto-switch to best endpoint
        </label>
        
        {!isAutoSwitchEnabled && (
          <button onClick={switchToBestEndpoint}>
            Switch to Best Endpoint
          </button>
        )}
      </div>
      
      <div className="endpoints-list">
        {endpoints.map(endpoint => (
          <div 
            key={endpoint.url}
            className={`endpoint-item ${endpoint.url === activeEndpoint?.url ? 'active' : ''}`}
          >
            <div className="endpoint-header">
              <div className="endpoint-name">{endpoint.name}</div>
              {endpoint.isCustom && <span className="custom-badge">Custom</span>}
            </div>
            
            <div className="endpoint-url">{endpoint.url}</div>
            
            {metrics[endpoint.url] ? (
              <div className="endpoint-metrics">
                <div>Latency: {formatLatency(metrics[endpoint.url].latency)}</div>
              </div>
            ) : (
              <div className="no-metrics">No metrics available</div>
            )}
            
            {endpoint.url !== activeEndpoint?.url && (
              <button onClick={() => switchEndpoint(endpoint.url)}>
                Use This Endpoint
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Custom Endpoint Management

```tsx
import { useNetworkMonitoring } from "@/hooks/useNetworkMonitoring";
import { useState } from "react";
import { NetworkType } from "@/components/NetworkContextProvider";

function CustomEndpointManager() {
  const { 
    endpoints, 
    addCustomEndpoint, 
    removeCustomEndpoint,
    getEndpointsForCurrentNetwork
  } = useNetworkMonitoring();
  
  const [newEndpoint, setNewEndpoint] = useState({
    name: "",
    url: "",
    priority: 1
  });
  
  const handleAddEndpoint = () => {
    if (!newEndpoint.name || !newEndpoint.url) return;
    
    // Get current network from the first endpoint
    const currentEndpoints = getEndpointsForCurrentNetwork();
    const network = currentEndpoints.length > 0 
      ? currentEndpoints[0].network 
      : "mainnet-beta" as NetworkType;
    
    addCustomEndpoint({
      name: newEndpoint.name,
      url: newEndpoint.url,
      network,
      priority: newEndpoint.priority,
      weight: 1,
      isCustom: true
    });
    
    // Reset form
    setNewEndpoint({
      name: "",
      url: "",
      priority: 1
    });
  };
  
  // Filter to show only custom endpoints
  const customEndpoints = endpoints.filter(e => e.isCustom);
  
  return (
    <div>
      <h2>Custom Endpoints</h2>
      
      <div className="add-endpoint-form">
        <h3>Add New Endpoint</h3>
        <div>
          <label>
            Name:
            <input
              value={newEndpoint.name}
              onChange={e => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
              placeholder="My Custom RPC"
            />
          </label>
        </div>
        <div>
          <label>
            URL:
            <input
              value={newEndpoint.url}
              onChange={e => setNewEndpoint({ ...newEndpoint, url: e.target.value })}
              placeholder="https://my-rpc.example.com"
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
      
      <div className="custom-endpoints-list">
        <h3>Your Custom Endpoints</h3>
        {customEndpoints.length === 0 ? (
          <div>No custom endpoints added yet.</div>
        ) : (
          <ul>
            {customEndpoints.map(endpoint => (
              <li key={endpoint.url} className="custom-endpoint-item">
                <div className="endpoint-name">{endpoint.name}</div>
                <div className="endpoint-url">{endpoint.url}</div>
                <div className="endpoint-priority">Priority: {endpoint.priority}</div>
                <button 
                  onClick={() => removeCustomEndpoint(endpoint.url)}
                  className="remove-button"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

### Network Health Monitor

```tsx
import { useNetworkMonitoring } from "@/hooks/useNetworkMonitoring";
import { useEffect, useState } from "react";

function NetworkHealthMonitor() {
  const { 
    metrics, 
    getNetworkHealth,
    formatTPS,
    formatCongestion,
    getCongestionColor
  } = useNetworkMonitoring();
  
  const [averageMetrics, setAverageMetrics] = useState({
    latency: 0,
    reliability: 0,
    tps: 0,
    congestion: 0
  });
  
  // Calculate average metrics
  useEffect(() => {
    if (Object.keys(metrics).length === 0) return;
    
    const values = Object.values(metrics);
    const avgLatency = values.reduce((sum, m) => sum + m.latency, 0) / values.length;
    const avgReliability = values.reduce((sum, m) => sum + m.reliability, 0) / values.length;
    const avgTps = values.reduce((sum, m) => sum + m.tps, 0) / values.length;
    const avgCongestion = values.reduce((sum, m) => sum + m.congestion, 0) / values.length;
    
    setAverageMetrics({
      latency: avgLatency,
      reliability: avgReliability,
      tps: avgTps,
      congestion: avgCongestion
    });
  }, [metrics]);
  
  // Get network health
  const health = getNetworkHealth();
  
  return (
    <div>
      <h2>Network Health Monitor</h2>
      
      <div className="health-status" style={{ backgroundColor: health.color }}>
        <h3>Network Status: {health.status}</h3>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <h4>Transaction Throughput</h4>
          <div className="metric-value">{formatTPS(averageMetrics.tps)}</div>
        </div>
        
        <div className="metric-card">
          <h4>Network Congestion</h4>
          <div 
            className="metric-value"
            style={{ color: getCongestionColor(averageMetrics.congestion) }}
          >
            {formatCongestion(averageMetrics.congestion)}
          </div>
        </div>
        
        <div className="metric-card">
          <h4>Average Latency</h4>
          <div className="metric-value">
            {averageMetrics.latency.toFixed(0)} ms
          </div>
        </div>
        
        <div className="metric-card">
          <h4>Network Reliability</h4>
          <div className="metric-value">
            {(averageMetrics.reliability * 100).toFixed(1)}%
          </div>
        </div>
      </div>
      
      <div className="health-advice">
        {health.status === "Healthy" && (
          <p>The network is operating normally. Transactions should process quickly.</p>
        )}
        {health.status === "Degraded" && (
          <p>The network is experiencing some congestion. Transactions may take longer to process.</p>
        )}
        {health.status === "Congested" && (
          <p>The network is heavily congested. Consider increasing transaction fees or waiting for network conditions to improve.</p>
        )}
      </div>
    </div>
  );
}
```

### Integration with Transaction Hook

```tsx
import { useNetworkMonitoring } from "@/hooks/useNetworkMonitoring";
import { useTransaction } from "@/hooks/useTransaction";
import { useState } from "react";

function NetworkAwareTransaction() {
  const { 
    activeEndpoint, 
    getNetworkHealth,
    switchToBestEndpoint
  } = useNetworkMonitoring();
  const { sendAndConfirmTransaction } = useTransaction();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleTransaction = async () => {
    setIsLoading(true);
    
    // Check network health before sending
    const health = getNetworkHealth();
    
    // If network is congested, suggest switching endpoints
    if (health.status === "Congested") {
      const switched = switchToBestEndpoint();
      
      if (switched) {
        alert("Network is congested. Switched to a better endpoint.");
      } else {
        alert("Network is congested. Consider trying again later.");
      }
    }
    
    // Create transaction instructions
    const instructions = [...]; // Your transaction instructions
    
    try {
      // Send transaction with network context
      const signature = await sendAndConfirmTransaction(instructions, {
        metadata: {
          endpoint: activeEndpoint?.url,
          networkHealth: health.status
        }
      });
      
      if (signature) {
        console.log("Transaction sent:", signature);
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      
      // If transaction failed due to network issues, try switching endpoints
      if (error.message.includes("timeout") || error.message.includes("network")) {
        const switched = switchToBestEndpoint();
        
        if (switched) {
          alert("Network error detected. Switched to a better endpoint. Please try again.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={handleTransaction} disabled={isLoading}>
        {isLoading ? "Processing..." : "Send Transaction"}
      </button>
      
      {activeEndpoint && (
        <div className="endpoint-info">
          Using endpoint: {activeEndpoint.name}
        </div>
      )}
    </div>
  );
}
```

## Integration with Other Hooks

The `useNetworkMonitoring` hook integrates with several other hooks in the Goldium platform:

- **useTransaction**: Provides network context for transactions
- **useCache**: Uses network performance data for cache invalidation strategies
- **useSecurity**: Uses network reliability data for risk assessment
- **useErrorMonitoring**: Provides context for network-related errors

## Best Practices

1. **Enable auto-switching**: Allow the service to automatically switch to the best endpoint
2. **Monitor network health**: Regularly check network health status and alert users of issues
3. **Add fallback endpoints**: Configure multiple endpoints for each network for redundancy
4. **Customize for your needs**: Add custom endpoints that work well for your specific use case
5. **Handle endpoint switching**: Be prepared to handle connection changes when endpoints switch
6. **Respect rate limits**: Be mindful of rate limits when monitoring multiple endpoints
7. **Provide user feedback**: Inform users of network status and endpoint changes
