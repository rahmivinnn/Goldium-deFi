"use client"

import { useState, useEffect, useCallback } from "react"
import { useNetwork } from "@/components/NetworkContextProvider"
import { useWallet } from "@solana/wallet-adapter-react"
import { 
  getAnalyticsService, 
  EventCategory, 
  EventAction,
  EventData,
  PerformanceMetricData,
  FunnelStepData,
  AnalyticsConfig
} from "@/services/analytics"
import { TransactionType } from "@/services/transaction-tracking"

export function useAnalytics() {
  const { network } = useNetwork()
  const { publicKey } = useWallet()
  const [isEnabled, setIsEnabled] = useState<boolean>(true)
  
  // Get the analytics service
  const analyticsService = getAnalyticsService()
  
  // Track page view on mount
  useEffect(() => {
    if (isEnabled) {
      trackPageView(window.location.pathname)
    }
  }, [])
  
  // Track network changes
  useEffect(() => {
    if (isEnabled) {
      trackEvent({
        category: EventCategory.USER_ACTION,
        action: EventAction.NETWORK_CHANGE,
        label: network,
      })
    }
  }, [network, isEnabled])
  
  // Track wallet connection
  useEffect(() => {
    if (isEnabled && publicKey) {
      trackEvent({
        category: EventCategory.USER_ACTION,
        action: EventAction.WALLET_CONNECT,
      })
    }
  }, [publicKey, isEnabled])
  
  // Track page view
  const trackPageView = useCallback(
    (path: string, title?: string) => {
      if (!isEnabled) return
      
      analyticsService.trackEvent({
        category: EventCategory.USER_ACTION,
        action: EventAction.PAGE_VIEW,
        label: title || path,
        network,
        walletAddress: publicKey?.toString(),
        metadata: {
          path,
          title,
        },
      })
    },
    [analyticsService, network, publicKey, isEnabled]
  )
  
  // Track event
  const trackEvent = useCallback(
    (params: {
      category: EventCategory
      action: EventAction
      label?: string
      value?: number
      metadata?: Record<string, any>
    }) => {
      if (!isEnabled) return
      
      analyticsService.trackEvent({
        ...params,
        network,
        walletAddress: publicKey?.toString(),
      })
    },
    [analyticsService, network, publicKey, isEnabled]
  )
  
  // Track button click
  const trackButtonClick = useCallback(
    (buttonName: string, metadata?: Record<string, any>) => {
      if (!isEnabled) return
      
      analyticsService.trackEvent({
        category: EventCategory.USER_ACTION,
        action: EventAction.BUTTON_CLICK,
        label: buttonName,
        network,
        walletAddress: publicKey?.toString(),
        metadata,
      })
    },
    [analyticsService, network, publicKey, isEnabled]
  )
  
  // Track form submit
  const trackFormSubmit = useCallback(
    (formName: string, metadata?: Record<string, any>) => {
      if (!isEnabled) return
      
      analyticsService.trackEvent({
        category: EventCategory.USER_ACTION,
        action: EventAction.FORM_SUBMIT,
        label: formName,
        network,
        walletAddress: publicKey?.toString(),
        metadata,
      })
    },
    [analyticsService, network, publicKey, isEnabled]
  )
  
  // Track transaction
  const trackTransaction = useCallback(
    (params: {
      type: TransactionType
      action: 'initiated' | 'completed' | 'failed'
      transactionSignature?: string
      amount?: number
      token?: string
      metadata?: Record<string, any>
    }) => {
      if (!isEnabled) return
      
      analyticsService.trackTransaction({
        ...params,
        network,
        walletAddress: publicKey?.toString(),
      })
    },
    [analyticsService, network, publicKey, isEnabled]
  )
  
  // Track performance metric
  const trackPerformanceMetric = useCallback(
    (params: {
      name: string
      value: number
      unit: string
      metadata?: Record<string, any>
    }) => {
      if (!isEnabled) return
      
      analyticsService.trackPerformanceMetric({
        ...params,
        network,
        walletAddress: publicKey?.toString(),
      })
    },
    [analyticsService, network, publicKey, isEnabled]
  )
  
  // Track funnel step
  const trackFunnelStep = useCallback(
    (params: {
      funnelId: string
      stepNumber: number
      stepName: string
      completed: boolean
      timeSpent?: number
      metadata?: Record<string, any>
    }) => {
      if (!isEnabled) return
      
      analyticsService.trackFunnelStep({
        ...params,
        network,
        walletAddress: publicKey?.toString(),
      })
    },
    [analyticsService, network, publicKey, isEnabled]
  )
  
  // Start funnel tracking
  const startFunnelTracking = useCallback(
    (funnelId: string, funnelName: string) => {
      if (!isEnabled) return
      
      // Track first step
      trackFunnelStep({
        funnelId,
        stepNumber: 1,
        stepName: `${funnelName} - Start`,
        completed: true,
        metadata: {
          funnelName,
        },
      })
      
      return {
        trackStep: (stepNumber: number, stepName: string, completed: boolean = true, timeSpent?: number) => {
          trackFunnelStep({
            funnelId,
            stepNumber,
            stepName,
            completed,
            timeSpent,
            metadata: {
              funnelName,
            },
          })
        },
        completeFunnel: (timeSpent?: number) => {
          // Get all steps for this funnel
          const steps = analyticsService.getFunnelStepsByFunnelId(funnelId)
          
          // Find max step number
          const maxStep = steps.length > 0
            ? Math.max(...steps.map(step => step.stepNumber))
            : 0
          
          // Track final step
          trackFunnelStep({
            funnelId,
            stepNumber: maxStep + 1,
            stepName: `${funnelName} - Complete`,
            completed: true,
            timeSpent,
            metadata: {
              funnelName,
              isComplete: true,
            },
          })
        },
        abandonFunnel: (reason?: string) => {
          // Get all steps for this funnel
          const steps = analyticsService.getFunnelStepsByFunnelId(funnelId)
          
          // Find max step number
          const maxStep = steps.length > 0
            ? Math.max(...steps.map(step => step.stepNumber))
            : 0
          
          // Track abandonment
          trackFunnelStep({
            funnelId,
            stepNumber: maxStep + 1,
            stepName: `${funnelName} - Abandoned`,
            completed: false,
            metadata: {
              funnelName,
              isComplete: false,
              abandonReason: reason,
            },
          })
        },
      }
    },
    [analyticsService, trackFunnelStep, isEnabled]
  )
  
  // Get events
  const getEvents = useCallback(
    () => {
      return analyticsService.getEvents()
    },
    [analyticsService]
  )
  
  // Get events by category
  const getEventsByCategory = useCallback(
    (category: EventCategory) => {
      return analyticsService.getEventsByCategory(category)
    },
    [analyticsService]
  )
  
  // Get events by action
  const getEventsByAction = useCallback(
    (action: EventAction) => {
      return analyticsService.getEventsByAction(action)
    },
    [analyticsService]
  )
  
  // Get performance metrics
  const getPerformanceMetrics = useCallback(
    () => {
      return analyticsService.getPerformanceMetrics()
    },
    [analyticsService]
  )
  
  // Get funnel steps
  const getFunnelSteps = useCallback(
    () => {
      return analyticsService.getFunnelSteps()
    },
    [analyticsService]
  )
  
  // Get funnel completion rate
  const getFunnelCompletionRate = useCallback(
    (funnelId: string) => {
      return analyticsService.getFunnelCompletionRate(funnelId)
    },
    [analyticsService]
  )
  
  // Enable analytics
  const enableAnalytics = useCallback(
    () => {
      setIsEnabled(true)
      analyticsService.updateConfig({ enabled: true })
    },
    [analyticsService]
  )
  
  // Disable analytics
  const disableAnalytics = useCallback(
    () => {
      setIsEnabled(false)
      analyticsService.updateConfig({ enabled: false })
    },
    [analyticsService]
  )
  
  // Update analytics config
  const updateAnalyticsConfig = useCallback(
    (config: Partial<AnalyticsConfig>) => {
      analyticsService.updateConfig(config)
      if (config.enabled !== undefined) {
        setIsEnabled(config.enabled)
      }
    },
    [analyticsService]
  )
  
  // Clear analytics data
  const clearAnalyticsData = useCallback(
    () => {
      analyticsService.clearData()
    },
    [analyticsService]
  )
  
  return {
    isEnabled,
    trackPageView,
    trackEvent,
    trackButtonClick,
    trackFormSubmit,
    trackTransaction,
    trackPerformanceMetric,
    trackFunnelStep,
    startFunnelTracking,
    getEvents,
    getEventsByCategory,
    getEventsByAction,
    getPerformanceMetrics,
    getFunnelSteps,
    getFunnelCompletionRate,
    enableAnalytics,
    disableAnalytics,
    updateAnalyticsConfig,
    clearAnalyticsData,
  }
}
