import { WalletContextProvider } from "@/components/providers/WalletContextProvider"
import Header from "@/components/Header"
import DeFiTester from "@/components/DeFiTester"

export default function TestingPage() {
  return (
    <WalletContextProvider>
      <main className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <div className="max-w-7xl mx-auto w-full px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent mb-2">
              DeFi Testing Dashboard
            </h1>
            <p className="text-gray-400">Test and verify all DeFi features in the Goldium platform</p>
          </div>

          <DeFiTester />
        </div>
      </main>
    </WalletContextProvider>
  )
}
