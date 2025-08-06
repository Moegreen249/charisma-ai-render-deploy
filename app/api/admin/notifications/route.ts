import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { UnifiedNotificationService } from "@/lib/unified-notifications";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type");
    const userId = searchParams.get("userId");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const stats = searchParams.get("stats") === "true";

    // If requesting stats only
    if (stats) {
      const notificationStats = await UnifiedNotificationService.getNotificationStats();
      return NextResponse.json(notificationStats);
    }

    // Build where clause
    const where: any = {};
    if (type) where.type = type;
    if (userId) where.userId = userId;
    if (unreadOnly) where.read = false;

    // Get notifications with pagination
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.notification.count({ where })
    ]);

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { 
      type, 
      title, 
      message, 
      userId, 
      userIds, 
      sendToAll, 
      metadata, 
      persistent = true,
      channels = ["all"],
      action 
    } = body;

    // Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields: type, title, message" },
        { status: 400 }
      );
    }

    const notification = {
      type,
      title,
      message,
      metadata,
      persistent,
      action
    };

    let results;

    if (sendToAll) {
      // Send to all users
      results = await UnifiedNotificationService.sendToAll(notification, channels);
      
      return NextResponse.json({
        success: true,
        message: "Notification sent to all users",
        results: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          details: results
        }
      });

    } else if (userIds && Array.isArray(userIds)) {
      // Send to multiple specific users
      results = [];
      for (const targetUserId of userIds) {
        const result = await UnifiedNotificationService.sendToUser(
          targetUserId, 
          notification, 
          channels
        );
        results.push({ userId: targetUserId, ...result });
      }

      return NextResponse.json({
        success: true,
        message: `Notification sent to ${userIds.length} users`,
        results: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          details: results
        }
      });

    } else if (userId) {
      // Send to single user
      const result = await UnifiedNotificationService.sendToUser(
        userId, 
        notification, 
        channels
      );

      return NextResponse.json({
        success: result.success,
        message: result.success 
          ? "Notification sent successfully" 
          : "Notification partially failed",
        result,
        errors: result.errors
      });

    } else {
      return NextResponse.json(
        { error: "Must specify userId, userIds array, or sendToAll=true" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const daysOld = parseInt(searchParams.get("daysOld") || "30");

    if (action === "cleanup") {
      // Clean up old notifications
      const deletedCount = await UnifiedNotificationService.cleanupOldNotifications(daysOld);
      
      return NextResponse.json({
        success: true,
        message: `Cleaned up ${deletedCount} old notifications`,
        deletedCount
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use ?action=cleanup" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error in notification cleanup:", error);
    return NextResponse.json(
      { error: "Failed to cleanup notifications" },
      { status: 500 }
    );
  }
}