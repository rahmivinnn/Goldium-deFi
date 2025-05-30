"use client"

import { useEffect, useState } from "react"
import { safeAddEventListener, onDOMReady } from "@/utils/dom-safe"

export default function ClientInitializer() {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === "undefined") return

    // Initialize client-side functionality
    const initialize = () => {
      console.log("Client initialization started")

      // Add any global event listeners here
      const cleanupResize = safeAddEventListener(
        window,
        "resize",
        () => {
          // Handle resize events
        },
        { passive: true },
      )

      // Mark as initialized
      setIsInitialized(true)
      console.log("Client initialization complete")

      // Return cleanup function
      return () => {
        cleanupResize()
        console.log("Client cleanup complete")
      }
    }

    // Wait for DOM to be ready before initializing
    const cleanup = onDOMReady(initialize)

    // Clean up on unmount
    return cleanup
  }, [])

  // This component doesn't render anything
  return null
}
