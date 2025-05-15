"use client"

import { useEffect, useState } from "react"
import { isBrowser } from "@/utils/browser"
import { debugLogDOMReadyState, debugCheckElementExists } from "@/utils/debug-utils"

export default function DOMDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<{
    isBrowser: boolean
    readyState: string
    windowDimensions: string
    userAgent: string
    timestamp: number
  }>({
    isBrowser: false,
    readyState: "unknown",
    windowDimensions: "unknown",
    userAgent: "unknown",
    timestamp: Date.now(),
  })

  useEffect(() => {
    if (!isBrowser) return

    // Log DOM ready state
    debugLogDOMReadyState()

    // Check for common elements
    debugCheckElementExists("body")
    debugCheckElementExists("head")
    debugCheckElementExists("#__next")
    debugCheckElementExists("[data-rk]") // Wallet adapter elements

    // Update diagnostics
    const updateDiagnostics = () => {
      setDiagnostics({
        isBrowser,
        readyState: document.readyState,
        windowDimensions: `${window.innerWidth}x${window.innerHeight}`,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      })
    }

    // Initial update
    updateDiagnostics()

    // Set up listeners for DOM state changes
    const readyStateHandler = () => {
      console.log(`DOMContentLoaded fired, readyState: ${document.readyState}`)
      updateDiagnostics()
    }

    const loadHandler = () => {
      console.log(`Window load event fired, readyState: ${document.readyState}`)
      updateDiagnostics()
    }

    document.addEventListener("DOMContentLoaded", readyStateHandler)
    window.addEventListener("load", loadHandler)

    // Clean up
    return () => {
      document.removeEventListener("DOMContentLoaded", readyStateHandler)
      window.removeEventListener("load", loadHandler)
    }
  }, [])

  // Don't render anything on server
  if (!isBrowser) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-2 z-50">
      <div>Browser: {String(diagnostics.isBrowser)}</div>
      <div>Ready State: {diagnostics.readyState}</div>
      <div>Window: {diagnostics.windowDimensions}</div>
      <div>User Agent: {diagnostics.userAgent}</div>
      <div>Timestamp: {new Date(diagnostics.timestamp).toISOString()}</div>
    </div>
  )
}
