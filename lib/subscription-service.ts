import { prisma } from './prisma';
import { 
  SubscriptionTier, 
  SubscriptionStatus, 
  UserSubscription, 
  User 
} from '@prisma/client';

// Types for subscription management
export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: PlanFeature[];
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
  maxFileSize: number; // MB
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

export interface SubscriptionError {
  code: 'PAYMENT_FAILED' | 'SUBSCRIPTION_EXPIRED' | 'UPGRADE_FAILED' | 'DOWNGRADE_FAILED' | 'LIMIT_EXCEEDED' | 'INVALID_TIER';
  message: string;
  details?: {
    stripeError?: string;
    retryable: boolean;
    nextAction?: string;
  };
}

// Predefined subscription plans
export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  FREE: {
    id: 'free',
    name: 'Free',
    tier: SubscriptionTier.FREE,
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      { name: 'Story Generation', description: 'Basic story generation', included: true, limit: 3 },
      { name: 'Analysis Templates', description: 'Standard templates', included: true },
      { name: 'File Upload', description: 'Basic file processing', included: true, limit: 5 },
      { name: 'Priority Support', description: '24/7 priority support', included: false },
      { name: 'Advanced Analytics', description: 'Detailed insights', included: false }
    ],
    limits: {
      storiesPerMonth: 3,
      apiCallsPerMonth: 100,
      maxFileSize: 5,
      prioritySupport: false,
      advancedAnalytics: false,
      concurrentTasks: 1
    }
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    tier: SubscriptionTier.PRO,
    price: 29,
    currency: 'USD',
    interval: 'month',
    features: [
      { name: 'Story Generation', description: 'Unlimited story generation', included: true },
      { name: 'Analysis Templates', description: 'All templates + custom', included: true },
      { name: 'File Upload', description: 'Advanced file processing', included: true, limit: 100 },
      { name: 'Priority Support', description: '24/7 priority support', included: true },
      { name: 'Advanced Analytics', description: 'Detailed insights', included: true }
    ],
    limits: {
      storiesPerMonth: -1, // unlimited
      apiCallsPerMonth: 10000,
      maxFileSize: 50,
      prioritySupport: true,
      advancedAnalytics: true,
      concurrentTasks: 5
    }
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    tier: SubscriptionTier.ENTERPRISE,
    price: 99,
    currency: 'USD',
    interval: 'month',
    features: [
      { name: 'Story Generation', description: 'Unlimited story generation', included: true },
      { name: 'Analysis Templates', description: 'All templates + custom + API', included: true },
      { name: 'File Upload', description: 'Enterprise file processing', included: true },
      { name: 'Priority Support', description: 'Dedicated support', included: true },
      { name: 'Advanced Analytics', description: 'Full analytics suite', included: true },
      { name: 'API Access', description: 'Full API access', included: true },
      { name: 'Custom Integrations', description: 'Custom integrations', included: true }
    ],
    limits: {
      storiesPerMonth: -1, // unlimited
      apiCallsPerMonth: -1, // unlimited
      maxFileSize: 500,
      prioritySupport: true,
      advancedAnalytics: true,
      concurrentTasks: 20
    }
  }
};

export class SubscriptionService {
  /**
   * Get user's current subscription with usage metrics
   */
  async getUserSubscription(userId: string): Promise<(UserSubscription & { usage: UsageMetrics; user: User }) | null> {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!subscription) {
      return null;
    }

    const usage = await this.calculateUsageMetrics(userId, subscription);
    
    return {
      ...subscription,
      usage
    } as UserSubscription & { usage: UsageMetrics; user: User };
  }

  /**
   * Create a new subscription for a user
   */
  async createSubscription(
    userId: string, 
    tier: SubscriptionTier = SubscriptionTier.FREE,
    stripeCustomerId?: string,
    stripeSubscriptionId?: string
  ): Promise<UserSubscription> {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    try {
      const subscription = await prisma.userSubscription.create({
        data: {
          userId,
          tier,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          stripeCustomerId,
          stripeSubscriptionId,
          usage: {
            storiesGenerated: 0,
            apiCallsUsed: 0,
            filesProcessed: 0,
            lastResetAt: now.toISOString()
          }
        }
      });

      return subscription;
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update subscription tier (upgrade/downgrade)
   */
  async updateSubscriptionTier(
    userId: string, 
    newTier: SubscriptionTier,
    stripeSubscriptionId?: string
  ): Promise<UserSubscription> {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Validate tier transition
    if (!this.isValidTierTransition(subscription.tier, newTier)) {
      const error: SubscriptionError = {
        code: 'INVALID_TIER',
        message: `Invalid tier transition from ${subscription.tier} to ${newTier}`,
        details: {
          retryable: false,
          nextAction: 'Contact support for assistance'
        }
      };
      throw error;
    }

    try {
      const updatedSubscription = await prisma.userSubscription.update({
        where: { userId },
        data: {
          tier: newTier,
          stripeSubscriptionId: stripeSubscriptionId || subscription.stripeSubscriptionId,
          updatedAt: new Date()
        }
      });

      return updatedSubscription;
    } catch (error) {
      const subscriptionError: SubscriptionError = {
        code: newTier > subscription.tier ? 'UPGRADE_FAILED' : 'DOWNGRADE_FAILED',
        message: `Failed to ${newTier > subscription.tier ? 'upgrade' : 'downgrade'} subscription`,
        details: {
          retryable: true,
          nextAction: 'Please try again or contact support'
        }
      };
      throw subscriptionError;
    }
  }

  /**
   * Cancel subscription (mark for cancellation at period end)
   */
  async cancelSubscription(userId: string, immediate: boolean = false): Promise<UserSubscription> {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const updateData: any = {
      cancelAtPeriodEnd: true,
      updatedAt: new Date()
    };

    if (immediate) {
      updateData.status = SubscriptionStatus.CANCELED;
      updateData.currentPeriodEnd = new Date();
    }

    try {
      const canceledSubscription = await prisma.userSubscription.update({
        where: { userId },
        data: updateData
      });

      return canceledSubscription;
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reactivate a canceled subscription
   */
  async reactivateSubscription(userId: string): Promise<UserSubscription> {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status !== SubscriptionStatus.CANCELED && !subscription.cancelAtPeriodEnd) {
      throw new Error('Subscription is not canceled');
    }

    try {
      const reactivatedSubscription = await prisma.userSubscription.update({
        where: { userId },
        data: {
          status: SubscriptionStatus.ACTIVE,
          cancelAtPeriodEnd: false,
          updatedAt: new Date()
        }
      });

      return reactivatedSubscription;
    } catch (error) {
      throw new Error(`Failed to reactivate subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update subscription status (for webhook processing)
   */
  async updateSubscriptionStatus(
    userId: string, 
    status: SubscriptionStatus,
    metadata?: any
  ): Promise<UserSubscription> {
    try {
      const updatedSubscription = await prisma.userSubscription.update({
        where: { userId },
        data: {
          status,
          updatedAt: new Date(),
          ...(metadata && { usage: metadata })
        }
      });

      return updatedSubscription;
    } catch (error) {
      throw new Error(`Failed to update subscription status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if user can perform an action based on subscription limits
   */
  async canPerformAction(
    userId: string, 
    action: 'generate_story' | 'api_call' | 'upload_file' | 'concurrent_task'
  ): Promise<{ allowed: boolean; reason?: string; usage?: UsageMetrics }> {
    const subscriptionData = await this.getUserSubscription(userId);
    
    if (!subscriptionData) {
      return { allowed: false, reason: 'No subscription found' };
    }

    const { tier, status } = subscriptionData;
    const usage = subscriptionData.usage;
    const limits = SUBSCRIPTION_PLANS[tier].limits;

    // Check subscription status
    if (status !== SubscriptionStatus.ACTIVE) {
      return { 
        allowed: false, 
        reason: `Subscription is ${status.toLowerCase()}`,
        usage 
      };
    }

    // Check specific action limits
    switch (action) {
      case 'generate_story':
        if (limits.storiesPerMonth !== -1 && usage.storiesGenerated >= limits.storiesPerMonth) {
          return { 
            allowed: false, 
            reason: `Monthly story limit reached (${limits.storiesPerMonth})`,
            usage 
          };
        }
        break;

      case 'api_call':
        if (limits.apiCallsPerMonth !== -1 && usage.apiCallsUsed >= limits.apiCallsPerMonth) {
          return { 
            allowed: false, 
            reason: `Monthly API call limit reached (${limits.apiCallsPerMonth})`,
            usage 
          };
        }
        break;

      case 'upload_file':
        if (usage.filesProcessed >= usage.filesLimit) {
          return { 
            allowed: false, 
            reason: `Monthly file upload limit reached (${usage.filesLimit})`,
            usage 
          };
        }
        break;

      case 'concurrent_task':
        // This would need to check current running tasks
        const runningTasks = await this.getCurrentRunningTasks(userId);
        if (runningTasks >= limits.concurrentTasks) {
          return { 
            allowed: false, 
            reason: `Concurrent task limit reached (${limits.concurrentTasks})`,
            usage 
          };
        }
        break;
    }

    return { allowed: true, usage };
  }

  /**
   * Track usage for billing and limits
   */
  async trackUsage(
    userId: string, 
    action: 'generate_story' | 'api_call' | 'upload_file',
    amount: number = 1
  ): Promise<void> {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const currentUsage = (subscription.usage as any) || {
      storiesGenerated: 0,
      apiCallsUsed: 0,
      filesProcessed: 0,
      lastResetAt: new Date().toISOString()
    };

    // Update usage based on action
    switch (action) {
      case 'generate_story':
        currentUsage.storiesGenerated += amount;
        break;
      case 'api_call':
        currentUsage.apiCallsUsed += amount;
        break;
      case 'upload_file':
        currentUsage.filesProcessed += amount;
        break;
    }

    try {
      await prisma.userSubscription.update({
        where: { userId },
        data: {
          usage: currentUsage,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Failed to track usage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reset usage metrics for new billing period
   */
  async resetUsageMetrics(userId: string): Promise<void> {
    const now = new Date();
    const nextPeriodEnd = new Date(now);
    nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

    try {
      await prisma.userSubscription.update({
        where: { userId },
        data: {
          currentPeriodStart: now,
          currentPeriodEnd: nextPeriodEnd,
          usage: {
            storiesGenerated: 0,
            apiCallsUsed: 0,
            filesProcessed: 0,
            lastResetAt: now.toISOString()
          },
          updatedAt: now
        }
      });
    } catch (error) {
      throw new Error(`Failed to reset usage metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get subscription plan details
   */
  getSubscriptionPlan(tier: SubscriptionTier): SubscriptionPlan {
    return SUBSCRIPTION_PLANS[tier];
  }

  /**
   * Get all available subscription plans
   */
  getAllSubscriptionPlans(): SubscriptionPlan[] {
    return Object.values(SUBSCRIPTION_PLANS);
  }

  /**
   * Check if a subscription is expired
   */
  isSubscriptionExpired(subscription: UserSubscription): boolean {
    return new Date() > subscription.currentPeriodEnd;
  }

  /**
   * Get days until subscription expires
   */
  getDaysUntilExpiration(subscription: UserSubscription): number {
    const now = new Date();
    const expiration = subscription.currentPeriodEnd;
    const diffTime = expiration.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Private helper methods

  private async calculateUsageMetrics(userId: string, subscription: UserSubscription): Promise<UsageMetrics> {
    const currentUsage = (subscription.usage as any) || {
      storiesGenerated: 0,
      apiCallsUsed: 0,
      filesProcessed: 0
    };

    const limits = SUBSCRIPTION_PLANS[subscription.tier].limits;

    return {
      storiesGenerated: currentUsage.storiesGenerated || 0,
      storiesLimit: limits.storiesPerMonth === -1 ? Infinity : limits.storiesPerMonth,
      apiCallsUsed: currentUsage.apiCallsUsed || 0,
      apiCallsLimit: limits.apiCallsPerMonth === -1 ? Infinity : limits.apiCallsPerMonth,
      filesProcessed: currentUsage.filesProcessed || 0,
      filesLimit: limits.storiesPerMonth, // Using stories limit for files for now
      periodStart: subscription.currentPeriodStart,
      periodEnd: subscription.currentPeriodEnd
    };
  }

  private isValidTierTransition(currentTier: SubscriptionTier, newTier: SubscriptionTier): boolean {
    // Allow any transition for now, but could add business rules here
    return true;
  }

  private async getCurrentRunningTasks(userId: string): Promise<number> {
    const runningTasks = await prisma.taskQueue.count({
      where: {
        userId,
        status: 'RUNNING'
      }
    });

    return runningTasks;
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();

/**
 * Subscription lifecycle management
 */
export class SubscriptionLifecycleManager {
  /**
   * Handle subscription renewal
   */
  async handleSubscriptionRenewal(userId: string): Promise<void> {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Reset usage metrics for new billing period
    await subscriptionService.resetUsageMetrics(userId);

    // Update subscription status if it was past due
    if (subscription.status === SubscriptionStatus.PAST_DUE) {
      await subscriptionService.updateSubscriptionStatus(userId, SubscriptionStatus.ACTIVE);
    }
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailed(userId: string, attemptCount: number = 1): Promise<void> {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Update status based on attempt count
    if (attemptCount >= 3) {
      await subscriptionService.updateSubscriptionStatus(userId, SubscriptionStatus.UNPAID);
    } else {
      await subscriptionService.updateSubscriptionStatus(userId, SubscriptionStatus.PAST_DUE);
    }

    // TODO: Send notification to user about failed payment
  }

  /**
   * Handle subscription cancellation
   */
  async handleSubscriptionCancellation(userId: string, immediate: boolean = false): Promise<void> {
    await subscriptionService.cancelSubscription(userId, immediate);

    // TODO: Send cancellation confirmation email
    // TODO: Schedule data retention cleanup if needed
  }

  /**
   * Process expired subscriptions
   */
  async processExpiredSubscriptions(): Promise<void> {
    const expiredSubscriptions = await prisma.userSubscription.findMany({
      where: {
        currentPeriodEnd: {
          lt: new Date()
        },
        status: SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: true
      }
    });

    for (const subscription of expiredSubscriptions) {
      await subscriptionService.updateSubscriptionStatus(
        subscription.userId, 
        SubscriptionStatus.CANCELED
      );
    }
  }

  /**
   * Send usage warnings when approaching limits
   */
  async checkUsageWarnings(): Promise<void> {
    const activeSubscriptions = await prisma.userSubscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        tier: {
          in: [SubscriptionTier.FREE, SubscriptionTier.PRO]
        }
      },
      include: { user: true }
    });

    for (const subscription of activeSubscriptions) {
      const usage = await subscriptionService.getUserSubscription(subscription.userId);
      
      if (!usage) continue;

      const plan = SUBSCRIPTION_PLANS[subscription.tier];
      
      // Check story generation usage
      if (plan.limits.storiesPerMonth !== -1) {
        const usagePercentage = (usage.usage.storiesGenerated / plan.limits.storiesPerMonth) * 100;
        
        if (usagePercentage >= 80 && usagePercentage < 100) {
          // TODO: Send warning notification
          console.log(`User ${subscription.userId} approaching story limit: ${usagePercentage}%`);
        }
      }

      // Check API usage
      if (plan.limits.apiCallsPerMonth !== -1) {
        const usagePercentage = (usage.usage.apiCallsUsed / plan.limits.apiCallsPerMonth) * 100;
        
        if (usagePercentage >= 80 && usagePercentage < 100) {
          // TODO: Send warning notification
          console.log(`User ${subscription.userId} approaching API limit: ${usagePercentage}%`);
        }
      }
    }
  }

  /**
   * Generate usage report for a user
   */
  async generateUsageReport(userId: string, startDate: Date, endDate: Date): Promise<any> {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Get story generation count
    const storiesGenerated = await prisma.story.count({
      where: {
        userId,
        generatedAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Get analysis count (proxy for API calls)
    const analysesPerformed = await prisma.analysis.count({
      where: {
        userId,
        analysisDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Get background jobs count
    const backgroundJobs = await prisma.backgroundJob.count({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const plan = SUBSCRIPTION_PLANS[subscription.tier];

    return {
      user: {
        id: subscription.user.id,
        email: subscription.user.email,
        name: subscription.user.name
      },
      subscription: {
        tier: subscription.tier,
        status: subscription.status
      },
      period: {
        start: startDate,
        end: endDate
      },
      usage: {
        storiesGenerated,
        analysesPerformed,
        backgroundJobs,
        limits: plan.limits
      },
      utilization: {
        stories: plan.limits.storiesPerMonth === -1 ? 0 : (storiesGenerated / plan.limits.storiesPerMonth) * 100,
        apiCalls: plan.limits.apiCallsPerMonth === -1 ? 0 : (analysesPerformed / plan.limits.apiCallsPerMonth) * 100
      }
    };
  }
}

// Export lifecycle manager instance
export const subscriptionLifecycleManager = new SubscriptionLifecycleManager();