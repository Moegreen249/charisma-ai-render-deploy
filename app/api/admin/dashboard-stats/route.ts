import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user statistics
    const [totalUsers, pendingUsers, approvedUsers, rejectedUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isApproved: false, rejectedAt: null } }),
      prisma.user.count({ where: { isApproved: true } }),
      prisma.user.count({ where: { rejectedAt: { not: null } } })
    ]);

    // Get recent signups (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentSignups = await prisma.user.count({
      where: {
        createdAt: {
          gte: weekAgo
        }
      }
    });

    // Calculate weekly growth (simplified)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const previousWeekSignups = await prisma.user.count({
      where: {
        createdAt: {
          gte: twoWeeksAgo,
          lt: weekAgo
        }
      }
    });

    const weeklyGrowth = previousWeekSignups > 0 
      ? Math.round(((recentSignups - previousWeekSignups) / previousWeekSignups) * 100)
      : recentSignups > 0 ? 100 : 0;

    // System health check
    let systemStatus: 'healthy' | 'warning' | 'error' = 'healthy';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      systemStatus = 'error';
    }

    const stats = {
      users: {
        total: totalUsers,
        pending: pendingUsers,
        approved: approvedUsers,
        rejected: rejectedUsers
      },
      system: {
        status: systemStatus,
        uptime: '99.9%', // This would come from your monitoring system
        lastBackup: 'Today' // This would come from your backup system
      },
      analytics: {
        dailySignups: Math.round(recentSignups / 7), // Average daily signups
        weeklyGrowth: weeklyGrowth,
        monthlyActive: approvedUsers // Simplified - would be actual active users
      }
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}