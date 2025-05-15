"use client"

import { useCallback } from "react"

import { createContext, useContext, useState, useEffect, type ReactNode, type FC } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/components/ui/use-toast"
import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet as useSolanaWallet,
} from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { GOLD_TOKEN } from "@/constants/tokens"
import { motion } from "framer-motion"

// Import the wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css"

// Re-export the useWallet hook from @solana/wallet-adapter-react
export { useSolanaWallet as useWallet }

// Define WalletType
export type WalletType = "phantom" | "solflare" | "metamask"

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

// Wallet balance context
type WalletBalanceContextType = {
  solBalance: number | null
  goldBalance: number | null
  isLoading: boolean
  refreshBalances: () => Promise<void>
  lastUpdated: number
}

const WalletBalanceContext = createContext<WalletBalanceContextType>({
  solBalance: null,
  goldBalance: null,
  isLoading: false,
  refreshBalances: async () => {},
  lastUpdated: 0,
})

export const useWalletBalance = () => useContext(WalletBalanceContext)

interface WalletContextProviderProps {
  children: ReactNode
}

const WalletBalanceProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { connection } = useConnection()
  const { publicKey } = useSolanaWallet()
  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [goldBalance, setGoldBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(0)
  const { toast } = useToast()

  const refreshBalances = async () => {
    if (!publicKey) {
      setSolBalance(null)
      setGoldBalance(null)
      return
    }

    setIsLoading(true)
    try {
      // Get SOL balance
      const lamports = await connection.getBalance(publicKey)
      const solBalanceValue = lamports / LAMPORTS_PER_SOL

      // Animate SOL balance update if it changed
      if (solBalance !== null && solBalanceValue !== solBalance) {
        animateBalanceChange("SOL", solBalanceValue)
      }
      setSolBalance(solBalanceValue)

      // Get GOLD token balance
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      })

      const goldTokenAccount = tokenAccounts.value.find(
        (account) => account.account.data.parsed.info.mint === GOLD_TOKEN.mint,
      )

      if (goldTokenAccount) {
        const goldBalanceValue = goldTokenAccount.account.data.parsed.info.tokenAmount.uiAmount

        // Animate GOLD balance update if it changed
        if (goldBalance !== null && goldBalanceValue !== goldBalance) {
          animateBalanceChange("GOLD", goldBalanceValue)
        }
        setGoldBalance(goldBalanceValue)
      } else {
        setGoldBalance(0)
      }

      setLastUpdated(Date.now())
    } catch (error) {
      console.error("Error refreshing balances:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const animateBalanceChange = (token: string, newValue: number) => {
    const oldValue = token === "SOL" ? solBalance : goldBalance
    if (oldValue === null) return

    const isIncrease = newValue > oldValue

    toast({
      title: `${token} Balance ${isIncrease ? "Increased" : "Decreased"}`,
      description: (
        <div className="flex items-center">
          <span>{oldValue.toFixed(4)} → </span>
          <motion.span
            initial={{ color: isIncrease ? "#10B981" : "#EF4444" }}
            animate={{ color: "white" }}
            transition={{ duration: 2 }}
            className="font-bold ml-1"
          >
            {newValue.toFixed(4)}
          </motion.span>
        </div>
      ),
      variant: isIncrease ? "success" : "default",
    })
  }

  // Refresh balances when wallet connects or changes
  useEffect(() => {
    refreshBalances()
  }, [publicKey, connection])

  // Auto-refresh balances every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (publicKey) {
        refreshBalances()
      }
    }, 10000)

    return () => clearInterval(intervalId)
  }, [publicKey, connection])

  return (
    <WalletBalanceContext.Provider value={{ solBalance, goldBalance, isLoading, refreshBalances, lastUpdated }}>
      {children}
    </WalletBalanceContext.Provider>
  )
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useLocalStorage<"dark" | "light">("goldium-theme", "dark")

  // Language state
  const [language, setLanguage] = useLocalStorage<Language>("goldium-language", "en")
  const t = (key: string) => translations[language][key] || key

  // Transaction state
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("goldium-transactions", [])

  const addTransaction = (transaction: Omit<Transaction, "id" | "timestamp">) => {
    const newTransaction = {
      ...transaction,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
    }
    setTransactions([newTransaction, ...transactions])
  }

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(transactions.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx)))
  }

  const clearTransactions = () => {
    setTransactions([])
  }

  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const endpoint = clusterApiUrl("mainnet-beta")
  const { toast } = useToast()

  // Initialize wallet adapters
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()]

  // Handle wallet connection events
  const onWalletConnect = useCallback(() => {
    toast({
      title: "Wallet Connected",
      description: "Your wallet has been successfully connected",
      variant: "default",
    })
  }, [toast])

  const onWalletDisconnect = useCallback(() => {
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
      variant: "default",
    })
  }, [toast])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <LanguageContext.Provider value={{ language, setLanguage, t }}>
        <TransactionContext.Provider value={{ transactions, addTransaction, updateTransaction, clearTransactions }}>
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider
              wallets={wallets}
              autoConnect
              onError={(error) => {
                toast({
                  title: "Wallet Error",
                  description: error.message,
                  variant: "destructive",
                })
              }}
            >
              <WalletModalProvider>
                <WalletBalanceProvider>{children}</WalletBalanceProvider>
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </TransactionContext.Provider>
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  )
}
