# useCache Hook

## Overview

The `useCache` hook provides a React interface to the Goldium platform's caching services, enabling components to efficiently store and retrieve data while reducing network requests and improving performance. It unifies access to token price caching, contract state caching, transaction simulation caching, and general-purpose caching.

## Key Features

- **Token Price Caching**: Efficiently cache and retrieve token price data
- **Contract State Caching**: Cache on-chain program state with automatic updates
- **Transaction Simulation Caching**: Cache transaction simulation results
- **Network Response Caching**: Cache API responses to reduce network requests
- **Generic Caching**: Flexible caching for any type of data
- **Network Awareness**: Automatically adapts to network changes
- **Connection Integration**: Works with the current Solana connection

## Installation

The `useCache` hook is included in the Goldium DeFi platform. To use it, import it in your component:

```typescript
import { useCache } from "@/hooks/useCache";
```

## API Reference

### Hook Return Value

The `useCache` hook returns an object with the following properties and methods:

#### Token Price Caching

##### `getTokenPrice`

Gets the price data for a token:

```typescript
getTokenPrice(mintAddress: string | PublicKey): Promise<TokenPriceData | null>
```

**Parameters:**
- `mintAddress`: The token mint address

**Returns:** A promise that resolves to the token price data if available, or `null`

##### `getTokenPrices`

Gets price data for multiple tokens:

```typescript
getTokenPrices(mintAddresses: (string | PublicKey)[]): Promise<Record<string, TokenPriceData>>
```

**Parameters:**
- `mintAddresses`: Array of token mint addresses

**Returns:** A promise that resolves to an object mapping mint addresses to price data

#### Contract State Caching

##### `getContractState`

Gets the state of a contract account:

```typescript
getContractState<T = any>(
  programId: string | PublicKey,
  accountId: string | PublicKey,
  parser?: (data: Buffer) => T
): Promise<T | null>
```

**Parameters:**
- `programId`: The program ID
- `accountId`: The account ID
- `parser`: Optional function to parse the account data

**Returns:** A promise that resolves to the parsed account data if available, or `null`

##### `getContractStates`

Gets the state of multiple contract accounts:

```typescript
getContractStates<T = any>(
  programId: string | PublicKey,
  accountIds: (string | PublicKey)[],
  parser?: (data: Buffer) => T
): Promise<Record<string, T>>
```

**Parameters:**
- `programId`: The program ID
- `accountIds`: Array of account IDs
- `parser`: Optional function to parse the account data

**Returns:** A promise that resolves to an object mapping account IDs to parsed data

#### Transaction Simulation Caching

##### `simulateTransaction`

Simulates a transaction and caches the result:

```typescript
simulateTransaction(
  transaction: Transaction | VersionedTransaction | TransactionInstruction[],
  signers?: PublicKey[]
): Promise<TransactionSimulationResult>
```

**Parameters:**
- `transaction`: The transaction to simulate
- `signers`: Optional array of signer public keys

**Returns:** A promise that resolves to the simulation result

#### Generic Caching

##### `cacheData`

Caches arbitrary data:

```typescript
cacheData<T>(
  namespace: string,
  key: string,
  value: T,
  options?: Partial<CacheOptions>
): void
```

**Parameters:**
- `namespace`: Cache namespace
- `key`: Cache key
- `value`: Value to cache
- `options`: Optional cache options

##### `getCachedData`

Retrieves cached data:

```typescript
getCachedData<T>(
  namespace: string,
  key: string,
  options?: Partial<CacheOptions>
): T | null
```

**Parameters:**
- `namespace`: Cache namespace
- `key`: Cache key
- `options`: Optional cache options

**Returns:** The cached value if found and not expired, or `null`

##### `isDataCached`

Checks if data is cached:

```typescript
isDataCached(
  namespace: string,
  key: string,
  options?: Partial<CacheOptions>
): boolean
```

**Parameters:**
- `namespace`: Cache namespace
- `key`: Cache key
- `options`: Optional cache options

**Returns:** `true` if the data is cached and not expired, `false` otherwise

##### `deleteCachedData`

Deletes cached data:

```typescript
deleteCachedData(
  namespace: string,
  key: string,
  options?: Partial<CacheOptions>
): boolean
```

**Parameters:**
- `namespace`: Cache namespace
- `key`: Cache key
- `options`: Optional cache options

**Returns:** `true` if the data was found and deleted, `false` otherwise

##### `clearCache`

Clears a cache namespace:

```typescript
clearCache(
  namespace: string,
  options?: Partial<CacheOptions>
): void
```

**Parameters:**
- `namespace`: Cache namespace
- `options`: Optional cache options

##### `clearAllCaches`

Clears all caches:

```typescript
clearAllCaches(): void
```

#### Network Response Caching

##### `cacheNetworkResponse`

Caches a network response:

```typescript
cacheNetworkResponse<T>(
  endpoint: string,
  params: any,
  response: T,
  ttl?: number
): void
```

**Parameters:**
- `endpoint`: API endpoint
- `params`: Request parameters
- `response`: Response data
- `ttl`: Optional time-to-live in milliseconds

##### `getCachedNetworkResponse`

Gets a cached network response:

```typescript
getCachedNetworkResponse<T>(
  endpoint: string,
  params: any
): T | null
```

**Parameters:**
- `endpoint`: API endpoint
- `params`: Request parameters

**Returns:** The cached response if found and not expired, or `null`

##### `fetchWithCache`

Fetches data with caching:

```typescript
fetchWithCache<T>(
  url: string,
  options?: RequestInit,
  ttl?: number
): Promise<T>
```

**Parameters:**
- `url`: The URL to fetch
- `options`: Optional fetch options
- `ttl`: Optional time-to-live in milliseconds

**Returns:** A promise that resolves to the fetched or cached data

## Usage Examples

### Token Price Caching

```tsx
import { useCache } from "@/hooks/useCache";
import { useState, useEffect } from "react";

function TokenPriceDisplay({ mint }: { mint: string }) {
  const { getTokenPrice } = useCache();
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPrice = async () => {
      setLoading(true);
      const priceData = await getTokenPrice(mint);
      setPrice(priceData?.price || null);
      setLoading(false);
    };
    
    fetchPrice();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, [mint, getTokenPrice]);
  
  if (loading) {
    return <div>Loading price...</div>;
  }
  
  return (
    <div>
      {price !== null ? `$${price.toFixed(2)}` : "Price unavailable"}
    </div>
  );
}
```

### Contract State Caching

```tsx
import { useCache } from "@/hooks/useCache";
import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";

// Define a parser for the account data
const parsePoolData = (data: Buffer) => {
  return {
    tokenA: new PublicKey(data.slice(0, 32)),
    tokenB: new PublicKey(data.slice(32, 64)),
    reserves: [
      Number(data.readBigUInt64LE(64)),
      Number(data.readBigUInt64LE(72))
    ],
    // ... other fields
  };
};

function PoolInfoDisplay({ programId, poolAccount }: { programId: string, poolAccount: string }) {
  const { getContractState } = useCache();
  const [poolData, setPoolData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPoolData = async () => {
      setLoading(true);
      const data = await getContractState(programId, poolAccount, parsePoolData);
      setPoolData(data);
      setLoading(false);
    };
    
    fetchPoolData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPoolData, 30000);
    return () => clearInterval(interval);
  }, [programId, poolAccount, getContractState]);
  
  if (loading) {
    return <div>Loading pool data...</div>;
  }
  
  if (!poolData) {
    return <div>Pool not found</div>;
  }
  
  return (
    <div>
      <h3>Pool Info</h3>
      <div>Token A: {poolData.tokenA.toString()}</div>
      <div>Token B: {poolData.tokenB.toString()}</div>
      <div>Reserves: {poolData.reserves[0]} / {poolData.reserves[1]}</div>
    </div>
  );
}
```

### Transaction Simulation Caching

```tsx
import { useCache } from "@/hooks/useCache";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL 
} from "@solana/web3.js";

function TransactionSimulator() {
  const { publicKey } = useWallet();
  const { simulateTransaction } = useCache();
  const [amount, setAmount] = useState(0.1);
  const [recipient, setRecipient] = useState("");
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const handleSimulate = async () => {
    if (!publicKey || !recipient) return;
    
    setIsSimulating(true);
    
    try {
      // Create a transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipient),
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );
      
      // Simulate the transaction
      const result = await simulateTransaction(transaction, [publicKey]);
      setSimulationResult(result);
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setIsSimulating(false);
    }
  };
  
  return (
    <div>
      <h3>Transaction Simulator</h3>
      
      <div>
        <label>
          Recipient:
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Recipient address"
          />
        </label>
      </div>
      
      <div>
        <label>
          Amount (SOL):
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min="0.001"
            step="0.001"
          />
        </label>
      </div>
      
      <button onClick={handleSimulate} disabled={!publicKey || !recipient || isSimulating}>
        {isSimulating ? "Simulating..." : "Simulate Transaction"}
      </button>
      
      {simulationResult && (
        <div>
          <h4>Simulation Result</h4>
          <div>Success: {simulationResult.success ? "Yes" : "No"}</div>
          {simulationResult.error && <div>Error: {simulationResult.error}</div>}
          <div>Estimated Fee: {simulationResult.formattedEstimatedFee}</div>
          <div>Compute Units: {simulationResult.unitsConsumed || "Unknown"}</div>
        </div>
      )}
    </div>
  );
}
```

### Network Response Caching

```tsx
import { useCache } from "@/hooks/useCache";
import { useState, useEffect } from "react";

function TokenList() {
  const { fetchWithCache } = useCache();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      
      try {
        // This will use the cache if available, otherwise fetch from the API
        const data = await fetchWithCache(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100",
          undefined,
          5 * 60 * 1000 // 5 minute TTL
        );
        
        setTokens(data);
      } catch (error) {
        console.error("Failed to fetch tokens:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTokens();
  }, [fetchWithCache]);
  
  if (loading) {
    return <div>Loading tokens...</div>;
  }
  
  return (
    <div>
      <h3>Top Tokens</h3>
      <ul>
        {tokens.map(token => (
          <li key={token.id}>
            {token.name} ({token.symbol.toUpperCase()}): ${token.current_price}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Generic Caching

```tsx
import { useCache } from "@/hooks/useCache";
import { useState } from "react";

function UserPreferences() {
  const { cacheData, getCachedData, clearCache } = useCache();
  const [theme, setTheme] = useState(() => {
    // Initialize from cache if available
    return getCachedData("user-preferences", "theme") || "light";
  });
  const [fontSize, setFontSize] = useState(() => {
    // Initialize from cache if available
    return getCachedData("user-preferences", "fontSize") || "medium";
  });
  
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    // Cache the new theme
    cacheData("user-preferences", "theme", newTheme, {
      persistToStorage: true,
      ttl: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  };
  
  const handleFontSizeChange = (newSize: string) => {
    setFontSize(newSize);
    // Cache the new font size
    cacheData("user-preferences", "fontSize", newSize, {
      persistToStorage: true,
      ttl: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  };
  
  const handleResetPreferences = () => {
    setTheme("light");
    setFontSize("medium");
    // Clear the preferences cache
    clearCache("user-preferences");
  };
  
  return (
    <div>
      <h3>User Preferences</h3>
      
      <div>
        <label>
          Theme:
          <select value={theme} onChange={(e) => handleThemeChange(e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </label>
      </div>
      
      <div>
        <label>
          Font Size:
          <select value={fontSize} onChange={(e) => handleFontSizeChange(e.target.value)}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
      </div>
      
      <button onClick={handleResetPreferences}>
        Reset to Defaults
      </button>
    </div>
  );
}
```

## Integration with Other Hooks

The `useCache` hook integrates with several other hooks in the Goldium platform:

- **useTransaction**: Uses cached transaction simulations for gas estimation
- **useSecurity**: Uses cached token prices and contract state for security analysis
- **useNetworkMonitoring**: Uses cached network responses for performance metrics
- **useErrorMonitoring**: Provides context for cache-related errors

## Best Practices

1. **Use appropriate TTLs**: Set TTLs based on how frequently the data changes
2. **Handle cache misses**: Always have a fallback for when data isn't in the cache
3. **Validate cached data**: Verify that cached data is still valid before using it
4. **Use namespaces**: Separate different types of data into different namespaces
5. **Clear selectively**: Clear only the caches that need to be invalidated
6. **Combine with loading states**: Use loading states to indicate when data is being fetched
7. **Refresh periodically**: Set up intervals to refresh cached data that changes over time
