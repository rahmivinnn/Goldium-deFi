"use client"

import { useState } from "react"
import { useTransactions } from "@/components/WalletContextProvider"
import { useTheme } from "@/components/WalletContextProvider"
import { useLanguage } from "@/components/WalletContextProvider"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle, ExternalLink, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function TransactionHistory() {
  const { transactions, clearTransactions } = useTransactions()
  const [isOpen, setIsOpen] = useState(false)
  const { theme } = useTheme()
  const { t } = useLanguage()
  const isDarkTheme = theme === "dark"

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
      case "confirmed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return t("pending")
      case "confirmed":
        return t("confirmed")
      case "failed":
        return t("failed")
      default:
        return status
    }
  }

  if (transactions.length === 0) {
    return null
  }

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className={`w-full flex items-center justify-between ${
              isDarkTheme
                ? "border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span>{t("transactionHistory")}</span>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div
            className={`mt-2 rounded-lg border ${
              isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
            } overflow-hidden`}
          >
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className={`font-medium ${isDarkTheme ? "text-white" : "text-gray-900"}`}>Recent Transactions</h3>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-2 ${isDarkTheme ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className={isDarkTheme ? "bg-gray-900 border-gray-800" : "bg-white"}>
                    <AlertDialogHeader>
                      <AlertDialogTitle className={isDarkTheme ? "text-white" : "text-gray-900"}>
                        Clear Transaction History
                      </AlertDialogTitle>
                      <AlertDialogDescription className={isDarkTheme ? "text-gray-400" : "text-gray-500"}>
                        This will clear all your transaction history. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className={isDarkTheme ? "bg-gray-800 text-white hover:bg-gray-700" : ""}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={clearTransactions} className="bg-red-500 text-white hover:bg-red-600">
                        Clear
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {transactions.length === 0 ? (
                <div className={`text-center py-4 ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
                  {t("noTransactions")}
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className={`p-3 rounded-lg ${
                        isDarkTheme ? "bg-gray-800/50 border border-gray-700" : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(tx.status)}
                            <span className={`text-sm font-medium ${isDarkTheme ? "text-white" : "text-gray-900"}`}>
                              {tx.fromAmount} {tx.fromToken} → {tx.toAmount.toFixed(6)} {tx.toToken}
                            </span>
                          </div>
                          <div className={`text-xs mt-1 ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
                            {formatDate(tx.timestamp)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              tx.status === "confirmed"
                                ? "bg-green-500/10 text-green-500"
                                : tx.status === "pending"
                                  ? "bg-yellow-500/10 text-yellow-500"
                                  : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {getStatusText(tx.status)}
                          </span>

                          {tx.signature && (
                            <a
                              href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`ml-2 p-1 rounded-full ${
                                isDarkTheme
                                  ? "text-gray-400 hover:text-white hover:bg-gray-700"
                                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                              }`}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
