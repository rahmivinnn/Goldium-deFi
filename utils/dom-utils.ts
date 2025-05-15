/**
 * Safely adds an event listener with proper checks
 */
export function safeAddEventListener<K extends keyof WindowEventMap>(
  element: Window | Document | HTMLElement | null | undefined,
  eventType: K,
  callback: (ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
): () => void {
  // Check if we're in a browser environment
  if (typeof window === "undefined") return () => {}

  // Check if the element exists
  if (!element) return () => {}

  // Add the event listener
  element.addEventListener(eventType, callback as EventListener, options)

  // Return a cleanup function
  return () => {
    element.removeEventListener(eventType, callback as EventListener, options)
  }
}

/**
 * Runs a callback when the DOM is fully loaded
 */
export function onDOMReady(callback: () => void): () => void {
  // Check if we're in a browser environment
  if (typeof window === "undefined") return () => {}

  // If the DOM is already loaded, run the callback immediately
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(callback, 0)
    return () => {}
  }

  // Otherwise, wait for the DOMContentLoaded event
  const handler = () => {
    document.removeEventListener("DOMContentLoaded", handler)
    callback()
  }

  document.addEventListener("DOMContentLoaded", handler)

  // Return a cleanup function
  return () => {
    document.removeEventListener("DOMContentLoaded", handler)
  }
}

/**
 * Safely gets an element by ID with type checking
 */
export function getElementById<T extends HTMLElement = HTMLElement>(id: string): T | null {
  if (typeof document === "undefined") return null
  return document.getElementById(id) as T | null
}

/**
 * Safely queries an element with type checking
 */
export function querySelector<T extends HTMLElement = HTMLElement>(selector: string): T | null {
  if (typeof document === "undefined") return null
  return document.querySelector(selector) as T | null
}
