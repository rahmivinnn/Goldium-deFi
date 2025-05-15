import { isBrowser } from "./browser"

/**
 * Safely add event listeners to DOM elements with proper null checks
 */

/**
 * Safely add a click event listener to an element
 */
export const safeAddClickListener = (
  element: HTMLElement | null | undefined,
  handler: (event: MouseEvent) => void,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  if (!isBrowser || !element) return () => {}

  element.addEventListener("click", handler, options)
  return () => element.removeEventListener("click", handler, options)
}

/**
 * Safely add a mouseover event listener to an element
 */
export const safeAddMouseOverListener = (
  element: HTMLElement | null | undefined,
  handler: (event: MouseEvent) => void,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  if (!isBrowser || !element) return () => {}

  element.addEventListener("mouseover", handler, options)
  return () => element.removeEventListener("mouseover", handler, options)
}

/**
 * Safely add a mouseout event listener to an element
 */
export const safeAddMouseOutListener = (
  element: HTMLElement | null | undefined,
  handler: (event: MouseEvent) => void,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  if (!isBrowser || !element) return () => {}

  element.addEventListener("mouseout", handler, options)
  return () => element.removeEventListener("mouseout", handler, options)
}

/**
 * Safely add a keydown event listener to an element
 */
export const safeAddKeyDownListener = (
  element: HTMLElement | Document | null | undefined,
  handler: (event: KeyboardEvent) => void,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  if (!isBrowser || !element) return () => {}

  element.addEventListener("keydown", handler, options)
  return () => element.removeEventListener("keydown", handler, options)
}

/**
 * Safely add a keyup event listener to an element
 */
export const safeAddKeyUpListener = (
  element: HTMLElement | Document | null | undefined,
  handler: (event: KeyboardEvent) => void,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  if (!isBrowser || !element) return () => {}

  element.addEventListener("keyup", handler, options)
  return () => element.removeEventListener("keyup", handler, options)
}

/**
 * Safely add a focus event listener to an element
 */
export const safeAddFocusListener = (
  element: HTMLElement | null | undefined,
  handler: (event: FocusEvent) => void,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  if (!isBrowser || !element) return () => {}

  element.addEventListener("focus", handler, options)
  return () => element.removeEventListener("focus", handler, options)
}

/**
 * Safely add a blur event listener to an element
 */
export const safeAddBlurListener = (
  element: HTMLElement | null | undefined,
  handler: (event: FocusEvent) => void,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  if (!isBrowser || !element) return () => {}

  element.addEventListener("blur", handler, options)
  return () => element.removeEventListener("blur", handler, options)
}

/**
 * Safely add a change event listener to an element
 */
export const safeAddChangeListener = (
  element: HTMLElement | null | undefined,
  handler: (event: Event) => void,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  if (!isBrowser || !element) return () => {}

  element.addEventListener("change", handler, options)
  return () => element.removeEventListener("change", handler, options)
}

/**
 * Safely add an input event listener to an element
 */
export const safeAddInputListener = (
  element: HTMLElement | null | undefined,
  handler: (event: Event) => void,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  if (!isBrowser || !element) return () => {}

  element.addEventListener("input", handler, options)
  return () => element.removeEventListener("input", handler, options)
}

/**
 * Safely add a submit event listener to a form element
 */
export const safeAddSubmitListener = (
  element: HTMLFormElement | null | undefined,
  handler: (event: SubmitEvent) => void,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  if (!isBrowser || !element) return () => {}

  element.addEventListener("submit", handler, options)
  return () => element.removeEventListener("submit", handler, options)
}

/**
 * Safely add a touchstart event listener to an element
 */
export const safeAddTouchStartListener = (
  element: HTMLElement | null | undefined,
  handler: (event: TouchEvent) => void,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  if (!isBrowser || !element) return () => {}

  element.addEventListener("touchstart", handler, options)
  return () => element.removeEventListener("touchstart", handler, options)
}

/**
 * Safely add a touchend event listener to an element
 */
export const safeAddTouchEndListener = (
  element: HTMLElement | null | undefined,
  handler: (event: TouchEvent) => void,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  if (!isBrowser || !element) return () => {}

  element.addEventListener("touchend", handler, options)
  return () => element.removeEventListener("touchend", handler, options)
}

/**
 * Safely add a touchmove event listener to an element
 */
export const safeAddTouchMoveListener = (
  element: HTMLElement | null | undefined,
  handler: (event: TouchEvent) => void,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  if (!isBrowser || !element) return () => {}

  element.addEventListener("touchmove", handler, options)
  return () => element.removeEventListener("touchmove", handler, options)
}

/**
 * Safely add multiple event listeners to an element
 */
export const safeAddMultipleEventListeners = (
  element: HTMLElement | null | undefined,
  events: { type: string; handler: EventListenerOrEventListenerObject; options?: boolean | AddEventListenerOptions }[],
): (() => void) => {
  if (!isBrowser || !element) return () => {}

  // Add all event listeners
  events.forEach(({ type, handler, options }) => {
    element.addEventListener(type, handler, options)
  })

  // Return a cleanup function that removes all event listeners
  return () => {
    events.forEach(({ type, handler, options }) => {
      element.removeEventListener(type, handler, options)
    })
  }
}

/**
 * Safely add event listeners to multiple elements
 */
export const safeAddEventListenersToMultipleElements = (
  elements: (HTMLElement | null | undefined)[],
  type: string,
  handler: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  if (!isBrowser) return () => {}

  // Filter out null or undefined elements
  const validElements = elements.filter((element): element is HTMLElement => element !== null && element !== undefined)

  // Add event listeners to all valid elements
  validElements.forEach((element) => {
    element.addEventListener(type, handler, options)
  })

  // Return a cleanup function that removes all event listeners
  return () => {
    validElements.forEach((element) => {
      element.removeEventListener(type, handler, options)
    })
  }
}

/**
 * Safely delegate an event listener to child elements matching a selector
 */
export const safeAddDelegatedEventListener = (
  parentElement: HTMLElement | null | undefined,
  selector: string,
  eventType: string,
  handler: (event: Event, delegateTarget: HTMLElement) => void,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  if (!isBrowser || !parentElement) return () => {}

  const delegatedHandler = (event: Event) => {
    let target = event.target as HTMLElement | null

    while (target && target !== parentElement) {
      if (target.matches(selector)) {
        handler(event, target)
        return
      }
      target = target.parentElement
    }
  }

  parentElement.addEventListener(eventType, delegatedHandler, options)
  return () => parentElement.removeEventListener(eventType, delegatedHandler, options)
}
