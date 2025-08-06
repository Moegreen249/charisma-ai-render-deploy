import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { subscriptionService } from "@/lib/subscription-service";
import { 
  createApiErrorResponse, 
  createApiSuccessResponse, 
  withApiErrorHandler,
  ApiErrorCode 
} from "@/lib/api-error-handler";

/**
 * GET /api/subscription/usage - Get detailed usage metrics
 */
async function handleGetUsage(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return createApiErrorResponse(ApiErrorCode.UNAUTHORIZED);
  }

  try {
    const subscription = await subscriptionService.getUserSubscription(session.user.id);
    
    if (!subscription) {
      return createApiErrorResponse(
        ApiErrorCode.NOT_FOUND,
        "No subscription found for user"
      );
    }

    const plan = subscriptionService.getSubscriptionPlan(subscription.tier);
    const usage = subscription.usage;

    // Calculate usage percentages
    const calculateUsagePercentage = (used: number, limit: number): number => {
      if (limit === -1 || limit === Infinity) return 0; // Unlimited
      return Math.min(100, (used / limit) * 100);
    };

    // Calculate days remaining in billing period
    const now = new Date();
    const periodEnd = subscription.currentPeriodEnd;
    const daysRemaining = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate daily usage rates
    const periodStart = subscription.currentPeriodStart;
    const totalDaysInPeriod = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = totalDaysInPeriod - daysRemaining;
    
    const dailyStoriesRate = daysElapsed > 0 ? usage.storiesGenerated / daysElapsed : 0;
    const dailyApiCallsRate = daysElapsed > 0 ? usage.apiCallsUsed / daysElapsed : 0;

    const responseData = {
      subscription: {
        tier: subscription.tier,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd
      },
      plan: {
        name: plan.name,
        limits: plan.limits
      },
      usage: {
        stories: {
          used: usage.storiesGenerated,
          limit: usage.storiesLimit,
          percentage: calculateUsagePercentage(usage.storiesGenerated, usage.storiesLimit),
          unlimited: usage.storiesLimit === Infinity || plan.limits.storiesPerMonth === -1
        },
        apiCalls: {
          used: usage.apiCallsUsed,
          limit: usage.apiCallsLimit,
          percentage: calculateUsagePercentage(usage.apiCallsUsed, usage.apiCallsLimit),
          unlimited: usage.apiCallsLimit === Infinity || plan.limits.apiCallsPerMonth === -1
        },
        files: {
          used: usage.filesProcessed,
          limit: usage.filesLimit,
          percentage: calculateUsagePercentage(usage.filesProcessed, usage.filesLimit),
          unlimited: false // Files are typically always limited
        }
      },
      period: {
        start: subscription.currentPeriodStart,
        end: subscription.currentPeriodEnd,
        daysRemaining,
        totalDays: totalDaysInPeriod,
        daysElapsed
      },
      analytics: {
        dailyAverages: {
          stories: Math.round(dailyStoriesRate * 100) / 100,
          apiCalls: Math.round(dailyApiCallsRate * 100) / 100
        },
        projectedUsage: {
          stories: daysRemaining > 0 ? Math.round((dailyStoriesRate * totalDaysInPeriod) * 100) / 100 : usage.storiesGenerated,
          apiCalls: daysRemaining > 0 ? Math.round((dailyApiCallsRate * totalDaysInPeriod) * 100) / 100 : usage.apiCallsUsed
        }
      },
      warnings: []
    };

    // Add usage warnings
    const warnings = [];
    
    if (responseData.usage.stories.percentage >= 80 && !responseData.usage.stories.unlimited) {
      warnings.push({
        type: 'stories',
        level: responseData.usage.stories.percentage >= 95 ? 'critical' : 'warning',
        message: `You've used ${Math.round(responseData.usage.stories.percentage)}% of your monthly story generation limit`
      });
    }

    if (responseData.usage.apiCalls.percentage >= 80 && !responseData.usage.apiCalls.unlimited) {
      warnings.push({
        type: 'apiCalls',
        level: responseData.usage.apiCalls.percentage >= 95 ? 'critical' : 'warning',
        message: `You've used ${Math.round(responseData.usage.apiCalls.percentage)}% of your monthly API call limit`
      });
    }

    if (responseData.usage.files.percentage >= 80) {
      warnings.push({
        type: 'files',
        level: responseData.usage.files.percentage >= 95 ? 'critical' : 'warning',
        message: `You've used ${Math.round(responseData.usage.files.percentage)}% of your monthly file processing limit`
      });
    }

    responseData.warnings = warnings;

    return createApiSuccessResponse(responseData);
  } catch (error) {
    console.error("Error fetching usage data:", error);
    return createApiErrorResponse(
      ApiErrorCode.DATABASE_ERROR,
      "Failed to fetch usage data"
    );
  }
}

// Export handler with error handling wrapper
export const GET = withApiErrorHandler(handleGetUsage, '/api/subscription/usage');