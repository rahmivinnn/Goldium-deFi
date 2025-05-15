import ConnectionTest from "@/components/ConnectionTest"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Connection Test | Goldium.io",
  description: "Test your wallet connection and network connectivity",
}

export default function ConnectionTestPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Connection Test</h1>
      <p className="text-center text-gray-400 max-w-2xl mx-auto mb-8">
        Use this page to test your wallet connection and network connectivity. This tool helps diagnose any issues with
        your wallet or network connection.
      </p>

      <ConnectionTest />

      <div className="mt-12 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Troubleshooting Tips</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-amber-500">Browser Compatibility</h3>
            <p className="text-sm text-gray-400">
              For the best experience, use Chrome, Firefox, or Brave. Safari and other browsers may have limited wallet
              compatibility.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-amber-500">Wallet Installation</h3>
            <p className="text-sm text-gray-400">
              Make sure you have a compatible wallet installed. We recommend Phantom, Solflare, or Backpack for Solana.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-amber-500">Connection Issues</h3>
            <p className="text-sm text-gray-400">
              If you're having trouble connecting, try refreshing the page, restarting your browser, or checking your
              wallet extension.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-amber-500">Network Connectivity</h3>
            <p className="text-sm text-gray-400">
              Ensure you have a stable internet connection. High latency or network issues can affect your experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
