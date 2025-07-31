import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeWindow = parseInt(searchParams.get("timeWindow") || "30"); // minutes

    const activeThreshold = new Date(Date.now() - timeWindow * 60 * 1000);

    // Get users with recent activity (optimized query)
    const recentActivities = await prisma.userActivity.findMany({
      where: {
        timestamp: {
          gte: activeThreshold,
        },
      },
      select: {
        userId: true,
        timestamp: true,
        page: true,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Group activities by user and get latest activity per user
    const userActivityMap = new Map();
    const userActionCounts = new Map();

    recentActivities.forEach(activity => {
      if (!userActivityMap.has(activity.userId) || 
          activity.timestamp > userActivityMap.get(activity.userId).timestamp) {
        userActivityMap.set(activity.userId, activity);
      }
      
      const count = userActionCounts.get(activity.userId) || 0;
      userActionCounts.set(activity.userId, count + 1);
    });

    // Get user details for active users
    const activeUserIds = Array.from(userActivityMap.keys());
    const activeUsers = activeUserIds.length > 0 ? await prisma.user.findMany({
      where: {
        id: {
          in: activeUserIds,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }) : [];

    // Transform the data for the frontend
    const users = activeUsers.map((user) => {
      const lastActivity = userActivityMap.get(user.id);
      const actionCount = userActionCounts.get(user.id) || 0;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        lastActive: lastActivity?.timestamp || new Date(),
        currentPage: lastActivity?.page || "/",
        sessionDuration: lastActivity ? Date.now() - new Date(lastActivity.timestamp).getTime() : 0,
        actions: actionCount,
        status: "online" as const,
      };
    });

    // Get additional statistics
    const stats = {
      totalActive: users.length,
      totalRegistered: await prisma.user.count(),
      onlineNow: users.filter(u =>
        new Date().getTime() - new Date(u.lastActive).getTime() < 5 * 60 * 1000 // Active in last 5 minutes
      ).length,
    };

    // Get user behavior analytics
    const behaviorStats = await prisma.userActivity.groupBy({
      by: ["action"],
      _count: {
        id: true,
      },
      where: {
        timestamp: {
          gte: activeThreshold,
        },
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    // Get page analytics
    const pageStats = await prisma.userActivity.groupBy({
      by: ["page"],
      _count: {
        id: true,
      },
      where: {
        timestamp: {
          gte: activeThreshold,
        },
        page: {
          not: null,
        },
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    return NextResponse.json({
      users,
      stats,
      analytics: {
        topActions: behaviorStats.map(stat => ({
          action: stat.action,
          count: stat._count.id,
        })),
        topPages: pageStats.map(stat => ({
          page: stat.page,
          count: stat._count.id,
        })),
      },
      timeWindow,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Active users API error:", error);

    // Log this error to the platform error system
    try {
      await prisma.platformError.create({
        data: {
          category: "SYSTEM",
          severity: "MEDIUM",
          message: "Active users API endpoint error",
          stackTrace: error instanceof Error ? error.stack : String(error),
          endpoint: "/api/admin/active-users",
        },
      });
    } catch (logError) {
      console.error("Failed to log active users API error:", logError);
    }

    return NextResponse.json(
      { error: "Failed to fetch active users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { action, userId, message } = body;

    switch (action) {
      case "send_notification":
        // In a real implementation, this would send a notification to the user
        // For now, we'll log it as an activity
        if (userId && message) {
          await prisma.userActivity.create({
            data: {
              userId,
              action: "admin_notification_received",
              category: "admin",
              metadata: {
                message,
                sentBy: session.user.id,
                timestamp: new Date().toISOString(),
              },
            },
          });

          return NextResponse.json({
            success: true,
            message: "Notification sent successfully",
          });
        }
        break;

      case "force_logout":
        // In a real implementation, this would invalidate the user's session
        // For now, we'll log it as an activity
        if (userId) {
          await prisma.userActivity.create({
            data: {
              userId,
              action: "admin_force_logout",
              category: "admin",
              metadata: {
                forcedBy: session.user.id,
                timestamp: new Date().toISOString(),
              },
            },
          });

          return NextResponse.json({
            success: true,
            message: "User logged out successfully",
          });
        }
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Active users action error:", error);

    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 }
    );
  }
}
