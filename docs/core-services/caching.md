# Caching Services

## Overview

The Goldium DeFi platform includes a comprehensive caching system designed to reduce RPC calls, improve performance, and enhance the user experience. The caching system consists of a general-purpose cache service and several specialized caching services for specific data types.

## Key Features

- **Time-Based Expiration**: All cached data has configurable TTL (Time To Live)
- **Namespace Separation**: Different data types are stored in separate namespaces
- **Persistence**: Cache can be persisted to localStorage for session continuity
- **Automatic Cleanup**: Expired cache entries are automatically removed
- **Size Limits**: Maximum cache size can be configured to prevent memory issues
- **Specialized Caches**: Dedicated caching services for tokens, contracts, and transactions
- **Network-Aware**: Cache is aware of the current network context

## Cache Services

The Goldium caching system includes the following services:

1. **General Cache Service**: Base caching functionality for any data type
2. **Token Price Cache**: Caches token price data with automatic updates
3. **Contract State Cache**: Caches on-chain program state with real-time updates
4. **Transaction Simulation Cache**: Caches transaction simulation results
5. **Network Response Cache**: Caches network API responses

## Installation

The caching services are included in the Goldium DeFi platform. To use them, import the services or the associated hook:

```typescript
// Import the general cache service
import { 
  getCacheService, 
  tokenPriceCache, 
  contractStateCache,
  transactionSimulationCache,
  networkResponseCache
} from "@/services/cache";

// Import specialized cache services
import { getTokenPriceCacheService } from "@/services/token-price-cache";
import { getContractStateCacheService } from "@/services/contract-state-cache";
import { getTransactionSimulationCacheService } from "@/services/transaction-simulation-cache";

// Or use the hook (recommended)
import { useCache } from "@/hooks/useCache";
```

## API Reference

### General Cache Service

#### Interfaces

##### `CacheEntry<T>`

Represents a cached item:

```typescript
export interface CacheEntry<T> {
  value: T;              // The cached value
  timestamp: number;     // When the entry was cached
  expiresAt: number;     // When the entry expires
}
```

##### `CacheOptions`

Configuration options for the cache:

```typescript
export interface CacheOptions {
  ttl?: number;              // Time to live in milliseconds
  maxSize?: number;          // Maximum number of entries
  namespace?: string;        // Cache namespace for grouping
  persistToStorage?: boolean; // Whether to persist to localStorage
}
```

#### Methods

##### `set<T>`

Adds or updates a value in the cache:

```typescript
set<T>(key: string, value: T, options?: Partial<CacheOptions>): void
```

**Parameters:**
- `key`: The cache key
- `value`: The value to cache
- `options`: Optional cache options that override the defaults

##### `get<T>`

Retrieves a value from the cache:

```typescript
get<T>(key: string): T | null
```

**Parameters:**
- `key`: The cache key

**Returns:** The cached value if found and not expired, or `null`

##### `has`

Checks if a key exists in the cache and is not expired:

```typescript
has(key: string): boolean
```

**Parameters:**
- `key`: The cache key

**Returns:** `true` if the key exists and is not expired, `false` otherwise

##### `delete`

Removes a value from the cache:

```typescript
delete(key: string): boolean
```

**Parameters:**
- `key`: The cache key

**Returns:** `true` if the key was found and deleted, `false` otherwise

##### `clear`

Clears all values from the cache:

```typescript
clear(): void
```

##### `keys`

Gets all keys in the cache:

```typescript
keys(): string[]
```

**Returns:** An array of all cache keys

##### `size`

Gets the number of entries in the cache:

```typescript
size(): number
```

**Returns:** The number of entries in the cache

### Token Price Cache Service

#### Interfaces

##### `TokenPriceData`

Contains token price information:

```typescript
export interface TokenPriceData {
  price: number;           // Current price in USD
  priceChange24h: number;  // 24-hour price change percentage
  volume24h: number;       // 24-hour trading volume
  marketCap: number;       // Market capitalization
  lastUpdated: number;     // Timestamp of last update
}
```

#### Methods

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

##### `clearPrices`

Clears all cached token prices:

```typescript
clearPrices(): void
```

##### `startAutoUpdate`

Starts automatic price updates:

```typescript
startAutoUpdate(intervalMs?: number): void
```

**Parameters:**
- `intervalMs`: Optional update interval in milliseconds (default: 60000)

##### `stopAutoUpdate`

Stops automatic price updates:

```typescript
stopAutoUpdate(): void
```

### Contract State Cache Service

#### Interfaces

##### `ContractStateData`

Contains contract state information:

```typescript
export interface ContractStateData {
  programId: string;      // Program ID
  accountId: string;      // Account ID
  data: any;              // Account data
  lastUpdated: number;    // Timestamp of last update
  slot: number;           // Blockchain slot number
}
```

#### Methods

##### `getContractState<T>`

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

##### `getContractStates<T>`

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

##### `clearStates`

Clears all cached contract states:

```typescript
clearStates(): void
```

### Transaction Simulation Cache Service

#### Interfaces

##### `TransactionSimulationResult`

Contains transaction simulation results:

```typescript
export interface TransactionSimulationResult {
  success: boolean;       // Whether the simulation was successful
  logs: string[];         // Simulation logs
  unitsConsumed?: number; // Compute units consumed
  error?: string;         // Error message if simulation failed
  returnData?: any;       // Return data from the transaction
  accounts?: any[];       // Account data after simulation
  lastUpdated: number;    // Timestamp of last update
}
```

#### Methods

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

##### `clearSimulations`

Clears all cached simulation results:

```typescript
clearSimulations(): void
```

### useCache Hook

The `useCache` hook provides a convenient interface to all caching services:

```typescript
function useCache() {
  // Token price caching
  const getTokenPrice: (mintAddress: string | PublicKey) => Promise<TokenPriceData | null>;
  const getTokenPrices: (mintAddresses: (string | PublicKey)[]) => Promise<Record<string, TokenPriceData>>;
  
  // Contract state caching
  const getContractState: <T = any>(
    programId: string | PublicKey,
    accountId: string | PublicKey,
    parser?: (data: Buffer) => T
  ) => Promise<T | null>;
  const getContractStates: <T = any>(
    programId: string | PublicKey,
    accountIds: (string | PublicKey)[],
    parser?: (data: Buffer) => T
  ) => Promise<Record<string, T>>;
  
  // Transaction simulation caching
  const simulateTransaction: (
    transaction: Transaction | VersionedTransaction | TransactionInstruction[],
    signers?: PublicKey[]
  ) => Promise<TransactionSimulationResult>;
  
  // Generic caching
  const cacheData: <T>(
    namespace: string,
    key: string,
    value: T,
    options?: Partial<CacheOptions>
  ) => void;
  const getCachedData: <T>(
    namespace: string,
    key: string,
    options?: Partial<CacheOptions>
  ) => T | null;
  const isDataCached: (
    namespace: string,
    key: string,
    options?: Partial<CacheOptions>
  ) => boolean;
  const deleteCachedData: (
    namespace: string,
    key: string,
    options?: Partial<CacheOptions>
  ) => boolean;
  const clearCache: (
    namespace: string,
    options?: Partial<CacheOptions>
  ) => void;
  const clearAllCaches: () => void;
  
  // Network response caching
  const cacheNetworkResponse: <T>(
    endpoint: string,
    params: any,
    response: T,
    ttl?: number
  ) => void;
  const getCachedNetworkResponse: <T>(
    endpoint: string,
    params: any
  ) => T | null;
  const fetchWithCache: <T>(
    url: string,
    options?: RequestInit,
    ttl?: number
  ) => Promise<T>;
}
```

## Usage Examples

### Basic Caching

```typescript
import { getCacheService } from "@/services/cache";

// Create a cache with custom options
const userCache = getCacheService({
  namespace: 'user-data',
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 50,
  persistToStorage: true
});

// Cache user data
userCache.set('user-profile', {
  name: 'Alice',
  balance: 1000,
  lastLogin: Date.now()
});

// Retrieve cached data
const userProfile = userCache.get('user-profile');
if (userProfile) {
  console.log(`Welcome back, ${userProfile.name}!`);
}
```

### Token Price Caching

```typescript
import { getTokenPriceCacheService } from "@/services/token-price-cache";
import { NetworkType } from "@/components/NetworkContextProvider";

// Initialize the service
const network: NetworkType = "mainnet-beta";
const tokenPriceService = getTokenPriceCacheService(network);

// Get token price
const getTokenPrice = async () => {
  const usdcMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  const priceData = await tokenPriceService.getTokenPrice(usdcMint);
  
  if (priceData) {
    console.log(`USDC price: $${priceData.price}`);
    console.log(`24h change: ${priceData.priceChange24h}%`);
  }
};

// Get multiple token prices
const getMultipleTokenPrices = async () => {
  const mints = [
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
    "So11111111111111111111111111111111111111112"   // Wrapped SOL
  ];
  
  const prices = await tokenPriceService.getTokenPrices(mints);
  
  for (const [mint, data] of Object.entries(prices)) {
    console.log(`Token ${mint}: $${data.price}`);
  }
};
```

### Contract State Caching

```typescript
import { getContractStateCacheService } from "@/services/contract-state-cache";
import { Connection, PublicKey } from "@solana/web3.js";
import { NetworkType } from "@/components/NetworkContextProvider";

// Initialize the service
const connection = new Connection("https://api.mainnet-beta.solana.com");
const network: NetworkType = "mainnet-beta";
const contractStateService = getContractStateCacheService(connection, network);

// Define a parser for the account data
const parsePoolData = (data: Buffer) => {
  // Custom parsing logic for your specific program
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

// Get pool state
const getPoolState = async () => {
  const programId = "SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8";
  const poolAccount = "7oPH1KtR8XTCWmz1PVgMsEHDqxPxULSKCqfkQmTtRDkJ";
  
  const poolData = await contractStateService.getContractState(
    programId,
    poolAccount,
    parsePoolData
  );
  
  if (poolData) {
    console.log(`Pool reserves: ${poolData.reserves[0]} / ${poolData.reserves[1]}`);
  }
};
```

### Using the Hook

```tsx
import { useCache } from "@/hooks/useCache";
import { PublicKey } from "@solana/web3.js";
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

### Network Response Caching

```tsx
import { useCache } from "@/hooks/useCache";

function TokenList() {
  const { fetchWithCache } = useCache();
  const [tokens, setTokens] = useState([]);
  
  useEffect(() => {
    const fetchTokens = async () => {
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
      }
    };
    
    fetchTokens();
  }, [fetchWithCache]);
  
  return (
    <ul>
      {tokens.map(token => (
        <li key={token.id}>{token.name}: ${token.current_price}</li>
      ))}
    </ul>
  );
}
```

## Integration with Other Services

The Caching Services integrate with several other services in the Goldium platform:

- **Transaction Service**: Uses the simulation cache to optimize gas usage
- **Security Services**: Uses cached contract state for anomaly detection
- **UI Components**: Use cached data for faster rendering
- **Network Monitoring**: Uses cached responses to assess network performance

## Best Practices

1. **Use appropriate TTLs**: Set TTLs based on how frequently the data changes
2. **Use namespaces**: Separate different types of data into different namespaces
3. **Handle cache misses**: Always have a fallback for when data isn't in the cache
4. **Validate cached data**: Verify that cached data is still valid before using it
5. **Use the hook**: Prefer using the `useCache` hook over direct service access
6. **Clear selectively**: Clear only the caches that need to be invalidated
7. **Monitor cache size**: Be mindful of cache size, especially for large data sets
