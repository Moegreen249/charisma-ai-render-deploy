import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { UnifiedNotificationService } from "@/lib/unified-notifications";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { action, notificationIds, filters } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Missing required field: action" },
        { status: 400 }
      );
    }

    let whereClause: any = {};

    // Build where clause from filters or notification IDs
    if (notificationIds && Array.isArray(notificationIds)) {
      whereClause.id = { in: notificationIds };
    } else if (filters) {
      if (filters.type) whereClause.type = filters.type;
      if (filters.userId) whereClause.userId = filters.userId;
      if (filters.unreadOnly) whereClause.read = false;
      if (filters.dateRange) {
        whereClause.createdAt = {};
        if (filters.dateRange.from) {
          whereClause.createdAt.gte = new Date(filters.dateRange.from);
        }
        if (filters.dateRange.to) {
          whereClause.createdAt.lte = new Date(filters.dateRange.to);
        }
      }
    }

    let result;

    switch (action) {
      case "markAsRead":
        result = await prisma.notification.updateMany({
          where: whereClause,
          data: { 
            read: true, 
            readAt: new Date() 
          }
        });
        
        return NextResponse.json({
          success: true,
          message: `Marked ${result.count} notifications as read`,
          updatedCount: result.count
        });

      case "markAsUnread":
        result = await prisma.notification.updateMany({
          where: whereClause,
          data: { 
            read: false, 
            readAt: null 
          }
        });
        
        return NextResponse.json({
          success: true,
          message: `Marked ${result.count} notifications as unread`,
          updatedCount: result.count
        });

      case "makePersistent":
        result = await prisma.notification.updateMany({
          where: whereClause,
          data: { persistent: true }
        });
        
        return NextResponse.json({
          success: true,
          message: `Made ${result.count} notifications persistent`,
          updatedCount: result.count
        });

      case "makeNonPersistent":
        result = await prisma.notification.updateMany({
          where: whereClause,
          data: { persistent: false }
        });
        
        return NextResponse.json({
          success: true,
          message: `Made ${result.count} notifications non-persistent`,
          updatedCount: result.count
        });

      case "delete":
        result = await prisma.notification.deleteMany({
          where: whereClause
        });
        
        return NextResponse.json({
          success: true,
          message: `Deleted ${result.count} notifications`,
          deletedCount: result.count
        });

      case "resend":
        // Get notifications to resend
        const notificationsToResend = await prisma.notification.findMany({
          where: whereClause,
          include: {
            user: { select: { id: true } }
          }
        });

        const resendResults = [];
        for (const notification of notificationsToResend) {
          try {
            const result = await UnifiedNotificationService.sendToUser(
              notification.userId,
              {
                type: notification.type as any,
                title: notification.title,
                message: notification.message,
                metadata: notification.metadata as any,
                persistent: notification.persistent,
              },
              ["websocket", "redis"] // Don't duplicate in database
            );
            
            resendResults.push({
              notificationId: notification.id,
              userId: notification.userId,
              success: result.success,
              errors: result.errors
            });
          } catch (error) {
            resendResults.push({
              notificationId: notification.id,
              userId: notification.userId,
              success: false,
              errors: [error instanceof Error ? error.message : "Unknown error"]
            });
          }
        }

        const successfulResends = resendResults.filter(r => r.success).length;
        
        return NextResponse.json({
          success: true,
          message: `Resent ${successfulResends} of ${notificationsToResend.length} notifications`,
          results: resendResults,
          summary: {
            total: notificationsToResend.length,
            successful: successfulResends,
            failed: resendResults.length - successfulResends
          }
        });

      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}. Valid actions: markAsRead, markAsUnread, makePersistent, makeNonPersistent, delete, resend` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("Error in bulk notification operation:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}