"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { ethers } from "ethers"

interface EthereumContextType {
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  account: string | null
  chainId: number | null
  connected: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const EthereumContext = createContext<EthereumContextType>({
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  connected: false,
  connect: async () => {},
  disconnect: () => {},
})

export const useEthereum = () => useContext(EthereumContext)

interface EthereumProviderProps {
  children: ReactNode
}

export function EthereumProvider({ children }: EthereumProviderProps) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setConnected(true)
          provider.getSigner().then(setSigner)
        } else {
          setAccount(null)
          setSigner(null)
          setConnected(false)
        }
      })

      // Listen for chain changes
      window.ethereum.on("chainChanged", (chainId: string) => {
        setChainId(Number.parseInt(chainId, 16))
      })

      // Check if already connected
      provider.listAccounts().then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0].address)
          setConnected(true)
          provider.getSigner().then(setSigner)
        }
      })

      provider.getNetwork().then((network) => {
        setChainId(Number(network.chainId))
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners()
      }
    }
  }, [])

  const connect = async () => {
    if (!provider) return

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      if (accounts.length > 0) {
        setAccount(accounts[0])
        setConnected(true)
        const signer = await provider.getSigner()
        setSigner(signer)
      }
    } catch (error) {
      console.error("Error connecting to MetaMask", error)
    }
  }

  const disconnect = () => {
    setAccount(null)
    setSigner(null)
    setConnected(false)
  }

  return (
    <EthereumContext.Provider
      value={{
        provider,
        signer,
        account,
        chainId,
        connected,
        connect,
        disconnect,
      }}
    >
      {children}
    </EthereumContext.Provider>
  )
}
