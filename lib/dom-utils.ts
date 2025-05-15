/**
 * Utility function to safely run code when the DOM is ready
 */
export function onDOMReady(callback: () => void): void {
  // Check if we're in the browser environment
  if (typeof window === "undefined") return

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback)
  } else {
    // DOM is already ready
    setTimeout(callback, 0)
  }
}

/**
 * Safely add an event listener to an element with null checking
 */
export function safeAddEventListener<K extends keyof WindowEventMap>(
  element: Window | Document | HTMLElement | null,
  event: K,
  handler: (this: Window, ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
): () => void {
  if (!element) return () => {}

  element.addEventListener(event, handler as EventListener, options)

  return () => {
    element.removeEventListener(event, handler as EventListener, options)
  }
}

/**
 * Safely get an element by ID with type checking
 */
export function getElementById<T extends HTMLElement = HTMLElement>(id: string): T | null {
  if (typeof document === "undefined") return null
  return document.getElementById(id) as T | null
}

/**
 * Safely query selector with type checking
 */
export function querySelector<T extends HTMLElement = HTMLElement>(selector: string): T | null {
  if (typeof document === "undefined") return null
  return document.querySelector(selector) as T | null
}
