type ErrorSeverity = "low" | "medium" | "high" | "critical"

interface ErrorLogContext {
  component?: string
  action?: string
  data?: Record<string, any>
  severity?: ErrorSeverity
  userId?: string
}

/**
 * Logs application errors with context
 */
export function logAppError(error: Error, context: ErrorLogContext = {}): void {
  const { component = "unknown", action = "unknown", data = {}, severity = "medium", userId = "anonymous" } = context

  // In a real app, you might send this to a logging service
  console.error(`[${severity.toUpperCase()}] Error in ${component} during ${action}:`, error.message, {
    stack: error.stack,
    userId,
    timestamp: new Date().toISOString(),
    ...data,
  })
}

/**
 * Logs user actions for analytics
 */
export function logUserAction(action: string, data: Record<string, any> = {}): void {
  // In a real app, you might send this to an analytics service
  console.log(`[USER ACTION] ${action}:`, {
    timestamp: new Date().toISOString(),
    ...data,
  })
}

/**
 * Formats error messages for user display
 */
export function formatErrorForUser(error: Error | string): string {
  const message = typeof error === "string" ? error : error.message

  // Clean up common error messages to be more user-friendly
  if (message.includes("network error") || message.includes("failed to fetch")) {
    return "Network error. Please check your internet connection and try again."
  }

  if (message.includes("timeout")) {
    return "The operation timed out. Please try again."
  }

  if (message.includes("insufficient funds") || message.includes("insufficient balance")) {
    return "Insufficient funds for this transaction."
  }

  // Default generic message if we can't make it more user-friendly
  return message || "An unexpected error occurred. Please try again."
}

/**
 * Creates a safe error handler that won't crash the app
 */
export function createSafeErrorHandler(
  handler: (error: Error) => void,
  fallback?: (error: Error) => void,
): (error: Error) => void {
  return (error: Error) => {
    try {
      handler(error)
    } catch (handlerError) {
      console.error("Error in error handler:", handlerError)
      if (fallback) {
        try {
          fallback(error)
        } catch (fallbackError) {
          console.error("Error in fallback error handler:", fallbackError)
        }
      }
    }
  }
}
