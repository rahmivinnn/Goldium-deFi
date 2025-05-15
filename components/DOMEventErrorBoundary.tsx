"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class DOMEventErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error("DOMEventErrorBoundary caught an error:", error, errorInfo)
    this.setState({ errorInfo })
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // Check if the error is related to addEventListener
      const isAddEventListenerError =
        this.state.error?.message.includes("addEventListener") || this.state.error?.stack?.includes("addEventListener")

      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-500/10 border border-red-500 rounded-md">
            <h2 className="text-lg font-bold text-red-500 mb-2">DOM Event Error</h2>
            <p className="text-sm text-red-400 mb-2">
              {isAddEventListenerError
                ? "Failed to add event listener to a DOM element that doesn't exist."
                : "An error occurred in a DOM event handler."}
            </p>
            <details className="text-xs text-gray-400">
              <summary className="cursor-pointer">Error Details</summary>
              <pre className="mt-2 p-2 bg-black/50 rounded overflow-auto">
                {this.state.error?.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          </div>
        )
      )
    }

    return this.props.children
  }
}
