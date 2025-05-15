import { TestingDashboard } from "@/components/TestingDashboard"
import PageLayout from "@/components/PageLayout"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "DeFi Testing Dashboard | Goldium.io",
  description: "Test and verify DeFi features across networks",
}

export default function TestingPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-300">
          DeFi Testing Dashboard
        </h1>

        <div className="max-w-4xl mx-auto">
          <TestingDashboard />
        </div>

        <div className="mt-12 max-w-2xl mx-auto bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20">
          <h2 className="text-2xl font-bold mb-4 text-amber-400">Testing Instructions</h2>

          <div className="space-y-4 text-gray-300">
            <p>
              This dashboard allows you to test all DeFi features across different networks. Follow these steps to
              thoroughly test the application:
            </p>

            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Select Network:</strong> Use the network selector to switch between Devnet, Testnet, and Mainnet
                Beta.
              </li>
              <li>
                <strong>Connect Wallet:</strong> Connect your Phantom wallet to the selected network.
              </li>
              <li>
                <strong>Run Tests:</strong> Click "Run All Tests" to verify basic connectivity and token balance.
              </li>
              <li>
                <strong>Test Individual Features:</strong> Use the tabs to test specific DeFi features like staking,
                swapping, and liquidity pools.
              </li>
              <li>
                <strong>Verify Results:</strong> Check the test results to ensure all features are working correctly.
              </li>
            </ol>

            <p className="text-amber-300 font-medium mt-4">
              Note: When testing on Devnet or Testnet, you can use the faucet to claim test GOLD tokens.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
