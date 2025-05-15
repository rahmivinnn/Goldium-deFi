# Goldium DeFi Platform Hooks

## Overview

The Goldium DeFi platform provides a set of React hooks that serve as the interface between UI components and the underlying services. These hooks encapsulate complex logic and state management, making it easy to integrate advanced features into React components.

## Available Hooks

### Core Hooks

- [**useCache**](./use-cache.md): Provides access to caching services for token prices, contract state, transaction simulation, and network responses.
- [**useTransaction**](./use-transaction.md): Facilitates transaction creation, signing, sending, and confirmation with enhanced error handling and retry strategies.
- [**useTransactionTracking**](./use-transaction-tracking.md): Enables tracking and monitoring of transaction status throughout the transaction lifecycle.
- [**useErrorMonitoring**](./use-error-monitoring.md): Provides error logging, categorization, and user-friendly error messages.
- [**useNetworkMonitoring**](./use-network-monitoring.md): Monitors RPC endpoint performance and enables automatic endpoint switching.

### Security Hooks

- [**useSecurity**](./use-security.md): Provides transaction preview, approval, and anomaly detection capabilities.

### Analytics Hooks

- [**useAnalytics**](./use-analytics.md): Enables tracking of user interactions, performance metrics, and conversion funnels.

## Hook Integration Diagram

The hooks are designed to work together, with each hook focusing on a specific aspect of the application:

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Components                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                         Hook Layer                              │
│                                                                 │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐    │
│  │useTransaction◄─────►│  useCache   │       │ useSecurity │    │
│  └──────┬──────┘       └──────┬──────┘       └──────┬──────┘    │
│         │                     │                     │           │
│         │                     │                     │           │
│  ┌──────▼──────┐       ┌──────▼──────┐       ┌──────▼──────┐    │
│  │useTransaction◄─────►│useNetworkMon│       │useAnalytics │    │
│  │  Tracking   │       │   itoring   │       │             │    │
│  └──────┬──────┘       └──────┬──────┘       └──────┬──────┘    │
│         │                     │                     │           │
│         │                     │                     │           │
│         └───────────►┌────────▼───────┐◄────────────┘           │
│                      │useErrorMonitor │                         │
│                      │      ing       │                         │
│                      └────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

## Usage Patterns

### Basic Hook Usage

```tsx
import { useHook } from "@/hooks/useHook";

function MyComponent() {
  const { someState, someFunction } = useHook();
  
  // Use the hook's state and functions
  return (
    <div>
      <div>{someState}</div>
      <button onClick={someFunction}>Do Something</button>
    </div>
  );
}
```

### Combining Multiple Hooks

```tsx
import { useTransaction } from "@/hooks/useTransaction";
import { useTransactionTracking } from "@/hooks/useTransactionTracking";
import { useSecurity } from "@/hooks/useSecurity";

function SecureTransactionComponent() {
  const { sendAndConfirmTransaction } = useTransaction();
  const { trackTransaction } = useTransactionTracking();
  const { previewTransaction } = useSecurity();
  
  // Use the hooks together for a comprehensive transaction flow
  const handleTransaction = async () => {
    // Create transaction
    const transaction = createTransaction();
    
    // Preview transaction
    const preview = await previewTransaction(transaction);
    
    // If preview looks good, send transaction
    if (preview.success) {
      // Track transaction
      trackTransaction("pending", "swap");
      
      // Send transaction
      const signature = await sendAndConfirmTransaction(transaction);
      
      // Do something with the signature
    }
  };
  
  return (
    <div>
      <button onClick={handleTransaction}>Send Transaction</button>
    </div>
  );
}
```

### Creating Custom Hooks

You can create custom hooks that build on the provided hooks:

```tsx
import { useTransaction } from "@/hooks/useTransaction";
import { useSecurity } from "@/hooks/useSecurity";
import { useState } from "react";

// Custom hook for secure transactions
function useSecureTransaction() {
  const { sendAndConfirmTransaction } = useTransaction();
  const { previewTransaction, approveTransaction } = useSecurity();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const sendSecureTransaction = async (transaction, options = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Preview transaction
      const preview = await previewTransaction(transaction);
      
      // Approve transaction
      const approval = await approveTransaction(transaction);
      
      // If approved, send transaction
      if (approval.status === "approved" || approval.status === "requires_confirmation") {
        return await sendAndConfirmTransaction(transaction, options);
      } else {
        throw new Error("Transaction not approved");
      }
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    sendSecureTransaction,
    isLoading,
    error
  };
}
```

## Best Practices

1. **Use the appropriate hook**: Each hook is designed for a specific purpose. Use the hook that best matches your needs.
2. **Handle loading states**: Most hooks involve asynchronous operations. Always handle loading states appropriately.
3. **Handle errors**: Use try/catch blocks with async operations and display user-friendly error messages.
4. **Memoize callbacks**: Use `useCallback` for functions passed to child components to prevent unnecessary re-renders.
5. **Respect dependencies**: When using `useEffect` with hook functions, include those functions in the dependency array.
6. **Combine hooks thoughtfully**: When using multiple hooks together, consider creating a custom hook to encapsulate the combined logic.
7. **Use TypeScript**: All hooks are fully typed. Take advantage of TypeScript to catch errors at compile time.

## Further Reading

For detailed information about each hook, including API reference and usage examples, see the individual hook documentation:

- [useCache](./use-cache.md)
- [useTransaction](./use-transaction.md)
- [useTransactionTracking](./use-transaction-tracking.md)
- [useErrorMonitoring](./use-error-monitoring.md)
- [useNetworkMonitoring](./use-network-monitoring.md)
- [useSecurity](./use-security.md)
- [useAnalytics](./use-analytics.md)
