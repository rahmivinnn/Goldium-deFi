"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useNetwork } from "@/components/providers/NetworkContextProvider"
import { useWalletConnection } from "@/components/providers/WalletConnectionProvider"
import { ConnectionStatusIndicator } from "@/components/ConnectionStatusIndicator"
import { AlertCircle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { detectBrowser } from "@/utils/browser-detection"

export function ConnectionStatusBar() {
  const { status, error, isBrowserSupported } = useWalletConnection()
  const { network } = useNetwork()
  const { connected } = useWallet()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const browserInfo = detectBrowser()

  // Show the bar if there's an error or browser compatibility issue
  useEffect(() => {
    if (isDismissed) return

    if (error || !isBrowserSupported) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [error, isBrowserSupported, isDismissed])

  // Reset dismissed state when error changes
  useEffect(() => {
    setIsDismissed(false)
  }, [error])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-amber-500/10 border-b border-amber-500/20"
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />

              {error ? (
                <span className="text-sm text-amber-500">{error.message}</span>
              ) : !isBrowserSupported ? (
                <span className="text-sm text-amber-500">
                  {browserInfo.name} may have limited wallet compatibility. For the best experience, please use Chrome,
                  Firefox, or Brave.
                </span>
              ) : (
                <span className="text-sm text-amber-500">Connected to {network} network</span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <ConnectionStatusIndicator />

              <button onClick={() => setIsDismissed(true)} className="text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
