"use client"

import { Connection, PublicKey } from "@solana/web3.js"
import { contractStateCache } from "@/services/cache"
import { NetworkType } from "@/components/NetworkContextProvider"

// Contract state data interface
export interface ContractStateData {
  programId: string;
  accountId: string;
  data: any;
  lastUpdated: number;
  slot: number;
}

/**
 * Contract state caching service
 */
export class ContractStateCacheService {
  private connection: Connection;
  private network: NetworkType;
  private updateInterval: NodeJS.Timeout | null = null;
  private updateListeners: ((states: Record<string, ContractStateData>) => void)[] = [];
  private isUpdating: boolean = false;
  private subscriptions: Record<string, number> = {}; // accountId -> subscription id
  
  constructor(connection: Connection, network: NetworkType) {
    this.connection = connection;
    this.network = network;
    
    // Start auto-updating
    this.startAutoUpdate();
  }
  
  /**
   * Update the connection and network
   */
  public updateConnection(connection: Connection, network: NetworkType): void {
    // Unsubscribe from all accounts
    this.unsubscribeAll();
    
    this.connection = connection;
    this.network = network;
    
    // Clear cache when network changes
    this.clearStates();
    
    // Resubscribe to all accounts
    this.resubscribeAll();
  }
  
  /**
   * Get contract state
   */
  public async getContractState<T = any>(
    programId: string | PublicKey,
    accountId: string | PublicKey,
    parser?: (data: Buffer) => T
  ): Promise<T | null> {
    const programAddress = typeof programId === 'string' ? programId : programId.toString();
    const accountAddress = typeof accountId === 'string' ? accountId : accountId.toString();
    const cacheKey = `${this.network}:${programAddress}:${accountAddress}`;
    
    // Check cache first
    const cachedState = contractStateCache.get<ContractStateData>(cacheKey);
    if (cachedState) {
      return cachedState.data;
    }
    
    // Fetch state if not in cache
    try {
      const state = await this.fetchContractState(accountAddress, parser);
      
      if (state) {
        // Cache the state
        contractStateCache.set(cacheKey, {
          programId: programAddress,
          accountId: accountAddress,
          data: state,
          lastUpdated: Date.now(),
          slot: 0, // Will be updated when we get the account info
        });
        
        // Subscribe to account changes
        this.subscribeToAccount(programAddress, accountAddress, parser);
        
        return state;
      }
    } catch (error) {
      console.error(`Error fetching state for account ${accountAddress}:`, error);
    }
    
    return null;
  }
  
  /**
   * Get multiple contract states
   */
  public async getContractStates<T = any>(
    programId: string | PublicKey,
    accountIds: (string | PublicKey)[],
    parser?: (data: Buffer) => T
  ): Promise<Record<string, T>> {
    const programAddress = typeof programId === 'string' ? programId : programId.toString();
    const result: Record<string, T> = {};
    
    // Convert all addresses to strings
    const accountAddresses = accountIds.map(addr => 
      typeof addr === 'string' ? addr : addr.toString()
    );
    
    // Check which addresses are in cache
    const missingAddresses: string[] = [];
    
    for (const accountAddress of accountAddresses) {
      const cacheKey = `${this.network}:${programAddress}:${accountAddress}`;
      const cachedState = contractStateCache.get<ContractStateData>(cacheKey);
      
      if (cachedState) {
        result[accountAddress] = cachedState.data;
      } else {
        missingAddresses.push(accountAddress);
      }
    }
    
    // Fetch missing states
    if (missingAddresses.length > 0) {
      try {
        const states = await this.fetchContractStates(missingAddresses, parser);
        
        // Add to result and cache
        for (const [accountAddress, state] of Object.entries(states)) {
          result[accountAddress] = state;
          
          contractStateCache.set(`${this.network}:${programAddress}:${accountAddress}`, {
            programId: programAddress,
            accountId: accountAddress,
            data: state,
            lastUpdated: Date.now(),
            slot: 0, // Will be updated when we get the account info
          });
          
          // Subscribe to account changes
          this.subscribeToAccount(programAddress, accountAddress, parser);
        }
      } catch (error) {
        console.error('Error fetching multiple contract states:', error);
      }
    }
    
    return result;
  }
  
  /**
   * Clear all cached states
   */
  public clearStates(): void {
    // Get all keys for the current network
    const keys = contractStateCache.keys().filter(key => key.startsWith(`${this.network}:`));
    
    // Delete each key
    for (const key of keys) {
      contractStateCache.delete(key);
    }
  }
  
  /**
   * Add a state update listener
   */
  public addUpdateListener(listener: (states: Record<string, ContractStateData>) => void): void {
    this.updateListeners.push(listener);
  }
  
  /**
   * Remove a state update listener
   */
  public removeUpdateListener(listener: (states: Record<string, ContractStateData>) => void): void {
    this.updateListeners = this.updateListeners.filter(l => l !== listener);
  }
  
  /**
   * Start auto-updating states
   */
  public startAutoUpdate(intervalMs: number = 60000): void {
    // Stop any existing interval
    this.stopAutoUpdate();
    
    // Start new interval
    this.updateInterval = setInterval(() => {
      this.updateStates();
    }, intervalMs);
    
    // Initial update
    this.updateStates();
  }
  
  /**
   * Stop auto-updating states
   */
  public stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  
  /**
   * Subscribe to account changes
   */
  private subscribeToAccount<T = any>(
    programId: string,
    accountId: string,
    parser?: (data: Buffer) => T
  ): void {
    // Check if already subscribed
    if (this.subscriptions[accountId]) {
      return;
    }
    
    try {
      // Subscribe to account changes
      const subscriptionId = this.connection.onAccountChange(
        new PublicKey(accountId),
        (accountInfo, context) => {
          // Parse the data
          let parsedData: any = accountInfo.data;
          
          if (parser) {
            try {
              parsedData = parser(accountInfo.data);
            } catch (error) {
              console.error(`Error parsing data for account ${accountId}:`, error);
            }
          }
          
          // Update cache
          const cacheKey = `${this.network}:${programId}:${accountId}`;
          const cachedState = contractStateCache.get<ContractStateData>(cacheKey);
          
          if (cachedState) {
            // Only update if the slot is newer
            if (!cachedState.slot || context.slot > cachedState.slot) {
              const updatedState: ContractStateData = {
                ...cachedState,
                data: parsedData,
                lastUpdated: Date.now(),
                slot: context.slot,
              };
              
              contractStateCache.set(cacheKey, updatedState);
              
              // Notify listeners
              this.notifyListeners({ [accountId]: updatedState });
            }
          } else {
            // Create new cache entry
            const newState: ContractStateData = {
              programId,
              accountId,
              data: parsedData,
              lastUpdated: Date.now(),
              slot: context.slot,
            };
            
            contractStateCache.set(cacheKey, newState);
            
            // Notify listeners
            this.notifyListeners({ [accountId]: newState });
          }
        },
        'confirmed'
      );
      
      // Store subscription ID
      this.subscriptions[accountId] = subscriptionId;
    } catch (error) {
      console.error(`Error subscribing to account ${accountId}:`, error);
    }
  }
  
  /**
   * Unsubscribe from account changes
   */
  private unsubscribeFromAccount(accountId: string): void {
    const subscriptionId = this.subscriptions[accountId];
    
    if (subscriptionId) {
      try {
        this.connection.removeAccountChangeListener(subscriptionId);
        delete this.subscriptions[accountId];
      } catch (error) {
        console.error(`Error unsubscribing from account ${accountId}:`, error);
      }
    }
  }
  
  /**
   * Unsubscribe from all accounts
   */
  private unsubscribeAll(): void {
    Object.keys(this.subscriptions).forEach(accountId => {
      this.unsubscribeFromAccount(accountId);
    });
  }
  
  /**
   * Resubscribe to all accounts
   */
  private resubscribeAll(): void {
    // Get all cached accounts
    const keys = contractStateCache.keys().filter(key => key.startsWith(`${this.network}:`));
    
    // Extract program and account IDs from cache keys
    for (const key of keys) {
      const [network, programId, accountId] = key.split(':');
      
      // Subscribe to account changes
      this.subscribeToAccount(programId, accountId);
    }
  }
  
  /**
   * Update all cached states
   */
  private async updateStates(): Promise<void> {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    
    try {
      // Get all cached account addresses for the current network
      const keys = contractStateCache.keys().filter(key => key.startsWith(`${this.network}:`));
      
      if (keys.length === 0) {
        this.isUpdating = false;
        return;
      }
      
      // Extract program and account IDs from cache keys
      const accounts: { programId: string; accountId: string }[] = [];
      
      for (const key of keys) {
        const [network, programId, accountId] = key.split(':');
        accounts.push({ programId, accountId });
      }
      
      // Fetch updated states
      const updatedStates: Record<string, ContractStateData> = {};
      
      for (const { programId, accountId } of accounts) {
        try {
          const accountInfo = await this.connection.getAccountInfo(new PublicKey(accountId), 'confirmed');
          
          if (accountInfo) {
            const cacheKey = `${this.network}:${programId}:${accountId}`;
            const cachedState = contractStateCache.get<ContractStateData>(cacheKey);
            
            if (cachedState) {
              // Update cache
              const updatedState: ContractStateData = {
                ...cachedState,
                lastUpdated: Date.now(),
              };
              
              contractStateCache.set(cacheKey, updatedState);
              updatedStates[accountId] = updatedState;
            }
          }
        } catch (error) {
          console.error(`Error updating state for account ${accountId}:`, error);
        }
      }
      
      // Notify listeners
      if (Object.keys(updatedStates).length > 0) {
        this.notifyListeners(updatedStates);
      }
    } catch (error) {
      console.error('Error updating contract states:', error);
    } finally {
      this.isUpdating = false;
    }
  }
  
  /**
   * Fetch contract state from blockchain
   */
  private async fetchContractState<T = any>(
    accountId: string,
    parser?: (data: Buffer) => T
  ): Promise<T | null> {
    try {
      const accountInfo = await this.connection.getAccountInfo(new PublicKey(accountId), 'confirmed');
      
      if (!accountInfo) {
        return null;
      }
      
      // Parse the data
      if (parser) {
        try {
          return parser(accountInfo.data);
        } catch (error) {
          console.error(`Error parsing data for account ${accountId}:`, error);
          return null;
        }
      }
      
      return accountInfo.data as unknown as T;
    } catch (error) {
      console.error(`Error fetching account ${accountId}:`, error);
      return null;
    }
  }
  
  /**
   * Fetch multiple contract states from blockchain
   */
  private async fetchContractStates<T = any>(
    accountIds: string[],
    parser?: (data: Buffer) => T
  ): Promise<Record<string, T>> {
    try {
      // Convert addresses to PublicKeys
      const publicKeys = accountIds.map(addr => new PublicKey(addr));
      
      // Fetch multiple accounts
      const accounts = await this.connection.getMultipleAccountsInfo(publicKeys, 'confirmed');
      
      // Process results
      const result: Record<string, T> = {};
      
      accounts.forEach((accountInfo, index) => {
        if (accountInfo) {
          const accountId = accountIds[index];
          
          // Parse the data
          if (parser) {
            try {
              result[accountId] = parser(accountInfo.data);
            } catch (error) {
              console.error(`Error parsing data for account ${accountId}:`, error);
            }
          } else {
            result[accountId] = accountInfo.data as unknown as T;
          }
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error fetching multiple accounts:', error);
      return {};
    }
  }
  
  /**
   * Notify all state update listeners
   */
  private notifyListeners(states: Record<string, ContractStateData>): void {
    this.updateListeners.forEach(listener => {
      try {
        listener(states);
      } catch (e) {
        console.error('Error in state update listener:', e);
      }
    });
  }
}

// Singleton instance
let contractStateCacheService: ContractStateCacheService | null = null;

/**
 * Get the contract state cache service instance
 */
export function getContractStateCacheService(
  connection: Connection,
  network: NetworkType
): ContractStateCacheService {
  if (!contractStateCacheService) {
    contractStateCacheService = new ContractStateCacheService(connection, network);
  } else {
    contractStateCacheService.updateConnection(connection, network);
  }
  
  return contractStateCacheService;
}
