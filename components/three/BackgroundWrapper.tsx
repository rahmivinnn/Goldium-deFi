"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import the GlobalBackground component with SSR disabled
const GlobalBackground = dynamic(() => import("@/components/three/GlobalBackground"), {
  ssr: false,
})

export default function BackgroundWrapper() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  if (!isMounted) {
    return null
  }

  return <GlobalBackground intensity={0.7} />
}
