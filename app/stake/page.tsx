import StakingClient from "./StakingClient"
import { WalletContextProvider } from "@/components/providers/WalletContextProvider"
import Header from "@/components/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function StakePage() {
  return (
    <WalletContextProvider>
      <main className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <div className="max-w-7xl mx-auto w-full px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent mb-2">
              Stake GOLD
            </h1>
            <p className="text-gray-400">Stake your GOLD tokens to earn rewards and participate in governance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <StakingClient />
            </div>
            <div>
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl text-gold">Staking Benefits</CardTitle>
                  <CardDescription>Why stake your GOLD tokens?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-white">Earn passive income</h3>
                    <p className="text-gray-400">
                      Earn up to 15% APY on your staked GOLD tokens. Rewards are calculated and accrued in real-time.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-white">Participate in governance</h3>
                    <p className="text-gray-400">
                      Staked GOLD tokens give you voting power in the Goldium DAO. Help shape the future of the
                      platform.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-white">Reduced fees</h3>
                    <p className="text-gray-400">
                      Stakers enjoy reduced trading fees on the Goldium platform. The more you stake, the lower your
                      fees.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-white">Priority features</h3>
                    <p className="text-gray-400">
                      Get early access to new features and products. Stakers are first in line for new opportunities.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </WalletContextProvider>
  )
}
