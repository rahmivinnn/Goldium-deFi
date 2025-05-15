# Error Monitoring Service

## Overview

The Error Monitoring Service provides a centralized system for capturing, categorizing, and managing errors that occur within the Goldium DeFi platform. It enables comprehensive error tracking, user-friendly error messages, and automatic retry strategies for specific error types.

## Key Features

- **Error Categorization**: Classifies errors by type, severity, and source
- **User-Friendly Messages**: Converts technical error messages into user-friendly explanations
- **Retry Strategies**: Implements automatic retry logic for transient errors
- **Error Persistence**: Maintains a history of errors for analysis
- **Cross-Network Support**: Works across Mainnet, Testnet, and Devnet
- **Resolution Tracking**: Tracks whether errors have been resolved
- **Error Analytics**: Provides data for error frequency and impact analysis

## Installation

The Error Monitoring Service is included in the Goldium DeFi platform. To use it, import the service or the associated hook:

```typescript
// Import the service directly
import { 
  getErrorMonitoringService, 
  ErrorCategory, 
  ErrorSeverity 
} from "@/services/error-monitoring";

// Or use the hook (recommended)
import { useErrorMonitoring } from "@/hooks/useErrorMonitoring";
```

## API Reference

### Enums

#### `ErrorCategory`

Categorizes the type of error:

```typescript
export enum ErrorCategory {
  WALLET_ERROR = 'wallet_error',       // Errors related to wallet connections
  NETWORK_ERROR = 'network_error',     // Network connectivity issues
  TRANSACTION_ERROR = 'transaction_error', // Transaction processing errors
  CONTRACT_ERROR = 'contract_error',   // Smart contract execution errors
  USER_ERROR = 'user_error',           // Errors caused by user actions
  UNKNOWN_ERROR = 'unknown_error',     // Uncategorized errors
}
```

#### `ErrorSeverity`

Indicates the severity level of an error:

```typescript
export enum ErrorSeverity {
  INFO = 'info',           // Informational messages
  WARNING = 'warning',     // Warnings that don't prevent functionality
  ERROR = 'error',         // Errors that impact functionality
  CRITICAL = 'critical',   // Critical errors that prevent core functionality
}
```

### Interfaces

#### `ErrorData`

Contains all data related to an error:

```typescript
export interface ErrorData {
  id: string;                 // Unique identifier for the error
  timestamp: number;          // When the error occurred
  message: string;            // Original error message
  category: ErrorCategory;    // Category of the error
  severity: ErrorSeverity;    // Severity level
  network: NetworkType;       // Network where the error occurred
  walletAddress?: string;     // Associated wallet address
  transactionSignature?: string; // Associated transaction signature
  stackTrace?: string;        // Error stack trace
  resolved: boolean;          // Whether the error has been resolved
  retryCount: number;         // Number of retry attempts
  maxRetries: number;         // Maximum number of retries allowed
  metadata?: Record<string, any>; // Additional context
}
```

### Service Methods

#### `logError`

Logs a new error:

```typescript
logError(
  error: Error | string,
  category: ErrorCategory = ErrorCategory.UNKNOWN_ERROR,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  metadata: Record<string, any> = {},
  maxRetries: number = 3
): ErrorData
```

**Parameters:**
- `error`: The error object or message string
- `category`: Category of the error
- `severity`: Severity level of the error
- `metadata`: Additional context about the error
- `maxRetries`: Maximum number of retry attempts

**Returns:** An `ErrorData` object representing the logged error

#### `getErrors`

Gets all logged errors:

```typescript
getErrors(): ErrorData[]
```

**Returns:** An array of all `ErrorData` objects

#### `getUnresolvedErrors`

Gets all unresolved errors:

```typescript
getUnresolvedErrors(): ErrorData[]
```

**Returns:** An array of unresolved `ErrorData` objects

#### `getErrorById`

Gets an error by its ID:

```typescript
getErrorById(id: string): ErrorData | undefined
```

**Parameters:**
- `id`: The unique ID of the error

**Returns:** The `ErrorData` object if found, or `undefined`

#### `getErrorsByCategory`

Gets errors by category:

```typescript
getErrorsByCategory(category: ErrorCategory): ErrorData[]
```

**Parameters:**
- `category`: The error category to filter by

**Returns:** An array of `ErrorData` objects of the specified category

#### `getErrorsBySeverity`

Gets errors by severity:

```typescript
getErrorsBySeverity(severity: ErrorSeverity): ErrorData[]
```

**Parameters:**
- `severity`: The error severity to filter by

**Returns:** An array of `ErrorData` objects with the specified severity

#### `getErrorsByNetwork`

Gets errors by network:

```typescript
getErrorsByNetwork(network: NetworkType): ErrorData[]
```

**Parameters:**
- `network`: The network to filter by

**Returns:** An array of `ErrorData` objects for the specified network

#### `resolveError`

Marks an error as resolved:

```typescript
resolveError(id: string): boolean
```

**Parameters:**
- `id`: The unique ID of the error

**Returns:** `true` if the error was found and resolved, `false` otherwise

#### `retryOperation`

Attempts to retry the operation that caused an error:

```typescript
retryOperation(id: string): Promise<boolean>
```

**Parameters:**
- `id`: The unique ID of the error

**Returns:** A promise that resolves to `true` if the retry was successful, `false` otherwise

#### `getUserFriendlyMessage`

Gets a user-friendly version of an error message:

```typescript
getUserFriendlyMessage(message: string): string
```

**Parameters:**
- `message`: The original error message

**Returns:** A user-friendly version of the error message

#### `clearErrors`

Clears all logged errors:

```typescript
clearErrors(): void
```

#### `clearResolvedErrors`

Clears only resolved errors:

```typescript
clearResolvedErrors(): void
```

### Usage Examples

#### Basic Error Logging

```typescript
import { 
  getErrorMonitoringService, 
  ErrorCategory, 
  ErrorSeverity 
} from "@/services/error-monitoring";

// Initialize the service
const errorService = getErrorMonitoringService();

try {
  // Some operation that might fail
  throw new Error("Failed to connect to RPC endpoint");
} catch (error) {
  // Log the error
  const errorData = errorService.logError(
    error,
    ErrorCategory.NETWORK_ERROR,
    ErrorSeverity.ERROR,
    {
      endpoint: "https://api.mainnet-beta.solana.com",
      attemptCount: 3
    }
  );
  
  // Get user-friendly message
  const friendlyMessage = errorService.getUserFriendlyMessage(errorData.message);
  console.log(`Error: ${friendlyMessage}`);
}
```

#### Using with the Hook

```tsx
import { useErrorMonitoring } from "@/hooks/useErrorMonitoring";
import { ErrorCategory, ErrorSeverity } from "@/services/error-monitoring";

function ErrorHandler() {
  const { 
    errors, 
    unresolvedErrors, 
    logError, 
    resolveError, 
    getUserFriendlyMessage 
  } = useErrorMonitoring();
  
  const handleOperation = async () => {
    try {
      // Some operation that might fail
      await someRiskyOperation();
    } catch (error) {
      // Log the error
      const errorData = logError(
        error,
        ErrorCategory.TRANSACTION_ERROR,
        ErrorSeverity.ERROR
      );
      
      // Show user-friendly message
      alert(getUserFriendlyMessage(errorData.message));
    }
  };
  
  // Display unresolved errors
  return (
    <div>
      <button onClick={handleOperation}>Perform Operation</button>
      
      <h2>Unresolved Errors</h2>
      <ul>
        {unresolvedErrors.map(error => (
          <li key={error.id}>
            {getUserFriendlyMessage(error.message)}
            <button onClick={() => resolveError(error.id)}>
              Mark Resolved
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### Integration with Transaction Hook

```tsx
import { useTransaction } from "@/hooks/useTransaction";
import { useErrorMonitoring } from "@/hooks/useErrorMonitoring";

function TransactionComponent() {
  const { sendAndConfirmTransaction } = useTransaction();
  const { getUserFriendlyMessage } = useErrorMonitoring();
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
          // The error is automatically logged by the transaction hook
          // We just need to display it
          setErrorMessage(getUserFriendlyMessage(error.message));
        }
      });
      
      if (signature) {
        console.log("Transaction sent:", signature);
      }
    } catch (error) {
      // This catch is for errors not handled by the onError callback
      setErrorMessage(getUserFriendlyMessage(error.message));
    }
  };
  
  return (
    <div>
      <button onClick={handleTransaction}>Send Transaction</button>
      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}
    </div>
  );
}
```

## Integration with Other Services

The Error Monitoring Service integrates with several other services in the Goldium platform:

- **Transaction Tracking Service**: Errors related to transactions are linked to their transaction data
- **Analytics Service**: Error events are tracked for analytics purposes
- **Network Monitoring Service**: Network-related errors contribute to network health assessment
- **Security Services**: Error patterns are analyzed for potential security issues

## Best Practices

1. **Categorize errors properly**: Use the appropriate `ErrorCategory` and `ErrorSeverity` for accurate tracking
2. **Include context**: Add relevant metadata to make errors more diagnosable
3. **Handle retries carefully**: Implement retry logic only for transient errors
4. **Use user-friendly messages**: Always display user-friendly messages to end users
5. **Resolve errors**: Mark errors as resolved once they've been addressed
6. **Clear old errors**: Periodically clear resolved errors to prevent storage bloat
7. **Monitor error trends**: Analyze error patterns to identify systemic issues
