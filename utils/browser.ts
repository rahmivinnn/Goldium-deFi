/**
 * Safe browser environment detection
 */
export const isBrowser = typeof window !== "undefined"

/**
 * Safely access window object
 * Returns null if not in browser environment
 */
export const getWindow = (): Window | null => {
  return isBrowser ? window : null
}

/**
 * Safely access document object
 * Returns null if not in browser environment
 */
export const getDocument = (): Document | null => {
  return isBrowser ? document : null
}

/**
 * Safely add an event listener with proper null checks
 * Returns a cleanup function
 */
export const safeAddEventListener = <K extends keyof WindowEventMap>(
  eventType: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  // Check if we're in a browser environment
  if (!isBrowser) return () => {}

  // Add the event listener
  window.addEventListener(eventType, handler, options)

  // Return a cleanup function
  return () => {
    window.removeEventListener(eventType, handler, options)
  }
}

/**
 * Safely add an event listener to a specific element
 * Returns a cleanup function
 */
export const safeAddElementEventListener = <K extends keyof HTMLElementEventMap>(
  element: HTMLElement | null | undefined,
  eventType: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  // Check if we're in a browser environment and element exists
  if (!isBrowser || !element) return () => {}

  // Add the event listener
  element.addEventListener(eventType, handler, options)

  // Return a cleanup function
  return () => {
    element.removeEventListener(eventType, handler, options)
  }
}

/**
 * Execute a callback when the DOM is fully loaded
 * Returns a cleanup function
 */
export const onDOMReady = (callback: () => void): (() => void) => {
  // Check if we're in a browser environment
  if (!isBrowser) return () => {}

  // If document is already loaded, run callback immediately
  if (document.readyState === "complete" || document.readyState === "interactive") {
    // Use setTimeout to ensure execution after current call stack
    setTimeout(callback, 0)
    return () => {}
  }

  // Otherwise wait for DOMContentLoaded
  const handler = () => callback()
  document.addEventListener("DOMContentLoaded", handler)

  // Return a cleanup function
  return () => {
    document.removeEventListener("DOMContentLoaded", handler)
  }
}

/**
 * Safely get an element by ID with proper type checking
 */
export const safeGetElementById = <T extends HTMLElement = HTMLElement>(id: string): T | null => {
  if (!isBrowser) return null
  return document.getElementById(id) as T | null
}

/**
 * Safely query an element with proper type checking
 */
export const safeQuerySelector = <T extends HTMLElement = HTMLElement>(selector: string): T | null => {
  if (!isBrowser) return null
  return document.querySelector(selector) as T | null
}

/**
 * Check if an element exists in the DOM
 */
export const elementExists = (selector: string): boolean => {
  if (!isBrowser) return false
  return document.querySelector(selector) !== null
}

/**
 * Safely add a scroll event listener
 * Returns a cleanup function
 */
export const safeAddScrollListener = (callback: (scrollY: number) => void): (() => void) => {
  // Check if we're in a browser environment
  if (!isBrowser) return () => {}

  // Create a wrapped handler that passes scrollY
  const handleScroll = () => {
    callback(window.scrollY)
  }

  // Add the event listener
  window.addEventListener("scroll", handleScroll, { passive: true })

  // Call once to set initial state
  // Use setTimeout to ensure it runs after the component has mounted
  setTimeout(() => {
    handleScroll()
  }, 0)

  // Return a cleanup function
  return () => {
    window.removeEventListener("scroll", handleScroll)
  }
}
