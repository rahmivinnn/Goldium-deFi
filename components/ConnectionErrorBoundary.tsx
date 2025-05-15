"use client"

import { Component, type ReactNode, type ErrorInfo } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { parseWalletError } from "@/utils/connection-error"

interface ConnectionErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ConnectionErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ConnectionErrorBoundary extends Component<ConnectionErrorBoundaryProps, ConnectionErrorBoundaryState> {
  constructor(props: ConnectionErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): ConnectionErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    })

    // Log the error to an error reporting service
    console.error("Connection error caught by boundary:", error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // Check if it's a connection-related error
      const isConnectionError =
        this.state.error?.message?.toLowerCase().includes("connection") ||
        this.state.error?.message?.toLowerCase().includes("network") ||
        this.state.error?.message?.toLowerCase().includes("wallet") ||
        this.state.error?.message?.toLowerCase().includes("timeout")

      // Parse the error
      const parsedError = parseWalletError(this.state.error)

      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Otherwise, show a default error UI
      return (
        <div className="p-6 rounded-lg border border-red-500/20 bg-red-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-red-500">
                {isConnectionError ? "Connection Error" : "Something went wrong"}
              </h3>
              <p className="mt-2 text-gray-400">{parsedError.message}</p>
              {parsedError.details && <p className="mt-1 text-sm text-gray-500">{parsedError.details}</p>}
              <div className="mt-4">
                <Button onClick={this.handleReset} className="bg-red-500 hover:bg-red-600 text-white">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
