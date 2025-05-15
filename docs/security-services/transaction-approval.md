# Transaction Approval Service

## Overview

The Transaction Approval Service provides a security layer for evaluating and approving transactions before they are signed and sent to the blockchain. It assesses transaction risk levels, identifies potential security concerns, and enforces approval policies based on transaction characteristics.

## Key Features

- **Risk Assessment**: Evaluates transactions for potential risks
- **Multi-level Approval**: Different approval requirements based on risk level
- **Hardware Wallet Recommendations**: Suggests hardware wallet use for high-value transactions
- **Program ID Verification**: Checks program IDs against known safe and risky lists
- **Value-based Policies**: Enforces stricter approval for high-value transactions
- **Integration with Preview**: Uses transaction preview data for comprehensive assessment
- **Cross-Network Support**: Works across Mainnet, Testnet, and Devnet

## Installation

The Transaction Approval Service is included in the Goldium DeFi platform. To use it, import the service or the associated hook:

```typescript
// Import the service directly
import { 
  getTransactionApprovalService, 
  TransactionApprovalResult,
  TransactionApprovalStatus,
  TransactionRiskLevel
} from "@/services/transaction-approval";

// Or use the hook (recommended)
import { useSecurity } from "@/hooks/useSecurity";
```

## API Reference

### Enums

#### `TransactionRiskLevel`

Represents the risk level of a transaction:

```typescript
export enum TransactionRiskLevel {
  LOW = 'low',           // Low risk transaction
  MEDIUM = 'medium',     // Medium risk transaction
  HIGH = 'high',         // High risk transaction
  CRITICAL = 'critical', // Critical risk transaction
}
```

#### `TransactionApprovalStatus`

Represents the approval status of a transaction:

```typescript
export enum TransactionApprovalStatus {
  APPROVED = 'approved',                 // Transaction is approved
  REJECTED = 'rejected',                 // Transaction is rejected
  PENDING = 'pending',                   // Transaction is pending approval
  REQUIRES_CONFIRMATION = 'requires_confirmation', // Transaction requires user confirmation
}
```

### Interfaces

#### `TransactionApprovalResult`

Contains the result of a transaction approval:

```typescript
export interface TransactionApprovalResult {
  status: TransactionApprovalStatus;  // Approval status
  riskLevel: TransactionRiskLevel;    // Risk level
  riskFactors: string[];              // Risk factors identified
  preview: TransactionPreview;        // Transaction preview
  requiresConfirmation: boolean;      // Whether user confirmation is required
  requiresHardwareWallet: boolean;    // Whether a hardware wallet is recommended
}
```

#### `TransactionApprovalOptions`

Options for transaction approval:

```typescript
export interface TransactionApprovalOptions {
  autoApproveThreshold?: number;      // USD value threshold for auto-approval
  requireHardwareWalletThreshold?: number; // USD value threshold for requiring hardware wallet
  skipPreview?: boolean;              // Skip preview generation
  tokenPrices?: Record<string, TokenPriceData>; // Token prices for value calculation
}
```

### Service Methods

#### `approveTransaction`

Approves a transaction:

```typescript
approveTransaction(
  transaction: Transaction | VersionedTransaction | TransactionInstruction[],
  signers?: PublicKey[],
  options?: TransactionApprovalOptions
): Promise<TransactionApprovalResult>
```

**Parameters:**
- `transaction`: The transaction to approve
- `signers`: Optional array of signer public keys
- `options`: Optional approval options

**Returns:** A promise that resolves to a `TransactionApprovalResult` object

### useSecurity Hook

The `useSecurity` hook provides access to the Transaction Approval Service:

```typescript
function useSecurity() {
  // Transaction approval
  const approveTransaction: (
    transaction: Transaction | VersionedTransaction | TransactionInstruction[],
    signers?: PublicKey[],
    options?: TransactionApprovalOptions
  ) => Promise<TransactionApprovalResult>;
  
  // Helper functions
  const getRiskLevelDescription: (riskLevel: TransactionRiskLevel) => string;
  const getRiskLevelColor: (riskLevel: TransactionRiskLevel) => string;
  
  // ... other security-related functions
}
```

## Usage Examples

### Basic Transaction Approval

```typescript
import { 
  getTransactionApprovalService, 
  TransactionApprovalStatus,
  TransactionRiskLevel
} from "@/services/transaction-approval";
import { Connection, Transaction, SystemProgram, PublicKey } from "@solana/web3.js";
import { NetworkType } from "@/components/NetworkContextProvider";

// Initialize the service
const connection = new Connection("https://api.mainnet-beta.solana.com");
const network: NetworkType = "mainnet-beta";
const approvalService = getTransactionApprovalService(connection, network);

// Create a transaction
const fromWallet = new PublicKey("8JUjWjAyXTMB4ZXcV7nk3p6Gg1fWAAoSck4b5tqNfY7Z");
const toWallet = new PublicKey("3Krd6c4vVKqgVkQMoMrxKNU7xQKkUY94ZvpWgPtKvkLF");
const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: fromWallet,
    toPubkey: toWallet,
    lamports: 1000000000, // 1 SOL
  })
);

// Approve the transaction
const approveTransaction = async () => {
  const result = await approvalService.approveTransaction(transaction, [fromWallet]);
  
  console.log("Approval Result:");
  console.log(`Status: ${result.status}`);
  console.log(`Risk Level: ${result.riskLevel}`);
  
  // Display risk factors
  if (result.riskFactors.length > 0) {
    console.log("\nRisk Factors:");
    result.riskFactors.forEach(factor => {
      console.log(`- ${factor}`);
    });
  }
  
  // Check if confirmation is required
  if (result.requiresConfirmation) {
    console.log("\nThis transaction requires explicit user confirmation.");
  }
  
  // Check if hardware wallet is recommended
  if (result.requiresHardwareWallet) {
    console.log("\nA hardware wallet is recommended for this transaction.");
  }
  
  // Determine if the transaction should proceed
  if (result.status === TransactionApprovalStatus.APPROVED) {
    console.log("\nTransaction is approved and can proceed.");
  } else if (result.status === TransactionApprovalStatus.REQUIRES_CONFIRMATION) {
    console.log("\nTransaction requires user confirmation before proceeding.");
  } else {
    console.log("\nTransaction is rejected and should not proceed.");
  }
};

approveTransaction();
```

### Using with the Hook

```tsx
import { useSecurity } from "@/hooks/useSecurity";
import { useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram, Transaction } from "@solana/web3.js";
import { useState } from "react";

function TransactionApprovalComponent() {
  const { publicKey, sendTransaction } = useWallet();
  const { 
    approveTransaction, 
    getRiskLevelDescription, 
    getRiskLevelColor,
    TransactionApprovalStatus 
  } = useSecurity();
  const [approvalResult, setApprovalResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleApproveTransfer = async () => {
    if (!publicKey) return;
    
    setIsLoading(true);
    
    // Create a sample transfer transaction
    const recipientAddress = "3Krd6c4vVKqgVkQMoMrxKNU7xQKkUY94ZvpWgPtKvkLF";
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(recipientAddress),
        lamports: 100000000, // 0.1 SOL
      })
    );
    
    // Approve transaction
    try {
      const result = await approveTransaction(transaction, [publicKey]);
      setApprovalResult(result);
    } catch (error) {
      console.error("Failed to approve transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendTransaction = async () => {
    if (!publicKey || !approvalResult || 
        (approvalResult.status !== TransactionApprovalStatus.APPROVED && 
         approvalResult.status !== TransactionApprovalStatus.REQUIRES_CONFIRMATION)) {
      return;
    }
    
    // Create the transaction again
    const recipientAddress = "3Krd6c4vVKqgVkQMoMrxKNU7xQKkUY94ZvpWgPtKvkLF";
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(recipientAddress),
        lamports: 100000000, // 0.1 SOL
      })
    );
    
    // Send the transaction
    try {
      const signature = await sendTransaction(transaction, connection);
      console.log("Transaction sent:", signature);
    } catch (error) {
      console.error("Failed to send transaction:", error);
    }
  };
  
  return (
    <div>
      <button onClick={handleApproveTransfer} disabled={!publicKey || isLoading}>
        Approve Transfer
      </button>
      
      {isLoading && <div>Approving transaction...</div>}
      
      {approvalResult && (
        <div>
          <h3>Transaction Approval</h3>
          
          <div>
            <h4>Status</h4>
            <div>{approvalResult.status}</div>
          </div>
          
          <div>
            <h4>Risk Level</h4>
            <div style={{ color: getRiskLevelColor(approvalResult.riskLevel) }}>
              {getRiskLevelDescription(approvalResult.riskLevel)}
            </div>
          </div>
          
          {approvalResult.riskFactors.length > 0 && (
            <div>
              <h4>Risk Factors</h4>
              <ul>
                {approvalResult.riskFactors.map((factor, index) => (
                  <li key={index}>{factor}</li>
                ))}
              </ul>
            </div>
          )}
          
          {approvalResult.requiresHardwareWallet && (
            <div className="warning">
              A hardware wallet is recommended for this transaction.
            </div>
          )}
          
          <button 
            onClick={handleSendTransaction} 
            disabled={
              approvalResult.status !== TransactionApprovalStatus.APPROVED && 
              approvalResult.status !== TransactionApprovalStatus.REQUIRES_CONFIRMATION
            }
          >
            Send Transaction
          </button>
        </div>
      )}
    </div>
  );
}
```

### High-Value Transaction Approval

```tsx
import { useSecurity } from "@/hooks/useSecurity";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCache } from "@/hooks/useCache";
import { SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useState } from "react";

function HighValueTransactionApproval() {
  const { publicKey } = useWallet();
  const { approveTransaction, TransactionApprovalStatus } = useSecurity();
  const { getTokenPrices } = useCache();
  const [amount, setAmount] = useState(1); // SOL amount
  const [approvalResult, setApprovalResult] = useState(null);
  
  const handleApproveHighValueTransfer = async () => {
    if (!publicKey) return;
    
    // Get SOL price for USD value calculation
    const tokenPrices = await getTokenPrices(["So11111111111111111111111111111111111111112"]);
    
    // Create a high-value transfer transaction
    const recipientAddress = "3Krd6c4vVKqgVkQMoMrxKNU7xQKkUY94ZvpWgPtKvkLF";
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(recipientAddress),
        lamports: amount * LAMPORTS_PER_SOL, // Convert to lamports
      })
    );
    
    // Approve with custom thresholds
    const result = await approveTransaction(transaction, [publicKey], {
      autoApproveThreshold: 50, // Auto-approve transactions under $50
      requireHardwareWalletThreshold: 500, // Require hardware wallet for transactions over $500
      tokenPrices,
    });
    
    setApprovalResult(result);
  };
  
  return (
    <div>
      <div>
        <label>
          Amount (SOL):
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min="0.1"
            step="0.1"
          />
        </label>
      </div>
      
      <button onClick={handleApproveHighValueTransfer} disabled={!publicKey}>
        Approve Transfer
      </button>
      
      {approvalResult && (
        <div>
          <h3>High-Value Transaction Approval</h3>
          
          <div>
            <h4>Status</h4>
            <div>{approvalResult.status}</div>
          </div>
          
          {approvalResult.requiresConfirmation && (
            <div className="warning">
              This transaction requires explicit confirmation due to its value.
            </div>
          )}
          
          {approvalResult.requiresHardwareWallet && (
            <div className="warning">
              This high-value transaction should be signed with a hardware wallet.
            </div>
          )}
          
          {approvalResult.status === TransactionApprovalStatus.REJECTED && (
            <div className="error">
              This transaction was rejected due to high risk factors.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

## Integration with Other Services

The Transaction Approval Service integrates with several other services in the Goldium DeFi platform:

- **Transaction Preview Service**: Uses preview data for risk assessment
- **Transaction Anomaly Detection**: Uses anomaly detection for risk assessment
- **Token Price Cache**: Uses token prices for value-based approval policies
- **Error Monitoring Service**: Logs approval failures for monitoring

## Best Practices

1. **Use appropriate thresholds**: Set approval thresholds based on your application's risk profile
2. **Always show risk factors**: Display risk factors to users for informed decisions
3. **Enforce hardware wallet use**: Require hardware wallets for high-value transactions
4. **Provide clear feedback**: Clearly communicate approval status and reasons
5. **Combine with preview**: Always show transaction preview alongside approval status
6. **Update program lists**: Regularly update known safe and risky program lists
7. **Respect user decisions**: Allow users to override non-critical warnings with confirmation
