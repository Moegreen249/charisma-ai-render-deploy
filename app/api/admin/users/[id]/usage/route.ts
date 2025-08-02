import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { subscriptionService } from '@/lib/subscription-service';

// GET - Get detailed usage metrics for a user
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
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'current'; // current, last_month, last_3_months, all_time

    // Get user with subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        stories: {
          select: {
            id: true,
            title: true,
            generatedAt: true,
          },
          orderBy: { generatedAt: 'desc' },
          take: timeframe === 'current' ? 10 : undefined,
        },
        analyses: {
          select: {
            id: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: timeframe === 'current' ? 10 : undefined,
        },
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

    // Calculate date ranges based on timeframe
    let startDate: Date;
    const endDate = new Date();

    switch (timeframe) {
      case 'last_month':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
        break;
      case 'last_3_months':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1);
        break;
      case 'all_time':
        startDate = user.createdAt;
        break;
      default: // current
        if (user.subscription) {
          startDate = user.subscription.currentPeriodStart;
        } else {
          startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        }
    }

    // Get usage metrics from subscription service
    let currentUsage = null;
    if (user.subscription) {
      try {
        // Use the usage data from the subscription
        currentUsage = user.subscription.usage || null;
      } catch (error) {
        console.warn('Failed to get current usage:', error);
      }
    }

    // Get historical usage data
    const historicalStories = await prisma.story.findMany({
      where: {
        userId: userId,
        generatedAt: {
          gte: startDate,
          lte: endDate,
        }
      },
      select: {
        id: true,
        generatedAt: true,
      }
    });

    const historicalAnalyses = await prisma.analysis.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        }
      },
      select: {
        id: true,
        createdAt: true,
      }
    });

    // Calculate usage statistics
    const usageStats = {
      current: currentUsage,
      historical: {
        timeframe,
        startDate,
        endDate,
        storiesCreated: historicalStories.length,
        totalWordCount: 0, // Remove word count calculation for now
        analysesPerformed: historicalAnalyses.length,
        averageStoriesPerDay: timeframe !== 'current' 
          ? historicalStories.length / Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
          : 0,
        averageAnalysesPerDay: timeframe !== 'current'
          ? historicalAnalyses.length / Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
          : 0,
      },
      breakdown: {
        storiesByDay: groupByDay(historicalStories.map(s => ({ createdAt: s.generatedAt }))),
        analysesByDay: groupByDay(historicalAnalyses),
      },
      limits: user.subscription ? getSubscriptionLimits(user.subscription.tier) : null,
    };

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      subscription: user.subscription,
      usage: usageStats,
      recentActivity: {
        stories: user.stories.slice(0, 5),
        analyses: user.analyses.slice(0, 5),
      },
      totals: user._count,
    });

  } catch (error) {
    console.error('Error fetching user usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user usage' },
      { status: 500 }
    );
  }
}

// Helper function to group items by day
function groupByDay(items: { createdAt: Date }[]) {
  const grouped: Record<string, number> = {};
  
  items.forEach(item => {
    const day = item.createdAt.toISOString().split('T')[0];
    grouped[day] = (grouped[day] || 0) + 1;
  });

  // Fill in missing days with 0
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
    const day = d.toISOString().split('T')[0];
    if (!(day in grouped)) {
      grouped[day] = 0;
    }
  }

  return grouped;
}

// Helper function to get subscription limits
function getSubscriptionLimits(tier: string) {
  switch (tier) {
    case 'FREE':
      return {
        storiesPerMonth: 3,
        apiCallsPerMonth: 100,
        maxFileSize: 5,
        prioritySupport: false,
        advancedAnalytics: false,
        concurrentTasks: 1,
      };
    case 'PRO':
      return {
        storiesPerMonth: -1, // unlimited
        apiCallsPerMonth: 10000,
        maxFileSize: 50,
        prioritySupport: true,
        advancedAnalytics: true,
        concurrentTasks: 5,
      };
    case 'ENTERPRISE':
      return {
        storiesPerMonth: -1, // unlimited
        apiCallsPerMonth: 50000,
        maxFileSize: 100,
        prioritySupport: true,
        advancedAnalytics: true,
        concurrentTasks: 10,
      };
    default:
      return null;
  }
}

// POST - Reset usage metrics (admin only)
export async function POST(
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
    const { resetType } = body; // 'current_period', 'all'

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

    // Reset usage metrics
    let resetUsage;
    if (resetType === 'all') {
      // Reset all usage
      resetUsage = {
        storiesGenerated: 0,
        apiCallsUsed: 0,
        filesProcessed: 0,
        periodStart: new Date(),
        periodEnd: user.subscription.currentPeriodEnd,
      };
    } else {
      // Reset current period
      const currentUsage = user.subscription.usage as any;
      resetUsage = {
        ...currentUsage,
        storiesGenerated: 0,
        apiCallsUsed: 0,
        filesProcessed: 0,
        periodStart: new Date(),
      };
    }

    const updatedSubscription = await prisma.userSubscription.update({
      where: { userId },
      data: {
        usage: resetUsage,
        updatedAt: new Date(),
      }
    });

    // Log the reset action
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        action: 'admin_usage_reset',
        category: 'admin',
        metadata: {
          targetUserId: userId,
          targetUserEmail: user.email,
          resetType,
          resetBy: session.user.email,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      message: 'Usage metrics reset successfully',
      subscription: updatedSubscription,
    });

  } catch (error) {
    console.error('Error resetting user usage:', error);
    return NextResponse.json(
      { error: 'Failed to reset usage' },
      { status: 500 }
    );
  }
}