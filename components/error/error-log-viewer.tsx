"use client"

import React, { useState, useEffect } from "react"
import { useErrorMonitoring } from "@/hooks/useErrorMonitoring"
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
  ErrorCategory, 
  ErrorSeverity, 
  ErrorData 
} from "@/services/error-monitoring"
import { 
  RefreshCw, 
  Search, 
  Filter, 
  X, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2,
  RotateCcw,
  Trash2,
  ExternalLink
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ErrorLogViewerProps {
  maxItems?: number
  showFilters?: boolean
  showPagination?: boolean
  showSearch?: boolean
  showRetry?: boolean
  showClear?: boolean
  defaultFilter?: {
    category?: ErrorCategory
    severity?: ErrorSeverity
    network?: string
  }
}

export function ErrorLogViewer({
  maxItems = 10,
  showFilters = true,
  showPagination = true,
  showSearch = true,
  showRetry = true,
  showClear = true,
  defaultFilter,
}: ErrorLogViewerProps) {
  const { 
    errors, 
    unresolvedErrors,
    logError,
    resolveError,
    clearErrors,
    getErrorsByCategory,
    getErrorsByNetwork,
    getUserFriendlyMessage,
    retryOperation
  } = useErrorMonitoring()
  
  // State for filtering and pagination
  const [filteredErrors, setFilteredErrors] = useState<ErrorData[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    category: defaultFilter?.category || "",
    severity: defaultFilter?.severity || "",
    network: defaultFilter?.network || "",
    resolved: "unresolved", // "all", "resolved", "unresolved"
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [selectedTab, setSelectedTab] = useState<string>("all")
  const [selectedError, setSelectedError] = useState<ErrorData | null>(null)
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredErrors.length / maxItems)
  
  // Get current page items
  const currentItems = filteredErrors.slice(
    (currentPage - 1) * maxItems,
    currentPage * maxItems
  )
  
  // Apply filters and search
  useEffect(() => {
    setIsLoading(true)
    
    // Start with all errors or only unresolved based on tab
    let result = selectedTab === "unresolved" ? [...unresolvedErrors] : [...errors]
    
    // Apply category filter
    if (filters.category) {
      result = result.filter(error => error.category === filters.category)
    }
    
    // Apply severity filter
    if (filters.severity) {
      result = result.filter(error => error.severity === filters.severity)
    }
    
    // Apply network filter
    if (filters.network) {
      result = result.filter(error => error.network === filters.network)
    }
    
    // Apply resolved filter
    if (filters.resolved === "resolved") {
      result = result.filter(error => error.resolved)
    } else if (filters.resolved === "unresolved") {
      result = result.filter(error => !error.resolved)
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(error => 
        error.message.toLowerCase().includes(query) ||
        error.category.toLowerCase().includes(query) ||
        error.severity.toLowerCase().includes(query) ||
        (error.metadata && JSON.stringify(error.metadata).toLowerCase().includes(query))
      )
    }
    
    // Sort by timestamp (newest first)
    result.sort((a, b) => b.timestamp - a.timestamp)
    
    setFilteredErrors(result)
    setIsLoading(false)
    
    // Reset to first page when filters change
    setCurrentPage(1)
  }, [errors, unresolvedErrors, filters, searchQuery, selectedTab])
  
  // Get severity badge variant
  const getSeverityVariant = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.INFO:
        return "info"
      case ErrorSeverity.WARNING:
        return "warning"
      case ErrorSeverity.ERROR:
        return "error"
      case ErrorSeverity.CRITICAL:
        return "error"
      default:
        return "neutral"
    }
  }
  
  // Get severity icon
  const getSeverityIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.INFO:
        return <Info className="h-4 w-4" />
      case ErrorSeverity.WARNING:
        return <AlertTriangle className="h-4 w-4" />
      case ErrorSeverity.ERROR:
        return <AlertCircle className="h-4 w-4" />
      case ErrorSeverity.CRITICAL:
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }
  
  // Format category
  const formatCategory = (category: ErrorCategory) => {
    return category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
  }
  
  // Format severity
  const formatSeverity = (severity: ErrorSeverity) => {
    return severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase()
  }
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: "",
      severity: "",
      network: "",
      resolved: "unresolved",
    })
    setSearchQuery("")
  }
  
  // Handle retry
  const handleRetry = (error: ErrorData) => {
    // This is a placeholder. In a real app, you would have a way to retry the operation
    // that caused the error. For now, we'll just mark it as resolved.
    resolveError(error.id)
  }
  
  // Handle clear all
  const handleClearAll = () => {
    clearErrors()
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
      title="Error Log"
      description="System errors and their status"
      isLoading={isLoading}
      isEmpty={filteredErrors.length === 0}
      emptyMessage="No errors found"
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
          
          {showClear && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      }
      footer={renderPagination()}
    >
      <Tabs 
        defaultValue="all" 
        onValueChange={(value) => {
          setSelectedTab(value)
          setFilters({
            ...filters,
            resolved: value === "unresolved" ? "unresolved" : "all"
          })
        }}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Errors</TabsTrigger>
          <TabsTrigger value="unresolved">Unresolved</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {showFilters && showFilterPanel && (
        <div className="mb-4 rounded-md border p-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-medium">Filter Errors</h4>
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
              <label className="mb-1 block text-xs">Category</label>
              <Select
                value={filters.category as string}
                onValueChange={(value) => setFilters({ ...filters, category: value as ErrorCategory })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value={ErrorCategory.WALLET_ERROR}>Wallet Error</SelectItem>
                  <SelectItem value={ErrorCategory.NETWORK_ERROR}>Network Error</SelectItem>
                  <SelectItem value={ErrorCategory.TRANSACTION_ERROR}>Transaction Error</SelectItem>
                  <SelectItem value={ErrorCategory.CONTRACT_ERROR}>Contract Error</SelectItem>
                  <SelectItem value={ErrorCategory.USER_ERROR}>User Error</SelectItem>
                  <SelectItem value={ErrorCategory.UNKNOWN_ERROR}>Unknown Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs">Severity</label>
              <Select
                value={filters.severity as string}
                onValueChange={(value) => setFilters({ ...filters, severity: value as ErrorSeverity })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Severities</SelectItem>
                  <SelectItem value={ErrorSeverity.INFO}>Info</SelectItem>
                  <SelectItem value={ErrorSeverity.WARNING}>Warning</SelectItem>
                  <SelectItem value={ErrorSeverity.ERROR}>Error</SelectItem>
                  <SelectItem value={ErrorSeverity.CRITICAL}>Critical</SelectItem>
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
              placeholder="Search by error message, category, or severity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {currentItems.map((error) => (
          <div
            key={error.id}
            className={`rounded-lg border p-4 ${
              error.resolved ? "bg-muted/50" : "bg-card"
            }`}
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <StatusBadge
                  variant={getSeverityVariant(error.severity)}
                  size="sm"
                >
                  {formatSeverity(error.severity)}
                </StatusBadge>
                <span className="text-xs text-muted-foreground">
                  {formatCategory(error.category)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(error.timestamp)}
              </div>
            </div>
            
            <h4 className="mb-2 font-medium">{error.message}</h4>
            
            <p className="mb-2 text-sm text-muted-foreground">
              {getUserFriendlyMessage(error.message)}
            </p>
            
            <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Network:</span>{" "}
                {error.network}
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>{" "}
                {error.resolved ? "Resolved" : "Unresolved"}
              </div>
              {error.walletAddress && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Wallet:</span>{" "}
                  {error.walletAddress.slice(0, 8)}...{error.walletAddress.slice(-8)}
                </div>
              )}
              {error.transactionSignature && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Transaction:</span>{" "}
                  <a
                    href={`https://explorer.solana.com/tx/${error.transactionSignature}?cluster=${error.network}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {error.transactionSignature.slice(0, 8)}...{error.transactionSignature.slice(-8)}
                    <ExternalLink className="ml-1 inline h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <Button
                variant="link"
                size="sm"
                onClick={() => setSelectedError(error)}
              >
                View Details
              </Button>
              
              <div className="flex items-center gap-2">
                {!error.resolved && showRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRetry(error)}
                    disabled={error.retryCount >= error.maxRetries}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Retry
                    {error.retryCount > 0 && ` (${error.retryCount}/${error.maxRetries})`}
                  </Button>
                )}
                
                {!error.resolved && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resolveError(error.id)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Resolved
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Error Details Dialog */}
      {selectedError && (
        <Dialog open={!!selectedError} onOpenChange={(open) => !open && setSelectedError(null)}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Error Details</DialogTitle>
              <DialogDescription>
                Detailed information about the error
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-2">
                <StatusBadge
                  variant={getSeverityVariant(selectedError.severity)}
                  size="md"
                >
                  {formatSeverity(selectedError.severity)}
                </StatusBadge>
                <span className="text-sm">
                  {formatCategory(selectedError.category)}
                </span>
              </div>
              
              <div>
                <Label className="mb-1 block">Error Message</Label>
                <div className="rounded-md bg-muted p-2 font-mono text-sm">
                  {selectedError.message}
                </div>
              </div>
              
              <div>
                <Label className="mb-1 block">User-Friendly Message</Label>
                <div className="rounded-md bg-muted p-2 text-sm">
                  {getUserFriendlyMessage(selectedError.message)}
                </div>
              </div>
              
              {selectedError.stackTrace && (
                <div>
                  <Label className="mb-1 block">Stack Trace</Label>
                  <Textarea
                    readOnly
                    value={selectedError.stackTrace}
                    className="h-32 font-mono text-xs"
                  />
                </div>
              )}
              
              <div>
                <Label className="mb-1 block">Metadata</Label>
                <Textarea
                  readOnly
                  value={JSON.stringify(selectedError.metadata || {}, null, 2)}
                  className="h-32 font-mono text-xs"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1 block">Timestamp</Label>
                  <div className="text-sm">
                    {formatDate(selectedError.timestamp)}
                  </div>
                </div>
                <div>
                  <Label className="mb-1 block">Network</Label>
                  <div className="text-sm">
                    {selectedError.network}
                  </div>
                </div>
                <div>
                  <Label className="mb-1 block">Status</Label>
                  <div className="text-sm">
                    {selectedError.resolved ? "Resolved" : "Unresolved"}
                  </div>
                </div>
                <div>
                  <Label className="mb-1 block">Retry Count</Label>
                  <div className="text-sm">
                    {selectedError.retryCount} / {selectedError.maxRetries}
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              {!selectedError.resolved && showRetry && (
                <Button
                  variant="outline"
                  onClick={() => handleRetry(selectedError)}
                  disabled={selectedError.retryCount >= selectedError.maxRetries}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              )}
              
              {!selectedError.resolved && (
                <Button
                  variant="default"
                  onClick={() => {
                    resolveError(selectedError.id)
                    setSelectedError(null)
                  }}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Resolved
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </CardContainer>
  )
}
