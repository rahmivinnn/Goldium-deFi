"use client"

import { useEffect, useState } from "react"

export default function LogoFallback() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Check if the logo image exists
    const img = new Image()
    img.src = "/logo.png"
    img.onload = () => setLoaded(true)
    img.onerror = () => setLoaded(false)
  }, [])

  if (loaded) {
    return (
      <img
        src="/logo.png"
        alt="Goldium Logo"
        className="w-12 h-12 object-contain"
        style={{ filter: "drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))" }}
      />
    )
  }

  // Fallback SVG logo if image doesn't load
  return (
    <div className="w-12 h-12 flex items-center justify-center">
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-pulse-gold"
      >
        <path d="M24 4L4 24L24 44L44 24L24 4Z" fill="url(#paint0_linear)" stroke="#FFD700" strokeWidth="2" />
        <path d="M24 12L12 24L24 36L36 24L24 12Z" fill="url(#paint1_linear)" stroke="#FFD700" strokeWidth="2" />
        <path d="M24 20L20 24L24 28L28 24L24 20Z" fill="#FFD700" stroke="#FFD700" strokeWidth="1" />
        <defs>
          <linearGradient id="paint0_linear" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD700" />
            <stop offset="1" stopColor="#FFA500" />
          </linearGradient>
          <linearGradient id="paint1_linear" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD700" />
            <stop offset="1" stopColor="#FFA500" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
