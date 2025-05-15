"use client"

// Cache entry interface
export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
}

// Cache options interface
export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  namespace?: string; // Cache namespace for grouping
  persistToStorage?: boolean; // Whether to persist to localStorage
}

// Default cache options
const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  namespace: 'default',
  persistToStorage: true,
};

/**
 * Cache service for storing and retrieving data with TTL
 */
export class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private options: CacheOptions;
  private storageKey: string;
  
  constructor(options: CacheOptions = {}) {
    this.options = { ...DEFAULT_CACHE_OPTIONS, ...options };
    this.storageKey = `goldium-cache-${this.options.namespace}`;
    
    // Load from storage if enabled
    if (this.options.persistToStorage) {
      this.loadFromStorage();
    }
    
    // Set up cleanup interval
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), 60000); // Clean up every minute
    }
  }
  
  /**
   * Set a value in the cache
   */
  public set<T>(key: string, value: T, options: Partial<CacheOptions> = {}): void {
    // Apply options
    const ttl = options.ttl || this.options.ttl;
    
    // Create cache entry
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttl || 0),
    };
    
    // Add to cache
    this.cache.set(key, entry);
    
    // Enforce max size
    if (this.options.maxSize && this.cache.size > this.options.maxSize) {
      // Remove oldest entry
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    // Persist to storage if enabled
    if (this.options.persistToStorage) {
      this.saveToStorage();
    }
  }
  
  /**
   * Get a value from the cache
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    // Check if entry exists and is not expired
    if (entry && entry.expiresAt > Date.now()) {
      return entry.value;
    }
    
    // Remove expired entry
    if (entry) {
      this.cache.delete(key);
      
      // Persist to storage if enabled
      if (this.options.persistToStorage) {
        this.saveToStorage();
      }
    }
    
    return null;
  }
  
  /**
   * Check if a key exists in the cache and is not expired
   */
  public has(key: string): boolean {
    const entry = this.cache.get(key);
    return !!entry && entry.expiresAt > Date.now();
  }
  
  /**
   * Remove a value from the cache
   */
  public delete(key: string): boolean {
    const result = this.cache.delete(key);
    
    // Persist to storage if enabled
    if (result && this.options.persistToStorage) {
      this.saveToStorage();
    }
    
    return result;
  }
  
  /**
   * Clear all values from the cache
   */
  public clear(): void {
    this.cache.clear();
    
    // Persist to storage if enabled
    if (this.options.persistToStorage) {
      this.saveToStorage();
    }
  }
  
  /**
   * Get all keys in the cache
   */
  public keys(): string[] {
    return Array.from(this.cache.keys());
  }
  
  /**
   * Get the number of entries in the cache
   */
  public size(): number {
    return this.cache.size;
  }
  
  /**
   * Get the oldest key in the cache
   */
  private getOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestKey = key;
        oldestTimestamp = entry.timestamp;
      }
    }
    
    return oldestKey;
  }
  
  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let hasChanges = false;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
        hasChanges = true;
      }
    }
    
    // Persist to storage if enabled and changes were made
    if (hasChanges && this.options.persistToStorage) {
      this.saveToStorage();
    }
  }
  
  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const serialized = JSON.stringify(Array.from(this.cache.entries()));
      localStorage.setItem(this.storageKey, serialized);
    } catch (e) {
      console.error('Failed to save cache to localStorage:', e);
    }
  }
  
  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const serialized = localStorage.getItem(this.storageKey);
      
      if (serialized) {
        const entries = JSON.parse(serialized) as [string, CacheEntry<any>][];
        this.cache = new Map(entries);
        
        // Clean up expired entries
        this.cleanup();
      }
    } catch (e) {
      console.error('Failed to load cache from localStorage:', e);
    }
  }
}

// Cache instances by namespace
const cacheInstances: Record<string, CacheService> = {};

/**
 * Get a cache service instance
 */
export function getCacheService(options: CacheOptions = {}): CacheService {
  const namespace = options.namespace || DEFAULT_CACHE_OPTIONS.namespace;
  
  if (!cacheInstances[namespace]) {
    cacheInstances[namespace] = new CacheService(options);
  }
  
  return cacheInstances[namespace];
}

// Predefined cache namespaces
export const CACHE_NAMESPACES = {
  TOKEN_PRICES: 'token-prices',
  TOKEN_BALANCES: 'token-balances',
  CONTRACT_STATE: 'contract-state',
  TRANSACTION_SIMULATION: 'transaction-simulation',
  NETWORK_RESPONSES: 'network-responses',
};

// Create and export predefined cache instances
export const tokenPriceCache = getCacheService({
  namespace: CACHE_NAMESPACES.TOKEN_PRICES,
  ttl: 60 * 1000, // 1 minute
});

export const tokenBalanceCache = getCacheService({
  namespace: CACHE_NAMESPACES.TOKEN_BALANCES,
  ttl: 30 * 1000, // 30 seconds
});

export const contractStateCache = getCacheService({
  namespace: CACHE_NAMESPACES.CONTRACT_STATE,
  ttl: 2 * 60 * 1000, // 2 minutes
});

export const transactionSimulationCache = getCacheService({
  namespace: CACHE_NAMESPACES.TRANSACTION_SIMULATION,
  ttl: 5 * 60 * 1000, // 5 minutes
});

export const networkResponseCache = getCacheService({
  namespace: CACHE_NAMESPACES.NETWORK_RESPONSES,
  ttl: 30 * 1000, // 30 seconds
});
