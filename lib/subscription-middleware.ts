import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-config';
import { subscriptionService } from './subscription-service';
import { SubscriptionTier } from '@prisma/client';

export interface SubscriptionMiddlewareOptions {
  requiredTier?: SubscriptionTier;
  action?: 'generate_story' | 'api_call' | 'upload_file' | 'concurrent_task';
  trackUsage?: boolean;
  usageAmount?: number;
}

/**
 * Middleware to enforce subscription limits and track usage
 */
export async function withSubscriptionCheck(
  request: NextRequest,
  options: SubscriptionMiddlewareOptions = {}
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user subscription
    const subscriptionData = await subscriptionService.getUserSubscription(userId);
    
    if (!subscriptionData) {
      // Create free subscription if none exists
      await subscriptionService.createSubscription(userId, SubscriptionTier.FREE);
      const newSubscriptionData = await subscriptionService.getUserSubscription(userId);
      
      if (!newSubscriptionData) {
        return NextResponse.json(
          { error: 'Failed to initialize subscription' },
          { status: 500 }
        );
      }
    }

    // Check required tier
    if (options.requiredTier) {
      const tierOrder = {
        [SubscriptionTier.FREE]: 0,
        [SubscriptionTier.PRO]: 1,
        [SubscriptionTier.ENTERPRISE]: 2
      };

      const userTierLevel = tierOrder[subscriptionData!.tier];
      const requiredTierLevel = tierOrder[options.requiredTier];

      if (userTierLevel < requiredTierLevel) {
        return NextResponse.json(
          { 
            error: 'Subscription upgrade required',
            details: {
              currentTier: subscriptionData!.tier,
              requiredTier: options.requiredTier,
              upgradeUrl: '/subscription'
            }
          },
          { status: 403 }
        );
      }
    }

    // Check action limits
    if (options.action) {
      const canPerform = await subscriptionService.canPerformAction(userId, options.action);
      
      if (!canPerform.allowed) {
        return NextResponse.json(
          {
            error: 'Subscription limit exceeded',
            details: {
              reason: canPerform.reason,
              usage: canPerform.usage,
              upgradeUrl: '/subscription'
            }
          },
          { status: 429 }
        );
      }
    }

    // Track usage if requested
    if (options.trackUsage && options.action && options.action !== 'concurrent_task') {
      await subscriptionService.trackUsage(
        userId, 
        options.action, 
        options.usageAmount || 1
      );
    }

    return null; // Continue processing
  } catch (error) {
    console.error('Subscription middleware error:', error);
    return NextResponse.json(
      { error: 'Subscription check failed' },
      { status: 500 }
    );
  }
}

/**
 * Higher-order function to wrap API routes with subscription checking
 */
export function withSubscription(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
  options: SubscriptionMiddlewareOptions = {}
) {
  return async (request: NextRequest, context: any) => {
    const subscriptionCheck = await withSubscriptionCheck(request, options);
    
    if (subscriptionCheck) {
      return subscriptionCheck; // Return error response
    }

    return handler(request, context);
  };
}

/**
 * Subscription enforcement decorator for API routes
 */
export function requiresSubscription(options: SubscriptionMiddlewareOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [request] = args;
      
      const subscriptionCheck = await withSubscriptionCheck(request, options);
      
      if (subscriptionCheck) {
        return subscriptionCheck;
      }

      return method.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Check if user has access to premium features
 */
export async function hasPremiumAccess(userId: string): Promise<boolean> {
  try {
    const subscription = await subscriptionService.getUserSubscription(userId);
    
    if (!subscription) {
      return false;
    }

    return subscription.tier !== SubscriptionTier.FREE && 
           subscription.status === 'ACTIVE';
  } catch (error) {
    console.error('Error checking premium access:', error);
    return false;
  }
}

/**
 * Get subscription context for API responses
 */
export async function getSubscriptionContext(userId: string) {
  try {
    const subscription = await subscriptionService.getUserSubscription(userId);
    
    if (!subscription) {
      return {
        tier: SubscriptionTier.FREE,
        status: 'ACTIVE',
        usage: {
          storiesGenerated: 0,
          storiesLimit: 3,
          apiCallsUsed: 0,
          apiCallsLimit: 100,
          filesProcessed: 0,
          filesLimit: 3,
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      };
    }

    return {
      tier: subscription.tier,
      status: subscription.status,
      usage: subscription.usage,
      billingCycle: {
        start: subscription.currentPeriodStart,
        end: subscription.currentPeriodEnd,
        daysRemaining: Math.max(0, Math.ceil(
          (subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ))
      }
    };
  } catch (error) {
    console.error('Error getting subscription context:', error);
    throw error;
  }
}

/**
 * Validate file upload against subscription limits
 */
export async function validateFileUpload(
  userId: string,
  fileSize: number
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const subscription = await subscriptionService.getUserSubscription(userId);
    
    if (!subscription) {
      return { allowed: false, reason: 'No subscription found' };
    }

    const plan = subscriptionService.getSubscriptionPlan(subscription.tier);
    const maxFileSizeMB = plan.limits.maxFileSize;
    const fileSizeMB = fileSize / (1024 * 1024);

    if (fileSizeMB > maxFileSizeMB) {
      return {
        allowed: false,
        reason: `File size (${fileSizeMB.toFixed(1)}MB) exceeds limit (${maxFileSizeMB}MB)`
      };
    }

    // Check if user can upload more files
    const canUpload = await subscriptionService.canPerformAction(userId, 'upload_file');
    
    return {
      allowed: canUpload.allowed,
      reason: canUpload.reason
    };
  } catch (error) {
    console.error('Error validating file upload:', error);
    return { allowed: false, reason: 'Validation failed' };
  }
}

/**
 * Rate limiting based on subscription tier
 */
export function getSubscriptionRateLimit(tier: SubscriptionTier): {
  requests: number;
  windowMs: number;
} {
  switch (tier) {
    case SubscriptionTier.FREE:
      return { requests: 10, windowMs: 60 * 1000 }; // 10 requests per minute
    case SubscriptionTier.PRO:
      return { requests: 100, windowMs: 60 * 1000 }; // 100 requests per minute
    case SubscriptionTier.ENTERPRISE:
      return { requests: 1000, windowMs: 60 * 1000 }; // 1000 requests per minute
    default:
      return { requests: 5, windowMs: 60 * 1000 }; // Conservative default
  }
}