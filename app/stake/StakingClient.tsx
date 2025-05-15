"use client"

import dynamic from "next/dynamic"

// Loading component for the Staking interface
const StakingLoadingComponent = () => (
  <div className="w-full max-w-md mx-auto bg-black border border-gold-500/20 p-8 rounded-lg animate-pulse">
    <div className="h-8 w-1/3 bg-gray-800 rounded mb-6"></div>
    <div className="grid grid-cols-2 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-900 rounded-lg p-4">
          <div className="h-4 w-1/2 bg-gray-800 rounded mb-2"></div>
          <div className="h-6 w-20 bg-gray-800 rounded"></div>
        </div>
      ))}
    </div>
    <div className="h-10 bg-gray-800 rounded mb-6"></div>
    <div className="h-10 bg-gray-800 rounded mb-4"></div>
    <div className="h-24 bg-gray-800 rounded"></div>
  </div>
)

// Dynamically import the StakingInterface component with SSR disabled
const StakingInterface = dynamic(() => import("@/components/StakingInterface"), {
  ssr: false,
  loading: () => <StakingLoadingComponent />,
})

export default function StakingClient() {
  return <StakingInterface />
}
