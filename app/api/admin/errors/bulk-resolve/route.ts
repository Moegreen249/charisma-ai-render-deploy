import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { RedisService } from "@/lib/redis";

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
    const {
      severity,
      category,
      errorIds,
      olderThan,
      resolution
    } = body;

    // Build where clause for bulk resolution
    const where: any = {
      isResolved: false,
    };

    if (severity) {
      where.severity = severity;
    }

    if (category) {
      where.category = category;
    }

    if (errorIds && Array.isArray(errorIds)) {
      where.id = { in: errorIds };
    }

    if (olderThan) {
      where.createdAt = {
        lt: new Date(Date.now() - olderThan * 24 * 60 * 60 * 1000), // olderThan in days
      };
    }

    // Get errors to be resolved for logging
    const errorsToResolve = await prisma.platformError.findMany({
      where,
      select: {
        id: true,
        category: true,
        severity: true,
        message: true,
      },
    });

    if (errorsToResolve.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No errors found matching the criteria",
        resolvedCount: 0,
      });
    }

    // Perform bulk update
    const result = await prisma.platformError.updateMany({
      where,
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: session.user.id,
        resolution: resolution || `Bulk resolved by admin ${session.user.name || session.user.email}`,
      },
    });

    // Log the bulk admin action
    try {
      await prisma.userActivity.create({
        data: {
          userId: session.user.id,
          action: "bulk_error_resolution",
          category: "admin",
          metadata: {
            resolvedCount: result.count,
            criteria: {
              severity,
              category,
              errorIds: errorIds?.length || 0,
              olderThan,
            },
            resolution: resolution || "Bulk resolution by admin",
            errorIds: errorsToResolve.map(e => e.id),
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (logError) {
      console.error("Failed to log bulk admin action:", logError);
    }

    // Publish notification for real-time updates
    await RedisService.publishNotification("error_updates", {
      type: "bulk_error_resolved",
      adminId: session.user.id,
      adminName: session.user.name,
      resolvedCount: result.count,
      criteria: { severity, category },
      timestamp: new Date().toISOString(),
    });

    // Clear cached analytics
    await RedisService.cacheAnalytics("system_status", null, 0);

    // Create summary for each category/severity resolved
    const summary = errorsToResolve.reduce((acc, error) => {
      const key = `${error.category}_${error.severity}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      message: `Successfully resolved ${result.count} error(s)`,
      resolvedCount: result.count,
      summary,
      criteria: {
        severity,
        category,
        errorIds: errorIds?.length || 0,
        olderThan,
      },
    });

  } catch (error) {
    console.error("Bulk error resolution API error:", error);

    // Log this error to the platform error system
    try {
      await prisma.platformError.create({
        data: {
          category: "SYSTEM",
          severity: "HIGH",
          message: "Bulk error resolution API endpoint failed",
          stackTrace: error instanceof Error ? error.stack : String(error),
          endpoint: "/api/admin/errors/bulk-resolve",
        },
      });
    } catch (logError) {
      console.error("Failed to log bulk error resolution API error:", logError);
    }

    return NextResponse.json(
      { error: "Failed to perform bulk error resolution" },
      { status: 500 }
    );
  }
}
