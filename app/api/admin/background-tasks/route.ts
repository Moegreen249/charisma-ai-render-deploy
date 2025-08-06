import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { TaskStatus, TaskType } from "@prisma/client";

// Unified job interface for admin display
interface UnifiedJob {
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
  source: 'backgroundJob' | 'taskQueue'; // To identify which system the job comes from
  // Additional fields for task queue jobs
  priority?: string;
  estimatedTime?: number;
  actualTime?: number;
  maxRetries?: number;
  queuedAt?: Date;
}

// Normalize background job to unified format
function normalizeBackgroundJob(job: any): UnifiedJob {
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
    source: 'backgroundJob'
  };
}

// Normalize task queue job to unified format
function normalizeTaskQueueJob(task: any): UnifiedJob {
  // Map task queue statuses to background job statuses for consistency
  const statusMap: Record<string, string> = {
    'QUEUED': 'PENDING',
    'RUNNING': 'PROCESSING',
    'COMPLETED': 'COMPLETED',
    'FAILED': 'FAILED',
    'CANCELED': 'CANCELLED'
  };

  // Extract story information from payload if available
  let fileName = null;
  let templateId = null;
  if (task.payload && typeof task.payload === 'object') {
    // For story generation, try to extract story title or analysis info
    if (task.type === 'STORY_GENERATION' && task.payload.analysisResult) {
      fileName = `Story Generation`;
    }
  }

  return {
    id: task.id,
    userId: task.userId,
    user: task.user,
    type: task.type,
    status: statusMap[task.status] || task.status,
    progress: task.progress,
    currentStep: `${task.type} Task`, // Task queue doesn't have detailed steps
    totalSteps: 1, // Task queue doesn't track steps the same way
    templateId: templateId,
    modelId: null, // Task queue doesn't store this directly
    provider: null, // Task queue doesn't store this directly
    fileName: fileName,
    result: task.result,
    error: task.error,
    startedAt: task.startedAt,
    completedAt: task.completedAt,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    retryCount: task.retryCount,
    source: 'taskQueue',
    // Additional task queue specific fields
    priority: task.priority,
    estimatedTime: task.estimatedTime,
    actualTime: task.actualTime,
    maxRetries: task.maxRetries,
    queuedAt: task.queuedAt
  };
}

// Map task queue status to background job status for filtering
function mapTaskQueueStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'QUEUED',
    'PROCESSING': 'RUNNING',
    'COMPLETED': 'COMPLETED',
    'FAILED': 'FAILED',
    'CANCELLED': 'CANCELED'
  };
  return statusMap[status] || status;
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

    // Build where clauses for both tables
    const backgroundJobWhere: any = {};
    const taskQueueWhere: any = {};

    if (status && status !== "all") {
      backgroundJobWhere.status = status;
      taskQueueWhere.status = mapTaskQueueStatus(status);
    }
    if (userId) {
      backgroundJobWhere.userId = userId;
      taskQueueWhere.userId = userId;
    }
    if (type && type !== "all") {
      if (type === "STORY_GENERATION") {
        // Only query task queue for story generation
        taskQueueWhere.type = type;
        backgroundJobWhere.type = "NEVER_MATCH"; // Ensure no background jobs match
      } else {
        // Only query background jobs for other types
        backgroundJobWhere.type = type;
        taskQueueWhere.type = "NEVER_MATCH"; // Ensure no task queue jobs match
      }
    }

    // Fetch from both systems in parallel
    const [backgroundJobs, taskQueueJobs, backgroundJobCount, taskQueueCount] = await Promise.all([
      // Background jobs (analysis, etc.)
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
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      
      // Task queue jobs (story generation, etc.)
      prisma.taskQueue.findMany({
        where: taskQueueWhere,
        select: {
          id: true,
          userId: true,
          type: true,
          status: true,
          priority: true,
          progress: true,
          payload: true,
          result: true,
          error: true,
          estimatedTime: true,
          actualTime: true,
          retryCount: true,
          maxRetries: true,
          queuedAt: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      
      // Counts
      prisma.backgroundJob.count({ where: backgroundJobWhere }),
      prisma.taskQueue.count({ where: taskQueueWhere }),
    ]);

    // Normalize and merge jobs
    const normalizedBackgroundJobs = backgroundJobs.map(normalizeBackgroundJob);
    const normalizedTaskQueueJobs = taskQueueJobs.map(normalizeTaskQueueJob);
    const allJobs = [...normalizedBackgroundJobs, ...normalizedTaskQueueJobs];

    // Sort by creation date (most recent first)
    allJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination to merged results
    const totalCount = backgroundJobCount + taskQueueCount;
    const paginatedJobs = allJobs.slice(offset, offset + limit);

    // Get combined statistics from both systems
    const [backgroundStats, taskQueueStats] = await Promise.all([
      prisma.backgroundJob.groupBy({
        by: ["status"],
        _count: { id: true },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
      prisma.taskQueue.groupBy({
        by: ["status"],
        _count: { id: true },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    // Combine statistics
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

    // Add task queue stats (with status mapping)
    taskQueueStats.forEach(stat => {
      const mappedStatus = {
        'QUEUED': 'pending',
        'RUNNING': 'processing',
        'COMPLETED': 'completed',
        'FAILED': 'failed',
        'CANCELED': 'cancelled'
      }[stat.status] || stat.status.toLowerCase();
      
      if (mappedStatus in stats) {
        stats[mappedStatus as keyof typeof stats] += stat._count.id;
      }
    });

    // Add system source information for debugging
    const systemInfo = {
      backgroundJobsCount: backgroundJobCount,
      taskQueueJobsCount: taskQueueCount,
      totalMerged: totalCount,
    };

    return NextResponse.json({
      jobs: paginatedJobs,
      totalCount,
      stats,
      systemInfo, // Include for admin debugging
      pagination: {
        limit,
        offset,
        hasMore: offset + paginatedJobs.length < totalCount,
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
    const { action, jobIds, sources } = body; // Add sources to identify which system each job belongs to

    if (!action || !Array.isArray(jobIds)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    // If sources are provided, separate jobs by system
    let backgroundJobIds: string[] = [];
    let taskQueueJobIds: string[] = [];

    if (sources && Array.isArray(sources)) {
      jobIds.forEach((jobId, index) => {
        if (sources[index] === 'backgroundJob') {
          backgroundJobIds.push(jobId);
        } else if (sources[index] === 'taskQueue') {
          taskQueueJobIds.push(jobId);
        }
      });
    } else {
      // Fallback: try to determine which system each job belongs to
      const [backgroundJobs, taskQueueJobs] = await Promise.all([
        prisma.backgroundJob.findMany({
          where: { id: { in: jobIds } },
          select: { id: true }
        }),
        prisma.taskQueue.findMany({
          where: { id: { in: jobIds } },
          select: { id: true }
        })
      ]);

      backgroundJobIds = backgroundJobs.map(job => job.id);
      taskQueueJobIds = taskQueueJobs.map(job => job.id);
    }

    let backgroundResult = { count: 0 };
    let taskQueueResult = { count: 0 };

    switch (action) {
      case "cancel":
        // Cancel background jobs
        if (backgroundJobIds.length > 0) {
          backgroundResult = await prisma.backgroundJob.updateMany({
            where: {
              id: { in: backgroundJobIds },
              status: { in: ["PENDING", "PROCESSING"] },
            },
            data: {
              status: "CANCELLED",
              updatedAt: new Date(),
            },
          });
        }

        // Cancel task queue jobs
        if (taskQueueJobIds.length > 0) {
          taskQueueResult = await prisma.taskQueue.updateMany({
            where: {
              id: { in: taskQueueJobIds },
              status: { in: ["QUEUED", "RUNNING"] },
            },
            data: {
              status: "CANCELED",
              updatedAt: new Date(),
            },
          });
        }
        break;

      case "retry":
        // Retry background jobs
        if (backgroundJobIds.length > 0) {
          backgroundResult = await prisma.backgroundJob.updateMany({
            where: {
              id: { in: backgroundJobIds },
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
        }

        // Retry task queue jobs
        if (taskQueueJobIds.length > 0) {
          taskQueueResult = await prisma.taskQueue.updateMany({
            where: {
              id: { in: taskQueueJobIds },
              status: "FAILED",
            },
            data: {
              status: "QUEUED",
              progress: 0,
              error: null,
              startedAt: null,
              completedAt: null,
              queuedAt: new Date(),
              updatedAt: new Date(),
            },
          });
        }
        break;

      case "delete":
        // Delete background jobs
        if (backgroundJobIds.length > 0) {
          backgroundResult = await prisma.backgroundJob.deleteMany({
            where: {
              id: { in: backgroundJobIds },
              status: { in: ["COMPLETED", "FAILED", "CANCELLED"] },
            },
          });
        }

        // Delete task queue jobs
        if (taskQueueJobIds.length > 0) {
          taskQueueResult = await prisma.taskQueue.deleteMany({
            where: {
              id: { in: taskQueueJobIds },
              status: { in: ["COMPLETED", "FAILED", "CANCELED"] },
            },
          });
        }
        break;

      case "pause_queue":
        // This would require implementing a queue pause mechanism
        // For now, we'll just return success
        break;

      case "resume_queue":
        // This would require implementing a queue resume mechanism
        // For now, we'll just return success
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 },
        );
    }

    const totalAffected = backgroundResult.count + taskQueueResult.count;

    // Log the admin action
    try {
      await prisma.userActivity.create({
        data: {
          userId: session.user.id,
          action: `background_task_${action}`,
          category: "admin",
          metadata: {
            jobIds,
            backgroundJobsAffected: backgroundResult.count,
            taskQueueJobsAffected: taskQueueResult.count,
            totalAffected,
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
      affectedCount: totalAffected,
      details: {
        backgroundJobs: backgroundResult.count,
        taskQueueJobs: taskQueueResult.count,
      },
      message: `Successfully ${action}ed ${totalAffected} job(s) (${backgroundResult.count} background jobs, ${taskQueueResult.count} task queue jobs)`,
    });
  } catch (error) {
    console.error("Background tasks action error:", error);

    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 },
    );
  }
}
