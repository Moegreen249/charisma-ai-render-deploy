import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { RedisService } from "@/lib/redis";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ errorId: string }> },
) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { errorId } = await params;

    if (!errorId) {
      return NextResponse.json(
        { error: "Error ID is required" },
        { status: 400 },
      );
    }

    // Get the error first to verify it exists
    const error = await prisma.platformError.findUnique({
      where: { id: errorId },
    });

    if (!error) {
      return NextResponse.json({ error: "Error not found" }, { status: 404 });
    }

    if (error.isResolved) {
      return NextResponse.json(
        { error: "Error is already resolved" },
        { status: 400 },
      );
    }

    // Get resolution details from request body (optional)
    const body = await request.json().catch(() => ({}));
    const { resolution, notes } = body;

    // Update error as resolved
    const updatedError = await prisma.platformError.update({
      where: { id: errorId },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: session.user.id,
        resolution:
          resolution ||
          `Resolved by admin ${session.user.name || session.user.email}`,
        requestData: {
          resolvedBy: session.user.id,
          resolvedByName: session.user.name,
          resolvedByEmail: session.user.email,
          resolutionNotes: notes,
          resolvedAt: new Date().toISOString(),
          originalErrorData: error.requestData,
        },
      },
    });

    // Log the admin action
    try {
      await prisma.userActivity.create({
        data: {
          userId: session.user.id,
          action: "error_resolved",
          category: "admin",
          metadata: {
            errorId,
            errorCategory: error.category,
            errorSeverity: error.severity,
            errorMessage: error.message,
            resolution: resolution || "Manual resolution by admin",
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (logError) {
      console.error("Failed to log admin action:", logError);
    }

    // Publish notification for real-time updates
    await RedisService.publishNotification("error_updates", {
      type: "error_resolved",
      errorId,
      adminId: session.user.id,
      adminName: session.user.name,
      category: error.category,
      severity: error.severity,
      timestamp: new Date().toISOString(),
    });

    // Clear any cached analytics that might include this error
    await RedisService.cacheAnalytics("system_status", null, 0);

    return NextResponse.json({
      success: true,
      message: "Error resolved successfully",
      error: updatedError,
    });
  } catch (error) {
    console.error("Error resolution API error:", error);

    // Log this error to the platform error system
    try {
      await prisma.platformError.create({
        data: {
          category: "SYSTEM",
          severity: "MEDIUM",
          message: "Error resolution API endpoint failed",
          stackTrace: error instanceof Error ? error.stack : String(error),
          endpoint: `/api/admin/errors/${(await params).errorId}/resolve`,
          requestData: {
            targetErrorId: (await params).errorId,
          },
        },
      });
    } catch (logError) {
      console.error("Failed to log error resolution API error:", logError);
    }

    return NextResponse.json(
      { error: "Failed to resolve error" },
      { status: 500 },
    );
  }
}
