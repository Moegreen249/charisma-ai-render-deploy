import { useState, useEffect, useCallback, useRef } from 'react';

// Import types directly to avoid module resolution issues
export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PAST_DUE = 'PAST_DUE',
  UNPAID = 'UNPAID',
  INCOMPLETE = 'INCOMPLETE'
}

export interface UserSubscription {
  id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: Date | string;
  currentPeriodEnd: Date | string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: readonly PlanFeature[];
  limits: PlanLimits;
}

export interface PlanFeature {
  name: string;
  description: string;
  included: boolean;
  limit?: number;
}

export interface PlanLimits {
  storiesPerMonth: number;
  apiCallsPerMonth: number;
  maxFileSize: number;
  prioritySupport: boolean;
  advancedAnalytics: boolean;
  concurrentTasks: number;
}

export interface UsageMetrics {
  storiesGenerated: number;
  storiesLimit: number;
  apiCallsUsed: number;
  apiCallsLimit: number;
  periodStart: Date;
  periodEnd: Date;
  filesProcessed: number;
  filesLimit: number;
}

// Types for the hook
export interface SubscriptionData {
  subscription: UserSubscription & { usage: UsageMetrics };
}

export interface UsageData {
  subscription: {
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  };
  plan: {
    name: string;
    limits: any;
  };
  usage: {
    stories: {
      used: number;
      limit: number;
      percentage: number;
      unlimited: boolean;
    };
    apiCalls: {
      used: number;
      limit: number;
      percentage: number;
      unlimited: boolean;
    };
    files: {
      used: number;
      limit: number;
      percentage: number;
      unlimited: boolean;
    };
  };
  period: {
    start: Date;
    end: Date;
    daysRemaining: number;
    totalDays: number;
    daysElapsed: number;
  };
  analytics: {
    dailyAverages: {
      stories: number;
      apiCalls: number;
    };
    projectedUsage: {
      stories: number;
      apiCalls: number;
    };
  };
  warnings: Array<{
    type: string;
    level: 'warning' | 'critical';
    message: string;
  }>;
}

export interface UpgradeResponse {
  subscription: {
    id: string;
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    updatedAt: Date;
  };
  previousPlan: SubscriptionPlan;
  newPlan: SubscriptionPlan;
  message: string;
}

export interface CancelResponse {
  subscription: {
    id: string;
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: Date;
  };
  message: string;
}

export interface SubscriptionError {
  message: string;
  code?: string;
  details?: any;
}

export interface UseSubscriptionOptions {
  refetchInterval?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface UseSubscriptionReturn {
  // Data
  subscription: SubscriptionData | null;
  usage: UsageData | null;
  
  // Loading states
  isLoading: boolean;
  isRefetching: boolean;
  isUpgrading: boolean;
  isCanceling: boolean;
  
  // Error states
  error: SubscriptionError | null;
  usageError: SubscriptionError | null;
  
  // Actions
  refetch: () => Promise<void>;
  refetchUsage: () => Promise<void>;
  changePlan: (tier: SubscriptionTier, options?: { stripeSubscriptionId?: string; billingEmail?: string; immediate?: boolean }) => Promise<UpgradeResponse>;
  upgradePlan: (tier: SubscriptionTier, options?: { stripeSubscriptionId?: string; billingEmail?: string }) => Promise<UpgradeResponse>;
  cancelSubscription: (immediate?: boolean) => Promise<CancelResponse>;
  
  // Retry mechanisms
  retry: () => Promise<void>;
  retryUsage: () => Promise<void>;
  
  // Utility functions
  canPerformAction: (action: 'generate_story' | 'api_call' | 'upload_file') => boolean;
  getUsageWarnings: () => Array<{ type: string; level: 'warning' | 'critical'; message: string }>;
}

const DEFAULT_OPTIONS: UseSubscriptionOptions = {
  refetchInterval: 5 * 60 * 1000, // 5 minutes
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

export function useSubscription(options: UseSubscriptionOptions = {}): UseSubscriptionReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // State management
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [error, setError] = useState<SubscriptionError | null>(null);
  const [usageError, setUsageError] = useState<SubscriptionError | null>(null);
  
  // Refs for cleanup and retry logic
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const usageRetryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper function to create error objects
  const createError = useCallback((message: string, code?: string, details?: any): SubscriptionError => ({
    message,
    code,
    details
  }), []);

  // Helper function for exponential backoff
  const getRetryDelay = useCallback((attempt: number): number => {
    return opts.retryDelay! * Math.pow(2, attempt);
  }, [opts.retryDelay]);

  // Fetch subscription data
  const fetchSubscription = useCallback(async (signal?: AbortSignal): Promise<void> => {
    try {
      const response = await fetch('/api/subscription', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw createError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          errorData.code || 'FETCH_ERROR',
          errorData
        );
      }

      const data = await response.json();
      setSubscription(data);
      setError(null);
      retryCountRef.current = 0;
    } catch (err) {
      if (signal?.aborted) return;
      
      const subscriptionError = err instanceof Error 
        ? createError(err.message, 'NETWORK_ERROR')
        : createError('Failed to fetch subscription data', 'UNKNOWN_ERROR');
      
      setError(subscriptionError);
      throw subscriptionError;
    }
  }, [createError]);

  // Fetch usage data
  const fetchUsage = useCallback(async (signal?: AbortSignal): Promise<void> => {
    try {
      const response = await fetch('/api/subscription/usage', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw createError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          errorData.code || 'FETCH_ERROR',
          errorData
        );
      }

      const data = await response.json();
      setUsage(data);
      setUsageError(null);
      usageRetryCountRef.current = 0;
    } catch (err) {
      if (signal?.aborted) return;
      
      const usageErr = err instanceof Error 
        ? createError(err.message, 'NETWORK_ERROR')
        : createError('Failed to fetch usage data', 'UNKNOWN_ERROR');
      
      setUsageError(usageErr);
      throw usageErr;
    }
  }, [createError]);

  // Retry mechanism for subscription data
  const retryFetchSubscription = useCallback(async (): Promise<void> => {
    if (retryCountRef.current >= opts.retryAttempts!) {
      return;
    }

    retryCountRef.current++;
    const delay = getRetryDelay(retryCountRef.current - 1);
    
    retryTimeoutRef.current = setTimeout(async () => {
      try {
        await fetchSubscription(abortControllerRef.current?.signal);
      } catch (err) {
        if (retryCountRef.current < opts.retryAttempts!) {
          await retryFetchSubscription();
        }
      }
    }, delay);
  }, [fetchSubscription, getRetryDelay, opts.retryAttempts]);

  // Retry mechanism for usage data
  const retryFetchUsage = useCallback(async (): Promise<void> => {
    if (usageRetryCountRef.current >= opts.retryAttempts!) {
      return;
    }

    usageRetryCountRef.current++;
    const delay = getRetryDelay(usageRetryCountRef.current - 1);
    
    retryTimeoutRef.current = setTimeout(async () => {
      try {
        await fetchUsage(abortControllerRef.current?.signal);
      } catch (err) {
        if (usageRetryCountRef.current < opts.retryAttempts!) {
          await retryFetchUsage();
        }
      }
    }, delay);
  }, [fetchUsage, getRetryDelay, opts.retryAttempts]);

  // Public refetch function
  const refetch = useCallback(async (): Promise<void> => {
    setIsRefetching(true);
    setError(null);
    
    // Cancel any existing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      await fetchSubscription(abortControllerRef.current.signal);
    } catch (err) {
      await retryFetchSubscription();
    } finally {
      setIsRefetching(false);
    }
  }, [fetchSubscription, retryFetchSubscription]);

  // Public refetch usage function
  const refetchUsage = useCallback(async (): Promise<void> => {
    setUsageError(null);
    
    try {
      await fetchUsage(abortControllerRef.current?.signal);
    } catch (err) {
      await retryFetchUsage();
    }
  }, [fetchUsage, retryFetchUsage]);

  // Plan change mutation (upgrade/downgrade)
  const changePlan = useCallback(async (
    tier: SubscriptionTier, 
    options?: { 
      stripeSubscriptionId?: string; 
      billingEmail?: string;
      immediate?: boolean;
    }
  ): Promise<UpgradeResponse> => {
    setIsUpgrading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          ...options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw createError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          errorData.code || 'PLAN_CHANGE_ERROR',
          errorData
        );
      }

      const data = await response.json();
      
      // Refresh subscription data after successful plan change
      await refetch();
      await refetchUsage();
      
      return data;
    } catch (err) {
      const planChangeError = err instanceof Error 
        ? createError(err.message, 'PLAN_CHANGE_ERROR')
        : createError('Failed to change subscription plan', 'UNKNOWN_ERROR');
      
      setError(planChangeError);
      throw planChangeError;
    } finally {
      setIsUpgrading(false);
    }
  }, [createError, refetch, refetchUsage]);

  // Legacy upgrade plan method for backward compatibility
  const upgradePlan = useCallback(async (
    tier: SubscriptionTier, 
    upgradeOptions?: { stripeSubscriptionId?: string; billingEmail?: string }
  ): Promise<UpgradeResponse> => {
    return changePlan(tier, upgradeOptions);
  }, [changePlan]);

  // Cancel subscription mutation
  const cancelSubscription = useCallback(async (immediate: boolean = false): Promise<CancelResponse> => {
    setIsCanceling(true);
    setError(null);

    try {
      const url = new URL('/api/subscription', window.location.origin);
      if (immediate) {
        url.searchParams.set('immediate', 'true');
      }

      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw createError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          errorData.code || 'CANCEL_ERROR',
          errorData
        );
      }

      const data = await response.json();
      
      // Refresh subscription data after successful cancellation
      await refetch();
      
      return data;
    } catch (err) {
      const cancelError = err instanceof Error 
        ? createError(err.message, 'CANCEL_ERROR')
        : createError('Failed to cancel subscription', 'UNKNOWN_ERROR');
      
      setError(cancelError);
      throw cancelError;
    } finally {
      setIsCanceling(false);
    }
  }, [createError, refetch]);

  // Manual retry function
  const retry = useCallback(async (): Promise<void> => {
    retryCountRef.current = 0;
    await refetch();
  }, [refetch]);

  // Manual retry usage function
  const retryUsage = useCallback(async (): Promise<void> => {
    usageRetryCountRef.current = 0;
    await refetchUsage();
  }, [refetchUsage]);

  // Utility function to check if user can perform an action
  const canPerformAction = useCallback((action: 'generate_story' | 'api_call' | 'upload_file'): boolean => {
    if (!usage || !subscription) return false;
    
    const { subscription: subData } = usage;
    if (subData.status !== SubscriptionStatus.ACTIVE) return false;

    switch (action) {
      case 'generate_story':
        return usage.usage.stories.unlimited || usage.usage.stories.used < usage.usage.stories.limit;
      case 'api_call':
        return usage.usage.apiCalls.unlimited || usage.usage.apiCalls.used < usage.usage.apiCalls.limit;
      case 'upload_file':
        return usage.usage.files.unlimited || usage.usage.files.used < usage.usage.files.limit;
      default:
        return false;
    }
  }, [usage, subscription]);

  // Get usage warnings
  const getUsageWarnings = useCallback(() => {
    return usage?.warnings || [];
  }, [usage]);

  // Initial data fetch
  useEffect(() => {
    let mounted = true;
    
    const initialFetch = async () => {
      setIsLoading(true);
      
      // Cancel any existing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      try {
        // Fetch both subscription and usage data in parallel
        await Promise.all([
          fetchSubscription(abortControllerRef.current.signal),
          fetchUsage(abortControllerRef.current.signal)
        ]);
      } catch (err) {
        // Errors are handled in individual fetch functions
        // Try to retry if initial fetch fails
        if (mounted) {
          await Promise.all([
            retryFetchSubscription(),
            retryFetchUsage()
          ]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initialFetch();

    return () => {
      mounted = false;
    };
  }, [fetchSubscription, fetchUsage, retryFetchSubscription, retryFetchUsage]);

  // Set up periodic refetch
  useEffect(() => {
    if (opts.refetchInterval && opts.refetchInterval > 0) {
      refetchIntervalRef.current = setInterval(() => {
        if (!isLoading && !isRefetching) {
          refetch();
          refetchUsage();
        }
      }, opts.refetchInterval);

      return () => {
        if (refetchIntervalRef.current) {
          clearInterval(refetchIntervalRef.current);
        }
      };
    }
  }, [opts.refetchInterval, isLoading, isRefetching, refetch, refetchUsage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (refetchIntervalRef.current) {
        clearInterval(refetchIntervalRef.current);
      }
    };
  }, []);

  return {
    // Data
    subscription,
    usage,
    
    // Loading states
    isLoading,
    isRefetching,
    isUpgrading,
    isCanceling,
    
    // Error states
    error,
    usageError,
    
    // Actions
    refetch,
    refetchUsage,
    changePlan,
    upgradePlan,
    cancelSubscription,
    
    // Retry mechanisms
    retry,
    retryUsage,
    
    // Utility functions
    canPerformAction,
    getUsageWarnings,
  };
}