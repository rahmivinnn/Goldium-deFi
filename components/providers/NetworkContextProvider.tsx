"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback, useMemo } from "react"
import { Connection } from "@solana/web3.js"

// Define the network types
export type NetworkType = "mainnet-beta" | "testnet" | "devnet"

// Define the context type
interface NetworkContextType {
  network: NetworkType
  setNetwork: (network: NetworkType) => void
  connection: Connection
}

// Create the context
const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

// Custom hook to use the network context
export function useNetwork() {
  const context = useContext(NetworkContext)
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkContextProvider")
  }
  return context
}

// Provider props
interface NetworkContextProviderProps {
  children: React.ReactNode
  defaultNetwork?: NetworkType
}

// Provider component
export function NetworkContextProvider({ children, defaultNetwork = "devnet" }: NetworkContextProviderProps) {
  const [network, setNetworkState] = useState<NetworkType>(defaultNetwork)

  // Get the RPC URL for the current network
  const getRpcUrl = useCallback((network: NetworkType): string => {
    switch (network) {
      case "mainnet-beta":
        return "https://api.mainnet-beta.solana.com"
      case "testnet":
        return "https://api.testnet.solana.com"
      case "devnet":
      default:
        return "https://api.devnet.solana.com"
    }
  }, [])

  // Create a connection to the Solana network
  const connection = useMemo(() => {
    return new Connection(getRpcUrl(network), "confirmed")
  }, [network, getRpcUrl])

  // Set the network and update the connection
  const setNetwork = useCallback((newNetwork: NetworkType) => {
    setNetworkState(newNetwork)
  }, [])

  // Context value
  const value = {
    network,
    setNetwork,
    connection,
  }

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
}
