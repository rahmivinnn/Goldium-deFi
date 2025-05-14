import Header from "@/components/Header"
import TokenBridge from "@/components/TokenBridge"
import { WalletContextProvider } from "@/components/WalletContextProvider"

export default function BridgePage() {
  return (
    <WalletContextProvider>
      <main className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <div className="max-w-3xl mx-auto w-full px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
            Cross-Chain Bridge
          </h1>
          <TokenBridge />
        </div>
      </main>
    </WalletContextProvider>
  )
}
