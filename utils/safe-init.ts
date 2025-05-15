import { isBrowser } from "./browser"

/**
 * Safely initialize the application with proper DOM checks
 * @param initFunction The initialization function to run
 */
export function safeInitialize(initFunction: () => void): void {
  if (!isBrowser) {
    console.log("Not in browser environment, skipping initialization")
    return
  }

  console.log("Initializing application...")

  // Check if the DOM is already loaded
  if (document.readyState === "complete" || document.readyState === "interactive") {
    console.log(`DOM already loaded (${document.readyState}), initializing immediately`)
    setTimeout(() => {
      try {
        initFunction()
      } catch (error) {
        console.error("Error during initialization:", error)
      }
    }, 0)
    return
  }

  // Otherwise wait for DOMContentLoaded
  console.log("DOM not yet loaded, waiting for DOMContentLoaded event")
  const handleDOMContentLoaded = () => {
    console.log("DOMContentLoaded event fired, initializing")
    try {
      initFunction()
    } catch (error) {
      console.error("Error during initialization:", error)
    }
  }

  document.addEventListener("DOMContentLoaded", handleDOMContentLoaded)

  // Also listen for load event as a fallback
  window.addEventListener(
    "load",
    () => {
      console.log("Window load event fired")
      document.removeEventListener("DOMContentLoaded", handleDOMContentLoaded)
      try {
        initFunction()
      } catch (error) {
        console.error("Error during initialization:", error)
      }
    },
    { once: true },
  )
}

/**
 * Safely add an event listener to a DOM element with proper checks
 * @param elementOrSelector The element or CSS selector
 * @param eventType The event type
 * @param handler The event handler
 * @param options Event listener options
 * @returns A cleanup function
 */
export function safeAddDOMEventListener<K extends keyof HTMLElementEventMap>(
  elementOrSelector: HTMLElement | string | null | undefined,
  eventType: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): () => void {
  if (!isBrowser) {
    console.warn(`Cannot add ${eventType} event listener: Not in browser environment`)
    return () => {}
  }

  let element: HTMLElement | null = null

  // If elementOrSelector is a string, treat it as a selector
  if (typeof elementOrSelector === "string") {
    element = document.querySelector(elementOrSelector)
    if (!element) {
      console.warn(`Cannot add ${eventType} event listener: Element with selector "${elementOrSelector}" not found`)

      // Set up a mutation observer to wait for the element
      const observer = new MutationObserver(() => {
        const newElement = document.querySelector(elementOrSelector)
        if (newElement) {
          observer.disconnect()
          console.log(`Element with selector "${elementOrSelector}" found, adding ${eventType} event listener`)
          newElement.addEventListener(eventType, handler as EventListener, options)
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })

      return () => {
        observer.disconnect()
      }
    }
  } else {
    // Otherwise use the element directly
    element = elementOrSelector || null
  }

  if (!element) {
    console.warn(`Cannot add ${eventType} event listener: Element is null or undefined`)
    return () => {}
  }

  try {
    element.addEventListener(eventType, handler as EventListener, options)
    console.log(`Successfully added ${eventType} event listener to element`)

    return () => {
      try {
        element?.removeEventListener(eventType, handler as EventListener, options)
        console.log(`Successfully removed ${eventType} event listener from element`)
      } catch (error) {
        console.error(`Error removing ${eventType} event listener:`, error)
      }
    }
  } catch (error) {
    console.error(`Error adding ${eventType} event listener:`, error)
    return () => {}
  }
}
