"use client"

import { type Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram } from "@solana/web3.js"
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMint,
  getOrCreateAssociatedTokenAccount,
  transfer,
  getMint,
} from "@solana/spl-token"
import type { WalletContextState } from "@solana/wallet-adapter-react"
import type { NetworkType } from "@/components/NetworkContextProvider"
import { GOLD_MINT_ADDRESS } from "@/constants/tokens"
import { GOLD_TOKEN_METADATA } from "@/constants/tokens"

// Mint GOLD tokens to a wallet
export async function mintGoldTokens(
  connection: Connection,
  wallet: WalletContextState,
  amount: number,
  network: NetworkType = "testnet", // Default to testnet for testing
): Promise<string> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected")
    }

    // Get the GOLD mint address for the current network
    const goldMintAddress = new PublicKey(GOLD_MINT_ADDRESS[network])

    // Get the associated token account for the wallet
    const tokenAccount = await getAssociatedTokenAddress(goldMintAddress, wallet.publicKey)

    // Check if the token account exists
    const tokenAccountInfo = await connection.getAccountInfo(tokenAccount)

    // Create a new transaction
    const transaction = new Transaction()

    // If the token account doesn't exist, create it
    if (!tokenAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey, // payer
          tokenAccount, // associatedToken
          wallet.publicKey, // owner
          goldMintAddress, // mint
        ),
      )
    }

    // Add a mock instruction to mint tokens
    const mockMintInstruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: tokenAccount, isSigner: false, isWritable: true },
        { pubkey: goldMintAddress, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      data: Buffer.from(`Mint ${amount} GOLD tokens`),
    })

    transaction.add(mockMintInstruction)

    // Sign and send the transaction
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    transaction.feePayer = wallet.publicKey

    const signedTransaction = await wallet.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signedTransaction.serialize())

    // Wait for confirmation
    await connection.confirmTransaction(signature)

    return signature
  } catch (error) {
    console.error("Error minting GOLD tokens:", error)
    throw error
  }
}

// Get token balance
export async function getTokenBalance(
  connection: Connection,
  walletPublicKey: PublicKey,
  mintAddress: string,
): Promise<number> {
  try {
    // Get the associated token account
    const tokenAccount = await getAssociatedTokenAddress(new PublicKey(mintAddress), walletPublicKey)

    // Get the token account info
    try {
      const tokenAccountInfo = await connection.getAccountInfo(tokenAccount)

      if (!tokenAccountInfo) {
        return 0
      }

      // Parse the token account data
      const accountInfo = await connection.getParsedAccountInfo(tokenAccount)
      const accountData: any = accountInfo.value?.data

      if (!accountData || !accountData.parsed || !accountData.parsed.info || !accountData.parsed.info.tokenAmount) {
        return 0
      }

      const balance = accountData.parsed.info.tokenAmount.uiAmount || 0
      return balance
    } catch (err) {
      console.error("Error getting token account info:", err)
      return 0
    }
  } catch (error) {
    console.error("Error getting token balance:", error)
    return 0
  }
}

// Get GOLD token balance
export async function getGoldTokenBalance(
  connection: Connection,
  walletPublicKey: PublicKey,
  network: NetworkType = "testnet",
): Promise<number> {
  try {
    // Find the associated token account for the GOLD token
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, {
      programId: TOKEN_PROGRAM_ID,
    })

    // Find the GOLD token account
    const goldTokenAccount = tokenAccounts.value.find(
      (account) => account.account.data.parsed.info.mint === GOLD_MINT_ADDRESS[network],
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

// Create a new GOLD token mint (for testnet testing)
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

// Transfer GOLD tokens
export async function transferGoldTokens(
  connection: Connection,
  wallet: WalletContextState,
  recipient: PublicKey,
  amount: number,
  network: NetworkType = "testnet",
): Promise<string> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected")
    }

    // Get the mint
    const mintPublicKey = new PublicKey(GOLD_MINT_ADDRESS[network])

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
export async function getGoldTokenSupply(connection: Connection, network: NetworkType = "testnet"): Promise<number> {
  try {
    const mintPublicKey = new PublicKey(GOLD_MINT_ADDRESS[network])
    const mintInfo = await getMint(connection, mintPublicKey)

    // Update any references to token supply or distribution to reflect 1M total supply
    return Number(mintInfo.supply) / Math.pow(10, GOLD_TOKEN_METADATA.decimals)
  } catch (error) {
    console.error("Error getting GOLD token supply:", error)
    return 0
  }
}
