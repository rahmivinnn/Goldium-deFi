"use client"

import { useEffect, useRef } from "react"
import { onDOMReady, isBrowser } from "@/utils/browser"

export default function ClientInit() {
  const initialized = useRef(false)

  useEffect(() => {
    // Prevent double initialization
    if (initialized.current) return
    initialized.current = true

    // Only run on client side
    if (!isBrowser) return

    // Initialize client-side code when the DOM is ready
    const cleanup = onDOMReady(() => {
      console.log("DOM is fully loaded and parsed")

      // Add any global initialization code here
      // This ensures it only runs after the DOM is ready

      // Set a global flag to indicate the app is fully loaded
      window.__APP_LOADED__ = true
    })

    // Clean up when the component unmounts
    return () => {
      cleanup()
      initialized.current = false
    }
  }, [])

  // This component doesn't render anything
  return null
}
