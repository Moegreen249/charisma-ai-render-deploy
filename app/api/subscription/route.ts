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
 * GET /api/subscription - Get current subscription data
 */
async function handleGetSubscription(request: NextRequest) {
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

    // Get subscription plan details
    const plan = subscriptionService.getSubscriptionPlan(subscription.tier);
    
    const responseData = {
      subscription: {
        ...subscription,
        usage: subscription.usage
      }
    };

    return createApiSuccessResponse(responseData);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return createApiErrorResponse(
      ApiErrorCode.DATABASE_ERROR,
      "Failed to fetch subscription data"
    );
  }
}

/**
 * DELETE /api/subscription - Cancel subscription
 */
async function handleDeleteSubscription(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return createApiErrorResponse(ApiErrorCode.UNAUTHORIZED);
  }

  try {
    const { searchParams } = new URL(request.url);
    const immediate = searchParams.get('immediate') === 'true';

    const canceledSubscription = await subscriptionService.cancelSubscription(
      session.user.id,
      immediate
    );

    const responseData = {
      subscription: {
        id: canceledSubscription.id,
        tier: canceledSubscription.tier,
        status: canceledSubscription.status,
        cancelAtPeriodEnd: canceledSubscription.cancelAtPeriodEnd,
        currentPeriodEnd: canceledSubscription.currentPeriodEnd
      },
      message: immediate 
        ? "Subscription canceled immediately" 
        : "Subscription will be canceled at the end of the current billing period"
    };

    return createApiSuccessResponse(responseData);
  } catch (error) {
    console.error("Error canceling subscription:", error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return createApiErrorResponse(
        ApiErrorCode.NOT_FOUND,
        "No subscription found to cancel"
      );
    }

    return createApiErrorResponse(
      ApiErrorCode.DATABASE_ERROR,
      "Failed to cancel subscription"
    );
  }
}

// Export handlers with error handling wrapper
export const GET = withApiErrorHandler(handleGetSubscription, '/api/subscription');
export const DELETE = withApiErrorHandler(handleDeleteSubscription, '/api/subscription');