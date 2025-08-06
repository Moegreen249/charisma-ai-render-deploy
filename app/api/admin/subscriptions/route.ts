import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authConfig);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all subscriptions with user data
    const subscriptions = await prisma.userSubscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add usage data for each subscription
    const subscriptionsWithUsage = await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          // Get usage metrics if available
          const usage = subscription.usage as any;
          return {
            ...subscription,
            usage: usage ? {
              storiesGenerated: usage.storiesGenerated || 0,
              storiesLimit: usage.storiesLimit || 10,
              apiCallsUsed: usage.apiCallsUsed || 0,
              apiCallsLimit: usage.apiCallsLimit || 100,
            } : {
              storiesGenerated: 0,
              storiesLimit: 10,
              apiCallsUsed: 0,
              apiCallsLimit: 100,
            }
          };
        } catch (error) {
          console.error(`Error processing subscription ${subscription.id}:`, error);
          return subscription;
        }
      })
    );

    return NextResponse.json({
      success: true,
      subscriptions: subscriptionsWithUsage,
      total: subscriptions.length
    });

  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}