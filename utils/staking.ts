import {
  type Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js"
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token"
import { BN } from "bn.js"
import { STAKING_PROGRAM_ID, GOLD_TOKEN } from "@/constants/tokens"
import type { WalletContextState } from "@solana/wallet-adapter-react"

// Staking program ID
const STAKING_PROGRAM_ID_PUBKEY = new PublicKey(STAKING_PROGRAM_ID)

// Staking pool seed
const STAKING_POOL_SEED = "staking_pool"

// User stake account seed
const USER_STAKE_SEED = "user_stake"

// Staking pool PDA
export async function findStakingPoolPDA() {
  return PublicKey.findProgramAddressSync([Buffer.from(STAKING_POOL_SEED)], STAKING_PROGRAM_ID_PUBKEY)
}

// User stake account PDA
export async function findUserStakePDA(walletPubkey: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(USER_STAKE_SEED), walletPubkey.toBuffer()],
    STAKING_PROGRAM_ID_PUBKEY,
  )
}

// Get staking pool info
export async function getStakingPoolInfo(connection: Connection) {
  try {
    const [stakingPoolPDA] = await findStakingPoolPDA()

    // Fetch the staking pool account data
    const accountInfo = await connection.getAccountInfo(stakingPoolPDA)

    if (!accountInfo) {
      throw new Error("Staking pool not initialized")
    }

    // In a real implementation, you would deserialize the account data
    // using your Anchor IDL or a custom deserializer

    // For now, we'll return mock data
    return {
      totalStaked: 1250000,
      apy: 12.5,
      lockupPeriod: 0, // flexible
      rewardTokenMint: GOLD_TOKEN.mint,
      rewardTokenSymbol: GOLD_TOKEN.symbol,
    }
  } catch (error) {
    console.error("Error getting staking pool info:", error)
    throw error
  }
}

// Get user staking info
export async function getUserStakingInfo(connection: Connection, walletPubkey: PublicKey) {
  try {
    const [userStakePDA] = await findUserStakePDA(walletPubkey)

    // Fetch the user stake account data
    const accountInfo = await connection.getAccountInfo(userStakePDA)

    if (!accountInfo) {
      // User hasn't staked yet
      return {
        stakedAmount: 0,
        rewards: 0,
        stakingTime: 0,
        unlockTime: 0,
        isLocked: false,
      }
    }

    // In a real implementation, you would deserialize the account data
    // using your Anchor IDL or a custom deserializer

    // For now, we'll return mock data with some randomization
    const now = Date.now()
    const stakingTime = now - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000) // Random time in the last 30 days

    return {
      stakedAmount: Math.floor(Math.random() * 1000) + 100, // Random amount between 100 and 1100
      rewards: Math.floor(Math.random() * 50) + 5, // Random rewards between 5 and 55
      stakingTime,
      unlockTime: 0, // Flexible staking
      isLocked: false,
    }
  } catch (error) {
    console.error("Error getting user staking info:", error)
    throw error
  }
}

// Stake tokens
export async function stakeTokens(
  connection: Connection,
  wallet: WalletContextState,
  amount: number,
): Promise<{ success: boolean; signature?: string; error?: string }> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected")
    }

    const goldMintPubkey = new PublicKey(GOLD_TOKEN.mint)
    const [stakingPoolPDA] = await findStakingPoolPDA()
    const [userStakePDA] = await findUserStakePDA(wallet.publicKey)

    // Get the associated token accounts
    const userTokenAccount = await getAssociatedTokenAddress(goldMintPubkey, wallet.publicKey)

    const poolTokenAccount = await getAssociatedTokenAddress(
      goldMintPubkey,
      stakingPoolPDA,
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

    // Convert amount to lamports (accounting for decimals)
    const amountLamports = amount * Math.pow(10, GOLD_TOKEN.decimals)

    // Create the stake instruction
    // In a real implementation, you would use your Anchor program's instruction builder
    // For now, we'll create a mock instruction
    const stakeInstruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: userStakePDA, isSigner: false, isWritable: true },
        { pubkey: stakingPoolPDA, isSigner: false, isWritable: true },
        { pubkey: userTokenAccount, isSigner: false, isWritable: true },
        { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
        { pubkey: goldMintPubkey, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: STAKING_PROGRAM_ID_PUBKEY,
      data: Buffer.from([0, ...new BN(amountLamports).toArray("le", 8)]), // 0 = stake instruction
    })

    transaction.add(stakeInstruction)

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
    console.error("Error staking tokens:", error)
    return {
      success: false,
      error: error.message || "Failed to stake tokens",
    }
  }
}

// Unstake tokens
export async function unstakeTokens(
  connection: Connection,
  wallet: WalletContextState,
  amount: number,
): Promise<{ success: boolean; signature?: string; error?: string }> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected")
    }

    const goldMintPubkey = new PublicKey(GOLD_TOKEN.mint)
    const [stakingPoolPDA] = await findStakingPoolPDA()
    const [userStakePDA] = await findUserStakePDA(wallet.publicKey)

    // Get the associated token accounts
    const userTokenAccount = await getAssociatedTokenAddress(goldMintPubkey, wallet.publicKey)

    const poolTokenAccount = await getAssociatedTokenAddress(
      goldMintPubkey,
      stakingPoolPDA,
      true, // allowOwnerOffCurve
    )

    // Convert amount to lamports (accounting for decimals)
    const amountLamports = amount * Math.pow(10, GOLD_TOKEN.decimals)

    // Create the unstake instruction
    // In a real implementation, you would use your Anchor program's instruction builder
    // For now, we'll create a mock instruction
    const unstakeInstruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: userStakePDA, isSigner: false, isWritable: true },
        { pubkey: stakingPoolPDA, isSigner: false, isWritable: true },
        { pubkey: userTokenAccount, isSigner: false, isWritable: true },
        { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
        { pubkey: goldMintPubkey, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: STAKING_PROGRAM_ID_PUBKEY,
      data: Buffer.from([1, ...new BN(amountLamports).toArray("le", 8)]), // 1 = unstake instruction
    })

    // Create a new transaction
    const transaction = new Transaction()
    transaction.add(unstakeInstruction)

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
    console.error("Error unstaking tokens:", error)
    return {
      success: false,
      error: error.message || "Failed to unstake tokens",
    }
  }
}

// Claim rewards
export async function claimRewards(
  connection: Connection,
  wallet: WalletContextState,
): Promise<{ success: boolean; signature?: string; error?: string }> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected")
    }

    const goldMintPubkey = new PublicKey(GOLD_TOKEN.mint)
    const [stakingPoolPDA] = await findStakingPoolPDA()
    const [userStakePDA] = await findUserStakePDA(wallet.publicKey)

    // Get the associated token accounts
    const userTokenAccount = await getAssociatedTokenAddress(goldMintPubkey, wallet.publicKey)

    const poolTokenAccount = await getAssociatedTokenAddress(
      goldMintPubkey,
      stakingPoolPDA,
      true, // allowOwnerOffCurve
    )

    // Create the claim rewards instruction
    // In a real implementation, you would use your Anchor program's instruction builder
    // For now, we'll create a mock instruction
    const claimInstruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: userStakePDA, isSigner: false, isWritable: true },
        { pubkey: stakingPoolPDA, isSigner: false, isWritable: true },
        { pubkey: userTokenAccount, isSigner: false, isWritable: true },
        { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
        { pubkey: goldMintPubkey, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: STAKING_PROGRAM_ID_PUBKEY,
      data: Buffer.from([2]), // 2 = claim rewards instruction
    })

    // Create a new transaction
    const transaction = new Transaction()
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
    console.error("Error claiming rewards:", error)
    return {
      success: false,
      error: error.message || "Failed to claim rewards",
    }
  }
}
