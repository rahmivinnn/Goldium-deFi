/**
 * Utility for testing error handling
 */

import { logError, ErrorSeverity, ErrorCategory } from "./error-logger"

/**
 * Test DOM error handling
 */
export function testDOMErrorHandling(): void {
  try {
    // Attempt to access a non-existent DOM element
    const element = document.getElementById("non-existent-element")
    element!.addEventListener("click", () => {})
  } catch (error) {
    logError(error instanceof Error ? error : new Error("DOM error test"), ErrorSeverity.MEDIUM, ErrorCategory.DOM, {
      action: "testDOMErrorHandling",
    })
    return
  }
}

/**
 * Test network error handling
 */
export async function testNetworkErrorHandling(): Promise<void> {
  try {
    // Attempt to fetch from a non-existent URL
    await fetch("https://non-existent-url.example")
  } catch (error) {
    logError(
      error instanceof Error ? error : new Error("Network error test"),
      ErrorSeverity.MEDIUM,
      ErrorCategory.NETWORK,
      { action: "testNetworkErrorHandling" },
    )
    return
  }
}

/**
 * Test rendering error handling
 */
export function testRenderingErrorHandling(): void {
  try {
    // Create an invalid rendering operation
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    // @ts-ignore - Intentionally cause an error
    ctx!.drawImage(null, 0, 0)
  } catch (error) {
    logError(
      error instanceof Error ? error : new Error("Rendering error test"),
      ErrorSeverity.MEDIUM,
      ErrorCategory.RENDERING,
      { action: "testRenderingErrorHandling" },
    )
    return
  }
}

/**
 * Test state error handling
 */
export function testStateErrorHandling(): void {
  try {
    // Create an invalid state operation
    const obj = Object.freeze({ name: "Test" })
    // @ts-ignore - Intentionally cause an error
    obj.name = "Modified"
  } catch (error) {
    logError(
      error instanceof Error ? error : new Error("State error test"),
      ErrorSeverity.MEDIUM,
      ErrorCategory.STATE,
      { action: "testStateErrorHandling" },
    )
    return
  }
}

/**
 * Run all error handling tests
 */
export async function runAllErrorTests(): Promise<void> {
  console.log("Running error handling tests...")

  testDOMErrorHandling()
  await testNetworkErrorHandling()
  testRenderingErrorHandling()
  testStateErrorHandling()

  console.log("Error handling tests completed")
}
