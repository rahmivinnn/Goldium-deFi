/**
 * Utility functions for wallet detection and interaction
 */

// Type definitions for wallet window objects
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean
      connect: () => Promise<{ publicKey: { toString: () => string } }>
      disconnect: () => Promise<void>
      signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>
      signTransaction: (transaction: any) => Promise<any>
      on: (event: string, callback: any) => void
      removeAllListeners: () => void
    }
    solflare?: {
      connect: () => Promise<{ publicKey: { toString: () => string } }>
      disconnect: () => Promise<void>
      signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>
      signTransaction: (transaction: any) => Promise<any>
      on: (event: string, callback: any) => void
      removeAllListeners: () => void
    }
    backpack?: {
      connect: () => Promise<{ publicKey: { toString: () => string } }>
      disconnect: () => Promise<void>
      signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>
      signTransaction: (transaction: any) => Promise<any>
      on: (event: string, callback: any) => void
      removeAllListeners: () => void
    }
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: any) => void
      removeAllListeners: () => void
    }
  }
}

/**
 * Check if a specific wallet is installed
 */
export function isWalletInstalled(walletName: string): boolean {
  if (typeof window === "undefined") return false

  switch (walletName.toLowerCase()) {
    case "phantom":
      return !!window.solana?.isPhantom
    case "solflare":
      return !!window.solflare
    case "metamask":
      return !!window.ethereum?.isMetaMask
    case "backpack":
      return !!window.backpack
    default:
      return false
  }
}

/**
 * Get all installed wallets
 */
export function getInstalledWallets(): string[] {
  const wallets: string[] = []

  if (isWalletInstalled("phantom")) wallets.push("phantom")
  if (isWalletInstalled("solflare")) wallets.push("solflare")
  if (isWalletInstalled("metamask")) wallets.push("metamask")
  if (isWalletInstalled("backpack")) wallets.push("backpack")

  return wallets
}

/**
 * Check if any wallet is installed
 */
export function isAnyWalletInstalled(): boolean {
  return getInstalledWallets().length > 0
}

/**
 * Get recommended wallet based on installed wallets and platform
 */
export function getRecommendedWallet(): string | null {
  const installedWallets = getInstalledWallets()

  if (installedWallets.length === 0) {
    // No wallets installed, recommend based on platform
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    if (isMobile) {
      return "phantom" // Phantom has good mobile support
    } else {
      return "phantom" // Phantom is popular on desktop
    }
  }

  // Prioritize wallets in this order
  const priorityOrder = ["phantom", "solflare", "backpack", "metamask"]

  for (const wallet of priorityOrder) {
    if (installedWallets.includes(wallet)) {
      return wallet
    }
  }

  // Default to first installed wallet
  return installedWallets[0]
}

/**
 * Get wallet installation URL
 */
export function getWalletInstallUrl(walletName: string): string {
  switch (walletName.toLowerCase()) {
    case "phantom":
      return "https://phantom.app/download"
    case "solflare":
      return "https://solflare.com/download"
    case "metamask":
      return "https://metamask.io/download/"
    case "backpack":
      return "https://www.backpack.app/download"
    default:
      return ""
  }
}

/**
 * Safely access wallet object
 */
export function getWalletObject(walletName: string): any | null {
  if (typeof window === "undefined") return null

  switch (walletName.toLowerCase()) {
    case "phantom":
      return window.solana
    case "solflare":
      return window.solflare
    case "metamask":
      return window.ethereum
    case "backpack":
      return window.backpack
    default:
      return null
  }
}
