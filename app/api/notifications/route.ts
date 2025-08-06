import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { UnifiedNotificationService } from "@/lib/unified-notifications";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const unreadOnly = searchParams.get("unread_only") === "true";

    const notifications = await UnifiedNotificationService.getUserNotifications(
      session.user.id,
      limit,
    );

    const filteredNotifications = unreadOnly
      ? notifications.filter((n: any) => !n.read)
      : notifications;

    return NextResponse.json({
      success: true,
      notifications: filteredNotifications,
      unreadCount: notifications.filter((n: any) => !n.read).length,
    });
  } catch (error) {
    console.error("Failed to get notifications:", error);
    return NextResponse.json(
      { error: "Failed to get notifications" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId, action } = await request.json();

    if (action === "mark_read" && notificationId) {
      await UnifiedNotificationService.markAsRead(notificationId, session.user.id);
    } else if (action === "mark_all_read") {
      await UnifiedNotificationService.markAllAsRead(session.user.id);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, title, message, metadata, persistent } = await request.json();

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields: type, title, message" },
        { status: 400 },
      );
    }

    const result = await UnifiedNotificationService.sendToUser(session.user.id, {
      type,
      title,
      message,
      metadata,
      persistent,
    });

    return NextResponse.json({ success: result.success, result });
  } catch (error) {
    console.error("Failed to send notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 },
    );
  }
}
