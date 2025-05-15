"use client"

import { useEffect, useRef } from "react"
import { isBrowser, onDOMReady } from "@/utils/browser"
import { debugLogDOMReadyState } from "@/utils/debug-utils"

export default function ClientInit() {
  const initialized = useRef(false)

  useEffect(() => {
    // Log current DOM state
    debugLogDOMReadyState()

    // Prevent double initialization
    if (initialized.current) {
      console.log("ClientInit already initialized, skipping")
      return
    }

    console.log("ClientInit initializing...")
    initialized.current = true

    // Only run on client side
    if (!isBrowser) {
      console.log("Not in browser environment, skipping initialization")
      return
    }

    // Initialize client-side code when the DOM is ready
    const cleanup = onDOMReady(() => {
      console.log("DOM is fully loaded and parsed, initializing client-side code")

      // Add any global initialization code here
      // This ensures it only runs after the DOM is ready

      // Set a global flag to indicate the app is fully loaded
      if (typeof window !== "undefined") {
        window.__APP_LOADED__ = true
        console.log("Set window.__APP_LOADED__ = true")
      }
    })

    // Clean up when the component unmounts
    return () => {
      console.log("ClientInit unmounting, cleaning up")
      cleanup()
      initialized.current = false
    }
  }, [])

  // This component doesn't render anything
  return null
}
