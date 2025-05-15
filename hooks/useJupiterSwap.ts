"use client"

import { useState, useCallback } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Transaction, VersionedTransaction } from "@solana/web3.js"
import { useTransaction } from "./useTransaction"
import type { Token } from "@/constants/tokens"
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes"

interface SwapRoute {
  inAmount: string
  outAmount: string
  outAmountWithSlippage: string
  priceImpactPct: number
  marketInfos: any[]
  slippageBps: number
}

interface QuoteResponse {
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  otherAmountThreshold: string
  swapMode: string
  slippageBps: number
  platformFee: any
  priceImpactPct: number
  routePlan: any[]
  contextSlot: number
  timeTaken: number
}

export function useJupiterSwap() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const { sendAndConfirmTransaction, isProcessing } = useTransaction()

  const [routes, setRoutes] = useState<SwapRoute[]>([])
  const [selectedRoute, setSelectedRoute] = useState<SwapRoute | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Get swap routes
  const getSwapRoutes = useCallback(
    async (
      inputToken: Token,
      outputToken: Token,
      amount: number,
      slippageBps = 50, // 0.5% default slippage
    ) => {
      if (!publicKey) return

      try {
        setIsLoading(true)

        // Convert amount to input token's smallest unit
        const inputAmount = Math.floor(amount * Math.pow(10, inputToken.decimals)).toString()

        // Fetch quote from Jupiter API
        const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputToken.mint}&outputMint=${outputToken.mint}&amount=${inputAmount}&slippageBps=${slippageBps}`

        const response = await fetch(quoteUrl)
        if (!response.ok) throw new Error("Failed to fetch swap routes")

        const data = await response.json()

        if (!data.data || data.data.length === 0) {
          throw new Error("No swap routes found")
        }

        // Format routes
        const formattedRoutes: SwapRoute[] = data.data.map((route: any) => ({
          inAmount: route.inAmount,
          outAmount: route.outAmount,
          outAmountWithSlippage: route.otherAmountThreshold,
          priceImpactPct: route.priceImpactPct,
          marketInfos: route.marketInfos,
          slippageBps: slippageBps,
        }))

        setRoutes(formattedRoutes)
        setSelectedRoute(formattedRoutes[0]) // Select best route by default
        setError(null)

        return formattedRoutes
      } catch (err) {
        console.error("Error fetching swap routes:", err)
        setError("Failed to fetch swap routes")
        setRoutes([])
        setSelectedRoute(null)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [publicKey],
  )

  // Execute swap
  const executeSwap = useCallback(
    async (inputToken: Token, outputToken: Token, amount: number, slippageBps = 50) => {
      if (!publicKey || !selectedRoute) return null

      try {
        setIsLoading(true)

        // Convert amount to input token's smallest unit
        const inputAmount = Math.floor(amount * Math.pow(10, inputToken.decimals)).toString()

        // 1. Get quote
        const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputToken.mint}&outputMint=${outputToken.mint}&amount=${inputAmount}&slippageBps=${slippageBps}`

        const quoteResponse = await fetch(quoteUrl)
        if (!quoteResponse.ok) throw new Error("Failed to fetch swap quote")

        const quoteData = await quoteResponse.json()
        const quoteResponse2: QuoteResponse = quoteData.data[0]

        // 2. Get swap transaction
        const swapUrl = "https://quote-api.jup.ag/v6/swap"

        const swapResponse = await fetch(swapUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quoteResponse: quoteResponse2,
            userPublicKey: publicKey.toString(),
            wrapAndUnwrapSol: true,
          }),
        })

        if (!swapResponse.ok) throw new Error("Failed to create swap transaction")

        const swapData = await swapResponse.json()

        // 3. Execute the transaction
        let transaction

        if (swapData.swapTransaction.startsWith("0x")) {
          // Handle serialized transaction
          const serializedTransaction = Buffer.from(swapData.swapTransaction.slice(2), "hex")
          transaction = VersionedTransaction.deserialize(serializedTransaction)
        } else {
          // Handle base58 encoded transaction
          const serializedTransaction = bs58.decode(swapData.swapTransaction)
          transaction = Transaction.from(serializedTransaction)
        }

        const signature = await sendAndConfirmTransaction(transaction)

        return signature
      } catch (error) {
        console.error("Error executing swap:", error)
        setError("Failed to execute swap")
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [publicKey, selectedRoute, sendAndConfirmTransaction],
  )

  return {
    routes,
    selectedRoute,
    setSelectedRoute,
    getSwapRoutes,
    executeSwap,
    isLoading: isLoading || isProcessing,
    error,
  }
}
