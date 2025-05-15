"use client"

import type React from "react"

import { useEffect, useMemo, useState, createContext, useContext, type ReactNode, useCallback } from "react"
import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet as useSolanaWallet,
} from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from "@solana/wallet-adapter-wallets"
import { useToast } from "@/components/ui/use-toast"
import { useNetwork } from "@/components/providers/NetworkContextProvider"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { clusterApiUrl } from "@solana/web3.js"

// Import the wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css"

// Transaction context
type Transaction = {
  id: string
  fromToken: string
  toToken: string
  fromAmount: number
  toAmount: number
  status: "pending" | "confirmed" | "failed"
  timestamp: number
  signature?: string
}

type TransactionContextType = {
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, "id" | "timestamp">) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  clearTransactions: () => void
}

const TransactionContext = createContext<TransactionContextType>({
  transactions: [],
  addTransaction: () => {},
  updateTransaction: () => {},
  clearTransactions: () => {},
})

export const useTransactions = () => useContext(TransactionContext)

// Theme context
type ThemeContextType = {
  theme: "dark" | "light"
  setTheme: (theme: "dark" | "light") => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

// Language context
type Language = "en" | "es" | "fr" | "zh" | "ja"

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    swap: "Swap",
    pools: "Pools",
    farms: "Farms",
    nftGallery: "NFT Gallery",
    settings: "Settings",
    connectWallet: "Connect Wallet",
    from: "From",
    to: "To",
    slippageTolerance: "Slippage Tolerance",
    enterAmount: "Enter an amount",
    insufficientBalance: "Insufficient Balance",
    fetchingQuote: "Fetching Quote",
    transactionHistory: "Transaction History",
    noTransactions: "No transactions yet",
    pending: "Pending",
    confirmed: "Confirmed",
    failed: "Failed",
  },
  es: {
    swap: "Intercambiar",
    pools: "Pools",
    farms: "Granjas",
    nftGallery: "Galería NFT",
    settings: "Ajustes",
    connectWallet: "Conectar Billetera",
    from: "De",
    to: "A",
    slippageTolerance: "Tolerancia de Deslizamiento",
    enterAmount: "Ingrese una cantidad",
    insufficientBalance: "Saldo Insuficiente",
    fetchingQuote: "Obteniendo Cotización",
    transactionHistory: "Historial de Transacciones",
    noTransactions: "Aún no hay transacciones",
    pending: "Pendiente",
    confirmed: "Confirmado",
    failed: "Fallido",
  },
  fr: {
    swap: "Échanger",
    pools: "Pools",
    farms: "Fermes",
    nftGallery: "Galerie NFT",
    settings: "Paramètres",
    connectWallet: "Connecter Portefeuille",
    from: "De",
    to: "À",
    slippageTolerance: "Tolérance de Glissement",
    enterAmount: "Entrez un montant",
    insufficientBalance: "Solde Insuffisant",
    fetchingQuote: "Récupération du Devis",
    transactionHistory: "Historique des Transactions",
    noTransactions: "Pas encore de transactions",
    pending: "En attente",
    confirmed: "Confirmé",
    failed: "Échoué",
  },
  zh: {
    swap: "兑换",
    pools: "流动池",
    farms: "农场",
    nftGallery: "NFT 画廊",
    settings: "设置",
    connectWallet: "连接钱包",
    from: "从",
    to: "到",
    slippageTolerance: "滑点容忍度",
    enterAmount: "输入金额",
    insufficientBalance: "余额不足",
    fetchingQuote: "获取报价",
    transactionHistory: "交易历史",
    noTransactions: "暂无交易",
    pending: "待处理",
    confirmed: "已确认",
    failed: "失败",
  },
  ja: {
    swap: "スワップ",
    pools: "プール",
    farms: "ファーム",
    nftGallery: "NFTギャラリー",
    settings: "設定",
    connectWallet: "ウォレットを接続",
    from: "から",
    to: "へ",
    slippageTolerance: "スリッページ許容度",
    enterAmount: "金額を入力",
    insufficientBalance: "残高不足",
    fetchingQuote: "見積もりを取得中",
    transactionHistory: "取引履歴",
    noTransactions: "まだ取引はありません",
    pending: "保留中",
    confirmed: "確認済み",
    failed: "失敗",
  },
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
})

export const useLanguage = () => useContext(LanguageContext)

interface WalletContextType {
  wallets: any[]
  isConnecting: boolean
  setIsConnecting: (isConnecting: boolean) => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWalletContext() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWalletContext must be used within a WalletContextProvider")
  }
  return context
}

interface WalletContextProviderProps {
  children: ReactNode
  network?: "devnet" | "testnet" | "mainnet-beta"
}

export function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const { network } = useNetwork()
  const [isConnecting, setIsConnecting] = useState(false)

  // Set network to WalletAdapterNetwork format
  const walletNetwork = useMemo(() => {
    switch (network) {
      case "mainnet-beta":
        return WalletAdapterNetwork.Mainnet
      case "testnet":
        return WalletAdapterNetwork.Testnet
      case "devnet":
      default:
        return WalletAdapterNetwork.Devnet
    }
  }, [network])

  // Generate RPC endpoint based on network
  const endpoint = useMemo(() => clusterApiUrl(walletNetwork), [walletNetwork])

  // Initialize wallet adapters
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter(), new TorusWalletAdapter()],
    [walletNetwork],
  )

  // Expose wallet context
  const value = {
    wallets,
    isConnecting,
    setIsConnecting,
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider value={value}>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

// Custom hook for wallet connection status with toast notifications
export function useWalletStatus() {
  const { connected, connecting, disconnecting, publicKey } = useSolanaWallet()
  const { connection } = useConnection()
  const { toast } = useToast()

  const [balance, setBalance] = useState<number | null>(null)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

  // Fetch SOL balance
  const fetchBalance = async () => {
    if (!publicKey || !connection) return null

    try {
      setIsLoadingBalance(true)
      const balance = await connection.getBalance(publicKey)
      const solBalance = balance / 10 ** 9 // Convert lamports to SOL
      setBalance(solBalance)
      return solBalance
    } catch (error) {
      console.error("Error fetching balance:", error)
      return null
    } finally {
      setIsLoadingBalance(false)
    }
  }

  // Show toast notifications for wallet status changes
  useEffect(() => {
    if (connected) {
      toast({
        title: "Wallet Connected",
        description: `Connected to ${publicKey?.toString().slice(0, 6)}...${publicKey?.toString().slice(-4)}`,
      })
      fetchBalance()
    }
  }, [connected, publicKey, toast])

  return {
    connected,
    connecting,
    disconnecting,
    publicKey,
    balance,
    isLoadingBalance,
    fetchBalance,
  }
}

export const useWallet = useWalletStatus
export const useWalletBalance = () => {
  const { connection } = useConnection()
  const { publicKey, connected } = useSolanaWallet()
  const [balances, setBalances] = useState<{ [key: string]: number }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalances = useCallback(async () => {
    if (!publicKey || !connected) return

    setIsLoading(true)
    setError(null)

    try {
      const solBalance = (await connection.getBalance(publicKey)) / 10 ** 9
      setBalances((prev) => ({ ...prev, SOL: solBalance }))

      setIsLoading(false)
    } catch (error: any) {
      console.error("Failed to fetch balances", error)
      setError(error.message || "Failed to fetch balances")
      setIsLoading(false)
    }
  }, [connection, publicKey, connected])

  useEffect(() => {
    if (publicKey && connected) {
      fetchBalances()
    }
  }, [publicKey, connected, fetchBalances])

  return {
    balances,
    isLoading,
    error,
    refreshBalances: fetchBalances,
  }
}
