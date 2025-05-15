"use client"

import { PublicKey } from "@solana/web3.js"
import { tokenPriceCache } from "@/services/cache"
import { NetworkType } from "@/components/NetworkContextProvider"

// Token price data interface
export interface TokenPriceData {
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: number;
}

/**
 * Token price caching service
 */
export class TokenPriceCacheService {
  private updateInterval: NodeJS.Timeout | null = null;
  private updateListeners: ((prices: Record<string, TokenPriceData>) => void)[] = [];
  private isUpdating: boolean = false;
  private network: NetworkType;
  
  constructor(network: NetworkType) {
    this.network = network;
    
    // Start auto-updating
    this.startAutoUpdate();
  }
  
  /**
   * Update the network
   */
  public updateNetwork(network: NetworkType): void {
    this.network = network;
    
    // Clear cache when network changes
    this.clearPrices();
    
    // Trigger immediate update
    this.updatePrices();
  }
  
  /**
   * Get token price
   */
  public async getTokenPrice(
    mintAddress: string | PublicKey
  ): Promise<TokenPriceData | null> {
    const address = typeof mintAddress === 'string' ? mintAddress : mintAddress.toString();
    const cacheKey = `${this.network}:${address}`;
    
    // Check cache first
    const cachedPrice = tokenPriceCache.get<TokenPriceData>(cacheKey);
    if (cachedPrice) {
      return cachedPrice;
    }
    
    // Fetch price if not in cache
    try {
      const price = await this.fetchTokenPrice(address);
      
      if (price) {
        // Cache the price
        tokenPriceCache.set(cacheKey, price);
        return price;
      }
    } catch (error) {
      console.error(`Error fetching price for token ${address}:`, error);
    }
    
    return null;
  }
  
  /**
   * Get multiple token prices
   */
  public async getTokenPrices(
    mintAddresses: (string | PublicKey)[]
  ): Promise<Record<string, TokenPriceData>> {
    const result: Record<string, TokenPriceData> = {};
    
    // Convert all addresses to strings
    const addresses = mintAddresses.map(addr => 
      typeof addr === 'string' ? addr : addr.toString()
    );
    
    // Check which addresses are in cache
    const missingAddresses: string[] = [];
    
    for (const address of addresses) {
      const cacheKey = `${this.network}:${address}`;
      const cachedPrice = tokenPriceCache.get<TokenPriceData>(cacheKey);
      
      if (cachedPrice) {
        result[address] = cachedPrice;
      } else {
        missingAddresses.push(address);
      }
    }
    
    // Fetch missing prices
    if (missingAddresses.length > 0) {
      try {
        const prices = await this.fetchTokenPrices(missingAddresses);
        
        // Add to result and cache
        for (const [address, price] of Object.entries(prices)) {
          result[address] = price;
          tokenPriceCache.set(`${this.network}:${address}`, price);
        }
      } catch (error) {
        console.error('Error fetching multiple token prices:', error);
      }
    }
    
    return result;
  }
  
  /**
   * Clear all cached prices
   */
  public clearPrices(): void {
    // Get all keys for the current network
    const keys = tokenPriceCache.keys().filter(key => key.startsWith(`${this.network}:`));
    
    // Delete each key
    for (const key of keys) {
      tokenPriceCache.delete(key);
    }
  }
  
  /**
   * Add a price update listener
   */
  public addUpdateListener(listener: (prices: Record<string, TokenPriceData>) => void): void {
    this.updateListeners.push(listener);
  }
  
  /**
   * Remove a price update listener
   */
  public removeUpdateListener(listener: (prices: Record<string, TokenPriceData>) => void): void {
    this.updateListeners = this.updateListeners.filter(l => l !== listener);
  }
  
  /**
   * Start auto-updating prices
   */
  public startAutoUpdate(intervalMs: number = 60000): void {
    // Stop any existing interval
    this.stopAutoUpdate();
    
    // Start new interval
    this.updateInterval = setInterval(() => {
      this.updatePrices();
    }, intervalMs);
    
    // Initial update
    this.updatePrices();
  }
  
  /**
   * Stop auto-updating prices
   */
  public stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  
  /**
   * Update all cached prices
   */
  private async updatePrices(): Promise<void> {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    
    try {
      // Get all cached token addresses for the current network
      const keys = tokenPriceCache.keys().filter(key => key.startsWith(`${this.network}:`));
      
      if (keys.length === 0) {
        this.isUpdating = false;
        return;
      }
      
      // Extract addresses from cache keys
      const addresses = keys.map(key => key.split(':')[1]);
      
      // Fetch updated prices
      const prices = await this.fetchTokenPrices(addresses);
      
      // Update cache
      for (const [address, price] of Object.entries(prices)) {
        tokenPriceCache.set(`${this.network}:${address}`, price);
      }
      
      // Notify listeners
      this.notifyListeners(prices);
    } catch (error) {
      console.error('Error updating token prices:', error);
    } finally {
      this.isUpdating = false;
    }
  }
  
  /**
   * Fetch token price from API
   */
  private async fetchTokenPrice(address: string): Promise<TokenPriceData | null> {
    // This is a placeholder. In a real app, you would fetch from a price API.
    // For demonstration, we'll return mock data.
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Generate mock price data
    return this.generateMockPriceData(address);
  }
  
  /**
   * Fetch multiple token prices from API
   */
  private async fetchTokenPrices(addresses: string[]): Promise<Record<string, TokenPriceData>> {
    // This is a placeholder. In a real app, you would fetch from a price API.
    // For demonstration, we'll return mock data.
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Generate mock price data for each address
    const result: Record<string, TokenPriceData> = {};
    
    for (const address of addresses) {
      result[address] = this.generateMockPriceData(address);
    }
    
    return result;
  }
  
  /**
   * Generate mock price data for testing
   */
  private generateMockPriceData(address: string): TokenPriceData {
    // Use the address to generate a deterministic but seemingly random price
    const seed = address.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const random = (seed % 1000) / 1000;
    
    return {
      price: 0.1 + random * 100,
      priceChange24h: -10 + random * 20,
      volume24h: 10000 + random * 1000000,
      marketCap: 100000 + random * 10000000,
      lastUpdated: Date.now(),
    };
  }
  
  /**
   * Notify all price update listeners
   */
  private notifyListeners(prices: Record<string, TokenPriceData>): void {
    this.updateListeners.forEach(listener => {
      try {
        listener(prices);
      } catch (e) {
        console.error('Error in price update listener:', e);
      }
    });
  }
}

// Singleton instance
let tokenPriceCacheService: TokenPriceCacheService | null = null;

/**
 * Get the token price cache service instance
 */
export function getTokenPriceCacheService(network: NetworkType): TokenPriceCacheService {
  if (!tokenPriceCacheService) {
    tokenPriceCacheService = new TokenPriceCacheService(network);
  } else {
    tokenPriceCacheService.updateNetwork(network);
  }
  
  return tokenPriceCacheService;
}
