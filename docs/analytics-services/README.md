# Goldium DeFi Platform Analytics Services

## Overview

The analytics services of the Goldium DeFi platform provide comprehensive tracking and analysis of user interactions, performance metrics, and conversion funnels. These services enable data-driven decision making while respecting user privacy through configurable anonymization options.

## Available Analytics Services

### Event Tracking Service

- [**Event Tracking**](./event-tracking.md): Captures user interactions and system events for analysis, with support for categorization, labeling, and metadata.

### Performance Metrics Service

- [**Performance Metrics**](./performance-metrics.md): Collects and analyzes performance data such as page load times, transaction processing times, and API response times.

### Funnel Analysis Service

- [**Funnel Analysis**](./funnel-analysis.md): Tracks multi-step operations to identify abandonment points and optimize conversion rates.

## Analytics Architecture

The analytics services work together to provide a comprehensive analytics solution:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Analytics Services                         │
│                                                                 │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐    │
│  │   Event     │       │ Performance │       │   Funnel    │    │
│  │  Tracking   │       │   Metrics   │       │  Analysis   │    │
│  └──────┬──────┘       └──────┬──────┘       └──────┬──────┘    │
│         │                     │                     │           │
│         │                     │                     │           │
│         ▼                     ▼                     ▼           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Analytics Storage                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Analytics Dashboard                     │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Analytics Configuration

The analytics services can be configured to respect user privacy and optimize performance:

```typescript
export interface AnalyticsConfig {
  enabled: boolean;           // Whether analytics is enabled
  anonymizeIp: boolean;       // Whether to anonymize IP addresses
  trackWalletAddresses: boolean; // Whether to track wallet addresses
  sessionTimeout: number;     // Session timeout in milliseconds
  samplingRate: number;       // Sampling rate (0-1)
}
```

## Integration Examples

### Basic Event Tracking

```typescript
import { getAnalyticsService, EventCategory, EventAction } from "@/services/analytics";

// Initialize the service with privacy-focused configuration
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

### Performance Tracking

```typescript
import { getAnalyticsService } from "@/services/analytics";

// Initialize the service
const analyticsService = getAnalyticsService();

// Track API response time
const trackApiPerformance = async (url, params) => {
  const startTime = performance.now();
  
  try {
    // Make API call
    const response = await fetch(url, params);
    const data = await response.json();
    
    // Calculate response time
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    // Track performance metric
    analyticsService.trackPerformanceMetric({
      name: "api_response_time",
      value: responseTime,
      unit: "ms",
      metadata: {
        endpoint: url,
        status: response.status
      }
    });
    
    return data;
  } catch (error) {
    // Track error
    analyticsService.trackEvent({
      category: EventCategory.ERROR,
      action: EventAction.API_ERROR,
      label: url,
      metadata: {
        error: error.message
      }
    });
    
    throw error;
  }
};

// Track transaction processing time
const trackTransactionPerformance = async (transaction) => {
  const startTime = performance.now();
  
  try {
    // Send transaction
    const signature = await sendTransaction(transaction);
    
    // Wait for confirmation
    await connection.confirmTransaction(signature);
    
    // Calculate processing time
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    // Track performance metric
    analyticsService.trackPerformanceMetric({
      name: "transaction_processing_time",
      value: processingTime,
      unit: "ms",
      metadata: {
        signature,
        network: "mainnet-beta"
      }
    });
    
    return signature;
  } catch (error) {
    // Track error
    analyticsService.trackEvent({
      category: EventCategory.ERROR,
      action: EventAction.TRANSACTION_ERROR,
      label: "Transaction Processing",
      metadata: {
        error: error.message
      }
    });
    
    throw error;
  }
};
```

### Funnel Tracking

```typescript
import { getAnalyticsService } from "@/services/analytics";

// Initialize the service
const analyticsService = getAnalyticsService();

// Track a swap funnel
const trackSwapFunnel = () => {
  const funnelId = "token-swap";
  const startTime = Date.now();
  let currentStep = 1;
  
  // Track first step (started)
  analyticsService.trackFunnelStep({
    funnelId,
    stepNumber: currentStep,
    stepName: "Select Tokens",
    completed: false
  });
  
  return {
    // Track token selection step
    completeTokenSelection: (fromToken, toToken) => {
      const timeSpent = Date.now() - startTime;
      
      analyticsService.trackFunnelStep({
        funnelId,
        stepNumber: currentStep,
        stepName: "Select Tokens",
        completed: true,
        timeSpent,
        metadata: {
          fromToken,
          toToken
        }
      });
      
      currentStep++;
      
      // Track next step (started)
      analyticsService.trackFunnelStep({
        funnelId,
        stepNumber: currentStep,
        stepName: "Enter Amount",
        completed: false
      });
    },
    
    // Track amount entry step
    completeAmountEntry: (amount, value) => {
      const timeSpent = Date.now() - startTime;
      
      analyticsService.trackFunnelStep({
        funnelId,
        stepNumber: currentStep,
        stepName: "Enter Amount",
        completed: true,
        timeSpent,
        metadata: {
          amount,
          value
        }
      });
      
      currentStep++;
      
      // Track next step (started)
      analyticsService.trackFunnelStep({
        funnelId,
        stepNumber: currentStep,
        stepName: "Review and Confirm",
        completed: false
      });
    },
    
    // Track confirmation step
    completeConfirmation: (signature) => {
      const timeSpent = Date.now() - startTime;
      
      analyticsService.trackFunnelStep({
        funnelId,
        stepNumber: currentStep,
        stepName: "Review and Confirm",
        completed: true,
        timeSpent,
        metadata: {
          signature
        }
      });
      
      // Track funnel completion
      analyticsService.trackEvent({
        category: EventCategory.FUNNEL,
        action: EventAction.FUNNEL_COMPLETE,
        label: funnelId,
        value: timeSpent,
        metadata: {
          steps: currentStep,
          totalTime: timeSpent
        }
      });
    },
    
    // Track funnel abandonment
    abandonFunnel: (reason) => {
      const timeSpent = Date.now() - startTime;
      
      analyticsService.trackFunnelStep({
        funnelId,
        stepNumber: currentStep,
        stepName: currentStep === 1 ? "Select Tokens" : currentStep === 2 ? "Enter Amount" : "Review and Confirm",
        completed: false,
        timeSpent,
        metadata: {
          reason
        }
      });
      
      // Track funnel abandonment
      analyticsService.trackEvent({
        category: EventCategory.FUNNEL,
        action: EventAction.FUNNEL_ABANDON,
        label: funnelId,
        value: currentStep,
        metadata: {
          step: currentStep,
          reason,
          timeSpent
        }
      });
    }
  };
};
```

### Analytics Dashboard Data

```typescript
import { getAnalyticsService, EventCategory } from "@/services/analytics";

// Initialize the service
const analyticsService = getAnalyticsService();

// Get analytics data for dashboard
const getAnalyticsDashboardData = () => {
  // Get all events
  const allEvents = analyticsService.getEvents();
  
  // Get transaction events
  const transactionEvents = analyticsService.getEventsByCategory(EventCategory.TRANSACTION);
  
  // Get performance metrics
  const performanceMetrics = analyticsService.getPerformanceMetrics();
  
  // Get funnel steps
  const funnelSteps = analyticsService.getFunnelSteps();
  
  // Calculate funnel completion rates
  const funnelIds = [...new Set(funnelSteps.map(step => step.funnelId))];
  const funnelCompletionRates = {};
  
  for (const funnelId of funnelIds) {
    funnelCompletionRates[funnelId] = analyticsService.getFunnelCompletionRate(funnelId);
  }
  
  // Calculate average performance metrics
  const avgPerformanceMetrics = {};
  
  for (const metric of performanceMetrics) {
    if (!avgPerformanceMetrics[metric.name]) {
      avgPerformanceMetrics[metric.name] = {
        values: [],
        unit: metric.unit
      };
    }
    
    avgPerformanceMetrics[metric.name].values.push(metric.value);
  }
  
  for (const [name, data] of Object.entries(avgPerformanceMetrics)) {
    avgPerformanceMetrics[name].average = 
      data.values.reduce((sum, value) => sum + value, 0) / data.values.length;
  }
  
  return {
    eventCount: allEvents.length,
    transactionCount: transactionEvents.length,
    performanceMetrics: avgPerformanceMetrics,
    funnelCompletionRates
  };
};
```

## Analytics Best Practices

1. **Respect user privacy**: Use anonymization options and be transparent about data collection.
2. **Track meaningful events**: Focus on events that provide actionable insights.
3. **Use consistent naming**: Maintain consistent naming conventions for events and metrics.
4. **Add context**: Include relevant metadata with events for better analysis.
5. **Track funnels**: Use funnel tracking for multi-step processes to identify drop-off points.
6. **Monitor performance**: Track performance metrics to identify bottlenecks.
7. **Analyze data**: Regularly review analytics data to inform product decisions.
8. **Optimize sampling**: Use sampling for high-volume events to reduce storage requirements.

## Further Reading

For detailed information about each analytics service, including API reference and usage examples, see the individual service documentation:

- [Event Tracking](./event-tracking.md)
- [Performance Metrics](./performance-metrics.md)
- [Funnel Analysis](./funnel-analysis.md)
