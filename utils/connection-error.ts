/**
 * Connection error utilities
 */

// Connection error type
export interface ConnectionError {
  code: string
  message: string
  details: string
  suggestedAction?: string
  recoverable: boolean
}

// Error codes
export const ERROR_CODES = {
  WALLET_NOT_FOUND: "WALLET_NOT_FOUND",
  CONNECTION_REJECTED: "CONNECTION_REJECTED",
  CONNECTION_TIMEOUT: "CONNECTION_TIMEOUT",
  NETWORK_ERROR: "NETWORK_ERROR",
  UNSUPPORTED_BROWSER: "UNSUPPORTED_BROWSER",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
}

// Create wallet not found error
export function createWalletNotFoundError(walletName: string): ConnectionError {
  return {
    code: ERROR_CODES.WALLET_NOT_FOUND,
    message: `${walletName} wallet not found`,
    details: `Please install ${walletName} wallet extension to continue.`,
    suggestedAction: `Install ${walletName}`,
    recoverable: false,
  }
}

// Create connection rejected error
export function createConnectionRejectedError(): ConnectionError {
  return {
    code: ERROR_CODES.CONNECTION_REJECTED,
    message: "Connection rejected",
    details: "You rejected the connection request. Please try again to connect your wallet.",
    suggestedAction: "Try again",
    recoverable: true,
  }
}

// Create connection timeout error
export function createConnectionTimeoutError(): ConnectionError {
  return {
    code: ERROR_CODES.CONNECTION_TIMEOUT,
    message: "Connection timeout",
    details: "The connection request timed out. Please check your wallet and try again.",
    suggestedAction: "Try again",
    recoverable: true,
  }
}

// Create network error
export function createNetworkError(details: string): ConnectionError {
  return {
    code: ERROR_CODES.NETWORK_ERROR,
    message: "Network error",
    details: details || "A network error occurred. Please check your internet connection and try again.",
    suggestedAction: "Try again",
    recoverable: true,
  }
}

// Create unsupported browser error
export function createUnsupportedBrowserError(browserName: string): ConnectionError {
  return {
    code: ERROR_CODES.UNSUPPORTED_BROWSER,
    message: "Browser not fully supported",
    details: `${browserName} may have limited wallet compatibility. For the best experience, please use Chrome, Firefox, or Brave.`,
    suggestedAction: "Continue anyway",
    recoverable: true,
  }
}

// Create unknown error
export function createUnknownError(error: any): ConnectionError {
  return {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: "Connection error",
    details: error?.message || "An unknown error occurred while connecting to your wallet.",
    suggestedAction: "Try again",
    recoverable: true,
  }
}

// Parse wallet error
export function parseWalletError(error: any): ConnectionError {
  // Handle null or undefined
  if (!error) {
    return createUnknownError(new Error("Unknown error"))
  }

  // Handle string errors
  if (typeof error === "string") {
    return createUnknownError(new Error(error))
  }

  // Handle Error objects
  const errorMessage = error.message || ""
  const errorCode = error.code

  // Check for wallet not found
  if (errorMessage.includes("not found") || errorMessage.includes("not installed")) {
    const walletName = errorMessage.includes("Phantom")
      ? "Phantom"
      : errorMessage.includes("Solflare")
        ? "Solflare"
        : errorMessage.includes("MetaMask")
          ? "MetaMask"
          : "Wallet"
    return createWalletNotFoundError(walletName)
  }

  // Check for user rejection
  if (
    errorCode === 4001 ||
    errorMessage.includes("rejected") ||
    errorMessage.includes("declined") ||
    errorMessage.includes("user rejected")
  ) {
    return createConnectionRejectedError()
  }

  // Check for timeout
  if (errorMessage.includes("timeout")) {
    return createConnectionTimeoutError()
  }

  // Check for network errors
  if (errorMessage.includes("network") || errorMessage.includes("internet") || errorMessage.includes("connection")) {
    return createNetworkError(errorMessage)
  }

  // Default to unknown error
  return createUnknownError(error)
}
