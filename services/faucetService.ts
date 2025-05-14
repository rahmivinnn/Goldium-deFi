import type { Connection, PublicKey } from "@solana/web3.js"
import type { WalletContextState } from "@solana/wallet-adapter-react"
import { mintGoldTokens } from "@/services/tokenService"

// Faucet cooldown time in milliseconds (5 minutes)
export const FAUCET_COOLDOWN = 5 * 60 * 1000

// Faucet amount
export const FAUCET_AMOUNT = 100 // 100 GOLD tokens

// Check if a wallet is eligible for the faucet
export async function checkFaucetEligibility(
  walletPublicKey: PublicKey,
): Promise<{ eligible: boolean; cooldownRemaining: number }> {
  try {
    // In a real implementation, you would store the last claim time in a database
    // For this demo, we'll use localStorage
    if (typeof window === "undefined") {
      return { eligible: true, cooldownRemaining: 0 }
    }

    const lastClaimKey = `goldium_faucet_${walletPublicKey.toString()}`
    const lastClaimTime = localStorage.getItem(lastClaimKey)

    if (!lastClaimTime) {
      return { eligible: true, cooldownRemaining: 0 }
    }

    const now = Date.now()
    const elapsed = now - Number.parseInt(lastClaimTime)

    if (elapsed >= FAUCET_COOLDOWN) {
      return { eligible: true, cooldownRemaining: 0 }
    } else {
      return { eligible: false, cooldownRemaining: FAUCET_COOLDOWN - elapsed }
    }
  } catch (error) {
    console.error("Error checking faucet eligibility:", error)
    return { eligible: false, cooldownRemaining: FAUCET_COOLDOWN }
  }
}

// Claim tokens from the faucet
export async function claimFromFaucet(
  connection: Connection,
  wallet: WalletContextState,
): Promise<{ success: boolean; signature?: string; error?: string }> {
  try {
    if (!wallet.publicKey) {
      return { success: false, error: "Wallet not connected" }
    }

    // Check eligibility
    const { eligible, cooldownRemaining } = await checkFaucetEligibility(wallet.publicKey)

    if (!eligible) {
      const cooldownMinutes = Math.ceil(cooldownRemaining / 60000)
      return {
        success: false,
        error: `Please wait ${cooldownMinutes} minute${cooldownMinutes > 1 ? "s" : ""} before claiming again`,
      }
    }

    // Mint tokens to the wallet
    const signature = await mintGoldTokens(connection, wallet, FAUCET_AMOUNT)

    // Update the last claim time
    if (typeof window !== "undefined") {
      const lastClaimKey = `goldium_faucet_${wallet.publicKey.toString()}`
      localStorage.setItem(lastClaimKey, Date.now().toString())
    }

    return { success: true, signature }
  } catch (error) {
    console.error("Error claiming from faucet:", error)
    return { success: false, error: error.message || "Failed to claim tokens" }
  }
}
