import Header from "@/components/Header"
import SwapCard from "@/components/SwapCard"
import TokenChart from "@/components/TokenChart"
import LiquidityPoolsList from "@/components/LiquidityPoolsList"
import TransactionHistory from "@/components/TransactionHistory"
import { WalletContextProvider } from "@/components/WalletContextProvider"
import { SOL_TOKEN, GOLD_TOKEN } from "@/constants/tokens"

export default function SwapPage() {
  return (
    <WalletContextProvider>
      <main className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <div className="max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SwapCard />
            <TokenChart mintAddress={SOL_TOKEN.mint} symbol={SOL_TOKEN.symbol} />
            <TransactionHistory />
          </div>
          <div className="space-y-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
              Available Liquidity Pools
            </h2>
            <LiquidityPoolsList mintAddress={GOLD_TOKEN.mint} />
          </div>
        </div>
      </main>
    </WalletContextProvider>
  )
}
