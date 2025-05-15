# useErrorMonitoring Hook

## Overview

The `useErrorMonitoring` hook provides a React interface to the Goldium platform's error monitoring service, enabling components to capture, categorize, and manage errors that occur within the application. It simplifies error handling while providing user-friendly error messages and automatic retry strategies.

## Key Features

- **Error Logging**: Capture and categorize errors
- **User-Friendly Messages**: Convert technical error messages into user-friendly explanations
- **Retry Strategies**: Implement automatic retry logic for transient errors
- **Error History**: Access error history for display and analysis
- **Cross-Network Support**: Works across Mainnet, Testnet, and Devnet
- **Resolution Tracking**: Track whether errors have been resolved
- **Error Categorization**: Classify errors by type, severity, and source

## Installation

The `useErrorMonitoring` hook is included in the Goldium DeFi platform. To use it, import it in your component:

```typescript
import { useErrorMonitoring } from "@/hooks/useErrorMonitoring";
```

## API Reference

### Hook Return Value

The `useErrorMonitoring` hook returns an object with the following properties and methods:

#### Error Data

##### `errors`

All logged errors:

```typescript
errors: ErrorData[]
```

##### `unresolvedErrors`

Errors that have not been resolved:

```typescript
unresolvedErrors: ErrorData[]
```

#### Error Logging

##### `logError`

Logs a new error:

```typescript
logError(
  error: Error | string,
  category?: ErrorCategory,
  severity?: ErrorSeverity,
  metadata?: Record<string, any>,
  maxRetries?: number
): ErrorData
```

**Parameters:**
- `error`: The error object or message string
- `category`: Category of the error (default: `ErrorCategory.UNKNOWN_ERROR`)
- `severity`: Severity level of the error (default: `ErrorSeverity.ERROR`)
- `metadata`: Additional context about the error
- `maxRetries`: Maximum number of retry attempts (default: 3)

**Returns:** An `ErrorData` object representing the logged error

#### Error Retrieval

##### `getErrorById`

Gets an error by its ID:

```typescript
getErrorById(id: string): ErrorData | undefined
```

**Parameters:**
- `id`: The unique ID of the error

**Returns:** The `ErrorData` object if found, or `undefined`

##### `getErrorsByCategory`

Gets errors by category:

```typescript
getErrorsByCategory(category: ErrorCategory): ErrorData[]
```

**Parameters:**
- `category`: The error category to filter by

**Returns:** An array of `ErrorData` objects of the specified category

##### `getErrorsBySeverity`

Gets errors by severity:

```typescript
getErrorsBySeverity(severity: ErrorSeverity): ErrorData[]
```

**Parameters:**
- `severity`: The error severity to filter by

**Returns:** An array of `ErrorData` objects with the specified severity

#### Error Management

##### `resolveError`

Marks an error as resolved:

```typescript
resolveError(id: string): boolean
```

**Parameters:**
- `id`: The unique ID of the error

**Returns:** `true` if the error was found and resolved, `false` otherwise

##### `retryOperation`

Attempts to retry the operation that caused an error:

```typescript
retryOperation(id: string): Promise<boolean>
```

**Parameters:**
- `id`: The unique ID of the error

**Returns:** A promise that resolves to `true` if the retry was successful, `false` otherwise

##### `clearErrors`

Clears all logged errors:

```typescript
clearErrors(): void
```

##### `clearResolvedErrors`

Clears only resolved errors:

```typescript
clearResolvedErrors(): void
```

#### Utility Functions

##### `getUserFriendlyMessage`

Gets a user-friendly version of an error message:

```typescript
getUserFriendlyMessage(message: string): string
```

**Parameters:**
- `message`: The original error message

**Returns:** A user-friendly version of the error message

##### `getSeverityLabel`

Gets a user-friendly label for an error severity:

```typescript
getSeverityLabel(severity: ErrorSeverity): string
```

**Parameters:**
- `severity`: The error severity

**Returns:** A user-friendly label for the severity

##### `getSeverityColor`

Gets a color for an error severity:

```typescript
getSeverityColor(severity: ErrorSeverity): string
```

**Parameters:**
- `severity`: The error severity

**Returns:** A color string (e.g., "blue", "yellow", "red")

## Usage Examples

### Basic Error Logging

```tsx
import { useErrorMonitoring } from "@/hooks/useErrorMonitoring";
import { ErrorCategory, ErrorSeverity } from "@/services/error-monitoring";
import { useState } from "react";

function ErrorHandlingComponent() {
  const { logError, getUserFriendlyMessage } = useErrorMonitoring();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleRiskyOperation = () => {
    try {
      // Some operation that might fail
      throw new Error("Failed to connect to RPC endpoint");
    } catch (error) {
      // Log the error
      const errorData = logError(
        error,
        ErrorCategory.NETWORK_ERROR,
        ErrorSeverity.ERROR,
        {
          endpoint: "https://api.mainnet-beta.solana.com",
          attemptCount: 3
        }
      );
      
      // Show user-friendly message
      setErrorMessage(getUserFriendlyMessage(errorData.message));
    }
  };
  
  return (
    <div>
      <button onClick={handleRiskyOperation}>
        Perform Risky Operation
      </button>
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
```

### Error Display and Management

```tsx
import { useErrorMonitoring } from "@/hooks/useErrorMonitoring";
import { useState } from "react";

function ErrorManager() {
  const { 
    unresolvedErrors, 
    resolveError, 
    retryOperation,
    getUserFriendlyMessage,
    getSeverityLabel,
    getSeverityColor
  } = useErrorMonitoring();
  
  return (
    <div>
      <h2>Error Manager</h2>
      
      {unresolvedErrors.length === 0 ? (
        <div>No unresolved errors</div>
      ) : (
        <div>
          <h3>Unresolved Errors ({unresolvedErrors.length})</h3>
          <ul>
            {unresolvedErrors.map(error => (
              <li key={error.id} className="error-item">
                <div className="error-header">
                  <span 
                    className="error-severity"
                    style={{ color: getSeverityColor(error.severity) }}
                  >
                    {getSeverityLabel(error.severity)}
                  </span>
                  <span className="error-category">
                    {error.category}
                  </span>
                  <span className="error-time">
                    {new Date(error.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <div className="error-message">
                  {getUserFriendlyMessage(error.message)}
                </div>
                
                {error.retryCount > 0 && (
                  <div className="error-retries">
                    Retry attempts: {error.retryCount} / {error.maxRetries}
                  </div>
                )}
                
                <div className="error-actions">
                  {error.retryCount < error.maxRetries && (
                    <button onClick={() => retryOperation(error.id)}>
                      Retry
                    </button>
                  )}
                  <button onClick={() => resolveError(error.id)}>
                    Mark as Resolved
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Integration with Transaction Hook

```tsx
import { useErrorMonitoring } from "@/hooks/useErrorMonitoring";
import { useTransaction } from "@/hooks/useTransaction";
import { ErrorCategory, ErrorSeverity } from "@/services/error-monitoring";
import { useState } from "react";

function TransactionWithErrorHandling() {
  const { logError, getUserFriendlyMessage } = useErrorMonitoring();
  const { sendAndConfirmTransaction } = useTransaction();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleTransaction = async () => {
    // Clear previous error
    setErrorMessage(null);
    
    // Create transaction instructions
    const instructions = [...]; // Your transaction instructions
    
    // Send transaction with error handling
    try {
      const signature = await sendAndConfirmTransaction(instructions, {
        onError: (error) => {
          // Log the error
          const errorData = logError(
            error,
            ErrorCategory.TRANSACTION_ERROR,
            ErrorSeverity.ERROR,
            {
              transactionType: "swap",
              instructions: instructions.length
            }
          );
          
          // Show user-friendly message
          setErrorMessage(getUserFriendlyMessage(errorData.message));
        }
      });
      
      if (signature) {
        console.log("Transaction sent:", signature);
      }
    } catch (error) {
      // This catch is for errors not handled by the onError callback
      const errorData = logError(
        error,
        ErrorCategory.TRANSACTION_ERROR,
        ErrorSeverity.ERROR
      );
      
      setErrorMessage(getUserFriendlyMessage(errorData.message));
    }
  };
  
  return (
    <div>
      <button onClick={handleTransaction}>
        Send Transaction
      </button>
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
```

### Automatic Retry Logic

```tsx
import { useErrorMonitoring } from "@/hooks/useErrorMonitoring";
import { ErrorCategory, ErrorSeverity } from "@/services/error-monitoring";
import { useState } from "react";

function AutoRetryComponent() {
  const { logError, getUserFriendlyMessage } = useErrorMonitoring();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const fetchDataWithRetry = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Attempt to fetch data
      const response = await fetch("https://api.example.com/data");
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      // Log the error with retry configuration
      const errorData = logError(
        error,
        ErrorCategory.NETWORK_ERROR,
        ErrorSeverity.ERROR,
        {
          endpoint: "https://api.example.com/data",
          method: "GET"
        },
        3 // Max retries
      );
      
      // Set up automatic retry
      const retrySuccessful = await retryWithBackoff(
        errorData.id,
        async () => {
          const response = await fetch("https://api.example.com/data");
          
          if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          setResult(data);
          return true;
        },
        errorData.maxRetries
      );
      
      if (!retrySuccessful) {
        setErrorMessage(getUserFriendlyMessage(errorData.message));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Retry with exponential backoff
  const retryWithBackoff = async (
    errorId: string,
    operation: () => Promise<boolean>,
    maxRetries: number
  ): Promise<boolean> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      try {
        const success = await operation();
        if (success) {
          // Operation succeeded, resolve the error
          resolveError(errorId);
          return true;
        }
      } catch (error) {
        console.log(`Retry ${attempt + 1} failed:`, error);
      }
    }
    
    return false;
  };
  
  return (
    <div>
      <button onClick={fetchDataWithRetry} disabled={isLoading}>
        {isLoading ? "Loading..." : "Fetch Data with Retry"}
      </button>
      
      {result && (
        <div className="result">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
```

### Error Analytics

```tsx
import { useErrorMonitoring } from "@/hooks/useErrorMonitoring";
import { ErrorCategory, ErrorSeverity } from "@/services/error-monitoring";
import { useState, useEffect } from "react";

function ErrorAnalytics() {
  const { errors, getErrorsByCategory, getErrorsBySeverity } = useErrorMonitoring();
  const [errorStats, setErrorStats] = useState({
    total: 0,
    byCategory: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>,
    resolutionRate: 0
  });
  
  // Calculate error statistics
  useEffect(() => {
    // Total errors
    const total = errors.length;
    
    // Errors by category
    const byCategory: Record<string, number> = {};
    Object.values(ErrorCategory).forEach(category => {
      byCategory[category] = getErrorsByCategory(category as ErrorCategory).length;
    });
    
    // Errors by severity
    const bySeverity: Record<string, number> = {};
    Object.values(ErrorSeverity).forEach(severity => {
      bySeverity[severity] = getErrorsBySeverity(severity as ErrorSeverity).length;
    });
    
    // Resolution rate
    const resolvedCount = errors.filter(error => error.resolved).length;
    const resolutionRate = total > 0 ? (resolvedCount / total) * 100 : 0;
    
    setErrorStats({
      total,
      byCategory,
      bySeverity,
      resolutionRate
    });
  }, [errors, getErrorsByCategory, getErrorsBySeverity]);
  
  return (
    <div>
      <h2>Error Analytics</h2>
      
      <div className="error-summary">
        <div>
          <h3>Total Errors</h3>
          <div className="stat">{errorStats.total}</div>
        </div>
        
        <div>
          <h3>Resolution Rate</h3>
          <div className="stat">{errorStats.resolutionRate.toFixed(1)}%</div>
        </div>
      </div>
      
      <div className="error-categories">
        <h3>Errors by Category</h3>
        <ul>
          {Object.entries(errorStats.byCategory).map(([category, count]) => (
            <li key={category}>
              <span className="category">{category}</span>
              <span className="count">{count}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="error-severities">
        <h3>Errors by Severity</h3>
        <ul>
          {Object.entries(errorStats.bySeverity).map(([severity, count]) => (
            <li key={severity}>
              <span 
                className="severity"
                style={{ color: getSeverityColor(severity as ErrorSeverity) }}
              >
                {severity}
              </span>
              <span className="count">{count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

## Integration with Other Hooks

The `useErrorMonitoring` hook integrates with several other hooks in the Goldium platform:

- **useTransaction**: Provides error handling for transactions
- **useCache**: Logs cache-related errors
- **useNetwork**: Includes network context in error data
- **useAnalytics**: Tracks error events for analytics

## Best Practices

1. **Categorize errors properly**: Use the appropriate `ErrorCategory` and `ErrorSeverity` for accurate tracking
2. **Include context**: Add relevant metadata to make errors more diagnosable
3. **Handle retries carefully**: Implement retry logic only for transient errors
4. **Use user-friendly messages**: Always display user-friendly messages to end users
5. **Resolve errors**: Mark errors as resolved once they've been addressed
6. **Clear old errors**: Periodically clear resolved errors to prevent storage bloat
7. **Monitor error trends**: Analyze error patterns to identify systemic issues
