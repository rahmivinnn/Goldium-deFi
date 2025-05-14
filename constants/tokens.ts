export interface Token {
  name: string
  symbol: string
  mint: string
  decimals: number
  logoURI: string
}

// Solana token
export const SOL_TOKEN: Token = {
  name: "Solana",
  symbol: "SOL",
  mint: "So11111111111111111111111111111111111111112",
  decimals: 9,
  logoURI: "/solana-logo.png",
}

// GOLD token (custom SPL token)
export const GOLD_TOKEN: Token = {
  name: "Goldium",
  symbol: "GOLD",
  mint: "GoLDium1111111111111111111111111111111111111", // This would be replaced with the actual mint address
  decimals: 9,
  logoURI: "/placeholder.svg?key=drkna",
}

// Additional tokens that could be added in the future
export const USDC_TOKEN: Token = {
  name: "USD Coin",
  symbol: "USDC",
  mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  decimals: 6,
  logoURI: "/placeholder.svg?key=h4ztn",
}

export const BONK_TOKEN: Token = {
  name: "Bonk",
  symbol: "BONK",
  mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  decimals: 5,
  logoURI: "/placeholder.svg?key=5isxr",
}

// List of all available tokens
export const AVAILABLE_TOKENS: Token[] = [SOL_TOKEN, GOLD_TOKEN, USDC_TOKEN, BONK_TOKEN]
