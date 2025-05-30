import type React from "react"
import type { Metadata } from "next"
import { Inter, Sora } from "next/font/google"
import "./globals.css"
import ClientProviders from "@/components/ClientProviders"
import ClientInitializer from "@/components/ClientInitializer"

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Goldium.io | Web3 Fantasy DeFi Platform",
  description: "Join Goldium.io for NFT trading, staking, and seamless crypto payments powered by GOLD token.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.variable} ${inter.variable} font-sans bg-black text-white`}>
        <ClientProviders>
          <ClientInitializer />
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
