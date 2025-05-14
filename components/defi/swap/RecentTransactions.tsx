"use client"

import { useState } from "react"
import { ArrowDownUp, CheckCircle2, Clock, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

// Sample data - in a real app, this would come from an API or context
const sampleTransactions = [
  {
    id: "tx1",
    type: "swap",
    fromToken: "SOL",
    toToken: "GOLD",
    fromAmount: "0.5",
    toAmount: "10.25",
    status: "completed",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    txHash: "5UfgJ...7Yhgt",
  },
  {
    id: "tx2",
    type: "swap",
    fromToken: "USDC",
    toToken: "SOL",
    fromAmount: "25",
    toAmount: "0.12",
    status: "completed",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    txHash: "8HjkL...2Mnbv",
  },
  {
    id: "tx3",
    type: "swap",
    fromToken: "GOLD",
    toToken: "BONK",
    fromAmount: "5",
    toAmount: "5000",
    status: "pending",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    txHash: "3FgTy...9Plmn",
  },
  {
    id: "tx4",
    type: "swap",
    fromToken: "BONK",
    toToken: "USDC",
    fromAmount: "10000",
    toAmount: "2.5",
    status: "completed",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    txHash: "7KlMn...4Zxcv",
  },
]

export default function RecentTransactions() {
  const [transactions] = useState(sampleTransactions)

  // Format the timestamp to a readable format
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  // Get status icon based on transaction status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
        <CardDescription>Your recent swap transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <ArrowDownUp className="mr-2 h-4 w-4" />
                      <span>Swap</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {tx.fromAmount} {tx.fromToken} → {tx.toAmount} {tx.toToken}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getStatusIcon(tx.status)}
                      <span className="ml-1 capitalize">{tx.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatTime(tx.timestamp)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">View transaction</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No recent transactions</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
