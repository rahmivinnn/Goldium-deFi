"use client"

import { useState, useEffect, useCallback } from "react"
import { useConnection } from "@solana/wallet-adapter-react"
import { useNetwork } from "@/components/NetworkContextProvider"
import { PublicKey, Transaction, VersionedTransaction, TransactionInstruction } from "@solana/web3.js"
import { 
  getCacheService, 
  tokenPriceCache, 
  tokenBalanceCache, 
  contractStateCache, 
  transactionSimulationCache, 
  networkResponseCache,
  CacheOptions
} from "@/services/cache"
import { getTokenPriceCacheService, TokenPriceData } from "@/services/token-price-cache"
import { getContractStateCacheService, ContractStateData } from "@/services/contract-state-cache"
import { 
  getTransactionSimulationCacheService, 
  TransactionSimulationResult 
} from "@/services/transaction-simulation-cache"

export function useCache() {
  const { connection } = useConnection()
  const { network } = useNetwork()
  
  // Get cache services
  const tokenPriceService = getTokenPriceCacheService(network)
  const contractStateService = getContractStateCacheService(connection, network)
  const transactionSimulationService = getTransactionSimulationCacheService(connection, network)
  
  // Update services when connection or network changes
  useEffect(() => {
    contractStateService.updateConnection(connection, network)
    transactionSimulationService.updateConnection(connection, network)
    tokenPriceService.updateNetwork(network)
  }, [connection, network])
  
  // Get token price
  const getTokenPrice = useCallback(
    async (mintAddress: string | PublicKey): Promise<TokenPriceData | null> => {
      return tokenPriceService.getTokenPrice(mintAddress)
    },
    [tokenPriceService]
  )
  
  // Get multiple token prices
  const getTokenPrices = useCallback(
    async (mintAddresses: (string | PublicKey)[]): Promise<Record<string, TokenPriceData>> => {
      return tokenPriceService.getTokenPrices(mintAddresses)
    },
    [tokenPriceService]
  )
  
  // Get contract state
  const getContractState = useCallback(
    async <T = any>(
      programId: string | PublicKey,
      accountId: string | PublicKey,
      parser?: (data: Buffer) => T
    ): Promise<T | null> => {
      return contractStateService.getContractState(programId, accountId, parser)
    },
    [contractStateService]
  )
  
  // Get multiple contract states
  const getContractStates = useCallback(
    async <T = any>(
      programId: string | PublicKey,
      accountIds: (string | PublicKey)[],
      parser?: (data: Buffer) => T
    ): Promise<Record<string, T>> => {
      return contractStateService.getContractStates(programId, accountIds, parser)
    },
    [contractStateService]
  )
  
  // Simulate transaction
  const simulateTransaction = useCallback(
    async (
      transaction: Transaction | VersionedTransaction | TransactionInstruction[],
      signers?: PublicKey[]
    ): Promise<TransactionSimulationResult> => {
      return transactionSimulationService.simulateTransaction(transaction, signers)
    },
    [transactionSimulationService]
  )
  
  // Cache generic data
  const cacheData = useCallback(
    <T>(
      namespace: string,
      key: string,
      value: T,
      options?: Partial<CacheOptions>
    ): void => {
      const cache = getCacheService({ namespace, ...options })
      cache.set(key, value, options)
    },
    []
  )
  
  // Get cached data
  const getCachedData = useCallback(
    <T>(
      namespace: string,
      key: string,
      options?: Partial<CacheOptions>
    ): T | null => {
      const cache = getCacheService({ namespace, ...options })
      return cache.get<T>(key)
    },
    []
  )
  
  // Check if data is cached
  const isDataCached = useCallback(
    (
      namespace: string,
      key: string,
      options?: Partial<CacheOptions>
    ): boolean => {
      const cache = getCacheService({ namespace, ...options })
      return cache.has(key)
    },
    []
  )
  
  // Delete cached data
  const deleteCachedData = useCallback(
    (
      namespace: string,
      key: string,
      options?: Partial<CacheOptions>
    ): boolean => {
      const cache = getCacheService({ namespace, ...options })
      return cache.delete(key)
    },
    []
  )
  
  // Clear cache
  const clearCache = useCallback(
    (
      namespace: string,
      options?: Partial<CacheOptions>
    ): void => {
      const cache = getCacheService({ namespace, ...options })
      cache.clear()
    },
    []
  )
  
  // Clear all caches
  const clearAllCaches = useCallback(
    (): void => {
      tokenPriceCache.clear()
      tokenBalanceCache.clear()
      contractStateCache.clear()
      transactionSimulationCache.clear()
      networkResponseCache.clear()
      
      // Clear service caches
      tokenPriceService.clearPrices()
      contractStateService.clearStates()
      transactionSimulationService.clearSimulations()
    },
    [tokenPriceService, contractStateService, transactionSimulationService]
  )
  
  // Cache network response
  const cacheNetworkResponse = useCallback(
    <T>(
      endpoint: string,
      params: any,
      response: T,
      ttl?: number
    ): void => {
      const key = `${endpoint}:${JSON.stringify(params)}`
      networkResponseCache.set(key, response, { ttl })
    },
    []
  )
  
  // Get cached network response
  const getCachedNetworkResponse = useCallback(
    <T>(
      endpoint: string,
      params: any
    ): T | null => {
      const key = `${endpoint}:${JSON.stringify(params)}`
      return networkResponseCache.get<T>(key)
    },
    []
  )
  
  // Fetch with cache
  const fetchWithCache = useCallback(
    async <T>(
      url: string,
      options?: RequestInit,
      ttl?: number
    ): Promise<T> => {
      const cacheKey = `${url}:${JSON.stringify(options)}`
      
      // Check cache first
      const cachedResponse = networkResponseCache.get<T>(cacheKey)
      if (cachedResponse) {
        return cachedResponse
      }
      
      // Fetch if not in cache
      const response = await fetch(url, options)
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Cache the response
      networkResponseCache.set(cacheKey, data, { ttl })
      
      return data
    },
    []
  )
  
  return {
    // Token price caching
    getTokenPrice,
    getTokenPrices,
    
    // Contract state caching
    getContractState,
    getContractStates,
    
    // Transaction simulation caching
    simulateTransaction,
    
    // Generic caching
    cacheData,
    getCachedData,
    isDataCached,
    deleteCachedData,
    clearCache,
    clearAllCaches,
    
    // Network response caching
    cacheNetworkResponse,
    getCachedNetworkResponse,
    fetchWithCache,
  }
}
