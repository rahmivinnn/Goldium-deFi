"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Menu, X, ChevronDown } from "lucide-react"
import { useNetwork } from "@/components/NetworkContextProvider"
import NetworkSelector from "@/components/NetworkSelector"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Marketplace", href: "/marketplace" },
  {
    name: "DeFi",
    href: "#",
    children: [
      { name: "Swap", href: "/defi/swap" },
      { name: "Stake", href: "/defi/stake" },
      { name: "Liquidity", href: "/defi/liquidity" },
    ],
  },
  { name: "NFT Gallery", href: "/nft-gallery" },
  { name: "3D Adventure", href: "/adventure" },
  { name: "Token", href: "/token" },
]

export default function Navbar() {
  const pathname = usePathname()
  const { publicKey, connected } = useWallet()
  const { network } = useNetwork()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when path changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-md border-b border-gold-500/20" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <Image src="/logo.png" alt="Goldium.io" width={40} height={40} className="h-10 w-auto" />
            <span className="text-xl font-heading font-bold gold-gradient-text">Goldium.io</span>
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-300"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) =>
            item.children ? (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium ${
                    pathname.startsWith(item.href) || item.children?.some((child) => pathname === child.href)
                      ? "text-gold-500"
                      : "text-gray-300 hover:text-gold-500"
                  }`}
                >
                  {item.name}
                  <ChevronDown className="h-4 w-4" />
                </button>

                {activeDropdown === item.name && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md bg-black/90 backdrop-blur-md border border-gold-500/20 shadow-lg shadow-gold-500/10 py-2 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`block px-4 py-2 text-sm ${
                          pathname === child.href
                            ? "text-gold-500 bg-gold-500/10"
                            : "text-gray-300 hover:text-gold-500 hover:bg-gold-500/5"
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium ${
                  pathname === item.href ? "text-gold-500" : "text-gray-300 hover:text-gold-500"
                }`}
              >
                {item.name}
              </Link>
            ),
          )}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 items-center">
          <NetworkSelector />

          <div className="custom-wallet-button">
            <WalletMultiButton />
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-black px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gold-500/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                <Image src="/logo.png" alt="Goldium.io" width={32} height={32} className="h-8 w-auto" />
                <span className="text-lg font-heading font-bold gold-gradient-text">Goldium.io</span>
              </Link>

              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-800">
                <div className="space-y-2 py-6">
                  {navigation.map((item) =>
                    item.children ? (
                      <div key={item.name} className="space-y-2">
                        <div className="px-3 py-2 text-base font-semibold text-white">{item.name}</div>
                        <div className="pl-4 space-y-2 border-l border-gold-500/20">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className={`block px-3 py-2 text-base ${
                                pathname === child.href ? "text-gold-500" : "text-gray-300 hover:text-gold-500"
                              }`}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`block px-3 py-2 text-base ${
                          pathname === item.href ? "text-gold-500" : "text-gray-300 hover:text-gold-500"
                        }`}
                      >
                        {item.name}
                      </Link>
                    ),
                  )}
                </div>

                <div className="py-6 space-y-4">
                  <NetworkSelector />

                  <div className="custom-wallet-button">
                    <WalletMultiButton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
