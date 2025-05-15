# Goldium DeFi Platform Core Services

## Overview

The core services of the Goldium DeFi platform provide the fundamental functionality that powers the application. These services handle transaction management, caching, error monitoring, and network monitoring, forming the backbone of the platform's infrastructure.

## Available Core Services

### Transaction Services

- [**Transaction Tracking Service**](./transaction-tracking.md): Tracks and monitors blockchain transactions throughout their lifecycle, maintaining a detailed history of transactions and their current status.

### Caching Services

- [**Caching Services**](./caching.md): Provides efficient data storage and retrieval mechanisms to reduce RPC calls and improve performance, including specialized caches for token prices, contract state, transaction simulation, and network responses.

### Error Monitoring Services

- [**Error Monitoring Service**](./error-monitoring.md): Captures, categorizes, and manages errors that occur within the application, providing user-friendly error messages and automatic retry strategies.

### Network Monitoring Services

- [**Network Monitoring Service**](./network-monitoring.md): Monitors RPC endpoint performance and enables automatic endpoint switching, ensuring optimal connectivity and performance.

## Service Architecture

The core services are designed to work together, with each service focusing on a specific aspect of the application:

```
┌─────────────────────────────────────────────────────────────────┐
│                       Service Layer                             │
│                                                                 │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐    │
│  │ Transaction ◄─────► │    Cache    │       │  Security   │    │
│  │  Services   │       │   Services  │       │  Services   │    │
│  └──────┬──────┘       └──────┬──────┘       └──────┬──────┘    │
│         │                     │                     │           │
│         │                     │                     │           │
│         │                     │                     │           │
│         │                     │                     │           │
│         └───────────►┌────────▼───────┐◄────────────┘           │
│                      │    Error      │                          │
│                      │   Services    │                          │
│                      └──────┬────────┘                          │
│                             │                                   │
│                      ┌──────▼────────┐                          │
│                      │   Network     │                          │
│                      │   Services    │                          │
│                      └───────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

## Service Integration

### Transaction Tracking Integration

The Transaction Tracking Service integrates with other services to provide a comprehensive transaction management solution:

```typescript
import { getTransactionTrackingService } from "@/services/transaction-tracking";
import { getErrorMonitoringService } from "@/services/error-monitoring";

// Initialize services
const trackingService = getTransactionTrackingService(connection, network);
const errorService = getErrorMonitoringService();

// Track a transaction
const txData = trackingService.trackTransaction(
  "5KKsWtSrFN7vgxJhVN6hQDgK9BzLez5un5QGNnbCxaVNWjkeke8L2oUQS6jZ9cXJFCdRa7ixiKDLaHJvQVciZuyi",
  "swap",
  {
    fromToken: "USDC",
    toToken: "SOL",
    fromAmount: 100,
    toAmount: 1.5
  }
);

// If transaction fails, log an error
if (txData.status === "failed") {
  errorService.logError(
    new Error(txData.errorMessage || "Transaction failed"),
    "transaction_error",
    "error",
    {
      transactionId: txData.id,
      transactionType: txData.type,
      signature: txData.signature
    }
  );
}
```

### Caching Integration

The Caching Services integrate with other services to provide efficient data access:

```typescript
import { getCacheService } from "@/services/cache";
import { getTokenPriceCacheService } from "@/services/token-price-cache";
import { getNetworkMonitoringService } from "@/services/network-monitoring";

// Initialize services
const tokenPriceCache = getTokenPriceCacheService(network);
const networkService = getNetworkMonitoringService();

// Get token price with network context
const getTokenPrice = async (mintAddress) => {
  // Get active endpoint
  const endpoint = networkService.getActiveEndpoint(network);
  
  // Use endpoint in cache key
  const cacheKey = `${endpoint?.url}:${mintAddress}`;
  
  // Check cache first
  const cachedPrice = tokenPriceCache.getTokenPrice(mintAddress);
  if (cachedPrice) {
    return cachedPrice;
  }
  
  // Fetch price if not in cache
  const price = await fetchTokenPrice(mintAddress);
  
  // Cache the price
  tokenPriceCache.cacheTokenPrice(mintAddress, price);
  
  return price;
};
```

### Error Monitoring Integration

The Error Monitoring Service integrates with other services to provide comprehensive error handling:

```typescript
import { getErrorMonitoringService } from "@/services/error-monitoring";
import { getNetworkMonitoringService } from "@/services/network-monitoring";

// Initialize services
const errorService = getErrorMonitoringService();
const networkService = getNetworkMonitoringService();

// Handle network errors with context
const handleNetworkOperation = async () => {
  try {
    // Some network operation
    await fetchData();
  } catch (error) {
    // Get active endpoint
    const endpoint = networkService.getActiveEndpoint(network);
    
    // Log error with network context
    const errorData = errorService.logError(
      error,
      "network_error",
      "error",
      {
        endpoint: endpoint?.url,
        network,
        metrics: networkService.getMetricsForEndpoint(endpoint?.url)
      }
    );
    
    // If error is due to endpoint, try switching
    if (error.message.includes("timeout") || error.message.includes("rate limit")) {
      const switched = networkService.switchToBestEndpoint(network);
      
      if (switched) {
        // Retry operation with new endpoint
        return await handleNetworkOperation();
      }
    }
    
    throw error;
  }
};
```

### Network Monitoring Integration

The Network Monitoring Service integrates with other services to provide optimal connectivity:

```typescript
import { getNetworkMonitoringService } from "@/services/network-monitoring";
import { getCacheService } from "@/services/cache";

// Initialize services
const networkService = getNetworkMonitoringService();
const networkResponseCache = getCacheService({ namespace: "network-response" });

// Fetch data with network awareness
const fetchDataWithNetworkAwareness = async (url, params) => {
  // Get active endpoint
  const endpoint = networkService.getActiveEndpoint(network);
  
  // Create cache key with endpoint context
  const cacheKey = `${endpoint?.url}:${url}:${JSON.stringify(params)}`;
  
  // Check cache first
  const cachedResponse = networkResponseCache.get(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Measure response time for network metrics
  const startTime = performance.now();
  
  try {
    // Fetch data
    const response = await fetch(url, params);
    const data = await response.json();
    
    // Calculate response time
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    // Update network metrics
    networkService.updateMetrics(endpoint?.url, {
      latency: responseTime,
      success: true
    });
    
    // Cache the response
    networkResponseCache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    // Update network metrics on failure
    networkService.updateMetrics(endpoint?.url, {
      success: false
    });
    
    // Try switching to a better endpoint
    const switched = networkService.switchToBestEndpoint(network);
    
    if (switched) {
      // Retry with new endpoint
      return await fetchDataWithNetworkAwareness(url, params);
    }
    
    throw error;
  }
};
```

## Best Practices

1. **Use singleton instances**: Use the provided factory functions to get singleton instances of services.
2. **Handle service dependencies**: Initialize services in the correct order to ensure dependencies are available.
3. **Provide context**: Include relevant context when logging errors or caching data.
4. **Use appropriate TTLs**: Set appropriate time-to-live values for cached data based on how frequently it changes.
5. **Handle network changes**: Be prepared to handle connection changes when endpoints switch.
6. **Respect rate limits**: Be mindful of rate limits when making RPC calls.
7. **Implement retry strategies**: Use appropriate retry strategies for transient errors.

## Further Reading

For detailed information about each service, including API reference and usage examples, see the individual service documentation:

- [Transaction Tracking Service](./transaction-tracking.md)
- [Caching Services](./caching.md)
- [Error Monitoring Service](./error-monitoring.md)
- [Network Monitoring Service](./network-monitoring.md)
