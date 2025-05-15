# useSecurity Hook

## Overview

The `useSecurity` hook provides a React interface to the Goldium platform's security services, enabling components to implement robust transaction security features. It unifies access to transaction preview, transaction approval, and anomaly detection services to help protect users from potential security risks.

## Key Features

- **Transaction Preview**: Generate detailed previews of transactions before signing
- **Transaction Approval**: Assess transaction risk levels and enforce approval policies
- **Anomaly Detection**: Identify unusual patterns and potential security threats
- **Risk Assessment**: Evaluate transactions for potential risks
- **User-Friendly Descriptions**: Convert technical security information into user-friendly text
- **Cross-Network Support**: Works across Mainnet, Testnet, and Devnet
- **Integration with Wallet**: Works with the connected wallet

## Installation

The `useSecurity` hook is included in the Goldium DeFi platform. To use it, import it in your component:

```typescript
import { useSecurity } from "@/hooks/useSecurity";
```

## API Reference

### Hook Return Value

The `useSecurity` hook returns an object with the following properties and methods:

#### Transaction Preview

##### `previewTransaction`

Generates a preview for a transaction:

```typescript
previewTransaction(
  transaction: Transaction | VersionedTransaction | TransactionInstruction[],
  signers?: PublicKey[]
): Promise<TransactionPreview>
```

**Parameters:**
- `transaction`: The transaction to preview
- `signers`: Optional array of signer public keys

**Returns:** A promise that resolves to a `TransactionPreview` object

#### Transaction Approval

##### `approveTransaction`

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

#### Anomaly Detection

##### `detectAnomalies`

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

#### Helper Functions

##### `getRiskLevelDescription`

Gets a user-friendly description of a risk level:

```typescript
getRiskLevelDescription(riskLevel: TransactionRiskLevel): string
```

**Parameters:**
- `riskLevel`: The risk level

**Returns:** A user-friendly description of the risk level

##### `getRiskLevelColor`

Gets a color associated with a risk level:

```typescript
getRiskLevelColor(riskLevel: TransactionRiskLevel): string
```

**Parameters:**
- `riskLevel`: The risk level

**Returns:** A color string (e.g., "green", "yellow", "red")

##### `getAnomalySeverityDescription`

Gets a user-friendly description of an anomaly severity:

```typescript
getAnomalySeverityDescription(severity: AnomalySeverity): string
```

**Parameters:**
- `severity`: The anomaly severity

**Returns:** A user-friendly description of the severity

##### `getAnomalySeverityColor`

Gets a color associated with an anomaly severity:

```typescript
getAnomalySeverityColor(severity: AnomalySeverity): string
```

**Parameters:**
- `severity`: The anomaly severity

**Returns:** A color string (e.g., "blue", "yellow", "red")

##### `getAnomalyTypeDescription`

Gets a user-friendly description of an anomaly type:

```typescript
getAnomalyTypeDescription(type: AnomalyType): string
```

**Parameters:**
- `type`: The anomaly type

**Returns:** A user-friendly description of the type

#### Constants

The hook also provides access to the following enums:

- `TransactionApprovalStatus`: Enum for transaction approval status
- `TransactionRiskLevel`: Enum for transaction risk levels
- `AnomalyType`: Enum for anomaly types
- `AnomalySeverity`: Enum for anomaly severity levels

## Usage Examples

### Transaction Preview

```tsx
import { useSecurity } from "@/hooks/useSecurity";
import { useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram, Transaction } from "@solana/web3.js";
import { useState } from "react";

function TransactionPreviewComponent() {
  const { publicKey } = useWallet();
  const { previewTransaction } = useSecurity();
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePreviewTransfer = async () => {
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
    
    // Generate preview
    try {
      const txPreview = await previewTransaction(transaction, [publicKey]);
      setPreview(txPreview);
    } catch (error) {
      console.error("Failed to preview transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={handlePreviewTransfer} disabled={!publicKey || isLoading}>
        Preview Transfer
      </button>
      
      {isLoading && <div>Generating preview...</div>}
      
      {preview && (
        <div>
          <h3>Transaction Preview</h3>
          
          <div>
            <h4>SOL Changes</h4>
            {preview.solChanges.map((change, index) => (
              <div key={index}>
                <div>{change.walletAddress.slice(0, 4)}...{change.walletAddress.slice(-4)}</div>
                <div className={change.rawChange >= 0 ? "text-green-500" : "text-red-500"}>
                  {change.formattedChange}
                </div>
                {change.usdValue && <div>${change.usdValue.toFixed(2)}</div>}
              </div>
            ))}
          </div>
          
          <div>
            <h4>Fee</h4>
            <div>{preview.formattedEstimatedFee}</div>
          </div>
          
          {preview.warnings.length > 0 && (
            <div>
              <h4>Warnings</h4>
              <ul>
                {preview.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Transaction Approval

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

### Anomaly Detection

```tsx
import { useSecurity } from "@/hooks/useSecurity";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTransactionTracking } from "@/hooks/useTransactionTracking";
import { SystemProgram, Transaction } from "@solana/web3.js";
import { useState } from "react";

function AnomalyDetectionComponent() {
  const { publicKey } = useWallet();
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

### Comprehensive Transaction Security

```tsx
import { useSecurity } from "@/hooks/useSecurity";
import { useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram, Transaction } from "@solana/web3.js";
import { useState } from "react";

function SecureTransactionComponent() {
  const { publicKey, sendTransaction } = useWallet();
  const { 
    previewTransaction, 
    approveTransaction, 
    detectAnomalies,
    TransactionApprovalStatus,
    AnomalySeverity
  } = useSecurity();
  const [preview, setPreview] = useState(null);
  const [approvalResult, setApprovalResult] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState("preview"); // "preview", "approve", "anomalies", "confirm"
  
  const createTransaction = () => {
    if (!publicKey) return null;
    
    // Create a sample transfer transaction
    const recipientAddress = "3Krd6c4vVKqgVkQMoMrxKNU7xQKkUY94ZvpWgPtKvkLF";
    return new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(recipientAddress),
        lamports: 100000000, // 0.1 SOL
      })
    );
  };
  
  const handlePreview = async () => {
    const transaction = createTransaction();
    if (!transaction) return;
    
    setIsLoading(true);
    
    try {
      const txPreview = await previewTransaction(transaction, [publicKey]);
      setPreview(txPreview);
      setStep("approve");
    } catch (error) {
      console.error("Failed to preview transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApprove = async () => {
    const transaction = createTransaction();
    if (!transaction) return;
    
    setIsLoading(true);
    
    try {
      const result = await approveTransaction(transaction, [publicKey]);
      setApprovalResult(result);
      setStep("anomalies");
    } catch (error) {
      console.error("Failed to approve transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDetectAnomalies = async () => {
    const transaction = createTransaction();
    if (!transaction) return;
    
    setIsLoading(true);
    
    try {
      const detectedAnomalies = await detectAnomalies(transaction, [publicKey]);
      setAnomalies(detectedAnomalies);
      setStep("confirm");
    } catch (error) {
      console.error("Failed to detect anomalies:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendTransaction = async () => {
    const transaction = createTransaction();
    if (!transaction) return;
    
    try {
      const signature = await sendTransaction(transaction, connection);
      console.log("Transaction sent:", signature);
    } catch (error) {
      console.error("Failed to send transaction:", error);
    }
  };
  
  const canProceed = () => {
    if (step === "confirm") {
      // Check if transaction can proceed
      const isApproved = 
        approvalResult && 
        (approvalResult.status === TransactionApprovalStatus.APPROVED || 
         approvalResult.status === TransactionApprovalStatus.REQUIRES_CONFIRMATION);
      
      const hasCriticalAnomalies = 
        anomalies.some(anomaly => anomaly.severity === AnomalySeverity.CRITICAL);
      
      return isApproved && !hasCriticalAnomalies;
    }
    
    return true;
  };
  
  return (
    <div>
      <h2>Secure Transaction Flow</h2>
      
      <div className="steps">
        <div className={`step ${step === "preview" ? "active" : ""}`}>
          <h3>1. Preview Transaction</h3>
          {step === "preview" && (
            <button onClick={handlePreview} disabled={!publicKey || isLoading}>
              Generate Preview
            </button>
          )}
          {preview && (
            <div className="preview-summary">
              <div>Changes: {preview.tokenChanges.length + preview.solChanges.length}</div>
              <div>Fee: {preview.formattedEstimatedFee}</div>
            </div>
          )}
        </div>
        
        <div className={`step ${step === "approve" ? "active" : ""}`}>
          <h3>2. Security Approval</h3>
          {step === "approve" && (
            <button onClick={handleApprove} disabled={!publicKey || isLoading}>
              Approve Transaction
            </button>
          )}
          {approvalResult && (
            <div className="approval-summary">
              <div>Status: {approvalResult.status}</div>
              <div>Risk Level: {approvalResult.riskLevel}</div>
            </div>
          )}
        </div>
        
        <div className={`step ${step === "anomalies" ? "active" : ""}`}>
          <h3>3. Anomaly Detection</h3>
          {step === "anomalies" && (
            <button onClick={handleDetectAnomalies} disabled={!publicKey || isLoading}>
              Check for Anomalies
            </button>
          )}
          {anomalies.length > 0 && (
            <div className="anomalies-summary">
              <div>Anomalies: {anomalies.length}</div>
              <div>
                Critical: {anomalies.filter(a => a.severity === AnomalySeverity.CRITICAL).length}
              </div>
            </div>
          )}
        </div>
        
        <div className={`step ${step === "confirm" ? "active" : ""}`}>
          <h3>4. Confirm and Send</h3>
          {step === "confirm" && (
            <button 
              onClick={handleSendTransaction} 
              disabled={!publicKey || isLoading || !canProceed()}
            >
              {canProceed() ? "Send Transaction" : "Transaction Blocked"}
            </button>
          )}
        </div>
      </div>
      
      {isLoading && <div className="loading">Processing...</div>}
    </div>
  );
}
```

## Integration with Other Hooks

The `useSecurity` hook integrates with several other hooks in the Goldium platform:

- **useTransaction**: Uses security services for transaction sending
- **useCache**: Uses cached token prices and contract state for security analysis
- **useTransactionTracking**: Uses transaction history for anomaly detection
- **useErrorMonitoring**: Provides context for security-related errors

## Best Practices

1. **Always preview transactions**: Generate a preview before sending any transaction
2. **Check approval status**: Verify that transactions are approved before sending
3. **Detect anomalies**: Use anomaly detection to identify potential security issues
4. **Explain security issues**: Clearly explain security issues to users in non-technical terms
5. **Use a multi-step flow**: Implement a step-by-step security flow for high-value transactions
6. **Respect risk levels**: Block or require confirmation for high-risk transactions
7. **Provide visual cues**: Use colors and icons to indicate risk levels and security status
