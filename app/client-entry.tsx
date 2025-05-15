"use client"

import { useEffect, useRef } from "react"
import { safeInitialize } from "@/utils/safe-init"
import { isBrowser } from "@/utils/browser"

export default function ClientEntry() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    safeInitialize(() => {
      console.log("Application initialized successfully")

      // Set up global error handler for addEventListener errors
      if (isBrowser) {
        const originalAddEventListener = EventTarget.prototype.addEventListener

        EventTarget.prototype.addEventListener = function (
          type: string,
          listener: EventListenerOrEventListenerObject,
          options?: boolean | AddEventListenerOptions,
        ) {
          try {
            return originalAddEventListener.call(this, type, listener, options)
          } catch (error) {
            console.error(
              `Error adding ${type} event listener:`,
              error,
              `\nElement:`,
              this,
              `\nStack:`,
              new Error().stack,
            )
            // Return a no-op function to prevent further errors
            return () => {}
          }
        }

        console.log("Installed global addEventListener error handler")
      }
    })

    return () => {
      initialized.current = false
    }
  }, [])

  return null
}
