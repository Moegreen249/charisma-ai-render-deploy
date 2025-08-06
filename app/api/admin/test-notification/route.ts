import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { UnifiedNotificationService } from "@/lib/unified-notifications";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is admin
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { type, userId, title, message } = await request.json();

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields: type, title, message" },
        { status: 400 }
      );
    }

    let result;

    if (userId) {
      // Send to specific user
      result = await UnifiedNotificationService.sendToUser(userId, {
        type,
        title,
        message,
        metadata: { testNotification: true, sentBy: session.user.id },
      });
    } else {
      // Send to all users
      await UnifiedNotificationService.sendToAll({
        type,
        title,
        message,
        metadata: { testNotification: true, sentBy: session.user.id },
      });
      result = { message: "Sent to all users" };
    }

    return NextResponse.json({
      success: true,
      message: "Test notification sent successfully",
      result,
    });
  } catch (error) {
    console.error("Failed to send test notification:", error);
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Send a test notification to the admin user
    const result = await UnifiedNotificationService.sendToUser(session.user.id, {
      type: "general",
      title: "Test Notification",
      message: "This is a test notification to verify the system is working correctly.",
      metadata: {
        testNotification: true,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Test notification sent to admin",
      result,
    });
  } catch (error) {
    console.error("Failed to send test notification:", error);
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    );
  }
}
