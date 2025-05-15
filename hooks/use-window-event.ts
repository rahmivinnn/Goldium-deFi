"use client"

import { useEffect } from "react"
import { isBrowser } from "@/utils/browser"

/**
 * A hook that safely adds window event listeners
 * @param eventType The event type to listen for
 * @param handler The event handler function
 * @param options Event listener options
 */
export function useWindowEvent<K extends keyof WindowEventMap>(
  eventType: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  useEffect(() => {
    // Only run on client side
    if (!isBrowser) return

    // Add the event listener
    window.addEventListener(eventType, handler, options)

    // Clean up
    return () => {
      window.removeEventListener(eventType, handler, options)
    }
  }, [eventType, handler, options])
}

/**
 * A hook that safely adds a scroll event listener
 * @param handler The scroll handler function that receives the current scrollY
 * @param options Event listener options
 */
export function useScrollEvent(handler: (scrollY: number) => void, options?: boolean | AddEventListenerOptions): void {
  useWindowEvent(
    "scroll",
    () => {
      if (isBrowser) {
        handler(window.scrollY)
      }
    },
    options,
  )

  // Call once to set initial state
  useEffect(() => {
    if (isBrowser) {
      handler(window.scrollY)
    }
  }, [handler])
}
