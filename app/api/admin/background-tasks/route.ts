import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// Job interface for admin display (now only background jobs)
interface AdminJob {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  type: string;
  status: string;
  progress: number;
  currentStep: string | null;
  totalSteps: number;
  templateId: string | null;
  modelId: string | null;
  provider: string | null;
  fileName: string | null;
  result: any;
  error: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  retryCount: number;
  maxRetries: number;
  priority: string;
  estimatedTime: number | null;
  actualTime: number | null;
  storyId: string | null;
  analysisId: string | null;
}

// Convert background job to admin job format
function formatBackgroundJob(job: any): AdminJob {
  return {
    id: job.id,
    userId: job.userId,
    user: job.user,
    type: job.type,
    status: job.status,
    progress: job.progress,
    currentStep: job.currentStep,
    totalSteps: job.totalSteps,
    templateId: job.templateId,
    modelId: job.modelId,
    provider: job.provider,
    fileName: job.fileName,
    result: job.result,
    error: job.error,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    retryCount: job.retryCount,
    maxRetries: job.maxRetries || 3,
    priority: job.priority || 'NORMAL',
    estimatedTime: job.estimatedTime,
    actualTime: job.actualTime,
    storyId: job.storyId,
    analysisId: job.analysisId,
  };
}

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
    const type = searchParams.get("type"); // Add type filter support

    // Build where clause for background jobs only
    const backgroundJobWhere: any = {};

    if (status && status !== "all") {
      backgroundJobWhere.status = status;
    }
    if (userId) {
      backgroundJobWhere.userId = userId;
    }
    if (type && type !== "all") {
      backgroundJobWhere.type = type;
    }

    // Fetch background jobs only (task queue system has been removed)
    const [backgroundJobs, backgroundJobCount] = await Promise.all([
      prisma.backgroundJob.findMany({
        where: backgroundJobWhere,
        select: {
          id: true,
          userId: true,
          type: true,
          status: true,
          progress: true,
          currentStep: true,
          totalSteps: true,
          templateId: true,
          modelId: true,
          provider: true,
          fileName: true,
          result: true,
          error: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
          updatedAt: true,
          retryCount: true,
          maxRetries: true,
          priority: true,
          estimatedTime: true,
          actualTime: true,
          storyId: true,
          analysisId: true,
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
      prisma.backgroundJob.count({ where: backgroundJobWhere }),
    ]);

    // Format background jobs for admin display
    const formattedJobs = backgroundJobs.map(formatBackgroundJob);
    const totalCount = backgroundJobCount;

    // Get statistics from background jobs only
    const backgroundStats = await prisma.backgroundJob.groupBy({
      by: ["status"],
      _count: { id: true },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    // Calculate statistics
    const stats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    };

    // Add background job stats
    backgroundStats.forEach(stat => {
      const key = stat.status.toLowerCase();
      if (key in stats) {
        stats[key as keyof typeof stats] += stat._count.id;
      }
    });

    return NextResponse.json({
      jobs: formattedJobs,
      totalCount,
      stats,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < totalCount,
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

    let result = { count: 0 };

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
