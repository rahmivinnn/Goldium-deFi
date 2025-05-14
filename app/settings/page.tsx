"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useEthereum } from "@/components/EthereumProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Moon, Sun, Globe, Shield, CreditCard, User, Wallet, ChevronRight } from "lucide-react"

export default function SettingsPage() {
  const { connected: solanaConnected, publicKey } = useWallet()
  const { connected: ethConnected, account } = useEthereum()
  const [theme, setTheme] = useState("dark")
  const [slippageTolerance, setSlippageTolerance] = useState("1.0")
  const [gasPreference, setGasPreference] = useState("standard")
  const [notifications, setNotifications] = useState({
    transactions: true,
    priceAlerts: true,
    newPools: false,
    marketing: false,
  })

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-400 mt-2">Customize your Goldium experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-fit">
            <nav className="space-y-1">
              {[
                { name: "General", icon: <Globe className="h-5 w-5" /> },
                { name: "Wallet", icon: <Wallet className="h-5 w-5" /> },
                { name: "Security", icon: <Shield className="h-5 w-5" /> },
                { name: "Notifications", icon: <Bell className="h-5 w-5" /> },
                { name: "Payment Methods", icon: <CreditCard className="h-5 w-5" /> },
                { name: "Profile", icon: <User className="h-5 w-5" /> },
              ].map((item, index) => (
                <button
                  key={item.name}
                  className={`flex items-center w-full px-3 py-2 text-left rounded-lg transition-colors ${
                    index === 0 ? "bg-gold/10 text-gold" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                  {index === 0 && <ChevronRight className="ml-auto h-4 w-4" />}
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage your app preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Theme</Label>
                    <div className="text-sm text-gray-400">Choose between dark and light mode</div>
                  </div>
                  <Tabs defaultValue="dark" value={theme} onValueChange={setTheme} className="w-[200px]">
                    <TabsList className="grid grid-cols-2">
                      <TabsTrigger value="dark" className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        <span>Dark</span>
                      </TabsTrigger>
                      <TabsTrigger value="light" className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        <span>Light</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Language</Label>
                    <div className="text-sm text-gray-400">Select your preferred language</div>
                  </div>
                  <Select defaultValue="en">
                    <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Slippage Tolerance</Label>
                    <div className="text-sm text-gray-400">Default slippage setting for swaps</div>
                  </div>
                  <Select value={slippageTolerance} onValueChange={setSlippageTolerance}>
                    <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select slippage" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="0.5">0.5%</SelectItem>
                      <SelectItem value="1.0">1.0%</SelectItem>
                      <SelectItem value="2.0">2.0%</SelectItem>
                      <SelectItem value="3.0">3.0%</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Gas Price (Ethereum)</Label>
                    <div className="text-sm text-gray-400">Set your preferred gas price strategy</div>
                  </div>
                  <Select value={gasPreference} onValueChange={setGasPreference}>
                    <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select gas preference" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="slow">Slow (Cheaper)</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Connected Wallets</CardTitle>
                <CardDescription>Manage your connected blockchain wallets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">S</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Solana</h3>
                        <p className="text-sm text-gray-400">
                          {solanaConnected
                            ? `${publicKey?.toString().slice(0, 6)}...${publicKey?.toString().slice(-4)}`
                            : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <div>
                      {solanaConnected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500">
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">E</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Ethereum</h3>
                        <p className="text-sm text-gray-400">
                          {ethConnected ? `${account?.slice(0, 6)}...${account?.slice(-4)}` : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <div>
                      {ethConnected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-500">
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    id: "transactions",
                    label: "Transaction Updates",
                    description: "Get notified about your transaction status",
                  },
                  {
                    id: "priceAlerts",
                    label: "Price Alerts",
                    description: "Receive alerts when token prices change significantly",
                  },
                  {
                    id: "newPools",
                    label: "New Pools & Farms",
                    description: "Be the first to know about new liquidity opportunities",
                  },
                  {
                    id: "marketing",
                    label: "Marketing & Promotions",
                    description: "Stay updated with Goldium news and offers",
                  },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor={item.id}>{item.label}</Label>
                      <div className="text-sm text-gray-400">{item.description}</div>
                    </div>
                    <Switch
                      id={item.id}
                      checked={notifications[item.id as keyof typeof notifications]}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, [item.id]: checked })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 transition-all">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
