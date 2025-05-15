# Transaction Tracking Service

## Overview

The Transaction Tracking Service provides comprehensive tracking and monitoring of blockchain transactions throughout their lifecycle. It maintains a detailed history of transactions, their current status, and relevant metadata, enabling users to monitor the progress of their transactions from creation to finalization.

## Key Features

- **Detailed Transaction States**: Tracks transactions through multiple states (created, signed, sent, confirming, confirmed, finalized, failed, timeout)
- **Real-time Status Updates**: Automatically polls for transaction status updates
- **Transaction History**: Maintains a persistent record of transaction history
- **Cross-Network Support**: Works across Mainnet, Testnet, and Devnet
- **Explorer Links**: Provides links to block explorers for transaction verification
- **Metadata Storage**: Stores additional transaction metadata for context

## Installation

The Transaction Tracking Service is included in the Goldium DeFi platform. To use it, import the service or the associated hook:

```typescript
// Import the service directly
import { getTransactionTrackingService, TransactionType } from "@/services/transaction-tracking";

// Or use the hook (recommended)
import { useTransactionTracking } from "@/hooks/useTransactionTracking";
```

## API Reference

### Enums

#### `TransactionStatus`

Represents the current status of a transaction:

```typescript
export enum TransactionStatus {
  CREATED = 'created',    // Transaction has been created but not signed
  SIGNED = 'signed',      // Transaction has been signed but not sent
  SENT = 'sent',          // Transaction has been sent to the network
  CONFIRMING = 'confirming', // Transaction is being confirmed (0 confirmations)
  CONFIRMED = 'confirmed',   // Transaction has at least 1 confirmation
  FINALIZED = 'finalized',   // Transaction is finalized (32+ confirmations)
  FAILED = 'failed',      // Transaction failed
  TIMEOUT = 'timeout',    // Transaction timed out waiting for confirmation
  UNKNOWN = 'unknown',    // Transaction status is unknown
}
```

#### `TransactionType`

Categorizes the type of transaction:

```typescript
export enum TransactionType {
  SWAP = 'swap',                  // Token swap
  STAKE = 'stake',                // Staking tokens
  UNSTAKE = 'unstake',            // Unstaking tokens
  CLAIM_REWARDS = 'claim_rewards', // Claiming staking rewards
  ADD_LIQUIDITY = 'add_liquidity', // Adding liquidity to a pool
  REMOVE_LIQUIDITY = 'remove_liquidity', // Removing liquidity from a pool
  CLAIM_FEES = 'claim_fees',       // Claiming LP fees
  TRANSFER = 'transfer',           // Token transfer
  OTHER = 'other',                 // Other transaction types
}
```

### Interfaces

#### `TransactionData`

Contains all data related to a transaction:

```typescript
export interface TransactionData {
  id: string;                 // Unique identifier for the transaction
  signature: string;          // Transaction signature
  timestamp: number;          // Timestamp when the transaction was created
  status: TransactionStatus;  // Current status of the transaction
  type: TransactionType;      // Type of transaction
  network: NetworkType;       // Network the transaction was sent on
  walletAddress?: string;     // Wallet address that initiated the transaction
  amount?: number;            // Amount involved in the transaction
  token?: string;             // Token involved in the transaction
  fee?: number;               // Transaction fee
  blockHeight?: number;       // Block height where the transaction was included
  confirmations?: number;     // Number of confirmations
  errorMessage?: string;      // Error message if the transaction failed
  explorerUrl?: string;       // URL to view the transaction in a block explorer
  metadata?: Record<string, any>; // Additional metadata
}
```

### Service Methods

#### `trackTransaction`

Tracks a new transaction:

```typescript
trackTransaction(
  signature: string,
  type: TransactionType,
  metadata: Record<string, any> = {},
  walletAddress?: string,
): TransactionData
```

**Parameters:**
- `signature`: Transaction signature (or 'pending' for transactions not yet sent)
- `type`: Type of transaction from the `TransactionType` enum
- `metadata`: Optional additional data about the transaction
- `walletAddress`: Optional wallet address that initiated the transaction

**Returns:** A `TransactionData` object representing the tracked transaction

#### `getTransactions`

Gets all tracked transactions:

```typescript
getTransactions(): TransactionData[]
```

**Returns:** An array of all tracked `TransactionData` objects

#### `getTransactionById`

Gets a transaction by its ID:

```typescript
getTransactionById(id: string): TransactionData | undefined
```

**Parameters:**
- `id`: The unique ID of the transaction

**Returns:** The `TransactionData` object if found, or `undefined`

#### `getTransactionBySignature`

Gets a transaction by its signature:

```typescript
getTransactionBySignature(signature: string): TransactionData | undefined
```

**Parameters:**
- `signature`: The transaction signature

**Returns:** The `TransactionData` object if found, or `undefined`

#### `getTransactionsByType`

Gets transactions by type:

```typescript
getTransactionsByType(type: TransactionType): TransactionData[]
```

**Parameters:**
- `type`: The transaction type to filter by

**Returns:** An array of `TransactionData` objects of the specified type

#### `getTransactionsByStatus`

Gets transactions by status:

```typescript
getTransactionsByStatus(status: TransactionStatus): TransactionData[]
```

**Parameters:**
- `status`: The transaction status to filter by

**Returns:** An array of `TransactionData` objects with the specified status

#### `getTransactionsByWallet`

Gets transactions by wallet address:

```typescript
getTransactionsByWallet(walletAddress: string): TransactionData[]
```

**Parameters:**
- `walletAddress`: The wallet address to filter by

**Returns:** An array of `TransactionData` objects for the specified wallet

#### `updateTransactionStatus`

Updates the status of a transaction:

```typescript
updateTransactionStatus(
  idOrSignature: string,
  status: TransactionStatus,
  additionalData: Partial<TransactionData> = {}
): boolean
```

**Parameters:**
- `idOrSignature`: The transaction ID or signature
- `status`: The new status
- `additionalData`: Optional additional data to update

**Returns:** `true` if the transaction was found and updated, `false` otherwise

#### `clearTransactions`

Clears all tracked transactions:

```typescript
clearTransactions(): void
```

#### `getExplorerUrl`

Gets the explorer URL for a transaction:

```typescript
getExplorerUrl(signature: string): string
```

**Parameters:**
- `signature`: The transaction signature

**Returns:** A URL to view the transaction in a block explorer

### Usage Examples

#### Basic Transaction Tracking

```typescript
import { getTransactionTrackingService, TransactionType } from "@/services/transaction-tracking";
import { Connection } from "@solana/web3.js";
import { NetworkType } from "@/components/NetworkContextProvider";

// Initialize the service
const connection = new Connection("https://api.mainnet-beta.solana.com");
const network: NetworkType = "mainnet-beta";
const trackingService = getTransactionTrackingService(connection, network);

// Track a transaction
const txData = trackingService.trackTransaction(
  "5KKsWtSrFN7vgxJhVN6hQDgK9BzLez5un5QGNnbCxaVNWjkeke8L2oUQS6jZ9cXJFCdRa7ixiKDLaHJvQVciZuyi",
  TransactionType.SWAP,
  {
    fromToken: "USDC",
    toToken: "SOL",
    fromAmount: 100,
    toAmount: 1.5
  },
  "8JUjWjAyXTMB4ZXcV7nk3p6Gg1fWAAoSck4b5tqNfY7Z"
);

// Get transaction status
const txStatus = txData.status;
console.log(`Transaction status: ${txStatus}`);

// Get explorer URL
const explorerUrl = trackingService.getExplorerUrl(txData.signature);
console.log(`View transaction: ${explorerUrl}`);
```

#### Using with the Hook

```tsx
import { useTransactionTracking } from "@/hooks/useTransactionTracking";
import { TransactionType } from "@/services/transaction-tracking";

function TransactionMonitor() {
  const { 
    transactions, 
    pendingTransactions, 
    trackTransaction, 
    getStatusLabel 
  } = useTransactionTracking();
  
  // Display pending transactions
  return (
    <div>
      <h2>Pending Transactions</h2>
      <ul>
        {pendingTransactions.map(tx => (
          <li key={tx.id}>
            {tx.type}: {getStatusLabel(tx.status)}
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
import { TransactionType } from "@/services/transaction-tracking";

function SwapComponent() {
  const { sendAndConfirmTransaction } = useTransaction();
  
  const handleSwap = async () => {
    // Create transaction instructions
    const instructions = [...]; // Your swap instructions
    
    // Send transaction with tracking
    const signature = await sendAndConfirmTransaction(instructions, {
      transactionType: TransactionType.SWAP,
      metadata: {
        fromToken: "USDC",
        toToken: "SOL",
        fromAmount: 100,
        toAmount: 1.5
      }
    });
    
    if (signature) {
      console.log("Swap transaction sent:", signature);
    }
  };
  
  return (
    <button onClick={handleSwap}>Swap</button>
  );
}
```

## Integration with Other Services

The Transaction Tracking Service integrates with several other services in the Goldium platform:

- **Error Monitoring Service**: Transactions that fail are logged with the Error Monitoring Service
- **Analytics Service**: Transaction events are tracked for analytics purposes
- **Network Monitoring Service**: Transaction performance is used to assess network health
- **Security Services**: Transaction history is used for anomaly detection

## Best Practices

1. **Always track transactions**: Track all transactions to maintain a complete history
2. **Include metadata**: Add relevant metadata to make transactions more understandable
3. **Handle timeouts**: Implement proper handling for transaction timeouts
4. **Use the hook**: Prefer using the `useTransactionTracking` hook over direct service access
5. **Clear old transactions**: Periodically clear very old transactions to prevent storage bloat
