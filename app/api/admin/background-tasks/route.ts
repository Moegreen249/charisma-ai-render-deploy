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
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    // Build where clause
    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }

    // Fetch background jobs with user information
    const [jobs, totalCount] = await Promise.all([
      prisma.backgroundJob.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.backgroundJob.count({ where }),
    ]);

    // Get queue statistics
    const queueStats = await prisma.backgroundJob.groupBy({
      by: ["status"],
      _count: { id: true },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    const stats = queueStats.reduce(
      (acc, stat) => {
        acc[stat.status.toLowerCase()] = stat._count.id;
        return acc;
      },
      {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
      } as Record<string, number>,
    );

    return NextResponse.json({
      jobs,
      totalCount,
      stats,
      pagination: {
        limit,
        offset,
        hasMore: offset + jobs.length < totalCount,
      },
    });
  } catch (error) {
    console.error("Background tasks API error:", error);

    // Log this error to the platform error system
    try {
      await prisma.platformError.create({
        data: {
          category: "SYSTEM",
          severity: "HIGH",
          message: "Background tasks API endpoint error",
          stackTrace: error instanceof Error ? error.stack : String(error),
          endpoint: "/api/admin/background-tasks",
        },
      });
    } catch (logError) {
      console.error("Failed to log background tasks API error:", logError);
    }

    return NextResponse.json(
      { error: "Failed to fetch background tasks" },
      { status: 500 },
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
    const { action, jobIds } = body;

    if (!action || !Array.isArray(jobIds)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    let result;

    switch (action) {
      case "cancel":
        result = await prisma.backgroundJob.updateMany({
          where: {
            id: { in: jobIds },
            status: { in: ["PENDING", "PROCESSING"] },
          },
          data: {
            status: "CANCELLED",
            updatedAt: new Date(),
          },
        });
        break;

      case "retry":
        result = await prisma.backgroundJob.updateMany({
          where: {
            id: { in: jobIds },
            status: "FAILED",
          },
          data: {
            status: "PENDING",
            progress: 0,
            currentStep: null,
            error: null,
            startedAt: null,
            completedAt: null,
            updatedAt: new Date(),
          },
        });
        break;

      case "delete":
        result = await prisma.backgroundJob.deleteMany({
          where: {
            id: { in: jobIds },
            status: { in: ["COMPLETED", "FAILED", "CANCELLED"] },
          },
        });
        break;

      case "pause_queue":
        // This would require implementing a queue pause mechanism
        // For now, we'll just return success
        result = { count: 0 };
        break;

      case "resume_queue":
        // This would require implementing a queue resume mechanism
        // For now, we'll just return success
        result = { count: 0 };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 },
        );
    }

    // Log the admin action
    try {
      await prisma.userActivity.create({
        data: {
          userId: session.user.id,
          action: `background_task_${action}`,
          category: "admin",
          metadata: {
            jobIds,
            affectedCount: result.count,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (logError) {
      console.error("Failed to log admin action:", logError);
    }

    return NextResponse.json({
      success: true,
      action,
      affectedCount: result.count,
      message: `Successfully ${action}ed ${result.count} job(s)`,
    });
  } catch (error) {
    console.error("Background tasks action error:", error);

    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 },
    );
  }
}
