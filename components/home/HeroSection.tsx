"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ArrowDown } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import ThreeScene with no SSR
const ThreeScene = dynamic(() => import("@/components/three/ThreeScene"), {
  ssr: false,
})

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const { top } = containerRef.current.getBoundingClientRect()
        setScrollY(-top)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <div className="text-amber-500 text-2xl font-bold">Loading Goldium.io...</div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden">
      {/* 3D Background */}
      <ThreeScene scrollY={scrollY} />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="w-32 h-32 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,10 80,30 80,70 50,90 20,70 20,30"
                fill="url(#goldGradient)"
                stroke="#ffc107"
                strokeWidth="2"
                className="animate-pulse"
              />
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffd700" />
                  <stop offset="50%" stopColor="#ffb700" />
                  <stop offset="100%" stopColor="#ff8c00" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-5xl md:text-7xl font-bold text-center mb-6"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
            Goldium.io
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-xl md:text-2xl text-amber-100/80 text-center max-w-3xl mb-12"
        >
          Join Goldium.io for NFT trading, staking, and seamless crypto payments powered by GOLD token.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold hover:from-amber-400 hover:to-yellow-500 transform hover:scale-105 transition-all shadow-lg shadow-amber-900/30">
            Get Started
          </button>
          <button className="px-8 py-3 rounded-lg bg-black/40 border border-amber-500/50 text-amber-100 font-bold hover:bg-black/60 hover:border-amber-400 transform hover:scale-105 transition-all">
            APKBq8kz.pump
          </button>
        </motion.div>

        {/* Rating */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-20 flex flex-col items-center"
        >
          <div className="flex mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-amber-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            ))}
          </div>
          <p className="text-amber-200/80 text-sm">RATED 5 STARS BY USERS</p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-8 flex flex-col items-center"
        >
          <ArrowDown className="h-6 w-6 text-amber-400 animate-bounce" />
        </motion.div>
      </div>
    </div>
  )
}
