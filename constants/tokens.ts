export interface Token {
  name: string
  symbol: string
  mint: string
  decimals: number
  logoURI: string
  totalSupply?: number
}

// Token addresses for different networks
export const GOLD_MINT_ADDRESS = {
  "mainnet-beta": "ApkBg8kzMBpVKxvgrw67vkd5KuGWqSu2GVb19eK4pump",
  devnet: "ApkBg8kzMBpVKxvgrw67vkd5KuGWqSu2GVb19eK4pump",
  testnet: "ApkBg8kzMBpVKxvgrw67vkd5KuGWqSu2GVb19eK4pump",
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
  mint: GOLD_MINT_ADDRESS["devnet"], // Default to devnet
  decimals: 9,
  logoURI: "/goldium-logo.png",
  totalSupply: 1_000_000, // Updated from 1 billion to 1 million tokens
}

// Function to get the correct GOLD token for the current network
export function getGoldTokenForNetwork(network: string): Token {
  return {
    ...GOLD_TOKEN,
    mint: GOLD_MINT_ADDRESS[network as keyof typeof GOLD_MINT_ADDRESS] || GOLD_MINT_ADDRESS.devnet,
  }
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
