"use client"

import { useEffect, useRef } from "react"
import { isBrowser } from "@/utils/browser"
import { debugAddWindowEventListener } from "@/utils/debug-utils"

/**
 * Hook to safely add an event listener to the window
 */
export function useWindowEvent<K extends keyof WindowEventMap>(
  eventType: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  // Store the handler in a ref to avoid unnecessary re-renders
  const handlerRef = useRef(handler)

  // Update the handler ref when the handler changes
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    // Check if we're in a browser environment
    if (!isBrowser) {
      console.warn(`useWindowEvent: Cannot add ${eventType} event listener - not in browser environment`)
      return
    }

    console.log(`useWindowEvent: Setting up ${eventType} event listener`)

    // Create a handler that calls the latest handler from the ref
    const eventHandler = (event: WindowEventMap[K]) => {
      handlerRef.current(event)
    }

    // Add the event listener with debug wrapper
    const cleanup = debugAddWindowEventListener(eventType, eventHandler, options)

    // Return a cleanup function
    return cleanup
  }, [eventType, options])
}

/**
 * Hook to safely add a scroll event listener
 * @param handler The scroll handler function that receives the current scrollY
 * @param options Event listener options
 */
export function useScrollEvent(handler: (scrollY: number) => void, options?: boolean | AddEventListenerOptions): void {
  const handlerRef = useRef(handler)

  // Update the handler ref when the handler changes
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useWindowEvent(
    "scroll",
    () => {
      if (isBrowser) {
        handlerRef.current(window.scrollY)
      }
    },
    options,
  )

  // Call once to set initial state
  useEffect(() => {
    if (isBrowser) {
      console.log("useScrollEvent: Setting initial scroll position")
      setTimeout(() => {
        handlerRef.current(window.scrollY)
      }, 0)
    }
  }, [])
}

/**
 * Hook to safely add a resize event listener to the window
 */
export function useWindowResize(handler: (width: number, height: number) => void): void {
  const handlerRef = useRef(handler)

  // Update the handler ref when the handler changes
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    // Check if we're in a browser environment
    if (!isBrowser) return

    // Create a handler that calls the latest handler from the ref with window dimensions
    const eventHandler = () => {
      handlerRef.current(window.innerWidth, window.innerHeight)
    }

    // Call once to set initial dimensions
    eventHandler()

    // Add the event listener
    window.addEventListener("resize", eventHandler, { passive: true })

    // Return a cleanup function
    return () => {
      window.removeEventListener("resize", eventHandler)
    }
  }, [])
}

/**
 * Hook to safely add a scroll event listener to the window
 */
export function useWindowScroll(handler: (scrollX: number, scrollY: number) => void): void {
  const handlerRef = useRef(handler)

  // Update the handler ref when the handler changes
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    // Check if we're in a browser environment
    if (!isBrowser) return

    // Create a handler that calls the latest handler from the ref with scroll position
    const eventHandler = () => {
      handlerRef.current(window.scrollX, window.scrollY)
    }

    // Call once to set initial scroll position
    eventHandler()

    // Add the event listener
    window.addEventListener("scroll", eventHandler, { passive: true })

    // Return a cleanup function
    return () => {
      window.removeEventListener("scroll", eventHandler)
    }
  }, [])
}

/**
 * Hook to safely add a mousemove event listener to the window
 */
export function useWindowMouseMove(handler: (x: number, y: number) => void): void {
  const handlerRef = useRef(handler)

  // Update the handler ref when the handler changes
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    // Check if we're in a browser environment
    if (!isBrowser) return

    // Create a handler that calls the latest handler from the ref with mouse position
    const eventHandler = (event: MouseEvent) => {
      handlerRef.current(event.clientX, event.clientY)
    }

    // Add the event listener
    window.addEventListener("mousemove", eventHandler)

    // Return a cleanup function
    return () => {
      window.removeEventListener("mousemove", eventHandler)
    }
  }, [])
}

/**
 * Hook to safely add a keydown event listener to the window
 */
export function useWindowKeyDown(handler: (event: KeyboardEvent) => void): void {
  useWindowEvent("keydown", handler)
}

/**
 * Hook to safely add a keyup event listener to the window
 */
export function useWindowKeyUp(handler: (event: KeyboardEvent) => void): void {
  useWindowEvent("keyup", handler)
}

/**
 * Hook to safely add a focus event listener to the window
 */
export function useWindowFocus(handler: (isFocused: boolean) => void): void {
  const handlerRef = useRef(handler)

  // Update the handler ref when the handler changes
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    // Check if we're in a browser environment
    if (!isBrowser) return

    // Create handlers that call the latest handler from the ref
    const handleFocus = () => handlerRef.current(true)
    const handleBlur = () => handlerRef.current(false)

    // Call once to set initial focus state
    handlerRef.current(document.hasFocus())

    // Add the event listeners
    window.addEventListener("focus", handleFocus)
    window.addEventListener("blur", handleBlur)

    // Return a cleanup function
    return () => {
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("blur", handleBlur)
    }
  }, [])
}

/**
 * Hook to safely add an online/offline event listener to the window
 */
export function useWindowOnline(handler: (isOnline: boolean) => void): void {
  const handlerRef = useRef(handler)

  // Update the handler ref when the handler changes
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    // Check if we're in a browser environment
    if (!isBrowser) return

    // Create handlers that call the latest handler from the ref
    const handleOnline = () => handlerRef.current(true)
    const handleOffline = () => handlerRef.current(false)

    // Call once to set initial online state
    handlerRef.current(navigator.onLine)

    // Add the event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Return a cleanup function
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])
}

/**
 * Hook to safely add a beforeunload event listener to the window
 */
export function useWindowBeforeUnload(handler: (event: BeforeUnloadEvent) => void): void {
  useWindowEvent("beforeunload", handler)
}

/**
 * Hook to safely add a storage event listener to the window
 */
export function useWindowStorage(handler: (event: StorageEvent) => void): void {
  useWindowEvent("storage", handler)
}

/**
 * Hook to safely add a popstate event listener to the window
 */
export function useWindowPopState(handler: (event: PopStateEvent) => void): void {
  useWindowEvent("popstate", handler)
}

/**
 * Hook to safely add a hashchange event listener to the window
 */
export function useWindowHashChange(handler: (event: HashChangeEvent) => void): void {
  useWindowEvent("hashchange", handler)
}

/**
 * Hook to safely add a message event listener to the window
 */
export function useWindowMessage(handler: (event: MessageEvent) => void): void {
  useWindowEvent("message", handler)
}
