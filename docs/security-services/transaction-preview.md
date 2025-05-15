# Transaction Preview Service

## Overview

The Transaction Preview Service provides detailed previews of transactions before they are signed and sent to the blockchain. It simulates transactions to show users exactly what changes will occur, including token transfers, SOL changes, and account modifications, enhancing transparency and security.

## Key Features

- **Token Transfer Preview**: Shows exact token amounts being transferred
- **SOL Transfer Preview**: Shows SOL amounts and transaction fees
- **USD Value Calculation**: Converts token and SOL amounts to USD values
- **Account Analysis**: Shows which accounts will be modified
- **New Account Detection**: Identifies new accounts being created
- **Warning Generation**: Highlights potentially risky aspects of transactions
- **Cross-Network Support**: Works across Mainnet, Testnet, and Devnet

## Installation

The Transaction Preview Service is included in the Goldium DeFi platform. To use it, import the service or the associated hook:

```typescript
// Import the service directly
import { 
  getTransactionPreviewService, 
  TransactionPreview 
} from "@/services/transaction-preview";

// Or use the hook (recommended)
import { useSecurity } from "@/hooks/useSecurity";
```

## API Reference

### Interfaces

#### `TokenAmountChange`

Represents a token balance change:

```typescript
export interface TokenAmountChange {
  mint: string;              // Token mint address
  mintName?: string;         // Token name
  mintSymbol?: string;       // Token symbol
  mintDecimals: number;      // Token decimals
  walletAddress: string;     // Wallet address
  preBalance: number;        // Balance before transaction
  postBalance: number;       // Balance after transaction
  rawChange: number;         // Raw change amount
  formattedChange: string;   // Formatted change amount
  usdValue?: number;         // USD value of the change
}
```

#### `SolAmountChange`

Represents a SOL balance change:

```typescript
export interface SolAmountChange {
  walletAddress: string;     // Wallet address
  preBalance: number;        // Balance before transaction
  postBalance: number;       // Balance after transaction
  rawChange: number;         // Raw change amount
  formattedChange: string;   // Formatted change amount
  usdValue?: number;         // USD value of the change
  fee: number;               // Transaction fee
  formattedFee: string;      // Formatted transaction fee
}
```

#### `TransactionPreview`

Contains the complete transaction preview:

```typescript
export interface TransactionPreview {
  success: boolean;          // Whether the simulation was successful
  error?: string;            // Error message if simulation failed
  warnings: string[];        // Warning messages
  tokenChanges: TokenAmountChange[]; // Token balance changes
  solChanges: SolAmountChange[]; // SOL balance changes
  logs: string[];            // Simulation logs
  unitsConsumed?: number;    // Compute units consumed
  estimatedFee: number;      // Estimated transaction fee
  formattedEstimatedFee: string; // Formatted transaction fee
  accounts: {
    writableCount: number;   // Number of writable accounts
    signerCount: number;     // Number of signer accounts
    readonlyCount: number;   // Number of readonly accounts
    newAccounts: string[];   // New accounts being created
    programIds: string[];    // Program IDs being called
  };
}
```

### Service Methods

#### `previewTransaction`

Generates a preview for a transaction:

```typescript
previewTransaction(
  transaction: Transaction | VersionedTransaction | TransactionInstruction[],
  signers?: PublicKey[],
  tokenPrices?: Record<string, TokenPriceData>
): Promise<TransactionPreview>
```

**Parameters:**
- `transaction`: The transaction to preview
- `signers`: Optional array of signer public keys
- `tokenPrices`: Optional token price data for USD value calculation

**Returns:** A promise that resolves to a `TransactionPreview` object

### useSecurity Hook

The `useSecurity` hook provides access to the Transaction Preview Service:

```typescript
function useSecurity() {
  // Transaction preview
  const previewTransaction: (
    transaction: Transaction | VersionedTransaction | TransactionInstruction[],
    signers?: PublicKey[]
  ) => Promise<TransactionPreview>;
  
  // ... other security-related functions
}
```

## Usage Examples

### Basic Transaction Preview

```typescript
import { getTransactionPreviewService } from "@/services/transaction-preview";
import { Connection, Transaction, SystemProgram, PublicKey } from "@solana/web3.js";
import { NetworkType } from "@/components/NetworkContextProvider";

// Initialize the service
const connection = new Connection("https://api.mainnet-beta.solana.com");
const network: NetworkType = "mainnet-beta";
const previewService = getTransactionPreviewService(connection, network);

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

// Preview the transaction
const previewTransaction = async () => {
  const preview = await previewService.previewTransaction(transaction, [fromWallet]);
  
  console.log("Transaction Preview:");
  console.log(`Success: ${preview.success}`);
  console.log(`Estimated Fee: ${preview.formattedEstimatedFee}`);
  
  // Display SOL changes
  console.log("\nSOL Changes:");
  preview.solChanges.forEach(change => {
    console.log(`${change.walletAddress}: ${change.formattedChange}`);
    if (change.usdValue) {
      console.log(`USD Value: $${change.usdValue.toFixed(2)}`);
    }
  });
  
  // Display warnings
  if (preview.warnings.length > 0) {
    console.log("\nWarnings:");
    preview.warnings.forEach(warning => {
      console.log(`- ${warning}`);
    });
  }
};

previewTransaction();
```

### Using with the Hook

```tsx
import { useSecurity } from "@/hooks/useSecurity";
import { useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram, Transaction } from "@solana/web3.js";
import { useState } from "react";

function TransactionPreviewComponent() {
  const { publicKey, sendTransaction } = useWallet();
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
  
  const handleSendTransaction = async () => {
    if (!publicKey || !preview || !preview.success) return;
    
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
          
          <button 
            onClick={handleSendTransaction} 
            disabled={!preview.success}
          >
            Send Transaction
          </button>
        </div>
      )}
    </div>
  );
}
```

### Token Transfer Preview

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

function TokenTransferPreview() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { previewTransaction } = useSecurity();
  const [preview, setPreview] = useState(null);
  
  const handlePreviewTokenTransfer = async () => {
    if (!publicKey) return;
    
    // Token mint address (e.g., USDC)
    const mintAddress = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    
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
      1000000 // 1 USDC (6 decimals)
    );
    
    // Preview the transaction
    const txPreview = await previewTransaction([transferInstruction], [publicKey]);
    setPreview(txPreview);
  };
  
  return (
    <div>
      <button onClick={handlePreviewTokenTransfer} disabled={!publicKey}>
        Preview Token Transfer
      </button>
      
      {preview && (
        <div>
          <h3>Token Transfer Preview</h3>
          
          <div>
            <h4>Token Changes</h4>
            {preview.tokenChanges.map((change, index) => (
              <div key={index}>
                <div>{change.mintSymbol || change.mintName || change.mint.slice(0, 8)}</div>
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

## Integration with Other Services

The Transaction Preview Service integrates with several other services in the Goldium DeFi platform:

- **Transaction Approval Service**: Uses preview data for risk assessment
- **Transaction Anomaly Detection**: Uses preview data to detect anomalies
- **Token Price Cache**: Uses token prices for USD value calculation
- **Transaction Simulation Cache**: Caches simulation results for performance

## Best Practices

1. **Always preview before sending**: Generate a preview before sending any transaction
2. **Show USD values**: Display USD values to help users understand the transaction's impact
3. **Highlight warnings**: Make warnings clearly visible to users
4. **Provide context**: Explain what each change means in user-friendly terms
5. **Handle simulation failures**: Gracefully handle cases where simulation fails
6. **Use with approval flow**: Combine with the Transaction Approval Service for enhanced security
7. **Cache token prices**: Provide token prices to the preview service for accurate USD values
