/**
 * Debug utility to safely add event listeners with error reporting
 * @param element The element to add the event listener to
 * @param eventType The type of event to listen for
 * @param handler The event handler function
 * @param options Event listener options
 * @returns A cleanup function
 */
export function debugAddEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement | null | undefined,
  elementDescription: string,
  eventType: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): () => void {
  if (!element) {
    console.error(
      `Failed to add ${eventType} event listener to ${elementDescription}: Element is null or undefined`,
      new Error().stack,
    )
    return () => {}
  }

  try {
    element.addEventListener(eventType, handler as EventListener, options)
    console.log(`Successfully added ${eventType} event listener to ${elementDescription}`)

    return () => {
      try {
        element.removeEventListener(eventType, handler as EventListener, options)
        console.log(`Successfully removed ${eventType} event listener from ${elementDescription}`)
      } catch (error) {
        console.error(`Error removing ${eventType} event listener from ${elementDescription}:`, error)
      }
    }
  } catch (error) {
    console.error(`Error adding ${eventType} event listener to ${elementDescription}:`, error)
    return () => {}
  }
}

/**
 * Debug utility to safely add window event listeners with error reporting
 * @param eventType The type of event to listen for
 * @param handler The event handler function
 * @param options Event listener options
 * @returns A cleanup function
 */
export function debugAddWindowEventListener<K extends keyof WindowEventMap>(
  eventType: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): () => void {
  if (typeof window === "undefined") {
    console.error(
      `Failed to add ${eventType} window event listener: Window is undefined (server-side rendering)`,
      new Error().stack,
    )
    return () => {}
  }

  try {
    window.addEventListener(eventType, handler, options)
    console.log(`Successfully added ${eventType} window event listener`)

    return () => {
      try {
        window.removeEventListener(eventType, handler, options)
        console.log(`Successfully removed ${eventType} window event listener`)
      } catch (error) {
        console.error(`Error removing ${eventType} window event listener:`, error)
      }
    }
  } catch (error) {
    console.error(`Error adding ${eventType} window event listener:`, error)
    return () => {}
  }
}

/**
 * Debug utility to safely add document event listeners with error reporting
 * @param eventType The type of event to listen for
 * @param handler The event handler function
 * @param options Event listener options
 * @returns A cleanup function
 */
export function debugAddDocumentEventListener<K extends keyof DocumentEventMap>(
  eventType: K,
  handler: (event: DocumentEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): () => void {
  if (typeof document === "undefined") {
    console.error(
      `Failed to add ${eventType} document event listener: Document is undefined (server-side rendering)`,
      new Error().stack,
    )
    return () => {}
  }

  try {
    document.addEventListener(eventType, handler as EventListener, options)
    console.log(`Successfully added ${eventType} document event listener`)

    return () => {
      try {
        document.removeEventListener(eventType, handler as EventListener, options)
        console.log(`Successfully removed ${eventType} document event listener`)
      } catch (error) {
        console.error(`Error removing ${eventType} document event listener:`, error)
      }
    }
  } catch (error) {
    console.error(`Error adding ${eventType} document event listener:`, error)
    return () => {}
  }
}

/**
 * Debug utility to check if an element exists and log the result
 * @param selector The CSS selector to check
 * @returns Whether the element exists
 */
export function debugCheckElementExists(selector: string): boolean {
  if (typeof document === "undefined") {
    console.error(`Cannot check if element ${selector} exists: Document is undefined (server-side rendering)`)
    return false
  }

  const element = document.querySelector(selector)
  if (element) {
    console.log(`Element ${selector} exists in the DOM`)
    return true
  } else {
    console.error(`Element ${selector} does not exist in the DOM`)
    return false
  }
}

/**
 * Debug utility to log DOM ready state
 */
export function debugLogDOMReadyState(): void {
  if (typeof document === "undefined") {
    console.error(`Cannot log DOM ready state: Document is undefined (server-side rendering)`)
    return
  }

  console.log(`Current DOM ready state: ${document.readyState}`)
}

/**
 * Debug utility to wait for DOM content loaded and execute a callback
 * @param callback The callback to execute when the DOM is loaded
 * @returns A cleanup function
 */
export function debugOnDOMContentLoaded(callback: () => void): () => void {
  if (typeof document === "undefined") {
    console.error(`Cannot wait for DOM content loaded: Document is undefined (server-side rendering)`)
    return () => {}
  }

  console.log(`Setting up DOMContentLoaded listener, current state: ${document.readyState}`)

  if (document.readyState === "loading") {
    const handler = () => {
      console.log("DOMContentLoaded event fired")
      callback()
    }

    document.addEventListener("DOMContentLoaded", handler)

    return () => {
      document.removeEventListener("DOMContentLoaded", handler)
    }
  } else {
    console.log("DOM already loaded, executing callback immediately")
    setTimeout(callback, 0)
    return () => {}
  }
}
