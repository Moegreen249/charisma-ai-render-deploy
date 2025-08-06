import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { SubscriptionStatus, SubscriptionTier } from '@prisma/client';

export async function PATCH(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authConfig);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, newTier } = body;

    // Find the subscription
    const subscription = await prisma.userSubscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    let updateData: any = {};
    let message = '';

    switch (action) {
      case 'cancel':
        updateData = {
          status: SubscriptionStatus.CANCELED,
          canceledAt: new Date(),
        };
        message = `Subscription canceled for ${subscription.user.email}`;
        break;

      case 'reactivate':
        updateData = {
          status: SubscriptionStatus.ACTIVE,
          canceledAt: null,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        };
        message = `Subscription reactivated for ${subscription.user.email}`;
        break;

      case 'upgrade':
      case 'downgrade':
        if (!newTier || !Object.values(SubscriptionTier).includes(newTier as SubscriptionTier)) {
          return NextResponse.json({ error: 'Invalid tier specified' }, { status: 400 });
        }
        updateData = {
          tier: newTier as SubscriptionTier,
        };
        message = `Subscription ${action}d to ${newTier} for ${subscription.user.email}`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update the subscription
    const updatedSubscription = await prisma.userSubscription.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Log the admin action
    await prisma.platformError.create({
      data: {
        message: `Admin ${session.user.email} ${action}ed subscription ${id} for user ${subscription.user.email}`,
        severity: 'LOW',
        category: 'SYSTEM',
        userId: session.user.id,
        requestData: {
          adminId: session.user.id,
          subscriptionId: id,
          targetUserId: subscription.userId,
          action,
          newTier,
        },
      }
    });

    return NextResponse.json({
      success: true,
      message,
      subscription: updatedSubscription
    });

  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authConfig);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    // Find the subscription
    const subscription = await prisma.userSubscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      subscription
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}