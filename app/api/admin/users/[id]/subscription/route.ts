import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { subscriptionService } from '@/lib/subscription-service';
import { z } from 'zod';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

const updateSubscriptionSchema = z.object({
  tier: z.enum(['FREE', 'PRO', 'ENTERPRISE']),
  status: z.enum(['ACTIVE', 'CANCELED', 'PAST_DUE', 'UNPAID']).optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  currentPeriodStart: z.string().optional(),
  currentPeriodEnd: z.string().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
});

// GET - Get user subscription details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: userId } = await params;

    // Get user with subscription and usage data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        _count: {
          select: {
            stories: true,
            analyses: true,
            backgroundJobs: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get current usage metrics
    let usageMetrics = null;
    if (user.subscription) {
      try {
        // For now, use the usage data from the subscription
        usageMetrics = user.subscription.usage || null;
      } catch (error) {
        console.warn('Failed to get usage metrics:', error);
      }
    }

    // Get billing history (if available)
    let billingHistory = [];
    if (user.subscription?.stripeCustomerId) {
      try {
        // This would integrate with Stripe to get billing history
        // For now, we'll return mock data structure
        billingHistory = [];
      } catch (error) {
        console.warn('Failed to get billing history:', error);
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      subscription: user.subscription,
      usage: usageMetrics,
      billingHistory,
      activity: {
        storiesCount: user._count.stories,
        analysesCount: user._count.analyses,
        jobsCount: user._count.backgroundJobs,
      }
    });

  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user subscription' },
      { status: 500 }
    );
  }
}

// PUT - Update user subscription
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: userId } = await params;
    const body = await request.json();

    // Validate input data
    const validation = updateSubscriptionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { tier, status, ...subscriptionData } = validation.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let updatedSubscription;

    if (user.subscription) {
      // Update existing subscription
      updatedSubscription = await prisma.userSubscription.update({
        where: { userId },
        data: {
          tier: tier as SubscriptionTier,
          status: status as SubscriptionStatus || user.subscription.status,
          ...subscriptionData,
          ...(subscriptionData.currentPeriodStart && {
            currentPeriodStart: new Date(subscriptionData.currentPeriodStart)
          }),
          ...(subscriptionData.currentPeriodEnd && {
            currentPeriodEnd: new Date(subscriptionData.currentPeriodEnd)
          }),
          updatedAt: new Date(),
        }
      });
    } else {
      // Create new subscription
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      
      updatedSubscription = await prisma.userSubscription.create({
        data: {
          userId,
          tier: tier as SubscriptionTier,
          status: (status as SubscriptionStatus) || SubscriptionStatus.ACTIVE,
          currentPeriodStart: subscriptionData.currentPeriodStart 
            ? new Date(subscriptionData.currentPeriodStart) 
            : now,
          currentPeriodEnd: subscriptionData.currentPeriodEnd 
            ? new Date(subscriptionData.currentPeriodEnd) 
            : nextMonth,
          cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd || false,
          stripeCustomerId: subscriptionData.stripeCustomerId || null,
          stripeSubscriptionId: subscriptionData.stripeSubscriptionId || null,
          usage: {
            storiesGenerated: 0,
            storiesLimit: tier === 'FREE' ? 3 : tier === 'PRO' ? -1 : -1,
            apiCallsUsed: 0,
            apiCallsLimit: tier === 'FREE' ? 100 : tier === 'PRO' ? 10000 : 50000,
            periodStart: now,
            periodEnd: nextMonth,
            filesProcessed: 0,
            filesLimit: tier === 'FREE' ? 5 : tier === 'PRO' ? 100 : 1000,
          }
        }
      });
    }

    // Log the subscription update
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        action: 'admin_subscription_updated',
        category: 'admin',
        metadata: {
          targetUserId: userId,
          targetUserEmail: user.email,
          previousTier: user.subscription?.tier,
          newTier: tier,
          previousStatus: user.subscription?.status,
          newStatus: status || user.subscription?.status,
          updatedBy: session.user.email,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      message: 'Subscription updated successfully',
      subscription: updatedSubscription,
    });

  } catch (error) {
    console.error('Error updating user subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel user subscription
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const immediate = searchParams.get('immediate') === 'true';

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    if (!user || !user.subscription) {
      return NextResponse.json(
        { error: 'User or subscription not found' },
        { status: 404 }
      );
    }

    let updatedSubscription;

    if (immediate) {
      // Cancel immediately
      updatedSubscription = await prisma.userSubscription.update({
        where: { userId },
        data: {
          status: SubscriptionStatus.CANCELED,
          cancelAtPeriodEnd: false,
          updatedAt: new Date(),
        }
      });
    } else {
      // Cancel at period end
      updatedSubscription = await prisma.userSubscription.update({
        where: { userId },
        data: {
          cancelAtPeriodEnd: true,
          updatedAt: new Date(),
        }
      });
    }

    // Log the cancellation
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        action: 'admin_subscription_canceled',
        category: 'admin',
        metadata: {
          targetUserId: userId,
          targetUserEmail: user.email,
          immediate,
          canceledBy: session.user.email,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      message: immediate 
        ? 'Subscription canceled immediately' 
        : 'Subscription set to cancel at period end',
      subscription: updatedSubscription,
    });

  } catch (error) {
    console.error('Error canceling user subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}