import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { WalletContextProvider } from "@/components/WalletContextProvider"
import { NetworkContextProvider } from "@/components/NetworkContextProvider"
import { ThemeProvider } from "@/components/ThemeProvider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" })

export const metadata: Metadata = {
  title: "Goldium.io | Premium Solana NFT & DeFi Platform",
  description: "Trade NFTs, stake tokens, and explore the Goldium ecosystem powered by $GOLD token on Solana",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans bg-black text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <NetworkContextProvider>
            <WalletContextProvider>{children}</WalletContextProvider>
          </NetworkContextProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
