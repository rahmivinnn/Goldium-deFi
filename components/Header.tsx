"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Menu, X, Sun, Moon, Globe } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/WalletContextProvider"
import { useLanguage } from "@/components/WalletContextProvider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const tabs = [
  { name: "swap", href: "/", current: true },
  { name: "pools", href: "/pools", current: false },
  { name: "farms", href: "/farms", current: false },
  { name: "nftGallery", href: "/nft", current: false },
  { name: "settings", href: "/settings", current: false },
]

export default function Header() {
  const pathname = usePathname()
  const { connected, publicKey } = useWallet()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  // Handle theme toggle
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Apply theme class to body
  useEffect(() => {
    document.body.className = theme === "dark" ? "dark" : "light"
  }, [theme])

  return (
    <header
      className={`${theme === "dark" ? "bg-black/90" : "bg-white/90"} backdrop-blur-md border-b ${theme === "dark" ? "border-gold/20" : "border-gold/30"} sticky top-0 z-50`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              {/* Gold text logo */}
              <span
                className={`text-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent`}
              >
                Goldium.io
              </span>
            </Link>

            <div className="hidden md:flex space-x-1">
              {tabs.map((tab) => {
                const isCurrent = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href))

                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isCurrent
                        ? "bg-gold/10 text-gold"
                        : `${theme === "dark" ? "text-gray-300" : "text-gray-700"} hover:bg-gold/5 hover:text-gold`
                    }`}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    {t(tab.name)}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Globe className={`h-5 w-5 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage("en")}>English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("es")}>Español</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("fr")}>Français</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("zh")}>中文</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("ja")}>日本語</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme}>
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-gray-300" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700" />
                )}
              </Button>
            </div>

            <div className={`${connected ? "shadow-gold/20 shadow-lg" : ""}`}>
              <WalletMultiButton
                className={`!bg-gradient-to-r !from-amber-600 !to-yellow-400 hover:!from-amber-500 hover:!to-yellow-300 !transition-all !rounded-lg !border !border-amber-300/30 !shadow-lg !shadow-amber-500/20 !font-bold !text-black !px-6 !py-2`}
              />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className={`inline-flex items-center justify-center rounded-md p-2 ${
                  theme === "dark"
                    ? "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                } focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className={`space-y-1 px-2 pb-3 pt-2 sm:px-3 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
            {tabs.map((tab) => {
              const isCurrent = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href))

              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isCurrent
                      ? "bg-gold/10 text-gold"
                      : `${theme === "dark" ? "text-gray-300" : "text-gray-700"} hover:bg-gold/5 hover:text-gold`
                  }`}
                  aria-current={isCurrent ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t(tab.name)}
                </Link>
              )
            })}
          </div>
          <div className={`border-t ${theme === "dark" ? "border-gray-700" : "border-gray-200"} pb-3 pt-4`}>
            <div className="flex items-center justify-between px-5">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme}>
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5 text-gray-300" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-700" />
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Globe className={`h-5 w-5 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setLanguage("en")}>English</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage("es")}>Español</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage("fr")}>Français</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage("zh")}>中文</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage("ja")}>日本語</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="w-full max-w-[200px]">
                <WalletMultiButton className="!bg-gradient-to-r !from-amber-600 !to-yellow-400 hover:!from-amber-500 hover:!to-yellow-300 !transition-all !rounded-lg !border !border-amber-300/30 !shadow-lg !shadow-amber-500/20 !font-bold !text-black !px-4 !py-2 !w-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
