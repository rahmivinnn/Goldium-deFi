import PageLayout from "@/components/PageLayout"
import SwapCard from "@/components/defi/SwapCard"

export default function SwapPage() {
  return (
    <PageLayout>
      <div className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold gold-gradient-text">Token Swap</h1>
            <p className="mt-4 text-xl text-gray-400">Swap between GOLD and other tokens with the best rates</p>
          </div>

          <SwapCard />
        </div>
      </div>
    </PageLayout>
  )
}
