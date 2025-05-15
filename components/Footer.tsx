"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Github, Twitter, DiscIcon as Discord } from "lucide-react"

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  return (
    <footer ref={footerRef} className="bg-gray-900 border-t border-yellow-900/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/goldium-logo.png" alt="Goldium.io" width={40} height={40} className="h-10 w-auto" />
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-300">
                Goldium.io
              </span>
            </Link>
            <p className="mt-4 text-gray-400">
              The next generation of decentralized finance and NFT trading powered by GOLD token.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {["Home", "Dashboard", "Marketplace", "Games"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* DeFi */}
          <div>
            <h3 className="text-white font-semibold mb-4">DeFi</h3>
            <ul className="space-y-2">
              {["Swap", "Stake", "Liquidity", "Bridge", "Vaults"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/defi/${item.toLowerCase()}`}
                    className="text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {["Documentation", "API", "FAQ", "Support"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">
              <Discord className="h-5 w-5" />
              <span className="sr-only">Discord</span>
            </a>
          </div>
          <div className="text-gray-500 text-sm">&copy; {currentYear} Goldium.io. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}
