# Goldium DeFi Platform Security Services

## Overview

The security services of the Goldium DeFi platform provide robust protection mechanisms to safeguard users' assets and transactions. These services enable transaction preview, approval workflows, and anomaly detection to identify and prevent potential security risks before transactions are signed and sent to the blockchain.

## Available Security Services

### Transaction Preview Service

- [**Transaction Preview Service**](./transaction-preview.md): Generates detailed previews of transactions before they are signed, showing token transfers, SOL changes, and account modifications to enhance transparency.

### Transaction Approval Service

- [**Transaction Approval Service**](./transaction-approval.md): Assesses transaction risk levels, identifies potential security concerns, and enforces approval policies based on transaction characteristics.

### Anomaly Detection Service

- [**Anomaly Detection Service**](./anomaly-detection.md): Identifies unusual patterns and potential security threats in transactions by analyzing transaction characteristics against historical patterns and known risk factors.

## Security Architecture

The security services work together to provide a comprehensive security layer:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Services                          │
│                                                                 │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐    │
│  │ Transaction ├──────►│ Transaction │◄──────┤  Anomaly    │    │
│  │  Preview    │       │  Approval   │       │  Detection  │    │
│  └──────┬──────┘       └──────┬──────┘       └──────┬──────┘    │
│         │                     │                     │           │
│         │                     │                     │           │
│         ▼                     ▼                     ▼           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Security Decision                       │    │
│  │                                                          │    │
│  │  ┌───────────┐    ┌───────────┐    ┌───────────────┐     │    │
│  │  │ Approved  │    │ Requires  │    │   Rejected    │     │    │
│  │  │           │    │Confirmation│    │              │     │    │
│  │  └───────────┘    └───────────┘    └───────────────┘     │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Security Workflow

The typical security workflow involves three main steps:

1. **Transaction Preview**: Generate a detailed preview of the transaction to show the user exactly what will happen.
2. **Risk Assessment**: Evaluate the transaction for potential risks and determine an approval status.
3. **Anomaly Detection**: Identify unusual patterns or potential security threats in the transaction.

Based on the results of these steps, the transaction is either approved, requires confirmation, or is rejected.

## Integration Examples

### Basic Security Flow

```typescript
import { getTransactionPreviewService } from "@/services/transaction-preview";
import { getTransactionApprovalService } from "@/services/transaction-approval";
import { getTransactionAnomalyDetectionService } from "@/services/transaction-anomaly-detection";

// Initialize services
const previewService = getTransactionPreviewService(connection, network);
const approvalService = getTransactionApprovalService(connection, network);
const anomalyService = getTransactionAnomalyDetectionService(connection, network);

// Security workflow
const securityCheck = async (transaction, signers) => {
  // Step 1: Generate transaction preview
  const preview = await previewService.previewTransaction(transaction, signers);
  
  // Step 2: Assess transaction risk
  const approval = await approvalService.approveTransaction(transaction, signers);
  
  // Step 3: Detect anomalies
  const anomalies = await anomalyService.detectAnomalies(transaction, signers);
  
  // Determine if transaction can proceed
  const hasCriticalAnomalies = anomalies.some(
    anomaly => anomaly.severity === "critical"
  );
  
  const canProceed = 
    approval.status === "approved" || 
    (approval.status === "requires_confirmation" && !hasCriticalAnomalies);
  
  return {
    preview,
    approval,
    anomalies,
    canProceed
  };
};
```

### High-Value Transaction Security

```typescript
import { getTransactionApprovalService } from "@/services/transaction-approval";
import { getTokenPriceCacheService } from "@/services/token-price-cache";

// Initialize services
const approvalService = getTransactionApprovalService(connection, network);
const tokenPriceService = getTokenPriceCacheService(network);

// High-value transaction security
const secureHighValueTransaction = async (transaction, signers) => {
  // Get token prices for value calculation
  const tokenPrices = {
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": await tokenPriceService.getTokenPrice("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), // USDC
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": await tokenPriceService.getTokenPrice("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"), // USDT
    "So11111111111111111111111111111111111111112": await tokenPriceService.getTokenPrice("So11111111111111111111111111111111111111112"), // Wrapped SOL
  };
  
  // Approve with custom thresholds for high-value transactions
  const approval = await approvalService.approveTransaction(transaction, signers, {
    autoApproveThreshold: 100, // Auto-approve transactions under $100
    requireHardwareWalletThreshold: 1000, // Require hardware wallet for transactions over $1000
    tokenPrices,
  });
  
  // Check if hardware wallet is recommended
  if (approval.requiresHardwareWallet) {
    return {
      status: "hardware_wallet_recommended",
      message: "This high-value transaction should be signed with a hardware wallet for security.",
      approval
    };
  }
  
  // Check if confirmation is required
  if (approval.status === "requires_confirmation") {
    return {
      status: "confirmation_required",
      message: "This transaction requires explicit confirmation due to its value or complexity.",
      approval
    };
  }
  
  return {
    status: approval.status,
    approval
  };
};
```

### Anomaly Detection with Historical Context

```typescript
import { getTransactionAnomalyDetectionService } from "@/services/transaction-anomaly-detection";
import { getTransactionTrackingService } from "@/services/transaction-tracking";

// Initialize services
const anomalyService = getTransactionAnomalyDetectionService(connection, network);
const trackingService = getTransactionTrackingService(connection, network);

// Anomaly detection with historical context
const detectAnomaliesWithHistory = async (transaction, signers, walletAddress) => {
  // Get transaction history for the wallet
  const walletTransactions = trackingService.getTransactionsByWallet(walletAddress);
  
  // Convert to history items for anomaly detection
  const transactionHistory = walletTransactions.map(tx => ({
    signature: tx.signature,
    timestamp: tx.timestamp,
    programIds: tx.metadata?.programIds || [],
    accounts: [tx.walletAddress].filter(Boolean),
    tokenTransfers: tx.metadata?.tokens?.map(token => ({
      mint: token.mint,
      amount: token.amount,
    })),
    solTransfers: tx.metadata?.sol?.map(sol => ({
      amount: sol.amount,
    })),
  }));
  
  // Detect anomalies with historical context
  const anomalies = await anomalyService.detectAnomalies(transaction, signers, {
    transactionHistory,
    highValueThreshold: 500, // $500 USD threshold for high value transfers
    unusualProgramThreshold: 2, // Program must be seen at least twice to be considered usual
  });
  
  // Group anomalies by severity
  const criticalAnomalies = anomalies.filter(a => a.severity === "critical");
  const warningAnomalies = anomalies.filter(a => a.severity === "warning");
  const infoAnomalies = anomalies.filter(a => a.severity === "info");
  
  return {
    anomalies,
    criticalAnomalies,
    warningAnomalies,
    infoAnomalies,
    hasCriticalAnomalies: criticalAnomalies.length > 0
  };
};
```

## Security Best Practices

1. **Always preview transactions**: Generate a preview before sending any transaction to show users exactly what will happen.
2. **Implement multi-step approval**: Use a step-by-step security flow for high-value transactions.
3. **Respect risk levels**: Block or require confirmation for high-risk transactions.
4. **Use hardware wallets**: Recommend hardware wallets for high-value transactions.
5. **Provide clear explanations**: Clearly explain security issues to users in non-technical terms.
6. **Consider historical context**: Use transaction history for more accurate anomaly detection.
7. **Update security rules**: Regularly update known safe and risky program lists.
8. **Allow overrides**: Let users override non-critical warnings with explicit confirmation.

## Further Reading

For detailed information about each security service, including API reference and usage examples, see the individual service documentation:

- [Transaction Preview Service](./transaction-preview.md)
- [Transaction Approval Service](./transaction-approval.md)
- [Anomaly Detection Service](./anomaly-detection.md)
