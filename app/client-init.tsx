"use client"

import { useEffect } from "react"

export default function ClientInit() {
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === "undefined") return

    console.log("Client initialization complete")

    // Any other client-side initialization can go here
  }, [])

  // This component doesn't render anything
  return null
}
