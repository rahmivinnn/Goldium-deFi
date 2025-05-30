/**
 * Safely adds an event listener to an element with null checking
 */
export function safeAddEventListener<K extends keyof WindowEventMap>(
  element: Window | Document | HTMLElement | null,
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
): () => void {
  if (!element) {
    console.warn(`Cannot add ${type} listener to null element`)
    return () => {}
  }

  try {
    element.addEventListener(type, listener as EventListener, options)
    return () => {
      try {
        element.removeEventListener(type, listener as EventListener, options)
      } catch (error) {
        console.warn(`Error removing ${type} listener:`, error)
      }
    }
  } catch (error) {
    console.warn(`Error adding ${type} listener:`, error)
    return () => {}
  }
}

/**
 * Safely gets an element by ID with type checking
 */
export function safeGetElementById<T extends HTMLElement = HTMLElement>(id: string): T | null {
  try {
    return document.getElementById(id) as T | null
  } catch (error) {
    console.warn(`Error getting element by ID ${id}:`, error)
    return null
  }
}

/**
 * Safely queries an element with proper error handling
 */
export function safeQuerySelector<T extends HTMLElement = HTMLElement>(
  selector: string,
  parent: Document | HTMLElement = document,
): T | null {
  try {
    return parent.querySelector(selector) as T | null
  } catch (error) {
    console.warn(`Error querying selector ${selector}:`, error)
    return null
  }
}

/**
 * Safely executes a callback when the DOM is fully loaded
 */
export function onDOMReady(callback: () => void): void {
  if (typeof document === "undefined") {
    return
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    // Call on next tick to ensure consistent behavior
    setTimeout(callback, 1)
  } else {
    const removeListener = safeAddEventListener(document, "DOMContentLoaded", () => {
      removeListener()
      callback()
    })
  }
}

/**
 * Checks if we're in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined"
}

/**
 * Safely accesses window object
 */
export function safeWindow<T>(accessor: (win: Window) => T, fallback: T): T {
  if (isBrowser()) {
    try {
      return accessor(window)
    } catch (error) {
      console.warn("Error accessing window:", error)
      return fallback
    }
  }
  return fallback
}

/**
 * Safely executes code only in browser environment
 */
export function inBrowser(callback: () => void): void {
  if (isBrowser()) {
    try {
      callback()
    } catch (error) {
      console.warn("Error in browser-only code:", error)
    }
  }
}
