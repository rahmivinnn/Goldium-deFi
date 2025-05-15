"use client"

import React, { useState, useEffect } from "react"
import { useTransactionTracking } from "@/hooks/useTransactionTracking"
import { useNetwork } from "@/components/NetworkContextProvider"
import { CardContainer } from "@/components/ui/card-container"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { 
  TransactionStatus, 
  TransactionType, 
  TransactionData 
} from "@/services/transaction-tracking"
import { ExternalLink, RefreshCw, Search, Filter, X } from "lucide-react"

interface TransactionHistoryPanelProps {
  maxItems?: number
  showFilters?: boolean
  showPagination?: boolean
  showSearch?: boolean
  defaultFilter?: {
    type?: TransactionType
    status?: TransactionStatus
    network?: string
  }
}

export function TransactionHistoryPanel({
  maxItems = 10,
  showFilters = true,
  showPagination = true,
  showSearch = true,
  defaultFilter,
}: TransactionHistoryPanelProps) {
  const { transactions, getExplorerUrl, getStatusLabel, getTypeLabel } = useTransactionTracking()
  const { network } = useNetwork()
  
  // State for filtering and pagination
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionData[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    type: defaultFilter?.type || "",
    status: defaultFilter?.status || "",
    network: defaultFilter?.network || network,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredTransactions.length / maxItems)
  
  // Get current page items
  const currentItems = filteredTransactions.slice(
    (currentPage - 1) * maxItems,
    currentPage * maxItems
  )
  
  // Apply filters and search
  useEffect(() => {
    setIsLoading(true)
    
    // Filter transactions
    let result = [...transactions]
    
    // Apply type filter
    if (filters.type) {
      result = result.filter(tx => tx.type === filters.type)
    }
    
    // Apply status filter
    if (filters.status) {
      result = result.filter(tx => tx.status === filters.status)
    }
    
    // Apply network filter
    if (filters.network) {
      result = result.filter(tx => tx.network === filters.network)
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(tx => 
        tx.signature.toLowerCase().includes(query) ||
        tx.type.toLowerCase().includes(query) ||
        tx.status.toLowerCase().includes(query) ||
        (tx.metadata && JSON.stringify(tx.metadata).toLowerCase().includes(query))
      )
    }
    
    // Sort by timestamp (newest first)
    result.sort((a, b) => b.timestamp - a.timestamp)
    
    setFilteredTransactions(result)
    setIsLoading(false)
    
    // Reset to first page when filters change
    setCurrentPage(1)
  }, [transactions, filters, searchQuery])
  
  // Get status badge variant
  const getStatusVariant = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.CREATED:
      case TransactionStatus.SIGNED:
        return "info"
      case TransactionStatus.SENT:
      case TransactionStatus.CONFIRMING:
        return "pending"
      case TransactionStatus.CONFIRMED:
        return "warning"
      case TransactionStatus.FINALIZED:
        return "success"
      case TransactionStatus.FAILED:
        return "error"
      case TransactionStatus.TIMEOUT:
        return "warning"
      default:
        return "neutral"
    }
  }
  
  // Get status badge pulse
  const getStatusPulse = (status: TransactionStatus) => {
    return [
      TransactionStatus.SENT,
      TransactionStatus.CONFIRMING,
      TransactionStatus.CONFIRMED,
    ].includes(status)
  }
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }
  
  // Format address
  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      type: "",
      status: "",
      network: network,
    })
    setSearchQuery("")
  }
  
  // Render pagination
  const renderPagination = () => {
    if (!showPagination || totalPages <= 1) return null
    
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum
            
            if (totalPages <= 5) {
              // Show all pages if 5 or fewer
              pageNum = i + 1
            } else if (currentPage <= 3) {
              // Near the start
              if (i < 4) {
                pageNum = i + 1
              } else {
                return (
                  <PaginationItem key="ellipsis-end">
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }
            } else if (currentPage >= totalPages - 2) {
              // Near the end
              if (i === 0) {
                return (
                  <PaginationItem key="ellipsis-start">
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              } else {
                pageNum = totalPages - (4 - i)
              }
            } else {
              // In the middle
              if (i === 0) {
                return (
                  <PaginationItem key="ellipsis-start">
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              } else if (i === 4) {
                return (
                  <PaginationItem key="ellipsis-end">
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              } else {
                pageNum = currentPage + (i - 2)
              }
            }
            
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  isActive={currentPage === pageNum}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            )
          })}
          
          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }
  
  return (
    <CardContainer
      title="Transaction History"
      description="Recent transactions and their status"
      isLoading={isLoading}
      isEmpty={filteredTransactions.length === 0}
      emptyMessage="No transactions found"
      headerAction={
        <div className="flex items-center gap-2">
          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => resetFilters()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      }
      footer={renderPagination()}
    >
      {showFilters && showFilterPanel && (
        <div className="mb-4 rounded-md border p-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-medium">Filter Transactions</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilterPanel(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs">Transaction Type</label>
              <Select
                value={filters.type as string}
                onValueChange={(value) => setFilters({ ...filters, type: value as TransactionType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value={TransactionType.SWAP}>Swap</SelectItem>
                  <SelectItem value={TransactionType.STAKE}>Stake</SelectItem>
                  <SelectItem value={TransactionType.UNSTAKE}>Unstake</SelectItem>
                  <SelectItem value={TransactionType.CLAIM_REWARDS}>Claim Rewards</SelectItem>
                  <SelectItem value={TransactionType.ADD_LIQUIDITY}>Add Liquidity</SelectItem>
                  <SelectItem value={TransactionType.REMOVE_LIQUIDITY}>Remove Liquidity</SelectItem>
                  <SelectItem value={TransactionType.CLAIM_FEES}>Claim Fees</SelectItem>
                  <SelectItem value={TransactionType.TRANSFER}>Transfer</SelectItem>
                  <SelectItem value={TransactionType.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs">Status</label>
              <Select
                value={filters.status as string}
                onValueChange={(value) => setFilters({ ...filters, status: value as TransactionStatus })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value={TransactionStatus.CREATED}>Created</SelectItem>
                  <SelectItem value={TransactionStatus.SIGNED}>Signed</SelectItem>
                  <SelectItem value={TransactionStatus.SENT}>Sent</SelectItem>
                  <SelectItem value={TransactionStatus.CONFIRMING}>Confirming</SelectItem>
                  <SelectItem value={TransactionStatus.CONFIRMED}>Confirmed</SelectItem>
                  <SelectItem value={TransactionStatus.FINALIZED}>Finalized</SelectItem>
                  <SelectItem value={TransactionStatus.FAILED}>Failed</SelectItem>
                  <SelectItem value={TransactionStatus.TIMEOUT}>Timeout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs">Network</label>
              <Select
                value={filters.network as string}
                onValueChange={(value) => setFilters({ ...filters, network: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Networks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Networks</SelectItem>
                  <SelectItem value="devnet">Devnet</SelectItem>
                  <SelectItem value="testnet">Testnet</SelectItem>
                  <SelectItem value="mainnet-beta">Mainnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
      
      {showSearch && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by signature, type, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Network</TableHead>
              <TableHead>Signature</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{getTypeLabel(tx.type)}</TableCell>
                <TableCell>
                  <StatusBadge
                    variant={getStatusVariant(tx.status)}
                    pulse={getStatusPulse(tx.status)}
                    size="sm"
                  >
                    {getStatusLabel(tx.status)}
                  </StatusBadge>
                </TableCell>
                <TableCell>{formatDate(tx.timestamp)}</TableCell>
                <TableCell>{tx.network}</TableCell>
                <TableCell className="font-mono text-xs">
                  {formatAddress(tx.signature)}
                </TableCell>
                <TableCell className="text-right">
                  <a
                    href={getExplorerUrl(tx.signature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">View on Explorer</span>
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContainer>
  )
}
