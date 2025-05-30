"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  runAllErrorTests,
  testDOMErrorHandling,
  testNetworkErrorHandling,
  testRenderingErrorHandling,
  testStateErrorHandling,
} from "@/utils/error-testing"
import { getErrorLogs, clearErrorLogs, ErrorSeverity } from "@/utils/error-logger"
import ClientErrorBoundary from "@/components/ClientErrorBoundary"

export default function ErrorTestingPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)

  const handleRunAllTests = async () => {
    setIsRunningTests(true)
    clearErrorLogs()
    await runAllErrorTests()
    setLogs(getErrorLogs())
    setIsRunningTests(false)
  }

  const handleRunDOMTest = () => {
    clearErrorLogs()
    testDOMErrorHandling()
    setLogs(getErrorLogs())
  }

  const handleRunNetworkTest = async () => {
    setIsRunningTests(true)
    clearErrorLogs()
    await testNetworkErrorHandling()
    setLogs(getErrorLogs())
    setIsRunningTests(false)
  }

  const handleRunRenderingTest = () => {
    clearErrorLogs()
    testRenderingErrorHandling()
    setLogs(getErrorLogs())
  }

  const handleRunStateTest = () => {
    clearErrorLogs()
    testStateErrorHandling()
    setLogs(getErrorLogs())
  }

  const handleClearLogs = () => {
    clearErrorLogs()
    setLogs([])
  }

  return (
    <ClientErrorBoundary>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Error Handling Testing</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Test Error Handling</CardTitle>
              <CardDescription>Run tests to verify error handling mechanisms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleRunAllTests} className="w-full" disabled={isRunningTests}>
                {isRunningTests ? "Running Tests..." : "Run All Tests"}
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleRunDOMTest} variant="outline">
                  Test DOM Errors
                </Button>
                <Button onClick={handleRunNetworkTest} variant="outline" disabled={isRunningTests}>
                  Test Network Errors
                </Button>
                <Button onClick={handleRunRenderingTest} variant="outline">
                  Test Rendering Errors
                </Button>
                <Button onClick={handleRunStateTest} variant="outline">
                  Test State Errors
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleClearLogs} variant="ghost" className="w-full">
                Clear Logs
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Logs</CardTitle>
              <CardDescription>View logs from error handling tests</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] overflow-auto">
              {logs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No error logs to display</div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log, index) => (
                    <div key={index} className="p-3 bg-black/50 border rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${getSeverityColor(log.severity)}`}
                        >
                          {log.severity}
                        </span>
                        <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-sm font-medium mb-1">{log.message}</div>
                      <div className="text-xs text-gray-400 mb-2">Category: {log.category}</div>
                      {log.context && (
                        <div className="text-xs text-gray-400">
                          {log.context.component && <div>Component: {log.context.component}</div>}
                          {log.context.action && <div>Action: {log.context.action}</div>}
                        </div>
                      )}
                      {log.stack && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-400 cursor-pointer">Stack Trace</summary>
                          <pre className="text-xs text-gray-400 mt-1 p-2 bg-black/50 rounded overflow-x-auto">
                            {log.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientErrorBoundary>
  )
}

// Helper function to get severity color
function getSeverityColor(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      return "bg-red-500/20 text-red-500 border-red-500/30"
    case ErrorSeverity.HIGH:
      return "bg-orange-500/20 text-orange-500 border-orange-500/30"
    case ErrorSeverity.MEDIUM:
      return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
    case ErrorSeverity.LOW:
      return "bg-blue-500/20 text-blue-500 border-blue-500/30"
    default:
      return "bg-gray-500/20 text-gray-500 border-gray-500/30"
  }
}
