export interface Token {
  name: string
  symbol: string
  mint: string
  decimals: number
  logoURI: string
  totalSupply?: number
}

// Solana token
export const SOL_TOKEN: Token = {
  name: "Solana",
  symbol: "SOL",
  mint: "So11111111111111111111111111111111111111112",
  decimals: 9,
  logoURI: "/solana-logo.png",
}

// GOLD token with the correct mint address
export const GOLD_TOKEN: Token = {
  name: "Goldium",
  symbol: "GOLD",
  mint: "ApkBg8kzMBpVKxvgrw67vkd5KuGWqSu2GVb19eK4pump", // Real mint address
  decimals: 9,
  logoURI: "/placeholder.svg?key=drkna",
  totalSupply: 1_000_000_000, // 1 billion tokens
}

// Additional tokens that could be added in the future
export const USDC_TOKEN: Token = {
  name: "USD Coin",
  symbol: "USDC",
  mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  decimals: 6,
  logoURI: "/usdc-logo.png",
}

export const BONK_TOKEN: Token = {
  name: "Bonk",
  symbol: "BONK",
  mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  decimals: 5,
  logoURI: "/bonk-token-logo.png",
}

// List of all available tokens
export const AVAILABLE_TOKENS: Token[] = [SOL_TOKEN, GOLD_TOKEN, USDC_TOKEN, BONK_TOKEN]

// Staking program ID
export const STAKING_PROGRAM_ID = "GStKMnqHM6uJiVKGiznWSJQNuDtcMiNMM2WgaTJgr5P9"

// Faucet program ID
export const FAUCET_PROGRAM_ID = "FaucGo1dTkH8CjDXSFpZ7kVToKDnNXpKNYPfMJjJwHjR"

// Liquidity pool IDs
export const LIQUIDITY_POOLS = {
  GOLD_SOL: "GS1dsoPnAEuBnuXvzjVrAyJRxJhiR9Jbs3VaX7JJKnY",
  GOLD_USDC: "GU1dcUSgMGd9Bz1QBqMrwQoogZi1kHhfzFHcPXVZmtBE",
}
