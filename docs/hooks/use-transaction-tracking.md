# useTransactionTracking Hook

## Overview

The `useTransactionTracking` hook provides a React interface to the Goldium platform's transaction tracking service, enabling components to track, monitor, and display transaction status throughout the transaction lifecycle. It maintains a detailed history of transactions and their current status, enhancing transparency and user experience.

## Key Features

- **Transaction Status Tracking**: Track transactions through multiple states
- **Real-time Status Updates**: Automatically poll for transaction status updates
- **Transaction History**: Access and filter transaction history
- **Cross-Network Support**: Works across Mainnet, Testnet, and Devnet
- **Explorer Links**: Generate links to block explorers for transaction verification
- **Metadata Storage**: Store additional transaction metadata for context
- **Status Formatting**: Format transaction status for display

## Installation

The `useTransactionTracking` hook is included in the Goldium DeFi platform. To use it, import it in your component:

```typescript
import { useTransactionTracking } from "@/hooks/useTransactionTracking";
```

## API Reference

### Hook Return Value

The `useTransactionTracking` hook returns an object with the following properties and methods:

#### Transaction Data

##### `transactions`

All tracked transactions:

```typescript
transactions: TransactionData[]
```

##### `pendingTransactions`

Transactions that are not yet finalized:

```typescript
pendingTransactions: TransactionData[]
```

##### `recentTransactions`

Recent transactions (last 24 hours):

```typescript
recentTransactions: TransactionData[]
```

#### Transaction Tracking

##### `trackTransaction`

Tracks a new transaction:

```typescript
trackTransaction(
  signature: string,
  type: TransactionType,
  metadata?: Record<string, any>,
  walletAddress?: string
): TransactionData
```

**Parameters:**
- `signature`: Transaction signature (or 'pending' for transactions not yet sent)
- `type`: Type of transaction from the `TransactionType` enum
- `metadata`: Optional additional data about the transaction
- `walletAddress`: Optional wallet address that initiated the transaction

**Returns:** A `TransactionData` object representing the tracked transaction

##### `updateTransactionStatus`

Updates the status of a transaction:

```typescript
updateTransactionStatus(
  idOrSignature: string,
  status: TransactionStatus,
  additionalData?: Partial<TransactionData>
): boolean
```

**Parameters:**
- `idOrSignature`: The transaction ID or signature
- `status`: The new status
- `additionalData`: Optional additional data to update

**Returns:** `true` if the transaction was found and updated, `false` otherwise

#### Transaction Retrieval

##### `getTransactionById`

Gets a transaction by its ID:

```typescript
getTransactionById(id: string): TransactionData | undefined
```

**Parameters:**
- `id`: The unique ID of the transaction

**Returns:** The `TransactionData` object if found, or `undefined`

##### `getTransactionBySignature`

Gets a transaction by its signature:

```typescript
getTransactionBySignature(signature: string): TransactionData | undefined
```

**Parameters:**
- `signature`: The transaction signature

**Returns:** The `TransactionData` object if found, or `undefined`

##### `getTransactionsByType`

Gets transactions by type:

```typescript
getTransactionsByType(type: TransactionType): TransactionData[]
```

**Parameters:**
- `type`: The transaction type to filter by

**Returns:** An array of `TransactionData` objects of the specified type

##### `getTransactionsByStatus`

Gets transactions by status:

```typescript
getTransactionsByStatus(status: TransactionStatus): TransactionData[]
```

**Parameters:**
- `status`: The transaction status to filter by

**Returns:** An array of `TransactionData` objects with the specified status

##### `getTransactionsByWallet`

Gets transactions by wallet address:

```typescript
getTransactionsByWallet(walletAddress: string): TransactionData[]
```

**Parameters:**
- `walletAddress`: The wallet address to filter by

**Returns:** An array of `TransactionData` objects for the specified wallet

#### Utility Functions

##### `getExplorerUrl`

Gets the explorer URL for a transaction:

```typescript
getExplorerUrl(signature: string): string
```

**Parameters:**
- `signature`: The transaction signature

**Returns:** A URL to view the transaction in a block explorer

##### `getStatusLabel`

Gets a user-friendly label for a transaction status:

```typescript
getStatusLabel(status: TransactionStatus): string
```

**Parameters:**
- `status`: The transaction status

**Returns:** A user-friendly label for the status

##### `getStatusColor`

Gets a color for a transaction status:

```typescript
getStatusColor(status: TransactionStatus): string
```

**Parameters:**
- `status`: The transaction status

**Returns:** A color string (e.g., "green", "yellow", "red")

#### Management Functions

##### `clearTransactions`

Clears all tracked transactions:

```typescript
clearTransactions(): void
```

##### `clearOldTransactions`

Clears transactions older than a specified age:

```typescript
clearOldTransactions(maxAgeMs: number): void
```

**Parameters:**
- `maxAgeMs`: Maximum age in milliseconds

## Usage Examples

### Basic Transaction Tracking

```tsx
import { useTransactionTracking } from "@/hooks/useTransactionTracking";
import { TransactionType } from "@/services/transaction-tracking";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

function TransactionTracker() {
  const { publicKey } = useWallet();
  const { trackTransaction, getStatusLabel, getStatusColor } = useTransactionTracking();
  const [signature, setSignature] = useState("");
  
  const handleTrackTransaction = () => {
    if (!signature) return;
    
    const txData = trackTransaction(
      signature,
      TransactionType.SWAP,
      {
        fromToken: "USDC",
        toToken: "SOL",
        fromAmount: 100,
        toAmount: 1.5
      },
      publicKey?.toString()
    );
    
    console.log("Transaction tracked:", txData);
  };
  
  return (
    <div>
      <h2>Track Transaction</h2>
      <div>
        <input
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Transaction signature"
        />
        <button onClick={handleTrackTransaction}>
          Track Transaction
        </button>
      </div>
    </div>
  );
}
```

### Transaction History Display

```tsx
import { useTransactionTracking } from "@/hooks/useTransactionTracking";
import { useState } from "react";
import { TransactionStatus } from "@/services/transaction-tracking";

function TransactionHistory() {
  const { 
    transactions, 
    pendingTransactions, 
    getStatusLabel, 
    getStatusColor,
    getExplorerUrl
  } = useTransactionTracking();
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">("all");
  
  // Filter transactions by status
  const filteredTransactions = statusFilter === "all"
    ? transactions
    : transactions.filter(tx => tx.status === statusFilter);
  
  return (
    <div>
      <h2>Transaction History</h2>
      
      <div>
        <label>
          Filter by Status:
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | "all")}
          >
            <option value="all">All</option>
            <option value={TransactionStatus.CREATED}>Created</option>
            <option value={TransactionStatus.SIGNED}>Signed</option>
            <option value={TransactionStatus.SENT}>Sent</option>
            <option value={TransactionStatus.CONFIRMING}>Confirming</option>
            <option value={TransactionStatus.CONFIRMED}>Confirmed</option>
            <option value={TransactionStatus.FINALIZED}>Finalized</option>
            <option value={TransactionStatus.FAILED}>Failed</option>
            <option value={TransactionStatus.TIMEOUT}>Timeout</option>
          </select>
        </label>
      </div>
      
      {pendingTransactions.length > 0 && (
        <div>
          <h3>Pending Transactions</h3>
          <ul>
            {pendingTransactions.map(tx => (
              <li key={tx.id}>
                <div>Type: {tx.type}</div>
                <div>
                  Status: 
                  <span style={{ color: getStatusColor(tx.status) }}>
                    {getStatusLabel(tx.status)}
                  </span>
                </div>
                <div>
                  <a href={getExplorerUrl(tx.signature)} target="_blank" rel="noopener noreferrer">
                    View on Explorer
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div>
        <h3>Transaction History</h3>
        {filteredTransactions.length === 0 ? (
          <div>No transactions found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(tx => (
                <tr key={tx.id}>
                  <td>{tx.type}</td>
                  <td style={{ color: getStatusColor(tx.status) }}>
                    {getStatusLabel(tx.status)}
                  </td>
                  <td>{new Date(tx.timestamp).toLocaleString()}</td>
                  <td>
                    {tx.amount && tx.token
                      ? `${tx.amount} ${tx.token}`
                      : "-"
                    }
                  </td>
                  <td>
                    <a href={getExplorerUrl(tx.signature)} target="_blank" rel="noopener noreferrer">
                      View on Explorer
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

### Transaction Status Badge

```tsx
import { useTransactionTracking } from "@/hooks/useTransactionTracking";
import { TransactionStatus } from "@/services/transaction-tracking";

function TransactionStatusBadge({ signature }: { signature: string }) {
  const { 
    getTransactionBySignature, 
    getStatusLabel, 
    getStatusColor 
  } = useTransactionTracking();
  
  const transaction = getTransactionBySignature(signature);
  
  if (!transaction) {
    return <span className="badge badge-neutral">Unknown</span>;
  }
  
  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.FINALIZED:
        return "✓";
      case TransactionStatus.FAILED:
        return "✗";
      case TransactionStatus.TIMEOUT:
        return "⏱";
      default:
        return "⋯";
    }
  };
  
  return (
    <span 
      className={`badge badge-${getStatusColor(transaction.status)}`}
      style={{ color: getStatusColor(transaction.status) }}
    >
      {getStatusIcon(transaction.status)} {getStatusLabel(transaction.status)}
    </span>
  );
}
```

### Integration with Transaction Hook

```tsx
import { useTransactionTracking } from "@/hooks/useTransactionTracking";
import { useTransaction } from "@/hooks/useTransaction";
import { TransactionType } from "@/services/transaction-tracking";
import { useState } from "react";

function SwapComponent() {
  const { trackTransaction } = useTransactionTracking();
  const { sendAndConfirmTransaction } = useTransaction();
  const [amount, setAmount] = useState(0);
  const [fromToken, setFromToken] = useState("USDC");
  const [toToken, setToToken] = useState("SOL");
  
  const handleSwap = async () => {
    // Create transaction instructions
    const instructions = [...]; // Your swap instructions
    
    // Track transaction before sending (optional)
    const pendingTx = trackTransaction(
      "pending", // Will be updated with actual signature after sending
      TransactionType.SWAP,
      {
        fromToken,
        toToken,
        fromAmount: amount,
        toAmount: 0 // Will be updated after simulation
      }
    );
    
    // Send transaction with tracking
    const signature = await sendAndConfirmTransaction(instructions, {
      transactionType: TransactionType.SWAP,
      metadata: {
        fromToken,
        toToken,
        fromAmount: amount,
        pendingTxId: pendingTx.id // Link to the pending transaction
      }
    });
    
    if (signature) {
      console.log("Swap transaction sent:", signature);
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

### Transaction Notification System

```tsx
import { useTransactionTracking } from "@/hooks/useTransactionTracking";
import { useEffect, useState } from "react";
import { TransactionStatus } from "@/services/transaction-tracking";

function TransactionNotifications() {
  const { transactions, getStatusLabel } = useTransactionTracking();
  const [notifications, setNotifications] = useState<{ id: string; message: string; seen: boolean }[]>([]);
  
  // Watch for transaction status changes
  useEffect(() => {
    const newNotifications = [];
    
    for (const tx of transactions) {
      // Check if we already have a notification for this transaction
      const existingNotification = notifications.find(n => n.id === tx.id);
      
      // Generate notifications for status changes
      if (!existingNotification) {
        if (tx.status === TransactionStatus.FINALIZED) {
          newNotifications.push({
            id: tx.id,
            message: `Transaction ${tx.type} completed successfully!`,
            seen: false
          });
        } else if (tx.status === TransactionStatus.FAILED) {
          newNotifications.push({
            id: tx.id,
            message: `Transaction ${tx.type} failed: ${tx.errorMessage || "Unknown error"}`,
            seen: false
          });
        }
      }
    }
    
    if (newNotifications.length > 0) {
      setNotifications(prev => [...prev, ...newNotifications]);
    }
  }, [transactions]);
  
  const markAsSeen = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, seen: true } : n)
    );
  };
  
  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const unseenNotifications = notifications.filter(n => !n.seen);
  
  return (
    <div>
      <h2>Notifications {unseenNotifications.length > 0 && `(${unseenNotifications.length})`}</h2>
      
      {notifications.length === 0 ? (
        <div>No notifications</div>
      ) : (
        <ul>
          {notifications.map(notification => (
            <li 
              key={notification.id}
              className={notification.seen ? "notification-seen" : "notification-unseen"}
            >
              <div>{notification.message}</div>
              <div>
                <button onClick={() => markAsSeen(notification.id)}>
                  Mark as Seen
                </button>
                <button onClick={() => clearNotification(notification.id)}>
                  Dismiss
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Integration with Other Hooks

The `useTransactionTracking` hook integrates with several other hooks in the Goldium platform:

- **useTransaction**: Provides transaction tracking for the transaction hook
- **useSecurity**: Uses transaction history for anomaly detection
- **useAnalytics**: Provides transaction data for analytics
- **useErrorMonitoring**: Logs transaction errors for monitoring

## Best Practices

1. **Track all transactions**: Track all transactions to maintain a complete history
2. **Include metadata**: Add relevant metadata to make transactions more understandable
3. **Handle timeouts**: Implement proper handling for transaction timeouts
4. **Show status updates**: Keep users informed about transaction status changes
5. **Provide explorer links**: Allow users to verify transactions on block explorers
6. **Clear old transactions**: Periodically clear very old transactions to prevent storage bloat
7. **Use status formatting**: Use the provided formatting functions for consistent display
