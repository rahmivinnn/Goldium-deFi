"use client"

import { useEffect, useRef } from "react"
import { isBrowser } from "@/utils/browser"

/**
 * Hook to safely add an event listener to the document
 */
export function useDocumentEvent<K extends keyof DocumentEventMap>(
  eventType: K,
  handler: (event: DocumentEventMap[K]) => void,
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
    if (!isBrowser) return

    // Create a handler that calls the latest handler from the ref
    const eventHandler = (event: DocumentEventMap[K]) => {
      handlerRef.current(event)
    }

    // Add the event listener
    document.addEventListener(eventType, eventHandler, options)

    // Return a cleanup function
    return () => {
      document.removeEventListener(eventType, eventHandler, options)
    }
  }, [eventType, options])
}

/**
 * Hook to safely add a click event listener to the document
 */
export function useDocumentClick(
  handler: (event: MouseEvent) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  useDocumentEvent("click", handler, options)
}

/**
 * Hook to safely add a mousemove event listener to the document
 */
export function useDocumentMouseMove(
  handler: (event: MouseEvent) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  useDocumentEvent("mousemove", handler, options)
}

/**
 * Hook to safely add a mousedown event listener to the document
 */
export function useDocumentMouseDown(
  handler: (event: MouseEvent) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  useDocumentEvent("mousedown", handler, options)
}

/**
 * Hook to safely add a mouseup event listener to the document
 */
export function useDocumentMouseUp(
  handler: (event: MouseEvent) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  useDocumentEvent("mouseup", handler, options)
}

/**
 * Hook to safely add a keydown event listener to the document
 */
export function useDocumentKeyDown(
  handler: (event: KeyboardEvent) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  useDocumentEvent("keydown", handler, options)
}

/**
 * Hook to safely add a keyup event listener to the document
 */
export function useDocumentKeyUp(
  handler: (event: KeyboardEvent) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  useDocumentEvent("keyup", handler, options)
}

/**
 * Hook to safely add a touchstart event listener to the document
 */
export function useDocumentTouchStart(
  handler: (event: TouchEvent) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  useDocumentEvent("touchstart", handler, options)
}

/**
 * Hook to safely add a touchend event listener to the document
 */
export function useDocumentTouchEnd(
  handler: (event: TouchEvent) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  useDocumentEvent("touchend", handler, options)
}

/**
 * Hook to safely add a touchmove event listener to the document
 */
export function useDocumentTouchMove(
  handler: (event: TouchEvent) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  useDocumentEvent("touchmove", handler, options)
}

/**
 * Hook to safely add a visibilitychange event listener to the document
 */
export function useDocumentVisibilityChange(
  handler: (isVisible: boolean) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  const handlerRef = useRef(handler)

  // Update the handler ref when the handler changes
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    // Check if we're in a browser environment
    if (!isBrowser) return

    // Create a handler that calls the latest handler from the ref
    const eventHandler = () => {
      handlerRef.current(document.visibilityState === "visible")
    }

    // Call once to set initial visibility state
    eventHandler()

    // Add the event listener
    document.addEventListener("visibilitychange", eventHandler, options)

    // Return a cleanup function
    return () => {
      document.removeEventListener("visibilitychange", eventHandler, options)
    }
  }, [options])
}

/**
 * Hook to safely add a fullscreenchange event listener to the document
 */
export function useDocumentFullscreenChange(
  handler: (isFullscreen: boolean) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  const handlerRef = useRef(handler)

  // Update the handler ref when the handler changes
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    // Check if we're in a browser environment
    if (!isBrowser) return

    // Create a handler that calls the latest handler from the ref
    const eventHandler = () => {
      handlerRef.current(!!document.fullscreenElement)
    }

    // Call once to set initial fullscreen state
    eventHandler()

    // Add the event listener
    document.addEventListener("fullscreenchange", eventHandler, options)

    // Return a cleanup function
    return () => {
      document.removeEventListener("fullscreenchange", eventHandler, options)
    }
  }, [options])
}

/**
 * Hook to safely add a selectionchange event listener to the document
 */
export function useDocumentSelectionChange(
  handler: (selection: Selection | null) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  const handlerRef = useRef(handler)

  // Update the handler ref when the handler changes
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    // Check if we're in a browser environment
    if (!isBrowser) return

    // Create a handler that calls the latest handler from the ref
    const eventHandler = () => {
      handlerRef.current(document.getSelection())
    }

    // Call once to set initial selection
    eventHandler()

    // Add the event listener
    document.addEventListener("selectionchange", eventHandler, options)

    // Return a cleanup function
    return () => {
      document.removeEventListener("selectionchange", eventHandler, options)
    }
  }, [options])
}

/**
 * Hook to safely add a copy event listener to the document
 */
export function useDocumentCopy(
  handler: (event: ClipboardEvent) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  useDocumentEvent("copy", handler, options)
}

/**
 * Hook to safely add a paste event listener to the document
 */
export function useDocumentPaste(
  handler: (event: ClipboardEvent) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  useDocumentEvent("paste", handler, options)
}

/**
 * Hook to safely add a cut event listener to the document
 */
export function useDocumentCut(
  handler: (event: ClipboardEvent) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  useDocumentEvent("cut", handler, options)
}
