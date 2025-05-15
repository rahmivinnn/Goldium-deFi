import Header from "@/components/Header"
import StakingClient from "./StakingClient"

export default function StakePage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <div className="max-w-5xl mx-auto w-full px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
          Stake & Earn
        </h1>
        <StakingClient />
      </div>
    </main>
  )
}
