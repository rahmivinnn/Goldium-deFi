# Analytics Service

## Overview

The Analytics Service provides comprehensive tracking and analysis of user interactions, performance metrics, and conversion funnels within the Goldium DeFi platform. It enables data-driven decision making while respecting user privacy through configurable anonymization options.

## Key Features

- **Event Tracking**: Captures user interactions and system events
- **Performance Metrics**: Collects and analyzes performance data
- **Funnel Analysis**: Tracks multi-step operations to identify abandonment points
- **Privacy Controls**: Configurable anonymization and sampling options
- **Session Management**: Tracks user sessions with automatic timeout handling
- **Persistent Storage**: Stores analytics data in localStorage for continuity
- **Cross-Network Support**: Works across Mainnet, Testnet, and Devnet
- **Exportable Reports**: Allows exporting analytics data for external analysis

## Installation

The Analytics Service is included in the Goldium DeFi platform. To use it, import the service or the associated hook:

```typescript
// Import the service directly
import { 
  getAnalyticsService, 
  EventCategory, 
  EventAction 
} from "@/services/analytics";

// Or use the hook (recommended)
import { useAnalytics } from "@/hooks/useAnalytics";
```

## API Reference

### Enums

#### `EventCategory`

Categorizes the type of event:

```typescript
export enum EventCategory {
  TRANSACTION = 'transaction', // Transaction-related events
  USER_ACTION = 'user_action', // User interaction events
  SYSTEM = 'system',           // System events
  ERROR = 'error',             // Error events
  PERFORMANCE = 'performance', // Performance-related events
}
```

#### `EventAction`

Specifies the action that occurred:

```typescript
export enum EventAction {
  // Transaction events
  SWAP_INITIATED = 'swap_initiated',
  SWAP_COMPLETED = 'swap_completed',
  SWAP_FAILED = 'swap_failed',
  // ... more transaction events
  
  // User action events
  PAGE_VIEW = 'page_view',
  BUTTON_CLICK = 'button_click',
  FORM_SUBMIT = 'form_submit',
  WALLET_CONNECT = 'wallet_connect',
  // ... more user action events
  
  // System events
  APP_LOAD = 'app_load',
  APP_ERROR = 'app_error',
  NETWORK_ERROR = 'network_error',
  // ... more system events
  
  // Performance events
  PAGE_LOAD_TIME = 'page_load_time',
  TRANSACTION_TIME = 'transaction_time',
  API_RESPONSE_TIME = 'api_response_time',
  // ... more performance events
}
```

### Interfaces

#### `EventData`

Contains data about a tracked event:

```typescript
export interface EventData {
  id: string;                 // Unique identifier for the event
  timestamp: number;          // When the event occurred
  category: EventCategory;    // Category of the event
  action: EventAction;        // Specific action
  label?: string;             // Optional label for additional context
  value?: number;             // Optional numeric value
  network?: NetworkType;      // Network context
  walletAddress?: string;     // Associated wallet address (if tracking enabled)
  transactionSignature?: string; // Associated transaction signature
  metadata?: Record<string, any>; // Additional metadata
  sessionId: string;          // Session identifier
}
```

#### `PerformanceMetricData`

Contains performance measurement data:

```typescript
export interface PerformanceMetricData {
  id: string;                 // Unique identifier for the metric
  timestamp: number;          // When the metric was recorded
  name: string;               // Metric name
  value: number;              // Metric value
  unit: string;               // Unit of measurement
  network?: NetworkType;      // Network context
  walletAddress?: string;     // Associated wallet address (if tracking enabled)
  metadata?: Record<string, any>; // Additional metadata
  sessionId: string;          // Session identifier
}
```

#### `FunnelStepData`

Contains data about a step in a conversion funnel:

```typescript
export interface FunnelStepData {
  id: string;                 // Unique identifier for the step
  timestamp: number;          // When the step occurred
  funnelId: string;           // Identifier for the funnel
  stepNumber: number;         // Step number in the sequence
  stepName: string;           // Name of the step
  completed: boolean;         // Whether the step was completed
  timeSpent?: number;         // Time spent on this step
  network?: NetworkType;      // Network context
  walletAddress?: string;     // Associated wallet address (if tracking enabled)
  metadata?: Record<string, any>; // Additional metadata
  sessionId: string;          // Session identifier
}
```

#### `AnalyticsConfig`

Configuration options for the analytics service:

```typescript
export interface AnalyticsConfig {
  enabled: boolean;           // Whether analytics is enabled
  anonymizeIp: boolean;       // Whether to anonymize IP addresses
  trackWalletAddresses: boolean; // Whether to track wallet addresses
  sessionTimeout: number;     // Session timeout in milliseconds
  samplingRate: number;       // Sampling rate (0-1)
}
```

### Service Methods

#### `trackEvent`

Tracks an event:

```typescript
trackEvent(params: {
  category: EventCategory;
  action: EventAction;
  label?: string;
  value?: number;
  network?: NetworkType;
  walletAddress?: string;
  transactionSignature?: string;
  metadata?: Record<string, any>;
}): void
```

**Parameters:**
- `params`: Event parameters object

#### `trackPerformanceMetric`

Tracks a performance metric:

```typescript
trackPerformanceMetric(params: {
  name: string;
  value: number;
  unit: string;
  network?: NetworkType;
  walletAddress?: string;
  metadata?: Record<string, any>;
}): void
```

**Parameters:**
- `params`: Performance metric parameters object

#### `trackFunnelStep`

Tracks a step in a conversion funnel:

```typescript
trackFunnelStep(params: {
  funnelId: string;
  stepNumber: number;
  stepName: string;
  completed: boolean;
  timeSpent?: number;
  network?: NetworkType;
  walletAddress?: string;
  metadata?: Record<string, any>;
}): void
```

**Parameters:**
- `params`: Funnel step parameters object

#### `trackTransaction`

Tracks a transaction event:

```typescript
trackTransaction(params: {
  type: TransactionType;
  action: 'initiated' | 'completed' | 'failed';
  network: NetworkType;
  walletAddress?: string;
  transactionSignature?: string;
  amount?: number;
  token?: string;
  metadata?: Record<string, any>;
}): void
```

**Parameters:**
- `params`: Transaction parameters object

#### `getEvents`

Gets all tracked events:

```typescript
getEvents(): EventData[]
```

**Returns:** An array of all tracked `EventData` objects

#### `getEventsByCategory`

Gets events by category:

```typescript
getEventsByCategory(category: EventCategory): EventData[]
```

**Parameters:**
- `category`: The event category to filter by

**Returns:** An array of `EventData` objects of the specified category

#### `getEventsByAction`

Gets events by action:

```typescript
getEventsByAction(action: EventAction): EventData[]
```

**Parameters:**
- `action`: The event action to filter by

**Returns:** An array of `EventData` objects with the specified action

#### `getPerformanceMetrics`

Gets all performance metrics:

```typescript
getPerformanceMetrics(): PerformanceMetricData[]
```

**Returns:** An array of all `PerformanceMetricData` objects

#### `getFunnelSteps`

Gets all funnel steps:

```typescript
getFunnelSteps(): FunnelStepData[]
```

**Returns:** An array of all `FunnelStepData` objects

#### `getFunnelStepsByFunnelId`

Gets funnel steps by funnel ID:

```typescript
getFunnelStepsByFunnelId(funnelId: string): FunnelStepData[]
```

**Parameters:**
- `funnelId`: The funnel ID to filter by

**Returns:** An array of `FunnelStepData` objects for the specified funnel

#### `getFunnelCompletionRate`

Gets the completion rate for a funnel:

```typescript
getFunnelCompletionRate(funnelId: string): number
```

**Parameters:**
- `funnelId`: The funnel ID

**Returns:** The completion rate as a number between 0 and 1

#### `clearData`

Clears all analytics data:

```typescript
clearData(): void
```

#### `updateConfig`

Updates the analytics configuration:

```typescript
updateConfig(config: Partial<AnalyticsConfig>): void
```

**Parameters:**
- `config`: Partial configuration object to update

### useAnalytics Hook

The `useAnalytics` hook provides a convenient interface to the Analytics Service:

```typescript
function useAnalytics() {
  // State
  const isEnabled: boolean;
  
  // Event tracking
  const trackPageView: (path: string, title?: string) => void;
  const trackEvent: (params: {
    category: EventCategory;
    action: EventAction;
    label?: string;
    value?: number;
    metadata?: Record<string, any>;
  }) => void;
  const trackButtonClick: (buttonName: string, metadata?: Record<string, any>) => void;
  const trackFormSubmit: (formName: string, metadata?: Record<string, any>) => void;
  const trackTransaction: (params: {
    type: TransactionType;
    action: 'initiated' | 'completed' | 'failed';
    transactionSignature?: string;
    amount?: number;
    token?: string;
    metadata?: Record<string, any>;
  }) => void;
  
  // Performance tracking
  const trackPerformanceMetric: (params: {
    name: string;
    value: number;
    unit: string;
    metadata?: Record<string, any>;
  }) => void;
  
  // Funnel tracking
  const trackFunnelStep: (params: {
    funnelId: string;
    stepNumber: number;
    stepName: string;
    completed: boolean;
    timeSpent?: number;
    metadata?: Record<string, any>;
  }) => void;
  const startFunnelTracking: (funnelId: string, funnelName: string) => {
    trackStep: (stepNumber: number, stepName: string, completed?: boolean, timeSpent?: number) => void;
    completeFunnel: (timeSpent?: number) => void;
    abandonFunnel: (reason?: string) => void;
  };
  
  // Data access
  const getEvents: () => EventData[];
  const getEventsByCategory: (category: EventCategory) => EventData[];
  const getEventsByAction: (action: EventAction) => EventData[];
  const getPerformanceMetrics: () => PerformanceMetricData[];
  const getFunnelSteps: () => FunnelStepData[];
  const getFunnelCompletionRate: (funnelId: string) => number;
  
  // Configuration
  const enableAnalytics: () => void;
  const disableAnalytics: () => void;
  const updateAnalyticsConfig: (config: Partial<AnalyticsConfig>) => void;
  const clearAnalyticsData: () => void;
}
```

## Usage Examples

### Basic Event Tracking

```typescript
import { getAnalyticsService, EventCategory, EventAction } from "@/services/analytics";

// Initialize the service
const analyticsService = getAnalyticsService({
  anonymizeIp: true,
  trackWalletAddresses: false,
  samplingRate: 1.0
});

// Track a page view
analyticsService.trackEvent({
  category: EventCategory.USER_ACTION,
  action: EventAction.PAGE_VIEW,
  label: "Home Page",
});

// Track a button click
analyticsService.trackEvent({
  category: EventCategory.USER_ACTION,
  action: EventAction.BUTTON_CLICK,
  label: "Swap Button",
  metadata: {
    location: "Header",
    variant: "Primary"
  }
});

// Track a transaction
analyticsService.trackTransaction({
  type: "swap",
  action: "initiated",
  network: "mainnet-beta",
  amount: 100,
  token: "USDC",
  metadata: {
    fromToken: "USDC",
    toToken: "SOL",
    slippage: 0.5
  }
});
```

### Using the Hook

```tsx
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect } from "react";

function AnalyticsComponent() {
  const { 
    trackPageView, 
    trackButtonClick, 
    trackTransaction,
    isEnabled
  } = useAnalytics();
  
  // Track page view on mount
  useEffect(() => {
    if (isEnabled) {
      trackPageView("/swap", "Swap Page");
    }
  }, [isEnabled, trackPageView]);
  
  const handleSwapClick = () => {
    // Track button click
    trackButtonClick("Swap Execute", {
      fromToken: "USDC",
      toToken: "SOL",
      amount: 100
    });
    
    // Perform swap operation...
    
    // Track transaction
    trackTransaction({
      type: "swap",
      action: "initiated",
      amount: 100,
      token: "USDC",
      metadata: {
        fromToken: "USDC",
        toToken: "SOL",
        slippage: 0.5
      }
    });
  };
  
  return (
    <div>
      <button onClick={handleSwapClick}>Swap</button>
    </div>
  );
}
```

### Funnel Tracking

```tsx
import { useAnalytics } from "@/hooks/useAnalytics";
import { useState } from "react";

function SwapFunnelComponent() {
  const { startFunnelTracking } = useAnalytics();
  const [step, setStep] = useState(1);
  const [startTime, setStartTime] = useState(Date.now());
  
  // Initialize funnel tracking
  const funnelTracker = startFunnelTracking("swap-funnel", "Token Swap Flow");
  
  const handleNextStep = () => {
    // Track current step completion
    const timeSpent = Date.now() - startTime;
    funnelTracker.trackStep(step, `Swap Step ${step}`, true, timeSpent);
    
    // Move to next step
    setStep(step + 1);
    setStartTime(Date.now());
  };
  
  const handleComplete = () => {
    // Track final step
    const timeSpent = Date.now() - startTime;
    funnelTracker.trackStep(step, `Swap Step ${step}`, true, timeSpent);
    
    // Complete the funnel
    const totalTime = Date.now() - startTime;
    funnelTracker.completeFunnel(totalTime);
    
    // Reset
    setStep(1);
    setStartTime(Date.now());
  };
  
  const handleCancel = () => {
    // Abandon the funnel
    funnelTracker.abandonFunnel("User cancelled");
    
    // Reset
    setStep(1);
    setStartTime(Date.now());
  };
  
  return (
    <div>
      <h2>Swap Flow - Step {step}</h2>
      
      {step === 1 && (
        <div>
          <h3>Select Tokens</h3>
          {/* Token selection UI */}
          <button onClick={handleNextStep}>Next</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      )}
      
      {step === 2 && (
        <div>
          <h3>Enter Amount</h3>
          {/* Amount input UI */}
          <button onClick={handleNextStep}>Next</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      )}
      
      {step === 3 && (
        <div>
          <h3>Review and Confirm</h3>
          {/* Transaction review UI */}
          <button onClick={handleComplete}>Confirm Swap</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      )}
    </div>
  );
}
```

### Performance Tracking

```tsx
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect, useState } from "react";

function PerformanceTrackingComponent() {
  const { trackPerformanceMetric } = useAnalytics();
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchData = async () => {
    setIsLoading(true);
    const startTime = performance.now();
    
    try {
      // Fetch data from API
      const response = await fetch("https://api.example.com/data");
      const data = await response.json();
      
      // Calculate response time
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Track performance metric
      trackPerformanceMetric({
        name: "api_response_time",
        value: responseTime,
        unit: "ms",
        metadata: {
          endpoint: "https://api.example.com/data",
          status: response.status
        }
      });
      
      return data;
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={fetchData} disabled={isLoading}>
        {isLoading ? "Loading..." : "Fetch Data"}
      </button>
    </div>
  );
}
```

## Integration with Other Services

The Analytics Service integrates with several other services in the Goldium DeFi platform:

- **Transaction Service**: Tracks transaction events and performance
- **Error Monitoring Service**: Tracks error events for analysis
- **Network Monitoring Service**: Provides context for performance metrics
- **UI Components**: Integrates with UI components for event tracking

## Best Practices

1. **Respect user privacy**: Use anonymization options and be transparent about data collection
2. **Track meaningful events**: Focus on events that provide actionable insights
3. **Use consistent naming**: Maintain consistent naming conventions for events and metrics
4. **Add context**: Include relevant metadata with events for better analysis
5. **Track funnels**: Use funnel tracking for multi-step processes to identify drop-off points
6. **Monitor performance**: Track performance metrics to identify bottlenecks
7. **Analyze data**: Regularly review analytics data to inform product decisions
