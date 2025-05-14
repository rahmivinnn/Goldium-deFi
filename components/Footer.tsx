import Link from "next/link"
import Image from "next/image"
import { Twitter, Github, DiscIcon as Discord, ExternalLink } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gold-500/20">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Goldium.io" width={40} height={40} className="h-10 w-auto" />
              <span className="text-xl font-heading font-bold gold-gradient-text">Goldium.io</span>
            </Link>
            <p className="text-gray-400 text-sm">
              The premium NFT and DeFi platform on Solana, powered by $GOLD token.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gold-500"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gold-500"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gold-500"
              >
                <Discord className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-gold-500 font-medium mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-gold-500 text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-gray-400 hover:text-gold-500 text-sm">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/defi/swap" className="text-gray-400 hover:text-gold-500 text-sm">
                  Swap
                </Link>
              </li>
              <li>
                <Link href="/defi/stake" className="text-gray-400 hover:text-gold-500 text-sm">
                  Stake
                </Link>
              </li>
              <li>
                <Link href="/nft-gallery" className="text-gray-400 hover:text-gold-500 text-sm">
                  NFT Gallery
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-gold-500 font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/token" className="text-gray-400 hover:text-gold-500 text-sm">
                  Tokenomics
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-gold-500 text-sm flex items-center gap-1">
                  Whitepaper <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-gold-500 text-sm flex items-center gap-1">
                  Documentation <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-gold-500 text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-gold-500 font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-gold-500 text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-gold-500 text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-gray-400 hover:text-gold-500 text-sm">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Goldium.io. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <span className="text-gray-400 text-sm">Powered by</span>
            <a
              href="https://solana.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gold-500"
            >
              <Image src="/solana-logo.png" alt="Solana" width={20} height={20} className="h-5 w-auto" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
