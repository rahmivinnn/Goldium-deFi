import { debugAddWindowEventListener, debugAddEventListener, debugOnDOMContentLoaded } from "./debug-utils"

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
  if (!isBrowser) {
    console.warn(`Cannot add ${eventType} event listener: Not in browser environment`)
    return () => {}
  }

  return debugAddWindowEventListener(eventType, handler, options)
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
  if (!isBrowser) {
    console.warn(`Cannot add ${eventType} event listener to element: Not in browser environment`)
    return () => {}
  }

  if (!element) {
    console.warn(`Cannot add ${eventType} event listener: Element is null or undefined`)
    return () => {}
  }

  return debugAddEventListener(
    element,
    element.tagName + (element.id ? `#${element.id}` : ""),
    eventType,
    handler,
    options,
  )
}

/**
 * Execute a callback when the DOM is fully loaded
 * Returns a cleanup function
 */
export const onDOMReady = (callback: () => void): (() => void) => {
  // Check if we're in a browser environment
  if (!isBrowser) {
    console.warn(`Cannot execute onDOMReady callback: Not in browser environment`)
    return () => {}
  }

  return debugOnDOMContentLoaded(callback)
}

/**
 * Safely get an element by ID with proper type checking
 */
export const safeGetElementById = <T extends HTMLElement = HTMLElement>(id: string): T | null => {
  if (!isBrowser) {
    console.warn(`Cannot get element by ID ${id}: Not in browser environment`)
    return null
  }

  const element = document.getElementById(id) as T | null
  if (!element) {
    console.warn(`Element with ID ${id} not found in the DOM`)
  }

  return element
}

/**
 * Safely query an element with proper type checking
 */
export const safeQuerySelector = <T extends HTMLElement = HTMLElement>(selector: string): T | null => {
  if (!isBrowser) {
    console.warn(`Cannot query selector ${selector}: Not in browser environment`)
    return null
  }

  const element = document.querySelector(selector) as T | null
  if (!element) {
    console.warn(`Element matching selector "${selector}" not found in the DOM`)
  }

  return element
}

/**
 * Check if an element exists in the DOM
 */
export const elementExists = (selector: string): boolean => {
  if (!isBrowser) {
    console.warn(`Cannot check if element exists: Not in browser environment`)
    return false
  }

  const exists = document.querySelector(selector) !== null
  if (!exists) {
    console.warn(`Element matching selector "${selector}" not found in the DOM`)
  }

  return exists
}

/**
 * Safely add a scroll event listener
 * Returns a cleanup function
 */
export const safeAddScrollListener = (callback: (scrollY: number) => void): (() => void) => {
  // Check if we're in a browser environment
  if (!isBrowser) {
    console.warn(`Cannot add scroll listener: Not in browser environment`)
    return () => {}
  }

  // Create a wrapped handler that passes scrollY
  const handleScroll = () => {
    callback(window.scrollY)
  }

  return debugAddWindowEventListener("scroll", handleScroll, { passive: true })
}

/**
 * Safely add a resize event listener
 * Returns a cleanup function
 */
export const safeAddResizeListener = (callback: (width: number, height: number) => void): (() => void) => {
  // Check if we're in a browser environment
  if (!isBrowser) {
    console.warn(`Cannot add resize listener: Not in browser environment`)
    return () => {}
  }

  // Create a wrapped handler that passes dimensions
  const handleResize = () => {
    callback(window.innerWidth, window.innerHeight)
  }

  // Call once to set initial state
  setTimeout(() => {
    if (isBrowser) {
      handleResize()
    }
  }, 0)

  return debugAddWindowEventListener("resize", handleResize, { passive: true })
}

/**
 * Safely execute code only in browser environment
 */
export const runInBrowser = (callback: () => void): void => {
  if (isBrowser) {
    callback()
  } else {
    console.warn(`Cannot run callback: Not in browser environment`)
  }
}

/**
 * Safely check if an element is visible in viewport
 */
export const isElementInViewport = (element: HTMLElement | null): boolean => {
  if (!isBrowser || !element) {
    if (!isBrowser) console.warn(`Cannot check if element is in viewport: Not in browser environment`)
    if (!element) console.warn(`Cannot check if element is in viewport: Element is null`)
    return false
  }

  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * Safely add a DOM mutation observer
 * Returns a cleanup function
 */
export const safeAddMutationObserver = (
  targetNode: Node | null,
  callback: MutationCallback,
  options: MutationObserverInit = { childList: true, subtree: true },
): (() => void) => {
  if (!isBrowser || !targetNode) {
    if (!isBrowser) console.warn(`Cannot add mutation observer: Not in browser environment`)
    if (!targetNode) console.warn(`Cannot add mutation observer: Target node is null`)
    return () => {}
  }

  try {
    const observer = new MutationObserver(callback)
    observer.observe(targetNode, options)
    console.log(`Successfully added mutation observer to node`)

    return () => {
      observer.disconnect()
      console.log(`Successfully disconnected mutation observer`)
    }
  } catch (error) {
    console.error(`Error adding mutation observer:`, error)
    return () => {}
  }
}

/**
 * Wait for an element to be available in the DOM
 * @param selector CSS selector for the element
 * @param timeout Maximum time to wait in milliseconds
 * @returns Promise that resolves with the element or rejects on timeout
 */
export const waitForElement = <T extends HTMLElement = HTMLElement>(selector: string, timeout = 5000): Promise<T> => {
  if (!isBrowser) {
    console.warn(`Cannot wait for element: Not in browser environment`)
    return Promise.reject(new Error("Not in browser environment"))
  }

  return new Promise((resolve, reject) => {
    // Check if element already exists
    const element = document.querySelector<T>(selector)
    if (element) {
      console.log(`Element ${selector} already exists in the DOM`)
      resolve(element)
      return
    }

    console.log(`Waiting for element ${selector} to appear in the DOM...`)

    // Set timeout
    const timeoutId = setTimeout(() => {
      observer.disconnect()
      console.error(`Timed out waiting for element ${selector}`)
      reject(new Error(`Timed out waiting for element ${selector}`))
    }, timeout)

    // Set up mutation observer
    const observer = new MutationObserver(() => {
      const element = document.querySelector<T>(selector)
      if (element) {
        observer.disconnect()
        clearTimeout(timeoutId)
        console.log(`Element ${selector} found in the DOM`)
        resolve(element)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })
}
