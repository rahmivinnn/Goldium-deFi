"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { safeAddEventListener } from "@/utils/dom-safe"

// Dynamically import the ThreeScene component with SSR disabled
const ThreeScene = dynamic(() => import("../three/ThreeScene"), { ssr: false })

export default function HomeClientWrapper() {
  const [scrollY, setScrollY] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return

    setIsMounted(true)

    // Safely add scroll event listener
    const cleanup = safeAddEventListener(
      window,
      "scroll",
      () => {
        setScrollY(window.scrollY)
      },
      { passive: true },
    )

    // Return cleanup function
    return cleanup
  }, [])

  // Don't render anything until mounted on client
  if (!isMounted) {
    return null
  }

  return <ThreeScene scrollY={scrollY} />
}
