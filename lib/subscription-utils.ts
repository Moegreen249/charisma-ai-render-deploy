import { SubscriptionTier, SubscriptionStatus, SubscriptionPlan } from '@/lib/types';

// Import SUBSCRIPTION_PLANS statically to avoid server imports
export const SUBSCRIPTION_PLANS = {
  [SubscriptionTier.FREE]: {
    id: SubscriptionTier.FREE,
    name: 'Free',
    tier: SubscriptionTier.FREE,
    price: 0,
    currency: 'USD',
    interval: 'month' as const,
    description: 'Perfect for getting started',
    features: [
      { name: 'Stories per month', description: '5 stories', included: true, limit: 5 },
      { name: 'API calls', description: '1,000 per month', included: true, limit: 1000 },
      { name: 'File size limit', description: '5 MB max', included: true, limit: 5 },
      { name: 'Priority support', description: 'Email support', included: false },
      { name: 'Advanced analytics', description: 'Detailed insights', included: false },
      { name: 'Custom templates', description: 'Create your own', included: false },
      { name: 'API access', description: 'Direct API usage', included: false },
    ],
    limits: {
      storiesPerMonth: 5,
      apiCallsPerMonth: 1000,
      maxFileSize: 5,
      prioritySupport: false,
      advancedAnalytics: false,
      concurrentTasks: 1,
    }
  },
  [SubscriptionTier.PRO]: {
    id: SubscriptionTier.PRO,
    name: 'Pro',
    tier: SubscriptionTier.PRO,
    price: 9.99,
    currency: 'USD',
    interval: 'month' as const,
    description: 'For serious storytellers',
    features: [
      { name: 'Stories per month', description: '50 stories', included: true, limit: 50 },
      { name: 'API calls', description: '10,000 per month', included: true, limit: 10000 },
      { name: 'File size limit', description: '50 MB max', included: true, limit: 50 },
      { name: 'Priority support', description: 'Chat support', included: true },
      { name: 'Advanced analytics', description: 'Detailed insights', included: true },
      { name: 'Custom templates', description: 'Create your own', included: true },
      { name: 'API access', description: 'Direct API usage', included: true },
    ],
    limits: {
      storiesPerMonth: 50,
      apiCallsPerMonth: 10000,
      maxFileSize: 50,
      prioritySupport: true,
      advancedAnalytics: true,
      concurrentTasks: 5,
    }
  },
  [SubscriptionTier.ENTERPRISE]: {
    id: SubscriptionTier.ENTERPRISE,
    name: 'Enterprise',
    tier: SubscriptionTier.ENTERPRISE,
    price: 29.99,
    currency: 'USD',
    interval: 'month' as const,
    description: 'Unlimited everything',
    features: [
      { name: 'Stories per month', description: 'Unlimited', included: true, limit: -1 },
      { name: 'API calls', description: '100,000 per month', included: true, limit: 100000 },
      { name: 'File size limit', description: '500 MB max', included: true, limit: 500 },
      { name: 'Priority support', description: 'Phone support', included: true },
      { name: 'Advanced analytics', description: 'Full dashboard', included: true },
      { name: 'Custom templates', description: 'Unlimited custom', included: true },
      { name: 'API access', description: 'Full API access', included: true },
    ],
    limits: {
      storiesPerMonth: -1, // Unlimited
      apiCallsPerMonth: 100000,
      maxFileSize: 500,
      prioritySupport: true,
      advancedAnalytics: true,
      concurrentTasks: 10,
    }
  }
} as Record<SubscriptionTier, SubscriptionPlan>;

/**
 * Utility functions for subscription management
 */

export interface BillingCycle {
  start: Date;
  end: Date;
  daysRemaining: number;
  isExpired: boolean;
}

export interface SubscriptionComparison {
  current: SubscriptionTier;
  target: SubscriptionTier;
  isUpgrade: boolean;
  isDowngrade: boolean;
  priceDifference: number;
  featureChanges: FeatureChange[];
}

export interface FeatureChange {
  feature: string;
  currentValue: boolean | number;
  newValue: boolean | number;
  changeType: 'added' | 'removed' | 'increased' | 'decreased' | 'unchanged';
}

/**
 * Calculate billing cycle information
 */
export function calculateBillingCycle(periodStart: Date, periodEnd: Date): BillingCycle {
  const now = new Date();
  const timeDiff = periodEnd.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
  
  return {
    start: periodStart,
    end: periodEnd,
    daysRemaining,
    isExpired: now > periodEnd
  };
}

/**
 * Compare subscription tiers and calculate differences
 */
export function compareSubscriptionTiers(
  currentTier: SubscriptionTier, 
  targetTier: SubscriptionTier
): SubscriptionComparison {
  const currentPlan = SUBSCRIPTION_PLANS[currentTier];
  const targetPlan = SUBSCRIPTION_PLANS[targetTier];
  
  const tierOrder = {
    [SubscriptionTier.FREE]: 0,
    [SubscriptionTier.PRO]: 1,
    [SubscriptionTier.ENTERPRISE]: 2
  };

  const isUpgrade = tierOrder[targetTier] > tierOrder[currentTier];
  const isDowngrade = tierOrder[targetTier] < tierOrder[currentTier];
  const priceDifference = targetPlan.price - currentPlan.price;

  // Calculate feature changes
  const featureChanges: FeatureChange[] = [];
  
  // Compare limits
  const currentLimits = currentPlan.limits;
  const targetLimits = targetPlan.limits;
  
  // Stories per month
  if (currentLimits.storiesPerMonth !== targetLimits.storiesPerMonth) {
    featureChanges.push({
      feature: 'Stories per month',
      currentValue: currentLimits.storiesPerMonth === -1 ? Infinity : currentLimits.storiesPerMonth,
      newValue: targetLimits.storiesPerMonth === -1 ? Infinity : targetLimits.storiesPerMonth,
      changeType: targetLimits.storiesPerMonth > currentLimits.storiesPerMonth ? 'increased' : 'decreased'
    });
  }

  // API calls per month
  if (currentLimits.apiCallsPerMonth !== targetLimits.apiCallsPerMonth) {
    featureChanges.push({
      feature: 'API calls per month',
      currentValue: currentLimits.apiCallsPerMonth === -1 ? Infinity : currentLimits.apiCallsPerMonth,
      newValue: targetLimits.apiCallsPerMonth === -1 ? Infinity : targetLimits.apiCallsPerMonth,
      changeType: targetLimits.apiCallsPerMonth > currentLimits.apiCallsPerMonth ? 'increased' : 'decreased'
    });
  }

  // Max file size
  if (currentLimits.maxFileSize !== targetLimits.maxFileSize) {
    featureChanges.push({
      feature: 'Max file size (MB)',
      currentValue: currentLimits.maxFileSize,
      newValue: targetLimits.maxFileSize,
      changeType: targetLimits.maxFileSize > currentLimits.maxFileSize ? 'increased' : 'decreased'
    });
  }

  // Priority support
  if (currentLimits.prioritySupport !== targetLimits.prioritySupport) {
    featureChanges.push({
      feature: 'Priority support',
      currentValue: currentLimits.prioritySupport,
      newValue: targetLimits.prioritySupport,
      changeType: targetLimits.prioritySupport ? 'added' : 'removed'
    });
  }

  // Advanced analytics
  if (currentLimits.advancedAnalytics !== targetLimits.advancedAnalytics) {
    featureChanges.push({
      feature: 'Advanced analytics',
      currentValue: currentLimits.advancedAnalytics,
      newValue: targetLimits.advancedAnalytics,
      changeType: targetLimits.advancedAnalytics ? 'added' : 'removed'
    });
  }

  // Concurrent tasks
  if (currentLimits.concurrentTasks !== targetLimits.concurrentTasks) {
    featureChanges.push({
      feature: 'Concurrent tasks',
      currentValue: currentLimits.concurrentTasks,
      newValue: targetLimits.concurrentTasks,
      changeType: targetLimits.concurrentTasks > currentLimits.concurrentTasks ? 'increased' : 'decreased'
    });
  }

  return {
    current: currentTier,
    target: targetTier,
    isUpgrade,
    isDowngrade,
    priceDifference,
    featureChanges
  };
}

/**
 * Format subscription status for display
 */
export function formatSubscriptionStatus(status: SubscriptionStatus): string {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return 'Active';
    case SubscriptionStatus.CANCELED:
      return 'Canceled';
    case SubscriptionStatus.PAST_DUE:
      return 'Past Due';
    case SubscriptionStatus.UNPAID:
      return 'Unpaid';
    case SubscriptionStatus.INCOMPLETE:
      return 'Incomplete';
    default:
      return 'Unknown';
  }
}

/**
 * Get subscription status color for UI
 */
export function getSubscriptionStatusColor(status: SubscriptionStatus): string {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return 'green';
    case SubscriptionStatus.CANCELED:
      return 'gray';
    case SubscriptionStatus.PAST_DUE:
      return 'yellow';
    case SubscriptionStatus.UNPAID:
      return 'red';
    case SubscriptionStatus.INCOMPLETE:
      return 'orange';
    default:
      return 'gray';
  }
}

/**
 * Calculate usage percentage
 */
export function calculateUsagePercentage(used: number, limit: number): number {
  if (limit === -1 || limit === Infinity) {
    return 0; // Unlimited
  }
  return Math.min(100, Math.round((used / limit) * 100));
}

/**
 * Format usage display text
 */
export function formatUsageText(used: number, limit: number): string {
  if (limit === -1 || limit === Infinity) {
    return `${used.toLocaleString()} / Unlimited`;
  }
  return `${used.toLocaleString()} / ${limit.toLocaleString()}`;
}

/**
 * Check if usage is approaching limit
 */
export function isUsageApproachingLimit(used: number, limit: number, threshold: number = 0.8): boolean {
  if (limit === -1 || limit === Infinity) {
    return false;
  }
  return (used / limit) >= threshold;
}

/**
 * Get next billing date
 */
export function getNextBillingDate(currentPeriodEnd: Date): Date {
  const nextBilling = new Date(currentPeriodEnd);
  nextBilling.setMonth(nextBilling.getMonth() + 1);
  return nextBilling;
}

/**
 * Calculate prorated amount for plan changes
 */
export function calculateProratedAmount(
  currentPrice: number,
  newPrice: number,
  daysRemaining: number,
  totalDaysInPeriod: number = 30
): number {
  const dailyCurrentRate = currentPrice / totalDaysInPeriod;
  const dailyNewRate = newPrice / totalDaysInPeriod;
  const refund = dailyCurrentRate * daysRemaining;
  const newCharge = dailyNewRate * daysRemaining;
  
  return newCharge - refund;
}

/**
 * Validate subscription tier
 */
export function isValidSubscriptionTier(tier: string): tier is SubscriptionTier {
  return Object.values(SubscriptionTier).includes(tier as SubscriptionTier);
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  return SUBSCRIPTION_PLANS[tier].name;
}

/**
 * Get tier badge color
 */
export function getTierBadgeColor(tier: SubscriptionTier): string {
  switch (tier) {
    case SubscriptionTier.FREE:
      return 'gray';
    case SubscriptionTier.PRO:
      return 'blue';
    case SubscriptionTier.ENTERPRISE:
      return 'purple';
    default:
      return 'gray';
  }
}

/**
 * Check if subscription allows feature
 */
export function subscriptionAllowsFeature(
  tier: SubscriptionTier,
  feature: keyof typeof SUBSCRIPTION_PLANS.FREE.limits
): boolean {
  const plan = SUBSCRIPTION_PLANS[tier];
  const featureValue = plan.limits[feature];
  
  if (typeof featureValue === 'boolean') {
    return featureValue;
  }
  
  if (typeof featureValue === 'number') {
    return featureValue > 0;
  }
  
  return false;
}

/**
 * Get subscription renewal reminder text
 */
export function getRenewalReminderText(daysUntilRenewal: number): string {
  if (daysUntilRenewal <= 0) {
    return 'Your subscription has expired';
  } else if (daysUntilRenewal === 1) {
    return 'Your subscription renews tomorrow';
  } else if (daysUntilRenewal <= 7) {
    return `Your subscription renews in ${daysUntilRenewal} days`;
  } else {
    return `Your subscription renews on ${new Date(Date.now() + daysUntilRenewal * 24 * 60 * 60 * 1000).toLocaleDateString()}`;
  }
}