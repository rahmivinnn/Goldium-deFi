"use client"

import { useState, useEffect, useCallback } from "react"
import { useNetwork } from "@/components/NetworkContextProvider"
import { useWallet } from "@solana/wallet-adapter-react"
import { 
  getErrorMonitoringService, 
  ErrorCategory, 
  ErrorSeverity, 
  ErrorData,
  USER_FRIENDLY_MESSAGES
} from "@/services/error-monitoring"
import { useToast } from "@/components/ui/use-toast"

export function useErrorMonitoring() {
  const { network } = useNetwork()
  const { publicKey } = useWallet()
  const { toast } = useToast()
  const [errors, setErrors] = useState<ErrorData[]>([])
  const [unresolvedErrors, setUnresolvedErrors] = useState<ErrorData[]>([])
  
  // Get the error monitoring service
  const errorService = getErrorMonitoringService()
  
  // Update errors state when new errors are logged
  useEffect(() => {
    const handleNewError = (error: ErrorData) => {
      setErrors(prev => [...prev, error])
      setUnresolvedErrors(prev => [...prev, error])
      
      // Show toast for errors
      if (error.severity === ErrorSeverity.ERROR || error.severity === ErrorSeverity.CRITICAL) {
        toast({
          title: `${error.category.replace('_', ' ')} Error`,
          description: errorService.getUserFriendlyMessage(error.message),
          variant: "destructive",
          duration: 5000,
        })
      }
    }
    
    // Add error listener
    errorService.addErrorListener(handleNewError)
    
    // Initial load
    setErrors(errorService.getErrors())
    setUnresolvedErrors(errorService.getUnresolvedErrors())
    
    return () => {
      // Remove error listener
      errorService.removeErrorListener(handleNewError)
    }
  }, [errorService, toast])
  
  // Log a new error
  const logError = useCallback(
    (
      error: Error | string,
      category: ErrorCategory = ErrorCategory.UNKNOWN_ERROR,
      severity: ErrorSeverity = ErrorSeverity.ERROR,
      metadata: Record<string, any> = {}
    ) => {
      return errorService.logError(
        error,
        category,
        severity,
        {
          ...metadata,
          walletAddress: publicKey?.toString(),
        },
        network
      )
    },
    [errorService, network, publicKey]
  )
  
  // Resolve an error
  const resolveError = useCallback(
    (errorId: string) => {
      const resolved = errorService.resolveError(errorId)
      if (resolved) {
        setUnresolvedErrors(prev => prev.filter(e => e.id !== errorId))
      }
      return resolved
    },
    [errorService]
  )
  
  // Clear all errors
  const clearErrors = useCallback(() => {
    errorService.clearErrors()
    setErrors([])
    setUnresolvedErrors([])
  }, [errorService])
  
  // Get errors by category
  const getErrorsByCategory = useCallback(
    (category: ErrorCategory) => {
      return errorService.getErrorsByCategory(category)
    },
    [errorService]
  )
  
  // Get errors by network
  const getErrorsByNetwork = useCallback(
    (networkType: string) => {
      return errorService.getErrorsByNetwork(networkType as any)
    },
    [errorService]
  )
  
  // Get user-friendly error message
  const getUserFriendlyMessage = useCallback(
    (errorMessage: string) => {
      return errorService.getUserFriendlyMessage(errorMessage)
    },
    [errorService]
  )
  
  // Retry a failed operation
  const retryOperation = useCallback(
    async (errorId: string, operation: () => Promise<any>) => {
      const error = errors.find(e => e.id === errorId)
      if (!error) return null
      
      // Check if we can retry
      if (error.retryCount >= error.maxRetries) {
        return null
      }
      
      // Increment retry count
      errorService.incrementRetryCount(errorId)
      
      try {
        // Execute the operation
        const result = await operation()
        
        // If successful, resolve the error
        resolveError(errorId)
        
        return result
      } catch (e) {
        // Log the retry failure
        logError(
          e instanceof Error ? e : new Error(String(e)),
          error.category,
          error.severity,
          {
            ...error.metadata,
            originalErrorId: errorId,
            retryAttempt: error.retryCount,
          }
        )
        
        return null
      }
    },
    [errors, errorService, logError, resolveError]
  )
  
  return {
    errors,
    unresolvedErrors,
    logError,
    resolveError,
    clearErrors,
    getErrorsByCategory,
    getErrorsByNetwork,
    getUserFriendlyMessage,
    retryOperation,
  }
}
