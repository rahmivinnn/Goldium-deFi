"use client"

import { NetworkType } from "@/components/NetworkContextProvider"
import { TransactionType } from "@/services/transaction-tracking"

// Event categories
export enum EventCategory {
  TRANSACTION = 'transaction',
  USER_ACTION = 'user_action',
  SYSTEM = 'system',
  ERROR = 'error',
  PERFORMANCE = 'performance',
}

// Event actions
export enum EventAction {
  // Transaction events
  SWAP_INITIATED = 'swap_initiated',
  SWAP_COMPLETED = 'swap_completed',
  SWAP_FAILED = 'swap_failed',
  STAKE_INITIATED = 'stake_initiated',
  STAKE_COMPLETED = 'stake_completed',
  STAKE_FAILED = 'stake_failed',
  UNSTAKE_INITIATED = 'unstake_initiated',
  UNSTAKE_COMPLETED = 'unstake_completed',
  UNSTAKE_FAILED = 'unstake_failed',
  CLAIM_REWARDS_INITIATED = 'claim_rewards_initiated',
  CLAIM_REWARDS_COMPLETED = 'claim_rewards_completed',
  CLAIM_REWARDS_FAILED = 'claim_rewards_failed',
  ADD_LIQUIDITY_INITIATED = 'add_liquidity_initiated',
  ADD_LIQUIDITY_COMPLETED = 'add_liquidity_completed',
  ADD_LIQUIDITY_FAILED = 'add_liquidity_failed',
  REMOVE_LIQUIDITY_INITIATED = 'remove_liquidity_initiated',
  REMOVE_LIQUIDITY_COMPLETED = 'remove_liquidity_completed',
  REMOVE_LIQUIDITY_FAILED = 'remove_liquidity_failed',
  CLAIM_FEES_INITIATED = 'claim_fees_initiated',
  CLAIM_FEES_COMPLETED = 'claim_fees_completed',
  CLAIM_FEES_FAILED = 'claim_fees_failed',
  
  // User action events
  PAGE_VIEW = 'page_view',
  BUTTON_CLICK = 'button_click',
  FORM_SUBMIT = 'form_submit',
  WALLET_CONNECT = 'wallet_connect',
  WALLET_DISCONNECT = 'wallet_disconnect',
  NETWORK_CHANGE = 'network_change',
  SETTINGS_CHANGE = 'settings_change',
  
  // System events
  APP_LOAD = 'app_load',
  APP_ERROR = 'app_error',
  NETWORK_ERROR = 'network_error',
  RPC_ERROR = 'rpc_error',
  
  // Performance events
  PAGE_LOAD_TIME = 'page_load_time',
  TRANSACTION_TIME = 'transaction_time',
  API_RESPONSE_TIME = 'api_response_time',
  RPC_RESPONSE_TIME = 'rpc_response_time',
}

// Event data structure
export interface EventData {
  id: string;
  timestamp: number;
  category: EventCategory;
  action: EventAction;
  label?: string;
  value?: number;
  network?: NetworkType;
  walletAddress?: string;
  transactionSignature?: string;
  metadata?: Record<string, any>;
  sessionId: string;
}

// Performance metric data structure
export interface PerformanceMetricData {
  id: string;
  timestamp: number;
  name: string;
  value: number;
  unit: string;
  network?: NetworkType;
  walletAddress?: string;
  metadata?: Record<string, any>;
  sessionId: string;
}

// Funnel step data structure
export interface FunnelStepData {
  id: string;
  timestamp: number;
  funnelId: string;
  stepNumber: number;
  stepName: string;
  completed: boolean;
  timeSpent?: number;
  network?: NetworkType;
  walletAddress?: string;
  metadata?: Record<string, any>;
  sessionId: string;
}

// Analytics configuration
export interface AnalyticsConfig {
  enabled: boolean;
  anonymizeIp: boolean;
  trackWalletAddresses: boolean;
  sessionTimeout: number; // milliseconds
  samplingRate: number; // 0-1
}

/**
 * Analytics service for tracking user interactions and performance metrics
 */
export class AnalyticsService {
  private events: EventData[] = [];
  private performanceMetrics: PerformanceMetricData[] = [];
  private funnelSteps: FunnelStepData[] = [];
  private config: AnalyticsConfig;
  private sessionId: string;
  private sessionStartTime: number;
  private lastActivityTime: number;
  private isInitialized: boolean = false;
  
  constructor(config?: Partial<AnalyticsConfig>) {
    // Default configuration
    this.config = {
      enabled: true,
      anonymizeIp: true,
      trackWalletAddresses: false,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      samplingRate: 1.0, // 100% of events
      ...config,
    };
    
    // Generate session ID
    this.sessionId = this.generateId();
    this.sessionStartTime = Date.now();
    this.lastActivityTime = this.sessionStartTime;
    
    // Load data from local storage
    this.loadData();
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Initialize the analytics service
   */
  private initialize(): void {
    if (this.isInitialized) return;
    
    // Track app load event
    this.trackEvent({
      category: EventCategory.SYSTEM,
      action: EventAction.APP_LOAD,
    });
    
    // Set up session tracking
    this.setupSessionTracking();
    
    // Set up performance tracking
    this.setupPerformanceTracking();
    
    this.isInitialized = true;
  }
  
  /**
   * Set up session tracking
   */
  private setupSessionTracking(): void {
    // Check for session timeout
    const checkSession = () => {
      const now = Date.now();
      if (now - this.lastActivityTime > this.config.sessionTimeout) {
        // Session expired, create a new one
        this.sessionId = this.generateId();
        this.sessionStartTime = now;
      }
      this.lastActivityTime = now;
    };
    
    // Update last activity time on user interaction
    const updateActivity = () => {
      this.lastActivityTime = Date.now();
    };
    
    // Add event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('click', updateActivity);
      window.addEventListener('keydown', updateActivity);
      window.addEventListener('mousemove', updateActivity);
      window.addEventListener('scroll', updateActivity);
      
      // Check session every minute
      setInterval(checkSession, 60000);
    }
  }
  
  /**
   * Set up performance tracking
   */
  private setupPerformanceTracking(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Track page load time
      window.addEventListener('load', () => {
        const pageLoadTime = performance.now();
        this.trackPerformanceMetric({
          name: 'page_load_time',
          value: pageLoadTime,
          unit: 'ms',
        });
      });
      
      // Track navigation timing metrics
      setTimeout(() => {
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navTiming) {
          this.trackPerformanceMetric({
            name: 'dom_complete',
            value: navTiming.domComplete,
            unit: 'ms',
          });
          
          this.trackPerformanceMetric({
            name: 'dom_interactive',
            value: navTiming.domInteractive,
            unit: 'ms',
          });
          
          this.trackPerformanceMetric({
            name: 'load_event_end',
            value: navTiming.loadEventEnd,
            unit: 'ms',
          });
        }
      }, 0);
    }
  }
  
  /**
   * Track an event
   */
  public trackEvent(params: {
    category: EventCategory;
    action: EventAction;
    label?: string;
    value?: number;
    network?: NetworkType;
    walletAddress?: string;
    transactionSignature?: string;
    metadata?: Record<string, any>;
  }): void {
    if (!this.config.enabled) return;
    
    // Apply sampling
    if (Math.random() > this.config.samplingRate) return;
    
    // Create event data
    const event: EventData = {
      id: this.generateId(),
      timestamp: Date.now(),
      category: params.category,
      action: params.action,
      label: params.label,
      value: params.value,
      network: params.network,
      walletAddress: this.config.trackWalletAddresses ? params.walletAddress : undefined,
      transactionSignature: params.transactionSignature,
      metadata: params.metadata,
      sessionId: this.sessionId,
    };
    
    // Add to events list
    this.events.push(event);
    
    // Save to local storage
    this.saveData();
    
    // Send to analytics endpoint (if implemented)
    this.sendEvent(event);
  }
  
  /**
   * Track a performance metric
   */
  public trackPerformanceMetric(params: {
    name: string;
    value: number;
    unit: string;
    network?: NetworkType;
    walletAddress?: string;
    metadata?: Record<string, any>;
  }): void {
    if (!this.config.enabled) return;
    
    // Apply sampling
    if (Math.random() > this.config.samplingRate) return;
    
    // Create performance metric data
    const metric: PerformanceMetricData = {
      id: this.generateId(),
      timestamp: Date.now(),
      name: params.name,
      value: params.value,
      unit: params.unit,
      network: params.network,
      walletAddress: this.config.trackWalletAddresses ? params.walletAddress : undefined,
      metadata: params.metadata,
      sessionId: this.sessionId,
    };
    
    // Add to performance metrics list
    this.performanceMetrics.push(metric);
    
    // Save to local storage
    this.saveData();
    
    // Send to analytics endpoint (if implemented)
    this.sendPerformanceMetric(metric);
  }
  
  /**
   * Track a funnel step
   */
  public trackFunnelStep(params: {
    funnelId: string;
    stepNumber: number;
    stepName: string;
    completed: boolean;
    timeSpent?: number;
    network?: NetworkType;
    walletAddress?: string;
    metadata?: Record<string, any>;
  }): void {
    if (!this.config.enabled) return;
    
    // Apply sampling
    if (Math.random() > this.config.samplingRate) return;
    
    // Create funnel step data
    const step: FunnelStepData = {
      id: this.generateId(),
      timestamp: Date.now(),
      funnelId: params.funnelId,
      stepNumber: params.stepNumber,
      stepName: params.stepName,
      completed: params.completed,
      timeSpent: params.timeSpent,
      network: params.network,
      walletAddress: this.config.trackWalletAddresses ? params.walletAddress : undefined,
      metadata: params.metadata,
      sessionId: this.sessionId,
    };
    
    // Add to funnel steps list
    this.funnelSteps.push(step);
    
    // Save to local storage
    this.saveData();
    
    // Send to analytics endpoint (if implemented)
    this.sendFunnelStep(step);
  }
  
  /**
   * Track a transaction event
   */
  public trackTransaction(params: {
    type: TransactionType;
    action: 'initiated' | 'completed' | 'failed';
    network: NetworkType;
    walletAddress?: string;
    transactionSignature?: string;
    amount?: number;
    token?: string;
    metadata?: Record<string, any>;
  }): void {
    // Map transaction type and action to event action
    let eventAction: EventAction;
    
    switch (params.type) {
      case TransactionType.SWAP:
        eventAction = params.action === 'initiated'
          ? EventAction.SWAP_INITIATED
          : params.action === 'completed'
            ? EventAction.SWAP_COMPLETED
            : EventAction.SWAP_FAILED;
        break;
      case TransactionType.STAKE:
        eventAction = params.action === 'initiated'
          ? EventAction.STAKE_INITIATED
          : params.action === 'completed'
            ? EventAction.STAKE_COMPLETED
            : EventAction.STAKE_FAILED;
        break;
      case TransactionType.UNSTAKE:
        eventAction = params.action === 'initiated'
          ? EventAction.UNSTAKE_INITIATED
          : params.action === 'completed'
            ? EventAction.UNSTAKE_COMPLETED
            : EventAction.UNSTAKE_FAILED;
        break;
      case TransactionType.CLAIM_REWARDS:
        eventAction = params.action === 'initiated'
          ? EventAction.CLAIM_REWARDS_INITIATED
          : params.action === 'completed'
            ? EventAction.CLAIM_REWARDS_COMPLETED
            : EventAction.CLAIM_REWARDS_FAILED;
        break;
      case TransactionType.ADD_LIQUIDITY:
        eventAction = params.action === 'initiated'
          ? EventAction.ADD_LIQUIDITY_INITIATED
          : params.action === 'completed'
            ? EventAction.ADD_LIQUIDITY_COMPLETED
            : EventAction.ADD_LIQUIDITY_FAILED;
        break;
      case TransactionType.REMOVE_LIQUIDITY:
        eventAction = params.action === 'initiated'
          ? EventAction.REMOVE_LIQUIDITY_INITIATED
          : params.action === 'completed'
            ? EventAction.REMOVE_LIQUIDITY_COMPLETED
            : EventAction.REMOVE_LIQUIDITY_FAILED;
        break;
      case TransactionType.CLAIM_FEES:
        eventAction = params.action === 'initiated'
          ? EventAction.CLAIM_FEES_INITIATED
          : params.action === 'completed'
            ? EventAction.CLAIM_FEES_COMPLETED
            : EventAction.CLAIM_FEES_FAILED;
        break;
      default:
        eventAction = params.action === 'initiated'
          ? EventAction.SWAP_INITIATED
          : params.action === 'completed'
            ? EventAction.SWAP_COMPLETED
            : EventAction.SWAP_FAILED;
    }
    
    // Track the event
    this.trackEvent({
      category: EventCategory.TRANSACTION,
      action: eventAction,
      label: params.type,
      value: params.amount,
      network: params.network,
      walletAddress: params.walletAddress,
      transactionSignature: params.transactionSignature,
      metadata: {
        ...params.metadata,
        token: params.token,
      },
    });
  }
  
  /**
   * Get all events
   */
  public getEvents(): EventData[] {
    return [...this.events];
  }
  
  /**
   * Get events by category
   */
  public getEventsByCategory(category: EventCategory): EventData[] {
    return this.events.filter(event => event.category === category);
  }
  
  /**
   * Get events by action
   */
  public getEventsByAction(action: EventAction): EventData[] {
    return this.events.filter(event => event.action === action);
  }
  
  /**
   * Get all performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetricData[] {
    return [...this.performanceMetrics];
  }
  
  /**
   * Get all funnel steps
   */
  public getFunnelSteps(): FunnelStepData[] {
    return [...this.funnelSteps];
  }
  
  /**
   * Get funnel steps by funnel ID
   */
  public getFunnelStepsByFunnelId(funnelId: string): FunnelStepData[] {
    return this.funnelSteps.filter(step => step.funnelId === funnelId);
  }
  
  /**
   * Get funnel completion rate
   */
  public getFunnelCompletionRate(funnelId: string): number {
    const steps = this.getFunnelStepsByFunnelId(funnelId);
    
    if (steps.length === 0) return 0;
    
    // Group by session ID
    const sessionSteps: Record<string, FunnelStepData[]> = {};
    
    steps.forEach(step => {
      if (!sessionSteps[step.sessionId]) {
        sessionSteps[step.sessionId] = [];
      }
      sessionSteps[step.sessionId].push(step);
    });
    
    // Count completed funnels
    let completedFunnels = 0;
    let totalFunnels = 0;
    
    Object.values(sessionSteps).forEach(sessionSteps => {
      // Sort by step number
      sessionSteps.sort((a, b) => a.stepNumber - b.stepNumber);
      
      // Get max step number
      const maxStep = Math.max(...sessionSteps.map(step => step.stepNumber));
      
      // Check if the last step is completed
      const lastStep = sessionSteps.find(step => step.stepNumber === maxStep);
      
      if (lastStep && lastStep.completed) {
        completedFunnels++;
      }
      
      totalFunnels++;
    });
    
    return totalFunnels > 0 ? completedFunnels / totalFunnels : 0;
  }
  
  /**
   * Clear all analytics data
   */
  public clearData(): void {
    this.events = [];
    this.performanceMetrics = [];
    this.funnelSteps = [];
    
    // Clear local storage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('goldium-analytics-events');
      localStorage.removeItem('goldium-analytics-metrics');
      localStorage.removeItem('goldium-analytics-funnels');
    }
  }
  
  /**
   * Update configuration
   */
  public updateConfig(config: Partial<AnalyticsConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }
  
  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
  
  /**
   * Save data to local storage
   */
  private saveData(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      localStorage.setItem('goldium-analytics-events', JSON.stringify(this.events));
      localStorage.setItem('goldium-analytics-metrics', JSON.stringify(this.performanceMetrics));
      localStorage.setItem('goldium-analytics-funnels', JSON.stringify(this.funnelSteps));
    } catch (e) {
      console.error('Failed to save analytics data to local storage:', e);
    }
  }
  
  /**
   * Load data from local storage
   */
  private loadData(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const eventsData = localStorage.getItem('goldium-analytics-events');
      const metricsData = localStorage.getItem('goldium-analytics-metrics');
      const funnelsData = localStorage.getItem('goldium-analytics-funnels');
      
      if (eventsData) {
        this.events = JSON.parse(eventsData);
      }
      
      if (metricsData) {
        this.performanceMetrics = JSON.parse(metricsData);
      }
      
      if (funnelsData) {
        this.funnelSteps = JSON.parse(funnelsData);
      }
    } catch (e) {
      console.error('Failed to load analytics data from local storage:', e);
    }
  }
  
  /**
   * Send event to analytics endpoint
   */
  private sendEvent(event: EventData): void {
    // This is a placeholder. In a real app, you would send the event to your analytics endpoint.
    // For now, we'll just log it to the console in development.
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }
  }
  
  /**
   * Send performance metric to analytics endpoint
   */
  private sendPerformanceMetric(metric: PerformanceMetricData): void {
    // This is a placeholder. In a real app, you would send the metric to your analytics endpoint.
    // For now, we'll just log it to the console in development.
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metric:', metric);
    }
  }
  
  /**
   * Send funnel step to analytics endpoint
   */
  private sendFunnelStep(step: FunnelStepData): void {
    // This is a placeholder. In a real app, you would send the step to your analytics endpoint.
    // For now, we'll just log it to the console in development.
    if (process.env.NODE_ENV === 'development') {
      console.log('Funnel Step:', step);
    }
  }
}

// Singleton instance
let analyticsService: AnalyticsService | null = null;

/**
 * Get the analytics service instance
 */
export function getAnalyticsService(config?: Partial<AnalyticsConfig>): AnalyticsService {
  if (!analyticsService) {
    analyticsService = new AnalyticsService(config);
  } else if (config) {
    analyticsService.updateConfig(config);
  }
  
  return analyticsService;
}
