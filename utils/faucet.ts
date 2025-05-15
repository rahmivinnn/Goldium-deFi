import { type Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token"
import { FAUCET_PROGRAM_ID, GOLD_TOKEN } from "@/constants/tokens"
import type { WalletContextState } from "@solana/wallet-adapter-react"

// Faucet program ID
const FAUCET_PROGRAM_ID_PUBKEY = new PublicKey(FAUCET_PROGRAM_ID)

// Faucet PDA seed
const FAUCET_SEED = "faucet"

// User claim info seed
const USER_CLAIM_SEED = "user_claim"

// Find faucet PDA
export async function findFaucetPDA() {
  return PublicKey.findProgramAddressSync([Buffer.from(FAUCET_SEED)], FAUCET_PROGRAM_ID_PUBKEY)
}

// Find user claim PDA
export async function findUserClaimPDA(walletPubkey: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(USER_CLAIM_SEED), walletPubkey.toBuffer()],
    FAUCET_PROGRAM_ID_PUBKEY,
  )
}

// Get user claim info
export async function getUserClaimInfo(connection: Connection, walletPubkey: PublicKey) {
  try {
    const [userClaimPDA] = await findUserClaimPDA(walletPubkey)

    // Fetch the user claim account data
    const accountInfo = await connection.getAccountInfo(userClaimPDA)

    if (!accountInfo) {
      // User hasn't claimed yet
      return {
        lastClaimTime: 0,
        totalClaimed: 0,
        canClaim: true,
        nextClaimTime: 0,
      }
    }

    // In a real implementation, you would deserialize the account data
    // using your Anchor IDL or a custom deserializer

    // For now, we'll return mock data
    const now = Date.now()
    const lastClaimTime = now - Math.floor(Math.random() * 10 * 60 * 1000) // Random time in the last 10 minutes
    const cooldownPeriod = 5 * 60 * 1000 // 5 minutes
    const nextClaimTime = lastClaimTime + cooldownPeriod

    return {
      lastClaimTime,
      totalClaimed: Math.floor(Math.random() * 1000) + 100, // Random amount between 100 and 1100
      canClaim: now > nextClaimTime,
      nextClaimTime,
    }
  } catch (error) {
    console.error("Error getting user claim info:", error)
    throw error
  }
}

// Claim tokens from faucet
export async function claimFromFaucet(
  connection: Connection,
  wallet: WalletContextState,
): Promise<{ success: boolean; signature?: string; error?: string }> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected")
    }

    const goldMintPubkey = new PublicKey(GOLD_TOKEN.mint)
    const [faucetPDA] = await findFaucetPDA()
    const [userClaimPDA] = await findUserClaimPDA(wallet.publicKey)

    // Get the associated token accounts
    const userTokenAccount = await getAssociatedTokenAddress(goldMintPubkey, wallet.publicKey)

    const faucetTokenAccount = await getAssociatedTokenAddress(
      goldMintPubkey,
      faucetPDA,
      true, // allowOwnerOffCurve
    )

    // Check if the user token account exists
    const userTokenAccountInfo = await connection.getAccountInfo(userTokenAccount)

    // Create a new transaction
    const transaction = new Transaction()

    // If the user token account doesn't exist, create it
    if (!userTokenAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey, // payer
          userTokenAccount, // associatedToken
          wallet.publicKey, // owner
          goldMintPubkey, // mint
        ),
      )
    }

    // Create the claim instruction
    // In a real implementation, you would use your Anchor program's instruction builder
    // For now, we'll create a mock instruction
    const claimInstruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: userClaimPDA, isSigner: false, isWritable: true },
        { pubkey: faucetPDA, isSigner: false, isWritable: true },
        { pubkey: userTokenAccount, isSigner: false, isWritable: true },
        { pubkey: faucetTokenAccount, isSigner: false, isWritable: true },
        { pubkey: goldMintPubkey, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: FAUCET_PROGRAM_ID_PUBKEY,
      data: Buffer.from([0]), // 0 = claim instruction
    })

    transaction.add(claimInstruction)

    // Sign and send the transaction
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    transaction.feePayer = wallet.publicKey

    const signedTransaction = await wallet.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signedTransaction.serialize())

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, "confirmed")

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`)
    }

    return {
      success: true,
      signature,
    }
  } catch (error) {
    console.error("Error claiming from faucet:", error)
    return {
      success: false,
      error: error.message || "Failed to claim tokens",
    }
  }
}
