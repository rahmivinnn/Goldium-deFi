"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import DeFiMenu from "@/components/DeFiMenu"
import WalletConnect from "@/components/WalletConnect"
import NetworkBadge from "@/components/NetworkBadge"
import { safeAddScrollListener, isBrowser } from "@/utils/browser"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isMounted = useRef(false)

  useEffect(() => {
    // Set mounted ref
    isMounted.current = true

    // Only run on client side
    if (!isBrowser) return

    // Add scroll listener safely
    const cleanup = safeAddScrollListener((newScrollY) => {
      if (isMounted.current) {
        setIsScrolled(newScrollY > 10)
      }
    })

    // Clean up
    return () => {
      isMounted.current = false
      cleanup()
    }
  }, [])

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Marketplace", href: "/marketplace" },
    // Games menu item removed
    { name: "Governance", href: "/governance" },
    { name: "Transactions", href: "/transactions" },
    { name: "Avatar", href: "/avatar" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/90 backdrop-blur-md shadow-lg shadow-yellow-900/10" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-10 w-10 md:h-12 md:w-12">
              <Image
                src="/goldium-logo.png"
                alt="Goldium.io"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-300">
              Goldium.io
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <React.Fragment key={item.name}>
                {item.name === "DeFi" ? (
                  <DeFiMenu />
                ) : (
                  <Link href={item.href} className="text-white hover:text-yellow-300 transition-colors">
                    {item.name}
                  </Link>
                )}
              </React.Fragment>
            ))}
            <DeFiMenu />
          </nav>

          {/* Right Side - Wallet & Network */}
          <div className="hidden md:flex items-center gap-4">
            <NetworkBadge />
            <WalletConnect />
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-black border-t border-yellow-900/30"
        >
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-yellow-300 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="py-2">
                <DeFiMenu />
              </div>
            </nav>
            <div className="mt-6 flex flex-col gap-4">
              <NetworkBadge />
              <WalletConnect />
            </div>
          </div>
        </motion.div>
      )}
    </header>
  )
}
