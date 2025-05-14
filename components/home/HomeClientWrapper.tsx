"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"

// Dynamically import the HeroSection with no SSR to avoid Three.js issues
const HeroSection = dynamic(() => import("@/components/home/HeroSection"), {
  ssr: false,
  loading: () => <HomeLoading />,
})

function HomeLoading() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-black">
      <div className="text-amber-500 text-2xl font-bold">Loading Goldium.io...</div>
    </div>
  )
}

export default function HomeClientWrapper() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HeroSection />
    </Suspense>
  )
}
