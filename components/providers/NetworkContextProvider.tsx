"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// Types
export type NetworkType = "devnet" | "testnet" | "mainnet"

interface NetworkContextType {
  network: NetworkType
  setNetwork: (network: NetworkType) => void
}

// Create context
const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

// Provider component
export function NetworkContextProvider({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useState<NetworkType>("devnet")

  const value = {
    network,
    setNetwork,
  }

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
}

// Custom hook to use the network context
export function useNetwork() {
  const context = useContext(NetworkContext)
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkContextProvider")
  }
  return context
}
