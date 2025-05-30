"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useToast } from "@/components/ui/use-toast"

// Dynamically import the StakingInterface component with SSR disabled
const StakingInterface = dynamic(() => import("@/components/StakingInterface"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-900 animate-pulse rounded-lg flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-t-transparent border-amber-500 rounded-full animate-spin"></div>
    </div>
  ),
})

export default function StakingClient() {
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return

    try {
      setIsMounted(true)
    } catch (error) {
      console.error("Error initializing StakingClient:", error)
      toast({
        title: "Error",
        description: "Failed to initialize staking interface. Please refresh the page.",
        variant: "destructive",
      })
    }
  }, [toast])

  // Don't render anything until mounted on client
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return <StakingInterface />
}
