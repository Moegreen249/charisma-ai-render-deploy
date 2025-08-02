import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { subscriptionService, SubscriptionError } from "@/lib/subscription-service";
import { SubscriptionTier } from "@prisma/client";
import { subscriptionUpgradeSchema } from "@/lib/schemas";
import { 
  createApiErrorResponse, 
  createApiSuccessResponse, 
  withApiErrorHandler,
  ApiErrorCode,
  validateRequiredFields
} from "@/lib/api-error-handler";

/**
 * POST /api/subscription/upgrade - Upgrade/downgrade subscription plan
 */
async function handleUpgradeSubscription(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return createApiErrorResponse(ApiErrorCode.UNAUTHORIZED);
  }

  try {
    const body = await request.json();
    
    // Validate request body
    const validation = subscriptionUpgradeSchema.safeParse(body);
    if (!validation.success) {
      return createApiErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        "Invalid request data",
        validation.error.errors
      );
    }

    const { tier, stripeSubscriptionId, billingEmail } = validation.data;

    // Get current subscription to check if upgrade is valid
    const currentSubscription = await subscriptionService.getUserSubscription(session.user.id);
    
    if (!currentSubscription) {
      return createApiErrorResponse(
        ApiErrorCode.NOT_FOUND,
        "No subscription found for user"
      );
    }

    // Check if the tier is actually changing
    if (currentSubscription.tier === tier) {
      return createApiErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        "User is already on the requested subscription tier"
      );
    }

    // Update subscription tier
    const updatedSubscription = await subscriptionService.updateSubscriptionTier(
      session.user.id,
      tier,
      stripeSubscriptionId
    );

    // Update billing email if provided
    if (billingEmail && billingEmail !== currentSubscription.billingEmail) {
      // This would typically be handled by the subscription service
      // For now, we'll include it in the response
    }

    // Get updated plan details
    const newPlan = subscriptionService.getSubscriptionPlan(tier);
    const oldPlan = subscriptionService.getSubscriptionPlan(currentSubscription.tier);

    const responseData = {
      subscription: {
        id: updatedSubscription.id,
        tier: updatedSubscription.tier,
        status: updatedSubscription.status,
        currentPeriodStart: updatedSubscription.currentPeriodStart,
        currentPeriodEnd: updatedSubscription.currentPeriodEnd,
        updatedAt: updatedSubscription.updatedAt
      },
      previousPlan: oldPlan,
      newPlan,
      message: tier > currentSubscription.tier 
        ? `Successfully upgraded to ${newPlan.name} plan`
        : `Successfully downgraded to ${newPlan.name} plan`
    };

    return createApiSuccessResponse(responseData);
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    
    // Handle subscription-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const subscriptionError = error as SubscriptionError;
      
      switch (subscriptionError.code) {
        case 'INVALID_TIER':
          return createApiErrorResponse(
            ApiErrorCode.VALIDATION_ERROR,
            subscriptionError.message,
            subscriptionError.details
          );
        case 'UPGRADE_FAILED':
        case 'DOWNGRADE_FAILED':
          return createApiErrorResponse(
            ApiErrorCode.EXTERNAL_SERVICE_ERROR,
            subscriptionError.message,
            subscriptionError.details
          );
        default:
          return createApiErrorResponse(
            ApiErrorCode.INTERNAL_SERVER_ERROR,
            subscriptionError.message,
            subscriptionError.details
          );
      }
    }

    if (error instanceof Error && error.message.includes('not found')) {
      return createApiErrorResponse(
        ApiErrorCode.NOT_FOUND,
        "Subscription not found"
      );
    }

    return createApiErrorResponse(
      ApiErrorCode.DATABASE_ERROR,
      "Failed to upgrade subscription"
    );
  }
}

// Export handler with error handling wrapper
export const POST = withApiErrorHandler(handleUpgradeSubscription, '/api/subscription/upgrade');