"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronDown, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { AVAILABLE_TOKENS, type Token } from "@/constants/tokens"
import { useTheme } from "@/components/WalletContextProvider"

interface TokenSelectorProps {
  selectedToken: Token
  onSelectToken: (token: Token) => void
  otherToken: Token
}

export default function TokenSelector({ selectedToken, onSelectToken, otherToken }: TokenSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  const filteredTokens = AVAILABLE_TOKENS.filter(
    (token) =>
      token.mint !== otherToken.mint &&
      (token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={`flex items-center gap-2 py-1 px-2 rounded-lg ${isDarkTheme ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-200 hover:bg-gray-300"} transition-colors`}
        >
          <div className="relative w-6 h-6">
            <Image
              src={selectedToken.logoURI || "/placeholder.svg"}
              alt={selectedToken.name}
              width={24}
              height={24}
              className="rounded-full"
            />
          </div>
          <span className={`font-medium ${isDarkTheme ? "text-white" : "text-gray-900"}`}>{selectedToken.symbol}</span>
          <ChevronDown className={`h-4 w-4 ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`} />
        </button>
      </DialogTrigger>
      <DialogContent className={isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}>
        <DialogHeader>
          <DialogTitle className={isDarkTheme ? "text-white" : "text-gray-900"}>Select a token</DialogTitle>
        </DialogHeader>
        <div className="mt-4 relative">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkTheme ? "text-gray-400" : "text-gray-500"} h-4 w-4`}
          />
          <Input
            placeholder="Search by name or symbol"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 ${isDarkTheme ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}`}
          />
        </div>
        <div className="mt-4 max-h-60 overflow-y-auto pr-1">
          {filteredTokens.length > 0 ? (
            <div className="grid gap-2">
              {filteredTokens.map((token) => (
                <button
                  key={token.mint}
                  className={`flex items-center gap-3 p-3 rounded-lg ${isDarkTheme ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`}
                  onClick={() => {
                    onSelectToken(token)
                    setOpen(false)
                  }}
                >
                  <div className="relative w-8 h-8">
                    <Image
                      src={token.logoURI || "/placeholder.svg"}
                      alt={token.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                  <div className="text-left">
                    <div className={`font-medium ${isDarkTheme ? "text-white" : "text-gray-900"}`}>{token.symbol}</div>
                    <div className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>{token.name}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className={`text-center py-4 ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>No tokens found</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
