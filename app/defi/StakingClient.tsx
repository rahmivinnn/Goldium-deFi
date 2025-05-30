"use client"

import { Suspense } from "react"
import StakingInterface from "@/components/StakingInterface"

export default function StakingClient() {
  return (
    <Suspense fallback={<div className="w-full h-64 bg-gray-900 animate-pulse rounded-lg"></div>}>
      <StakingInterface />
    </Suspense>
  )
}
