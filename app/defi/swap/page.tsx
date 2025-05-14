import PageLayout from "@/components/PageLayout"
import SwapCard from "@/components/defi/swap/SwapCard"
import TokenChart from "@/components/defi/swap/TokenChart"
import RecentTransactions from "@/components/defi/swap/RecentTransactions"

export default function SwapPage() {
  return (
    <PageLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-3xl font-heading font-bold gold-gradient-text mb-2">Token Swap</h1>
          <p className="text-gray-400 mb-6">Swap between GOLD and other tokens with the best rates</p>

          <SwapCard />
          <TokenChart />
        </div>

        <div>
          <RecentTransactions />
        </div>
      </div>
    </PageLayout>
  )
}
