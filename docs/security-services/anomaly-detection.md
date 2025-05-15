# Transaction Anomaly Detection Service

## Overview

The Transaction Anomaly Detection Service identifies unusual patterns and potential security risks in blockchain transactions before they are signed and sent. It analyzes transaction characteristics against historical patterns and known risk factors to detect anomalies that might indicate scams, errors, or security threats.

## Key Features

- **Unusual Program Detection**: Identifies interactions with uncommon programs
- **High-Value Transfer Detection**: Flags unusually large value transfers
- **Unusual Account Creation**: Detects creation of an abnormal number of accounts
- **Unusual Token Transfer**: Identifies transfers of rarely used tokens
- **Pattern Recognition**: Detects unusual combinations of operations
- **Scam Detection**: Identifies potential scam patterns
- **Historical Analysis**: Compares transactions against user history
- **Cross-Network Support**: Works across Mainnet, Testnet, and Devnet

## Installation

The Transaction Anomaly Detection Service is included in the Goldium DeFi platform. To use it, import the service or the associated hook:

```typescript
// Import the service directly
import { 
  getTransactionAnomalyDetectionService, 
  Anomaly,
  AnomalyType,
  AnomalySeverity
} from "@/services/transaction-anomaly-detection";

// Or use the hook (recommended)
import { useSecurity } from "@/hooks/useSecurity";
```

## API Reference

### Enums

#### `AnomalyType`

Categorizes the type of anomaly:

```typescript
export enum AnomalyType {
  UNUSUAL_PROGRAM = 'unusual_program',           // Interaction with unusual program
  HIGH_VALUE_TRANSFER = 'high_value_transfer',   // Unusually large value transfer
  UNUSUAL_ACCOUNT_CREATION = 'unusual_account_creation', // Creation of unusual number of accounts
  UNUSUAL_TOKEN_TRANSFER = 'unusual_token_transfer', // Transfer of unusual token
  UNUSUAL_PATTERN = 'unusual_pattern',           // Unusual operation pattern
  POTENTIAL_SCAM = 'potential_scam',             // Potential scam pattern
}
```

#### `AnomalySeverity`

Indicates the severity level of an anomaly:

```typescript
export enum AnomalySeverity {
  INFO = 'info',           // Informational anomaly
  WARNING = 'warning',     // Warning-level anomaly
  CRITICAL = 'critical',   // Critical-level anomaly
}
```

### Interfaces

#### `Anomaly`

Contains information about a detected anomaly:

```typescript
export interface Anomaly {
  type: AnomalyType;        // Type of anomaly
  severity: AnomalySeverity; // Severity level
  description: string;      // Human-readable description
  details?: any;            // Additional details
}
```

#### `TransactionHistoryItem`

Represents a historical transaction for comparison:

```typescript
export interface TransactionHistoryItem {
  signature: string;        // Transaction signature
  timestamp: number;        // When the transaction occurred
  programIds: string[];     // Programs involved in the transaction
  accounts: string[];       // Accounts involved in the transaction
  tokenTransfers?: {        // Token transfers in the transaction
    mint: string;           // Token mint address
    amount: number;         // Transfer amount
  }[];
  solTransfers?: {          // SOL transfers in the transaction
    amount: number;         // Transfer amount
  }[];
}
```

#### `AnomalyDetectionOptions`

Options for anomaly detection:

```typescript
export interface AnomalyDetectionOptions {
  tokenPrices?: Record<string, TokenPriceData>; // Token prices for value calculation
  transactionHistory?: TransactionHistoryItem[]; // Transaction history for comparison
  highValueThreshold?: number; // USD value threshold for high value transfers
  unusualProgramThreshold?: number; // Threshold for considering a program unusual
}
```

### Service Methods

#### `detectAnomalies`

Detects anomalies in a transaction:

```typescript
detectAnomalies(
  transaction: Transaction | VersionedTransaction | TransactionInstruction[],
  signers?: PublicKey[],
  options?: AnomalyDetectionOptions
): Promise<Anomaly[]>
```

**Parameters:**
- `transaction`: The transaction to analyze
- `signers`: Optional array of signer public keys
- `options`: Optional detection options

**Returns:** A promise that resolves to an array of detected `Anomaly` objects

### useSecurity Hook

The `useSecurity` hook provides access to the Transaction Anomaly Detection Service:

```typescript
function useSecurity() {
  // Anomaly detection
  const detectAnomalies: (
    transaction: Transaction | VersionedTransaction | TransactionInstruction[],
    signers?: PublicKey[],
    options?: AnomalyDetectionOptions
  ) => Promise<Anomaly[]>;
  
  // Helper functions
  const getAnomalySeverityDescription: (severity: AnomalySeverity) => string;
  const getAnomalySeverityColor: (severity: AnomalySeverity) => string;
  const getAnomalyTypeDescription: (type: AnomalyType) => string;
  
  // ... other security-related functions
}
```

## Usage Examples

### Basic Anomaly Detection

```typescript
import { 
  getTransactionAnomalyDetectionService, 
  AnomalySeverity 
} from "@/services/transaction-anomaly-detection";
import { Connection, Transaction, SystemProgram, PublicKey } from "@solana/web3.js";
import { NetworkType } from "@/components/NetworkContextProvider";

// Initialize the service
const connection = new Connection("https://api.mainnet-beta.solana.com");
const network: NetworkType = "mainnet-beta";
const anomalyService = getTransactionAnomalyDetectionService(connection, network);

// Create a transaction
const fromWallet = new PublicKey("8JUjWjAyXTMB4ZXcV7nk3p6Gg1fWAAoSck4b5tqNfY7Z");
const toWallet = new PublicKey("3Krd6c4vVKqgVkQMoMrxKNU7xQKkUY94ZvpWgPtKvkLF");
const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: fromWallet,
    toPubkey: toWallet,
    lamports: 10000000000, // 10 SOL (high value)
  })
);

// Detect anomalies
const detectAnomalies = async () => {
  // Mock transaction history
  const transactionHistory = [
    {
      signature: "5KKsWtSrFN7vgxJhVN6hQDgK9BzLez5un5QGNnbCxaVNWjkeke8L2oUQS6jZ9cXJFCdRa7ixiKDLaHJvQVciZuyi",
      timestamp: Date.now() - 86400000, // 1 day ago
      programIds: ["11111111111111111111111111111111"], // System program
      accounts: [fromWallet.toString(), "AnotherAddress123"],
      solTransfers: [{ amount: 0.1 * 1e9 }], // 0.1 SOL
    }
  ];
  
  const anomalies = await anomalyService.detectAnomalies(
    transaction, 
    [fromWallet],
    {
      highValueThreshold: 5, // $5 USD threshold for high value
      transactionHistory,
    }
  );
  
  console.log("Detected Anomalies:");
  
  if (anomalies.length === 0) {
    console.log("No anomalies detected.");
    return;
  }
  
  // Group by severity
  const criticalAnomalies = anomalies.filter(a => a.severity === AnomalySeverity.CRITICAL);
  const warningAnomalies = anomalies.filter(a => a.severity === AnomalySeverity.WARNING);
  const infoAnomalies = anomalies.filter(a => a.severity === AnomalySeverity.INFO);
  
  if (criticalAnomalies.length > 0) {
    console.log("\nCRITICAL ANOMALIES:");
    criticalAnomalies.forEach(anomaly => {
      console.log(`- ${anomaly.description}`);
    });
  }
  
  if (warningAnomalies.length > 0) {
    console.log("\nWARNINGS:");
    warningAnomalies.forEach(anomaly => {
      console.log(`- ${anomaly.description}`);
    });
  }
  
  if (infoAnomalies.length > 0) {
    console.log("\nINFORMATION:");
    infoAnomalies.forEach(anomaly => {
      console.log(`- ${anomaly.description}`);
    });
  }
};

detectAnomalies();
```

### Using with the Hook

```tsx
import { useSecurity } from "@/hooks/useSecurity";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTransactionTracking } from "@/hooks/useTransactionTracking";
import { SystemProgram, Transaction } from "@solana/web3.js";
import { useState } from "react";

function AnomalyDetectionComponent() {
  const { publicKey, sendTransaction } = useWallet();
  const { transactions } = useTransactionTracking();
  const { 
    detectAnomalies, 
    getAnomalySeverityDescription, 
    getAnomalySeverityColor,
    getAnomalyTypeDescription,
    AnomalySeverity 
  } = useSecurity();
  const [anomalies, setAnomalies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDetectAnomalies = async () => {
    if (!publicKey) return;
    
    setIsLoading(true);
    
    // Create a sample transfer transaction
    const recipientAddress = "3Krd6c4vVKqgVkQMoMrxKNU7xQKkUY94ZvpWgPtKvkLF";
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(recipientAddress),
        lamports: 5000000000, // 5 SOL (potentially high value)
      })
    );
    
    // Convert transaction history to the required format
    const transactionHistory = transactions.map(tx => ({
      signature: tx.signature,
      timestamp: tx.timestamp,
      programIds: tx.metadata?.programIds || [],
      accounts: [tx.walletAddress].filter(Boolean),
      solTransfers: tx.metadata?.sol?.map(sol => ({ amount: sol.amount })) || [],
    }));
    
    // Detect anomalies
    try {
      const detectedAnomalies = await detectAnomalies(
        transaction, 
        [publicKey],
        { transactionHistory }
      );
      setAnomalies(detectedAnomalies);
    } catch (error) {
      console.error("Failed to detect anomalies:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const hasCriticalAnomalies = anomalies.some(
    anomaly => anomaly.severity === AnomalySeverity.CRITICAL
  );
  
  return (
    <div>
      <button onClick={handleDetectAnomalies} disabled={!publicKey || isLoading}>
        Check Transaction Security
      </button>
      
      {isLoading && <div>Analyzing transaction...</div>}
      
      {anomalies.length > 0 && (
        <div>
          <h3>Security Analysis</h3>
          
          {hasCriticalAnomalies && (
            <div className="error-message">
              Critical security issues detected! This transaction may be unsafe.
            </div>
          )}
          
          <ul className="anomaly-list">
            {anomalies.map((anomaly, index) => (
              <li 
                key={index}
                className={`anomaly-item anomaly-${anomaly.severity}`}
              >
                <div className="anomaly-header">
                  <span className="anomaly-type">
                    {getAnomalyTypeDescription(anomaly.type)}
                  </span>
                  <span 
                    className="anomaly-severity"
                    style={{ color: getAnomalySeverityColor(anomaly.severity) }}
                  >
                    {getAnomalySeverityDescription(anomaly.severity)}
                  </span>
                </div>
                <div className="anomaly-description">
                  {anomaly.description}
                </div>
              </li>
            ))}
          </ul>
          
          <button 
            onClick={() => sendTransaction(transaction, connection)}
            disabled={hasCriticalAnomalies}
          >
            {hasCriticalAnomalies 
              ? "Transaction Blocked" 
              : "Proceed with Transaction"}
          </button>
        </div>
      )}
      
      {anomalies.length === 0 && !isLoading && (
        <div className="success-message">
          No security issues detected. This transaction appears safe.
        </div>
      )}
    </div>
  );
}
```

### Token Transfer Anomaly Detection

```tsx
import { useSecurity } from "@/hooks/useSecurity";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { 
  Transaction, 
  PublicKey, 
  TransactionInstruction 
} from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useState } from "react";

function TokenTransferAnomalyDetection() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { detectAnomalies, AnomalySeverity, AnomalyType } = useSecurity();
  const [anomalies, setAnomalies] = useState([]);
  
  const handleCheckTokenTransfer = async () => {
    if (!publicKey) return;
    
    // Token mint address (potentially unusual token)
    const mintAddress = new PublicKey("SomeUnusualTokenMintAddress123456789");
    
    // Recipient address
    const recipientAddress = new PublicKey("3Krd6c4vVKqgVkQMoMrxKNU7xQKkUY94ZvpWgPtKvkLF");
    
    // Get token accounts
    const fromTokenAccount = await Token.getAssociatedTokenAddress(
      TOKEN_PROGRAM_ID,
      mintAddress,
      publicKey
    );
    
    const toTokenAccount = await Token.getAssociatedTokenAddress(
      TOKEN_PROGRAM_ID,
      mintAddress,
      recipientAddress
    );
    
    // Create transfer instruction
    const transferInstruction = Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      fromTokenAccount,
      toTokenAccount,
      publicKey,
      [],
      1000000 // 1 token (with 6 decimals)
    );
    
    // Detect anomalies
    const detectedAnomalies = await detectAnomalies([transferInstruction], [publicKey]);
    setAnomalies(detectedAnomalies);
    
    // Check for specific anomaly types
    const hasUnusualToken = detectedAnomalies.some(
      anomaly => anomaly.type === AnomalyType.UNUSUAL_TOKEN_TRANSFER
    );
    
    const hasPotentialScam = detectedAnomalies.some(
      anomaly => anomaly.type === AnomalyType.POTENTIAL_SCAM
    );
    
    if (hasUnusualToken) {
      console.warn("Warning: This token is not commonly used in your transactions.");
    }
    
    if (hasPotentialScam) {
      console.error("Warning: This transaction matches patterns seen in scams.");
    }
  };
  
  return (
    <div>
      <button onClick={handleCheckTokenTransfer} disabled={!publicKey}>
        Check Token Transfer Security
      </button>
      
      {anomalies.length > 0 && (
        <div>
          <h3>Token Transfer Security Analysis</h3>
          
          <ul>
            {anomalies.map((anomaly, index) => (
              <li key={index}>
                <strong>{anomaly.type}:</strong> {anomaly.description}
                <span className={`severity-${anomaly.severity}`}>
                  ({anomaly.severity})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

## Integration with Other Services

The Transaction Anomaly Detection Service integrates with several other services in the Goldium DeFi platform:

- **Transaction Preview Service**: Uses preview data for anomaly detection
- **Transaction Approval Service**: Provides anomaly data for approval decisions
- **Transaction Tracking Service**: Uses transaction history for pattern analysis
- **Token Price Cache**: Uses token prices for value-based anomaly detection

## Best Practices

1. **Provide transaction history**: Always provide transaction history for better anomaly detection
2. **Explain anomalies**: Clearly explain detected anomalies to users in non-technical terms
3. **Use severity levels**: Differentiate between critical, warning, and informational anomalies
4. **Block critical anomalies**: Prevent transactions with critical anomalies from proceeding
5. **Update detection rules**: Regularly update detection rules as new scam patterns emerge
6. **Combine with approval**: Use anomaly detection as part of a comprehensive approval flow
7. **Allow overrides**: Let users override non-critical anomalies with explicit confirmation
