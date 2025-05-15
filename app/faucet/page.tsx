import { Faucet } from "@/components/Faucet"
import type { Metadata } from "next"
import PageLayout from "@/components/PageLayout"

export const metadata: Metadata = {
  title: "GOLD Token Faucet | Goldium.io",
  description: "Claim free GOLD tokens to explore the Goldium.io ecosystem",
}

export default function FaucetPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-300">
          GOLD Token Faucet
        </h1>

        <div className="max-w-md mx-auto">
          <Faucet />
        </div>

        <div className="mt-12 max-w-2xl mx-auto bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20">
          <h2 className="text-2xl font-bold mb-4 text-amber-400">About the GOLD Token Faucet</h2>

          <div className="space-y-4 text-gray-300">
            <p>
              The GOLD Token Faucet allows you to claim free GOLD tokens to explore the Goldium.io ecosystem. These
              tokens can be used for:
            </p>

            <ul className="list-disc pl-5 space-y-2">
              <li>Swapping with other tokens</li>
              <li>Providing liquidity to pools</li>
              <li>Staking to earn rewards</li>
              <li>Testing the bridge functionality</li>
              <li>Exploring NFT features</li>
            </ul>

            <p>
              You can claim tokens once every 5 minutes. The faucet is connected to the Solana Mainnet and requires a
              connected Phantom wallet to use.
            </p>

            <p className="text-amber-300 font-medium">Note: These are test tokens and have no real monetary value.</p>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
