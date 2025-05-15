"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { isBrowser } from "@/utils/browser"

/**
 * Hook to safely add an event listener to a DOM element
 */
export function useDomEvent<K extends keyof HTMLElementEventMap>(
  elementRef: React.RefObject<HTMLElement | null> | null,
  eventType: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
  deps: React.DependencyList = [],
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

    // Get the element from the ref
    const element = elementRef?.current

    // If the element doesn't exist, do nothing
    if (!element) return

    // Create a handler that calls the latest handler from the ref
    const eventHandler = (event: HTMLElementEventMap[K]) => {
      handlerRef.current(event)
    }

    // Add the event listener
    element.addEventListener(eventType, eventHandler as EventListener, options)

    // Return a cleanup function
    return () => {
      element.removeEventListener(eventType, eventHandler as EventListener, options)
    }
  }, [elementRef, eventType, options, ...deps])
}

/**
 * Hook to safely add an event listener to the window
 */
export function useWindowEvent<K extends keyof WindowEventMap>(
  eventType: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
  deps: React.DependencyList = [],
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
    const eventHandler = (event: WindowEventMap[K]) => {
      handlerRef.current(event)
    }

    // Add the event listener
    window.addEventListener(eventType, eventHandler, options)

    // Return a cleanup function
    return () => {
      window.removeEventListener(eventType, eventHandler, options)
    }
  }, [eventType, options, ...deps])
}

/**
 * Hook to safely add an event listener to the document
 */
export function useDocumentEvent<K extends keyof DocumentEventMap>(
  eventType: K,
  handler: (event: DocumentEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
  deps: React.DependencyList = [],
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
  }, [eventType, options, ...deps])
}

/**
 * Hook to safely add a click event listener to a DOM element
 */
export function useClickEvent(
  elementRef: React.RefObject<HTMLElement | null> | null,
  handler: (event: MouseEvent) => void,
  options?: boolean | AddEventListenerOptions,
  deps: React.DependencyList = [],
): void {
  useDomEvent(elementRef, "click", handler, options, deps)
}

/**
 * Hook to safely add a mouseover event listener to a DOM element
 */
export function useMouseOverEvent(
  elementRef: React.RefObject<HTMLElement | null> | null,
  handler: (event: MouseEvent) => void,
  options?: boolean | AddEventListenerOptions,
  deps: React.DependencyList = [],
): void {
  useDomEvent(elementRef, "mouseover", handler, options, deps)
}

/**
 * Hook to safely add a mouseout event listener to a DOM element
 */
export function useMouseOutEvent(
  elementRef: React.RefObject<HTMLElement | null> | null,
  handler: (event: MouseEvent) => void,
  options?: boolean | AddEventListenerOptions,
  deps: React.DependencyList = [],
): void {
  useDomEvent(elementRef, "mouseout", handler, options, deps)
}

/**
 * Hook to safely add a keydown event listener to the document
 */
export function useKeyDownEvent(
  handler: (event: KeyboardEvent) => void,
  options?: boolean | AddEventListenerOptions,
  deps: React.DependencyList = [],
): void {
  useDocumentEvent("keydown", handler, options, deps)
}

/**
 * Hook to safely add a keyup event listener to the document
 */
export function useKeyUpEvent(
  handler: (event: KeyboardEvent) => void,
  options?: boolean | AddEventListenerOptions,
  deps: React.DependencyList = [],
): void {
  useDocumentEvent("keyup", handler, options, deps)
}

/**
 * Hook to safely add a scroll event listener to the window
 */
export function useScrollEvent(
  handler: (event: Event) => void,
  options?: boolean | AddEventListenerOptions,
  deps: React.DependencyList = [],
): void {
  useWindowEvent("scroll", handler, options, deps)
}

/**
 * Hook to safely add a resize event listener to the window
 */
export function useResizeEvent(
  handler: (event: UIEvent) => void,
  options?: boolean | AddEventListenerOptions,
  deps: React.DependencyList = [],
): void {
  useWindowEvent("resize", handler, options, deps)
}

/**
 * Hook to safely add a focus event listener to a DOM element
 */
export function useFocusEvent(
  elementRef: React.RefObject<HTMLElement | null> | null,
  handler: (event: FocusEvent) => void,
  options?: boolean | AddEventListenerOptions,
  deps: React.DependencyList = [],
): void {
  useDomEvent(elementRef, "focus", handler, options, deps)
}

/**
 * Hook to safely add a blur event listener to a DOM element
 */
export function useBlurEvent(
  elementRef: React.RefObject<HTMLElement | null> | null,
  handler: (event: FocusEvent) => void,
  options?: boolean | AddEventListenerOptions,
  deps: React.DependencyList = [],
): void {
  useDomEvent(elementRef, "blur", handler, options, deps)
}

/**
 * Hook to safely add a change event listener to a DOM element
 */
export function useChangeEvent(
  elementRef: React.RefObject<HTMLElement | null> | null,
  handler: (event: Event) => void,
  options?: boolean | AddEventListenerOptions,
  deps: React.DependencyList = [],
): void {
  useDomEvent(elementRef, "change", handler, options, deps)
}

/**
 * Hook to safely add an input event listener to a DOM element
 */
export function useInputEvent(
  elementRef: React.RefObject<HTMLElement | null> | null,
  handler: (event: Event) => void,
  options?: boolean | AddEventListenerOptions,
  deps: React.DependencyList = [],
): void {
  useDomEvent(elementRef, "input", handler, options, deps)
}

/**
 * Hook to safely add a submit event listener to a form element
 */
export function useSubmitEvent(
  formRef: React.RefObject<HTMLFormElement | null> | null,
  handler: (event: SubmitEvent) => void,
  options?: boolean | AddEventListenerOptions,
  deps: React.DependencyList = [],
): void {
  useDomEvent(formRef as React.RefObject<HTMLElement | null>, "submit", handler, options, deps)
}

/**
 * Hook to safely add a touchstart event listener to a DOM element
 */
export function useTouchStartEvent(
  elementRef: React.RefObject<HTMLElement | null> | null,
  handler: (event: TouchEvent) => void,
  options?: boolean | AddEventListenerOptions,
  deps: React.DependencyList = [],
): void {
  useDomEvent(elementRef, "touchstart", handler, options, deps)
}

/**
 * Hook to safely add a touchend event listener to a DOM element
 */
export function useTouchEndEvent(
  elementRef: React.RefObject<HTMLElement | null> | null,
  handler: (event: TouchEvent) => void,
  options?: boolean | AddEventListenerOptions,
  deps: React.DependencyList = [],
): void {
  useDomEvent(elementRef, "touchend", handler, options, deps)
}

/**
 * Hook to safely add a touchmove event listener to a DOM element
 */
export function useTouchMoveEvent(
  elementRef: React.RefObject<HTMLElement | null> | null,
  handler: (event: TouchEvent) => void,
  options?: boolean | AddEventListenerOptions,
  deps: React.DependencyList = [],
): void {
  useDomEvent(elementRef, "touchmove", handler, options, deps)
}
