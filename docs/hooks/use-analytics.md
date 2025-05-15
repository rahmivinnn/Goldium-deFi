# useAnalytics Hook

## Overview

The `useAnalytics` hook provides a React interface to the Goldium platform's analytics service, enabling components to track user interactions, performance metrics, and conversion funnels. It simplifies the process of collecting analytics data while respecting user privacy through configurable settings.

## Key Features

- **Event Tracking**: Track user interactions and system events
- **Performance Metrics**: Collect and analyze performance data
- **Funnel Analysis**: Track multi-step operations to identify abandonment points
- **Transaction Tracking**: Track transaction events throughout their lifecycle
- **Network Awareness**: Automatically includes network context in analytics data
- **Wallet Integration**: Optionally includes wallet addresses in analytics data
- **Privacy Controls**: Configurable anonymization and data collection options
- **Data Access**: Access collected analytics data for display and analysis

## Installation

The `useAnalytics` hook is included in the Goldium DeFi platform. To use it, import it in your component:

```typescript
import { useAnalytics } from "@/hooks/useAnalytics";
```

## API Reference

### Hook Return Value

The `useAnalytics` hook returns an object with the following properties and methods:

#### State

##### `isEnabled`

Whether analytics tracking is enabled:

```typescript
isEnabled: boolean
```

#### Event Tracking

##### `trackPageView`

Tracks a page view:

```typescript
trackPageView(path: string, title?: string): void
```

**Parameters:**
- `path`: The page path
- `title`: Optional page title

##### `trackEvent`

Tracks a custom event:

```typescript
trackEvent(params: {
  category: EventCategory;
  action: EventAction;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}): void
```

**Parameters:**
- `params`: Event parameters object

##### `trackButtonClick`

Tracks a button click:

```typescript
trackButtonClick(buttonName: string, metadata?: Record<string, any>): void
```

**Parameters:**
- `buttonName`: The name of the button
- `metadata`: Optional additional data

##### `trackFormSubmit`

Tracks a form submission:

```typescript
trackFormSubmit(formName: string, metadata?: Record<string, any>): void
```

**Parameters:**
- `formName`: The name of the form
- `metadata`: Optional additional data

##### `trackTransaction`

Tracks a transaction event:

```typescript
trackTransaction(params: {
  type: TransactionType;
  action: 'initiated' | 'completed' | 'failed';
  transactionSignature?: string;
  amount?: number;
  token?: string;
  metadata?: Record<string, any>;
}): void
```

**Parameters:**
- `params`: Transaction parameters object

#### Performance Tracking

##### `trackPerformanceMetric`

Tracks a performance metric:

```typescript
trackPerformanceMetric(params: {
  name: string;
  value: number;
  unit: string;
  metadata?: Record<string, any>;
}): void
```

**Parameters:**
- `params`: Performance metric parameters object

#### Funnel Tracking

##### `trackFunnelStep`

Tracks a step in a conversion funnel:

```typescript
trackFunnelStep(params: {
  funnelId: string;
  stepNumber: number;
  stepName: string;
  completed: boolean;
  timeSpent?: number;
  metadata?: Record<string, any>;
}): void
```

**Parameters:**
- `params`: Funnel step parameters object

##### `startFunnelTracking`

Starts tracking a conversion funnel:

```typescript
startFunnelTracking(funnelId: string, funnelName: string): {
  trackStep: (stepNumber: number, stepName: string, completed?: boolean, timeSpent?: number) => void;
  completeFunnel: (timeSpent?: number) => void;
  abandonFunnel: (reason?: string) => void;
}
```

**Parameters:**
- `funnelId`: Unique identifier for the funnel
- `funnelName`: Display name for the funnel

**Returns:** An object with methods for tracking the funnel

#### Data Access

##### `getEvents`

Gets all tracked events:

```typescript
getEvents(): EventData[]
```

**Returns:** An array of all tracked `EventData` objects

##### `getEventsByCategory`

Gets events by category:

```typescript
getEventsByCategory(category: EventCategory): EventData[]
```

**Parameters:**
- `category`: The event category to filter by

**Returns:** An array of `EventData` objects of the specified category

##### `getEventsByAction`

Gets events by action:

```typescript
getEventsByAction(action: EventAction): EventData[]
```

**Parameters:**
- `action`: The event action to filter by

**Returns:** An array of `EventData` objects with the specified action

##### `getPerformanceMetrics`

Gets all performance metrics:

```typescript
getPerformanceMetrics(): PerformanceMetricData[]
```

**Returns:** An array of all `PerformanceMetricData` objects

##### `getFunnelSteps`

Gets all funnel steps:

```typescript
getFunnelSteps(): FunnelStepData[]
```

**Returns:** An array of all `FunnelStepData` objects

##### `getFunnelCompletionRate`

Gets the completion rate for a funnel:

```typescript
getFunnelCompletionRate(funnelId: string): number
```

**Parameters:**
- `funnelId`: The funnel ID

**Returns:** The completion rate as a number between 0 and 1

#### Configuration

##### `enableAnalytics`

Enables analytics tracking:

```typescript
enableAnalytics(): void
```

##### `disableAnalytics`

Disables analytics tracking:

```typescript
disableAnalytics(): void
```

##### `updateAnalyticsConfig`

Updates the analytics configuration:

```typescript
updateAnalyticsConfig(config: Partial<AnalyticsConfig>): void
```

**Parameters:**
- `config`: Partial configuration object to update

##### `clearAnalyticsData`

Clears all analytics data:

```typescript
clearAnalyticsData(): void
```

## Usage Examples

### Basic Event Tracking

```tsx
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect } from "react";

function AnalyticsComponent() {
  const { trackPageView, trackButtonClick, isEnabled } = useAnalytics();
  
  // Track page view on mount
  useEffect(() => {
    if (isEnabled) {
      trackPageView("/dashboard", "Dashboard Page");
    }
  }, [isEnabled, trackPageView]);
  
  const handleButtonClick = () => {
    // Track button click
    trackButtonClick("Refresh Data", {
      location: "Dashboard",
      section: "Portfolio Summary"
    });
    
    // Perform action...
  };
  
  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={handleButtonClick}>Refresh Data</button>
    </div>
  );
}
```

### Transaction Tracking

```tsx
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTransaction } from "@/hooks/useTransaction";
import { useState } from "react";

function SwapComponent() {
  const { trackTransaction } = useAnalytics();
  const { sendAndConfirmTransaction } = useTransaction();
  const [amount, setAmount] = useState(0);
  const [fromToken, setFromToken] = useState("USDC");
  const [toToken, setToToken] = useState("SOL");
  
  const handleSwap = async () => {
    // Track transaction initiated
    trackTransaction({
      type: "swap",
      action: "initiated",
      amount,
      token: fromToken,
      metadata: {
        fromToken,
        toToken,
        slippage: 0.5
      }
    });
    
    try {
      // Create transaction instructions
      const instructions = [...]; // Your swap instructions
      
      // Send transaction
      const signature = await sendAndConfirmTransaction(instructions);
      
      if (signature) {
        // Track transaction completed
        trackTransaction({
          type: "swap",
          action: "completed",
          transactionSignature: signature,
          amount,
          token: fromToken,
          metadata: {
            fromToken,
            toToken,
            slippage: 0.5
          }
        });
      }
    } catch (error) {
      // Track transaction failed
      trackTransaction({
        type: "swap",
        action: "failed",
        amount,
        token: fromToken,
        metadata: {
          fromToken,
          toToken,
          slippage: 0.5,
          error: error.message
        }
      });
    }
  };
  
  return (
    <div>
      <h2>Swap Tokens</h2>
      {/* Swap form UI */}
      <button onClick={handleSwap}>Swap</button>
    </div>
  );
}
```

### Funnel Tracking

```tsx
import { useAnalytics } from "@/hooks/useAnalytics";
import { useState, useEffect } from "react";

function StakingWizard() {
  const { startFunnelTracking } = useAnalytics();
  const [step, setStep] = useState(1);
  const [startTime, setStartTime] = useState(Date.now());
  const [amount, setAmount] = useState(0);
  const [duration, setDuration] = useState(30);
  
  // Initialize funnel tracking
  const funnelTracker = startFunnelTracking("staking-wizard", "Token Staking Flow");
  
  // Track initial step on mount
  useEffect(() => {
    funnelTracker.trackStep(1, "Select Amount", false);
  }, []);
  
  const handleNextStep = () => {
    // Track current step completion
    const timeSpent = Date.now() - startTime;
    funnelTracker.trackStep(step, getStepName(step), true, timeSpent);
    
    // Move to next step
    setStep(step + 1);
    setStartTime(Date.now());
    
    // Track next step started
    funnelTracker.trackStep(step + 1, getStepName(step + 1), false);
  };
  
  const handlePreviousStep = () => {
    // Track current step abandonment
    const timeSpent = Date.now() - startTime;
    funnelTracker.trackStep(step, getStepName(step), false, timeSpent);
    
    // Move to previous step
    setStep(step - 1);
    setStartTime(Date.now());
  };
  
  const handleComplete = () => {
    // Track final step
    const timeSpent = Date.now() - startTime;
    funnelTracker.trackStep(step, getStepName(step), true, timeSpent);
    
    // Complete the funnel
    funnelTracker.completeFunnel();
    
    // Perform staking action...
  };
  
  const handleCancel = () => {
    // Abandon the funnel
    funnelTracker.abandonFunnel("User cancelled");
  };
  
  const getStepName = (stepNumber) => {
    switch (stepNumber) {
      case 1: return "Select Amount";
      case 2: return "Choose Duration";
      case 3: return "Review and Confirm";
      default: return `Step ${stepNumber}`;
    }
  };
  
  return (
    <div>
      <h2>Stake Tokens - Step {step}</h2>
      
      {step === 1 && (
        <div>
          <h3>Select Amount</h3>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min="0"
          />
          <button onClick={handleNextStep}>Next</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      )}
      
      {step === 2 && (
        <div>
          <h3>Choose Duration</h3>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
          <button onClick={handlePreviousStep}>Back</button>
          <button onClick={handleNextStep}>Next</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      )}
      
      {step === 3 && (
        <div>
          <h3>Review and Confirm</h3>
          <div>Amount: {amount}</div>
          <div>Duration: {duration} days</div>
          <button onClick={handlePreviousStep}>Back</button>
          <button onClick={handleComplete}>Confirm Stake</button>
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

function PerformanceAwareComponent() {
  const { trackPerformanceMetric } = useAnalytics();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchData = async () => {
    setIsLoading(true);
    const startTime = performance.now();
    
    try {
      // Fetch data from API
      const response = await fetch("https://api.example.com/data");
      const result = await response.json();
      
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
      
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Track component render time
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      trackPerformanceMetric({
        name: "component_render_time",
        value: renderTime,
        unit: "ms",
        metadata: {
          component: "PerformanceAwareComponent"
        }
      });
    };
  }, [trackPerformanceMetric]);
  
  return (
    <div>
      <button onClick={fetchData} disabled={isLoading}>
        {isLoading ? "Loading..." : "Fetch Data"}
      </button>
      
      {data && (
        <div>
          {/* Render data */}
        </div>
      )}
    </div>
  );
}
```

### Analytics Dashboard

```tsx
import { useAnalytics } from "@/hooks/useAnalytics";
import { useState, useEffect } from "react";
import { EventCategory } from "@/services/analytics";

function AnalyticsDashboard() {
  const { 
    getEvents, 
    getEventsByCategory, 
    getPerformanceMetrics,
    getFunnelSteps,
    getFunnelCompletionRate,
    enableAnalytics,
    disableAnalytics,
    isEnabled
  } = useAnalytics();
  
  const [events, setEvents] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [funnelRates, setFunnelRates] = useState({});
  
  // Load data
  useEffect(() => {
    // Get transaction events
    const transactionEvents = getEventsByCategory(EventCategory.TRANSACTION);
    setEvents(transactionEvents);
    
    // Get performance metrics
    const performanceMetrics = getPerformanceMetrics();
    setMetrics(performanceMetrics);
    
    // Get funnel completion rates
    const funnelSteps = getFunnelSteps();
    const funnelIds = [...new Set(funnelSteps.map(step => step.funnelId))];
    
    const rates = {};
    funnelIds.forEach(id => {
      rates[id] = getFunnelCompletionRate(id);
    });
    
    setFunnelRates(rates);
  }, [
    getEventsByCategory, 
    getPerformanceMetrics, 
    getFunnelSteps, 
    getFunnelCompletionRate
  ]);
  
  return (
    <div>
      <h2>Analytics Dashboard</h2>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => e.target.checked ? enableAnalytics() : disableAnalytics()}
          />
          Enable Analytics
        </label>
      </div>
      
      <div>
        <h3>Transaction Events</h3>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Token</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td>{new Date(event.timestamp).toLocaleString()}</td>
                <td>{event.action}</td>
                <td>{event.metadata?.token || "-"}</td>
                <td>{event.value || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div>
        <h3>Performance Metrics</h3>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Average</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(
              metrics.reduce((acc, metric) => {
                if (!acc[metric.name]) {
                  acc[metric.name] = {
                    values: [],
                    unit: metric.unit
                  };
                }
                acc[metric.name].values.push(metric.value);
                return acc;
              }, {})
            ).map(([name, { values, unit }]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>
                  {(values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2)}
                </td>
                <td>{unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div>
        <h3>Funnel Completion Rates</h3>
        <table>
          <thead>
            <tr>
              <th>Funnel</th>
              <th>Completion Rate</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(funnelRates).map(([id, rate]) => (
              <tr key={id}>
                <td>{id}</td>
                <td>{(rate * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## Integration with Other Hooks

The `useAnalytics` hook integrates with several other hooks in the Goldium platform:

- **useTransaction**: Tracks transaction events
- **useNetwork**: Includes network context in analytics data
- **useWallet**: Optionally includes wallet addresses in analytics data
- **useErrorMonitoring**: Tracks error events

## Best Practices

1. **Respect user privacy**: Use anonymization options and be transparent about data collection
2. **Track meaningful events**: Focus on events that provide actionable insights
3. **Use consistent naming**: Maintain consistent naming conventions for events and metrics
4. **Add context**: Include relevant metadata with events for better analysis
5. **Track funnels**: Use funnel tracking for multi-step processes to identify drop-off points
6. **Monitor performance**: Track performance metrics to identify bottlenecks
7. **Check if enabled**: Always check `isEnabled` before tracking events to respect user preferences
