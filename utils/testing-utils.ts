// Test swap functionality
export async function testSwap(
  publicKey: string,
  inputToken: string,
  outputToken: string,
  amount: number,
): Promise<{ success: boolean; message: string }> {
  try {
    // Check if user has enough balance
    const inputBalance = localStorage.getItem(`${publicKey}_${inputToken.toLowerCase()}Balance`)
    if (!inputBalance || Number(inputBalance) < amount) {
      return {
        success: false,
        message: `Insufficient ${inputToken} balance. Required: ${amount}, Available: ${inputBalance || 0}`,
      }
    }

    // Simulate swap
    const inputAmount = amount
    const outputAmount = amount * 0.98 // 2% slippage

    // Update balances
    const newInputBalance = Number(inputBalance) - inputAmount
    localStorage.setItem(`${publicKey}_${inputToken.toLowerCase()}Balance`, newInputBalance.toString())

    const outputBalance = localStorage.getItem(`${publicKey}_${outputToken.toLowerCase()}Balance`) || "0"
    const newOutputBalance = Number(outputBalance) + outputAmount
    localStorage.setItem(`${publicKey}_${outputToken.toLowerCase()}Balance`, newOutputBalance.toString())

    return {
      success: true,
      message: `Successfully swapped ${inputAmount} ${inputToken} for ${outputAmount.toFixed(4)} ${outputToken}`,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to test swap",
    }
  }
}

// Test liquidity pool functionality
export async function testLiquidityPool(
  publicKey: string,
  action: "add" | "remove" | "claim",
  amount?: number,
): Promise<{ success: boolean; message: string }> {
  try {
    if (action === "add") {
      if (!amount) {
        return {
          success: false,
          message: "Amount is required for adding liquidity",
        }
      }

      // Check if user has enough GOLD
      const goldBalance = localStorage.getItem(`${publicKey}_goldBalance`) || "0"
      if (Number(goldBalance) < amount) {
        return {
          success: false,
          message: `Insufficient GOLD balance. Required: ${amount}, Available: ${goldBalance}`,
        }
      }

      // Update GOLD balance
      const newGoldBalance = Number(goldBalance) - amount
      localStorage.setItem(`${publicKey}_goldBalance`, newGoldBalance.toString())

      // Update LP tokens
      const lpTokens = localStorage.getItem(`${publicKey}_lpTokens`) || "0"
      const newLpTokens = Number(lpTokens) + amount * 10 // 1 GOLD = 10 LP tokens
      localStorage.setItem(`${publicKey}_lpTokens`, newLpTokens.toString())

      return {
        success: true,
        message: `Successfully added ${amount} GOLD to the liquidity pool`,
      }
    } else if (action === "remove") {
      if (!amount) {
        return {
          success: false,
          message: "Amount is required for removing liquidity",
        }
      }

      // Check if user has enough LP tokens
      const lpTokens = localStorage.getItem(`${publicKey}_lpTokens`) || "0"
      if (Number(lpTokens) < amount) {
        return {
          success: false,
          message: `Insufficient LP tokens. Required: ${amount}, Available: ${lpTokens}`,
        }
      }

      // Update LP tokens
      const newLpTokens = Number(lpTokens) - amount
      localStorage.setItem(`${publicKey}_lpTokens`, newLpTokens.toString())

      // Update GOLD balance
      const goldBalance = localStorage.getItem(`${publicKey}_goldBalance`) || "0"
      const newGoldBalance = Number(goldBalance) + amount * 0.1 // 1 LP token = 0.1 GOLD
      localStorage.setItem(`${publicKey}_goldBalance`, newGoldBalance.toString())

      return {
        success: true,
        message: `Successfully removed ${amount} LP tokens from the liquidity pool`,
      }
    } else if (action === "claim") {
      // Simulate claiming fees
      const lpTokens = localStorage.getItem(`${publicKey}_lpTokens`) || "0"
      if (Number(lpTokens) <= 0) {
        return {
          success: false,
          message: "No LP tokens to claim fees from",
        }
      }

      // Calculate fees (0.3% of pool volume per day, proportional to LP tokens)
      const fees = Number(lpTokens) * 0.003 * 0.01 // Assuming 1% of pool volume per day

      // Update GOLD balance
      const goldBalance = localStorage.getItem(`${publicKey}_goldBalance`) || "0"
      const newGoldBalance = Number(goldBalance) + fees
      localStorage.setItem(`${publicKey}_goldBalance`, newGoldBalance.toString())

      return {
        success: true,
        message: `Successfully claimed ${fees.toFixed(4)} GOLD in fees`,
      }
    }

    return {
      success: false,
      message: "Invalid action",
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to test liquidity pool",
    }
  }
}

// Test staking functionality
export async function testStaking(
  publicKey: string,
  action: "stake" | "unstake" | "claim",
  amount?: number,
): Promise<{ success: boolean; message: string }> {
  try {
    if (action === "stake") {
      if (!amount) {
        return {
          success: false,
          message: "Amount is required for staking",
        }
      }

      // Check if user has enough GOLD
      const goldBalance = localStorage.getItem(`${publicKey}_goldBalance`) || "0"
      if (Number(goldBalance) < amount) {
        return {
          success: false,
          message: `Insufficient GOLD balance. Required: ${amount}, Available: ${goldBalance}`,
        }
      }

      // Update GOLD balance
      const newGoldBalance = Number(goldBalance) - amount
      localStorage.setItem(`${publicKey}_goldBalance`, newGoldBalance.toString())

      // Update staked amount
      const stakedAmount = localStorage.getItem(`${publicKey}_stakedAmount`) || "0"
      const newStakedAmount = Number(stakedAmount) + amount
      localStorage.setItem(`${publicKey}_stakedAmount`, newStakedAmount.toString())

      // Set stake start time if this is the first stake
      if (Number(stakedAmount) <= 0) {
        const now = Math.floor(Date.now() / 1000)
        localStorage.setItem(`${publicKey}_stakeStartTime`, now.toString())
      }

      return {
        success: true,
        message: `Successfully staked ${amount} GOLD`,
      }
    } else if (action === "unstake") {
      if (!amount) {
        return {
          success: false,
          message: "Amount is required for unstaking",
        }
      }

      // Check if user has enough staked GOLD
      const stakedAmount = localStorage.getItem(`${publicKey}_stakedAmount`) || "0"
      if (Number(stakedAmount) < amount) {
        return {
          success: false,
          message: `Insufficient staked GOLD. Required: ${amount}, Available: ${stakedAmount}`,
        }
      }

      // Check if minimum stake duration has passed
      const stakeStartTime = localStorage.getItem(`${publicKey}_stakeStartTime`) || "0"
      const now = Math.floor(Date.now() / 1000)
      const stakeDuration = now - Number(stakeStartTime)
      const minStakeDuration = 604800 // 7 days in seconds

      if (stakeDuration < minStakeDuration) {
        return {
          success: false,
          message: `Cannot unstake yet. ${Math.ceil((minStakeDuration - stakeDuration) / 86400)} days remaining.`,
        }
      }

      // Update staked amount
      const newStakedAmount = Number(stakedAmount) - amount
      localStorage.setItem(`${publicKey}_stakedAmount`, newStakedAmount.toString())

      // Update GOLD balance
      const goldBalance = localStorage.getItem(`${publicKey}_goldBalance`) || "0"
      const newGoldBalance = Number(goldBalance) + amount
      localStorage.setItem(`${publicKey}_goldBalance`, newGoldBalance.toString())

      // Reset stake start time if all tokens are unstaked
      if (newStakedAmount <= 0) {
        localStorage.removeItem(`${publicKey}_stakeStartTime`)
      }

      return {
        success: true,
        message: `Successfully unstaked ${amount} GOLD`,
      }
    } else if (action === "claim") {
      // Check if user has staked GOLD
      const stakedAmount = localStorage.getItem(`${publicKey}_stakedAmount`) || "0"
      if (Number(stakedAmount) <= 0) {
        return {
          success: false,
          message: "No staked GOLD to claim rewards from",
        }
      }

      // Calculate rewards
      const stakeStartTime = localStorage.getItem(`${publicKey}_stakeStartTime`) || "0"
      const now = Math.floor(Date.now() / 1000)
      const stakeDuration = now - Number(stakeStartTime)
      const dailyRewardRate = 0.15 / 365 // 15% APY
      const daysStaked = stakeDuration / 86400
      const rewards = Number(stakedAmount) * dailyRewardRate * daysStaked

      // Update GOLD balance
      const goldBalance = localStorage.getItem(`${publicKey}_goldBalance`) || "0"
      const newGoldBalance = Number(goldBalance) + rewards
      localStorage.setItem(`${publicKey}_goldBalance`, newGoldBalance.toString())

      // Reset stake start time for future reward calculations
      localStorage.setItem(`${publicKey}_stakeStartTime`, now.toString())

      return {
        success: true,
        message: `Successfully claimed ${rewards.toFixed(4)} GOLD rewards`,
      }
    }

    return {
      success: false,
      message: "Invalid action",
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to test staking",
    }
  }
}

// Test bridge functionality
export async function testBridge(
  publicKey: string,
  sourceNetwork: string,
  targetNetwork: string,
  amount: number,
): Promise<{ success: boolean; message: string; txId?: string }> {
  try {
    // Check if user has enough GOLD on source network
    if (sourceNetwork === "solana") {
      const goldBalance = localStorage.getItem(`${publicKey}_goldBalance`) || "0"
      if (Number(goldBalance) < amount) {
        return {
          success: false,
          message: `Insufficient GOLD balance on ${sourceNetwork}. Required: ${amount}, Available: ${goldBalance}`,
        }
      }

      // Update GOLD balance on source network
      const newGoldBalance = Number(goldBalance) - amount
      localStorage.setItem(`${publicKey}_goldBalance`, newGoldBalance.toString())
    }

    // Generate transaction ID
    const txId = `bridge-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Store bridge transaction in history
    const bridgeHistory = JSON.parse(localStorage.getItem(`${publicKey}_bridgeHistory`) || "[]")
    bridgeHistory.push({
      id: txId,
      sourceNetwork,
      targetNetwork,
      amount,
      status: "completed",
      timestamp: Date.now(),
    })
    localStorage.setItem(`${publicKey}_bridgeHistory`, JSON.stringify(bridgeHistory))

    return {
      success: true,
      message: `Successfully bridged ${amount} GOLD from ${sourceNetwork} to ${targetNetwork}`,
      txId,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to test bridge",
    }
  }
}

// Test faucet functionality
export async function testFaucet(
  publicKey: string,
  network: string,
): Promise<{ success: boolean; message: string; amount?: number }> {
  try {
    // Check if user is in cooldown period
    const lastClaimTime = localStorage.getItem(`${publicKey}_lastClaimTime`)
    if (lastClaimTime) {
      const now = Date.now()
      const timeSinceLastClaim = now - Number(lastClaimTime)
      const cooldownPeriod = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

      if (timeSinceLastClaim < cooldownPeriod) {
        const timeRemaining = cooldownPeriod - timeSinceLastClaim
        const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000))
        const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000))

        return {
          success: false,
          message: `Cannot claim yet. ${hoursRemaining}h ${minutesRemaining}m remaining.`,
        }
      }
    }

    // Determine airdrop amount based on network
    let amount = 100 // Default for devnet
    if (network === "mainnet-beta") {
      amount = 10
    } else if (network === "testnet") {
      amount = 50
    }

    // Update GOLD balance
    const goldBalance = localStorage.getItem(`${publicKey}_goldBalance`) || "0"
    const newGoldBalance = Number(goldBalance) + amount
    localStorage.setItem(`${publicKey}_goldBalance`, newGoldBalance.toString())

    // Update last claim time
    localStorage.setItem(`${publicKey}_lastClaimTime`, Date.now().toString())

    return {
      success: true,
      message: `Successfully claimed ${amount} GOLD tokens from the faucet`,
      amount,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to test faucet",
    }
  }
}

// Initialize test environment
export function initializeTestEnvironment(publicKey: string): void {
  // Set default balances if not already set
  if (!localStorage.getItem(`${publicKey}_goldBalance`)) {
    localStorage.setItem(`${publicKey}_goldBalance`, "1000")
  }

  if (!localStorage.getItem(`${publicKey}_solBalance`)) {
    localStorage.setItem(`${publicKey}_solBalance`, "10")
  }

  if (!localStorage.getItem(`${publicKey}_usdcBalance`)) {
    localStorage.setItem(`${publicKey}_usdcBalance`, "500")
  }

  if (!localStorage.getItem(`${publicKey}_bonkBalance`)) {
    localStorage.setItem(`${publicKey}_bonkBalance`, "1000000")
  }

  // Initialize other state
  if (!localStorage.getItem(`${publicKey}_lpTokens`)) {
    localStorage.setItem(`${publicKey}_lpTokens`, "0")
  }

  if (!localStorage.getItem(`${publicKey}_stakedAmount`)) {
    localStorage.setItem(`${publicKey}_stakedAmount`, "0")
  }

  if (!localStorage.getItem(`${publicKey}_bridgeHistory`)) {
    localStorage.setItem(`${publicKey}_bridgeHistory`, "[]")
  }
}

// Reset test environment
export function resetTestEnvironment(publicKey: string): void {
  localStorage.removeItem(`${publicKey}_goldBalance`)
  localStorage.removeItem(`${publicKey}_solBalance`)
  localStorage.removeItem(`${publicKey}_usdcBalance`)
  localStorage.removeItem(`${publicKey}_bonkBalance`)
  localStorage.removeItem(`${publicKey}_lpTokens`)
  localStorage.removeItem(`${publicKey}_stakedAmount`)
  localStorage.removeItem(`${publicKey}_stakeStartTime`)
  localStorage.removeItem(`${publicKey}_lastClaimTime`)
  localStorage.removeItem(`${publicKey}_bridgeHistory`)

  // Re-initialize with default values
  initializeTestEnvironment(publicKey)
}

// Get user balances
export function getUserBalances(publicKey: string): Record<string, number> {
  return {
    GOLD: Number(localStorage.getItem(`${publicKey}_goldBalance`) || "0"),
    SOL: Number(localStorage.getItem(`${publicKey}_solBalance`) || "0"),
    USDC: Number(localStorage.getItem(`${publicKey}_usdcBalance`) || "0"),
    BONK: Number(localStorage.getItem(`${publicKey}_bonkBalance`) || "0"),
    LP: Number(localStorage.getItem(`${publicKey}_lpTokens`) || "0"),
    STAKED: Number(localStorage.getItem(`${publicKey}_stakedAmount`) || "0"),
  }
}
