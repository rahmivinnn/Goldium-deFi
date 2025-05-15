/**
 * Browser detection utilities
 */

// Browser info type
export interface BrowserInfo {
  name: string
  version: string
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isSupported: boolean
  recommendedWallet: string
}

/**
 * Detect browser information
 */
export function detectBrowser(): BrowserInfo {
  if (typeof window === "undefined") {
    return {
      name: "Unknown",
      version: "0",
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isSupported: true,
      recommendedWallet: "phantom",
    }
  }

  const userAgent = navigator.userAgent
  let browserName = "Unknown"
  let browserVersion = "0"
  let isMobile = false
  let isTablet = false
  let isDesktop = false
  let isSupported = true
  let recommendedWallet = "phantom"

  // Detect mobile/tablet
  if (/Android/i.test(userAgent)) {
    isMobile = true
    if (/Tablet|SM-T/i.test(userAgent)) {
      isTablet = true
      isMobile = false
    }
  } else if (/iPad|iPhone|iPod/.test(userAgent)) {
    if (/iPad/.test(userAgent)) {
      isTablet = true
    } else {
      isMobile = true
    }
  } else {
    isDesktop = true
  }

  // Detect browser
  if (/Firefox/i.test(userAgent)) {
    browserName = "Firefox"
    browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || "0"
    recommendedWallet = "phantom"
  } else if (/Chrome/i.test(userAgent) && !/Chromium|Edge|Edg|OPR|Opera/i.test(userAgent)) {
    browserName = "Chrome"
    browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "0"
    recommendedWallet = "phantom"
  } else if (/Safari/i.test(userAgent) && !/Chrome|Chromium|Edge|Edg|OPR|Opera/i.test(userAgent)) {
    browserName = "Safari"
    browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || "0"
    recommendedWallet = "phantom"
    // Safari has some wallet compatibility issues
    isSupported = true // Still supported, but with warnings
  } else if (/Edge|Edg/i.test(userAgent)) {
    browserName = "Edge"
    browserVersion = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || userAgent.match(/Edg\/([0-9.]+)/)?.[1] || "0"
    recommendedWallet = "phantom"
  } else if (/Opera|OPR/i.test(userAgent)) {
    browserName = "Opera"
    browserVersion = userAgent.match(/OPR\/([0-9.]+)/)?.[1] || userAgent.match(/Opera\/([0-9.]+)/)?.[1] || "0"
    recommendedWallet = "phantom"
  } else if (/Brave/i.test(userAgent)) {
    browserName = "Brave"
    browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "0" // Brave uses Chrome's UA
    recommendedWallet = "phantom"
  }

  // Adjust recommendations for mobile
  if (isMobile || isTablet) {
    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      recommendedWallet = "phantom" // Phantom has good iOS support
    } else {
      recommendedWallet = "phantom" // Phantom has good Android support too
    }
  }

  return {
    name: browserName,
    version: browserVersion,
    isMobile,
    isTablet,
    isDesktop,
    isSupported,
    recommendedWallet,
  }
}

/**
 * Check if browser is supported
 */
export function isBrowserSupported(): boolean {
  const { isSupported } = detectBrowser()
  return isSupported
}

/**
 * Get recommended wallet for current browser
 */
export function getRecommendedWallet(): string {
  const { recommendedWallet } = detectBrowser()
  return recommendedWallet
}

/**
 * Check if current browser is mobile
 */
export function isMobileBrowser(): boolean {
  const { isMobile } = detectBrowser()
  return isMobile
}
