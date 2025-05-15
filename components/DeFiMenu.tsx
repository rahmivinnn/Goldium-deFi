"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function DeFiMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const defiItems = [
    { name: "Swap", href: "/defi/swap" },
    { name: "Stake", href: "/defi/stake" },
    { name: "Liquidity", href: "/defi/liquidity" },
    { name: "Bridge", href: "/defi/bridge" },
    { name: "Vaults", href: "/defi/vaults" },
  ]

  return (
    <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button
        className="flex items-center text-white hover:text-yellow-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        DeFi
        <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-40 rounded-md bg-gray-900 border border-amber-500/20 shadow-lg shadow-amber-500/10 overflow-hidden z-50"
          >
            <div className="py-1">
              {defiItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-sm text-gray-200 hover:bg-amber-500/10 hover:text-amber-300"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
