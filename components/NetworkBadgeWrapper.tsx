"use client"

import dynamic from "next/dynamic"

// Placeholder component to show while loading
const NetworkBadgePlaceholder = () => (
  <div className="flex items-center gap-2 bg-black/50 border border-amber-500/20 rounded-full px-3 py-1">
    <div className="h-2 w-2 rounded-full bg-gray-500"></div>
    <span className="text-xs text-gray-300">Loading...</span>
  </div>
)

// Dynamically import the client component with SSR disabled
const ClientNetworkBadge = dynamic(() => import("./client-components/ClientNetworkBadge"), {
  ssr: false,
  loading: () => <NetworkBadgePlaceholder />,
})

export default function NetworkBadgeWrapper() {
  return <ClientNetworkBadge />
}
