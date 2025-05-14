import { type Connection, PublicKey } from "@solana/web3.js"
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  TOKEN_PROGRAM_ID,
  getMint,
} from "@solana/spl-token"
import type { WalletContextState } from "@solana/wallet-adapter-react"

// GOLD token mint address (this would be the actual address on mainnet)
// For devnet, we'll create a new mint for testing
export const GOLD_MINT_ADDRESS = {
  devnet: "GoLDium1111111111111111111111111111111111111",
  testnet: "GoLDium1111111111111111111111111111111111111",
  "mainnet-beta": "GoLDium1111111111111111111111111111111111111",
}

// Token metadata
export const GOLD_TOKEN_METADATA = {
  name: "Goldium",
  symbol: "GOLD",
  description: "The native utility token of the Goldium.io ecosystem",
  image: "/gold-token.png",
  decimals: 9,
}

// Get GOLD token balance
export async function getGoldTokenBalance(connection: Connection, walletPublicKey: PublicKey): Promise<number> {
  try {
    // Find the associated token account for the GOLD token
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, {
      programId: TOKEN_PROGRAM_ID,
    })

    // Find the GOLD token account
    const goldTokenAccount = tokenAccounts.value.find(
      (account) => account.account.data.parsed.info.mint === GOLD_MINT_ADDRESS.devnet,
    )

    if (!goldTokenAccount) {
      return 0
    }

    // Get the balance
    const balance = goldTokenAccount.account.data.parsed.info.tokenAmount.uiAmount
    return balance
  } catch (error) {
    console.error("Error getting GOLD token balance:", error)
    return 0
  }
}

// Create a new GOLD token mint (for devnet testing)
export async function createGoldTokenMint(connection: Connection, wallet: WalletContextState): Promise<string> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected")
    }

    // Create a new mint
    const mint = await createMint(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions!,
      },
      wallet.publicKey,
      wallet.publicKey,
      GOLD_TOKEN_METADATA.decimals,
    )

    return mint.toBase58()
  } catch (error) {
    console.error("Error creating GOLD token mint:", error)
    throw error
  }
}

// Mint GOLD tokens to a wallet (for devnet faucet)
export async function mintGoldTokens(
  connection: Connection,
  wallet: WalletContextState,
  amount: number,
): Promise<string> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected")
    }

    // Get the mint
    const mintPublicKey = new PublicKey(GOLD_MINT_ADDRESS.devnet)

    // Get or create the associated token account
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions!,
      },
      mintPublicKey,
      wallet.publicKey,
    )

    // Mint tokens to the token account
    const signature = await mintTo(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions!,
      },
      mintPublicKey,
      tokenAccount.address,
      wallet.publicKey,
      amount * Math.pow(10, GOLD_TOKEN_METADATA.decimals),
    )

    return signature
  } catch (error) {
    console.error("Error minting GOLD tokens:", error)
    throw error
  }
}

// Transfer GOLD tokens
export async function transferGoldTokens(
  connection: Connection,
  wallet: WalletContextState,
  recipient: PublicKey,
  amount: number,
): Promise<string> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected")
    }

    // Get the mint
    const mintPublicKey = new PublicKey(GOLD_MINT_ADDRESS.devnet)

    // Get the sender's token account
    const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions!,
      },
      mintPublicKey,
      wallet.publicKey,
    )

    // Get or create the recipient's token account
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions!,
      },
      mintPublicKey,
      recipient,
    )

    // Transfer tokens
    const signature = await transfer(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions!,
      },
      senderTokenAccount.address,
      recipientTokenAccount.address,
      wallet.publicKey,
      amount * Math.pow(10, GOLD_TOKEN_METADATA.decimals),
    )

    return signature
  } catch (error) {
    console.error("Error transferring GOLD tokens:", error)
    throw error
  }
}

// Get token supply
export async function getGoldTokenSupply(connection: Connection): Promise<number> {
  try {
    const mintPublicKey = new PublicKey(GOLD_MINT_ADDRESS.devnet)
    const mintInfo = await getMint(connection, mintPublicKey)

    return Number(mintInfo.supply) / Math.pow(10, GOLD_TOKEN_METADATA.decimals)
  } catch (error) {
    console.error("Error getting GOLD token supply:", error)
    return 0
  }
}
