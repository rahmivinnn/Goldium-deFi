"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { logAppError } from "@/utils/error-logger"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  component?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ClientErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { component = "unknown", onError } = this.props

    logAppError(error, {
      component,
      action: "render",
      data: { errorInfo },
      severity: "high",
    })

    if (onError) {
      onError(error, errorInfo)
    }
  }

  public render() {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      if (fallback) {
        return fallback
      }

      return (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-md">
          <h2 className="text-lg font-bold text-red-500 mb-2">Something went wrong</h2>
          <p className="text-sm text-red-400 mb-2">{error?.message || "An unexpected error occurred"}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
          >
            Try again
          </button>
        </div>
      )
    }

    return children
  }
}

// Add default export
export default ClientErrorBoundary
