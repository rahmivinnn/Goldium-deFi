import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SwapCard from "@/components/defi/swap/SwapCard"
import { LiquidityPool } from "@/components/LiquidityPool"
import StakingInterface from "@/components/StakingInterface"
import TokenBridge from "@/components/TokenBridge"
import Faucet from "@/components/Faucet"
import { WalletContextProvider } from "@/components/providers/WalletContextProvider"
import Header from "@/components/Header"

export default function DeFiPage() {
  return (
    <WalletContextProvider>
      <main className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <div className="max-w-7xl mx-auto w-full px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent mb-2">
              Goldium DeFi
            </h1>
            <p className="text-gray-400">
              Access all Goldium DeFi features in one place. Swap, provide liquidity, stake, bridge, and more.
            </p>
          </div>

          <Tabs defaultValue="swap" className="w-full">
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="swap">Swap</TabsTrigger>
              <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
              <TabsTrigger value="stake">Stake</TabsTrigger>
              <TabsTrigger value="bridge">Bridge</TabsTrigger>
              <TabsTrigger value="faucet">Faucet</TabsTrigger>
            </TabsList>
            <TabsContent value="swap" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Suspense fallback={<div>Loading...</div>}>
                    <SwapCard />
                  </Suspense>
                </div>
                <div>
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-xl text-gold">Swap Features</CardTitle>
                      <CardDescription>Exchange tokens instantly with the best rates</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-medium text-white">Why use Goldium Swap?</h3>
                        <ul className="list-disc list-inside text-gray-400 space-y-1">
                          <li>Best rates across multiple DEXes</li>
                          <li>Low slippage and fees</li>
                          <li>Fast and secure transactions</li>
                          <li>Support for all major Solana tokens</li>
                          <li>Real-time price updates</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium text-white">How it works</h3>
                        <p className="text-gray-400">
                          Goldium Swap aggregates liquidity from multiple DEXes to find the best swap route for your
                          tokens. We use Jupiter Protocol under the hood to ensure you always get the best rates.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="liquidity" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Suspense fallback={<div>Loading...</div>}>
                    <LiquidityPool />
                  </Suspense>
                </div>
                <div>
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-xl text-gold">Liquidity Pools</CardTitle>
                      <CardDescription>Provide liquidity and earn fees</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-medium text-white">Benefits of providing liquidity</h3>
                        <ul className="list-disc list-inside text-gray-400 space-y-1">
                          <li>Earn trading fees from swaps</li>
                          <li>Earn GOLD rewards from liquidity mining</li>
                          <li>Support the Goldium ecosystem</li>
                          <li>Automatic compounding options</li>
                          <li>Flexible deposit and withdrawal</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium text-white">How it works</h3>
                        <p className="text-gray-400">
                          When you provide liquidity, you deposit an equal value of two tokens into a pool. In return,
                          you receive LP tokens representing your share of the pool. You earn a portion of the trading
                          fees generated by the pool proportional to your share.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="stake" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Suspense fallback={<div>Loading...</div>}>
                    <StakingInterface />
                  </Suspense>
                </div>
                <div>
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-xl text-gold">Staking</CardTitle>
                      <CardDescription>Stake GOLD tokens to earn rewards</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-medium text-white">Benefits of staking</h3>
                        <ul className="list-disc list-inside text-gray-400 space-y-1">
                          <li>Earn passive income with competitive APY</li>
                          <li>Participate in governance decisions</li>
                          <li>Reduced trading fees on the platform</li>
                          <li>Priority access to new features</li>
                          <li>Support the Goldium ecosystem</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium text-white">How it works</h3>
                        <p className="text-gray-400">
                          Staking locks your GOLD tokens for a period of time, during which you earn rewards. The longer
                          you stake, the higher your rewards. You can claim rewards at any time, but you need to wait
                          until the lock period ends to unstake your tokens.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="bridge" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Suspense fallback={<div>Loading...</div>}>
                    <TokenBridge />
                  </Suspense>
                </div>
                <div>
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-xl text-gold">Cross-Chain Bridge</CardTitle>
                      <CardDescription>Move GOLD tokens across different blockchains</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-medium text-white">Supported networks</h3>
                        <ul className="list-disc list-inside text-gray-400 space-y-1">
                          <li>Solana (Native)</li>
                          <li>Ethereum (ERC-20)</li>
                          <li>Polygon (ERC-20)</li>
                          <li>Avalanche (ERC-20)</li>
                          <li>More coming soon</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium text-white">How it works</h3>
                        <p className="text-gray-400">
                          The Goldium Bridge uses a secure lock-and-mint mechanism to transfer tokens across chains.
                          When you bridge tokens, they are locked in a smart contract on the source chain, and an
                          equivalent amount is minted on the target chain. This ensures that the total supply remains
                          constant across all chains.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="faucet" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Suspense fallback={<div>Loading...</div>}>
                    <Faucet />
                  </Suspense>
                </div>
                <div>
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-xl text-gold">Token Faucet</CardTitle>
                      <CardDescription>Get GOLD tokens for testing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-medium text-white">Faucet rules</h3>
                        <ul className="list-disc list-inside text-gray-400 space-y-1">
                          <li>Available on testnet and devnet only</li>
                          <li>Limited to one request per wallet per day</li>
                          <li>Tokens are for testing purposes only</li>
                          <li>Abuse will result in being blacklisted</li>
                          <li>Request may take a few minutes to process</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium text-white">How to use</h3>
                        <p className="text-gray-400">
                          Connect your wallet, click the "Request GOLD Tokens" button, and wait for the tokens to be
                          sent to your wallet. You can use these tokens to test all the features of the Goldium
                          platform. Remember that these tokens have no real value and are only for testing purposes.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </WalletContextProvider>
  )
}
