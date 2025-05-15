import { type NetworkType } from "@/components/NetworkContextProvider"

export interface Token {
  name: string
  symbol: string
  mint: string | { [network in NetworkType]: string }
  decimals: number
  logoURI: string
  totalSupply?: number
}

// Helper function to get the correct mint address for the current network
export function getMintAddress(token: Token, network: NetworkType): string {
  if (typeof token.mint === 'string') {
    return token.mint
  }
  return token.mint[network] || token.mint["mainnet-beta"] // Fallback to mainnet if specific network not found
}

// Solana token - same address on all networks
export const SOL_TOKEN: Token = {
  name: "Solana",
  symbol: "SOL",
  mint: "So11111111111111111111111111111111111111112",
  decimals: 9,
  logoURI: "/solana-logo.png",
}

// GOLD token with network-specific addresses
export const GOLD_TOKEN: Token = {
  name: "Goldium",
  symbol: "GOLD",
  mint: {
    "devnet": "GoLDiumDevXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Devnet address
    "testnet": "GoLDiumTestXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Testnet address
    "mainnet-beta": "ApkBg8kzMBpVKxvgrw67vkd5KuGWqSu2GVb19eK4pump" // Mainnet address
  },
  decimals: 9,
  logoURI: "/placeholder.svg?key=drkna",
  totalSupply: 1_000_000_000, // 1 billion tokens
}

// USDC token with network-specific addresses
export const USDC_TOKEN: Token = {
  name: "USD Coin",
  symbol: "USDC",
  mint: {
    "devnet": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // Devnet USDC
    "testnet": "CpMah17kQEL2wqyMKt3mZBdTnZbkbfx4nqmQMFDP5vwp", // Testnet USDC
    "mainnet-beta": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" // Mainnet USDC
  },
  decimals: 6,
  logoURI: "/usdc-logo.png",
}

// BONK token with network-specific addresses
export const BONK_TOKEN: Token = {
  name: "Bonk",
  symbol: "BONK",
  mint: {
    "devnet": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // Using mainnet address for devnet for demo
    "testnet": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // Using mainnet address for testnet for demo
    "mainnet-beta": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" // Mainnet BONK
  },
  decimals: 5,
  logoURI: "/bonk-token-logo.png",
}

// List of all available tokens
export const AVAILABLE_TOKENS: Token[] = [SOL_TOKEN, GOLD_TOKEN, USDC_TOKEN, BONK_TOKEN]

// Program IDs with network-specific addresses
export const PROGRAM_IDS = {
  STAKING: {
    "devnet": "GStKMnqHM6uJiVKGiznWSJQNuDtcMiNMM2WgaTJgr5P9",
    "testnet": "GStKMnqHM6uJiVKGiznWSJQNuDtcMiNMM2WgaTJgr5P9",
    "mainnet-beta": "GStKMnqHM6uJiVKGiznWSJQNuDtcMiNMM2WgaTJgr5P9"
  },
  FAUCET: {
    "devnet": "FaucGo1dTkH8CjDXSFpZ7kVToKDnNXpKNYPfMJjJwHjR",
    "testnet": "FaucGo1dTkH8CjDXSFpZ7kVToKDnNXpKNYPfMJjJwHjR",
    "mainnet-beta": "FaucGo1dTkH8CjDXSFpZ7kVToKDnNXpKNYPfMJjJwHjR"
  },
  DEX: {
    "devnet": "DexXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "testnet": "DexXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "mainnet-beta": "DexXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  }
}

// Helper function to get program ID for the current network
export function getProgramId(program: keyof typeof PROGRAM_IDS, network: NetworkType): string {
  return PROGRAM_IDS[program][network] || PROGRAM_IDS[program]["mainnet-beta"]
}

// Liquidity pool IDs with network-specific addresses
export const LIQUIDITY_POOLS = {
  GOLD_SOL: {
    "devnet": "GS1dsoPnAEuBnuXvzjVrAyJRxJhiR9Jbs3VaX7JJKnY",
    "testnet": "GS1dsoPnAEuBnuXvzjVrAyJRxJhiR9Jbs3VaX7JJKnY",
    "mainnet-beta": "GS1dsoPnAEuBnuXvzjVrAyJRxJhiR9Jbs3VaX7JJKnY"
  },
  GOLD_USDC: {
    "devnet": "GU1dcUSgMGd9Bz1QBqMrwQoogZi1kHhfzFHcPXVZmtBE",
    "testnet": "GU1dcUSgMGd9Bz1QBqMrwQoogZi1kHhfzFHcPXVZmtBE",
    "mainnet-beta": "GU1dcUSgMGd9Bz1QBqMrwQoogZi1kHhfzFHcPXVZmtBE"
  }
}

// Helper function to get liquidity pool ID for the current network
export function getLiquidityPoolId(pool: keyof typeof LIQUIDITY_POOLS, network: NetworkType): string {
  return LIQUIDITY_POOLS[pool][network] || LIQUIDITY_POOLS[pool]["mainnet-beta"]
}
