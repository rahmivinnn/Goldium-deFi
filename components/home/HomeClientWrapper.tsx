"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Dynamically import the ThreeScene component with SSR disabled
const ThreeScene = dynamic(() => import("../three/ThreeScene"), { ssr: false })

export default function HomeClientWrapper() {
  const [scrollY, setScrollY] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isMounted) {
    return null
  }

  return <ThreeScene scrollY={scrollY} />
}
