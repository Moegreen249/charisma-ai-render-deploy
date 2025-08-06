import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { taskQueueService } from "@/lib/task-queue-service";
import { withEnhancedErrorHandler } from "@/lib/enhanced-error-handler";
import { TaskStatus, TaskType, TaskPriority } from "@prisma/client";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getTasksHandler(request: NextRequest): Promise<NextResponse> {
  // Check authentication
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  
  // Parse query parameters
  const statusParam = searchParams.get('status');
  const typeParam = searchParams.get('type');
  const priorityParam = searchParams.get('priority');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  // Parse status filter
  let status: TaskStatus[] | undefined;
  if (statusParam) {
    status = statusParam.split(',').filter(s => 
      Object.values(TaskStatus).includes(s as TaskStatus)
    ) as TaskStatus[];
  }

  // Parse type filter
  let type: TaskType[] | undefined;
  if (typeParam) {
    type = typeParam.split(',').filter(t => 
      Object.values(TaskType).includes(t as TaskType)
    ) as TaskType[];
  }

  // Parse priority filter
  let priority: TaskPriority[] | undefined;
  if (priorityParam) {
    priority = priorityParam.split(',').filter(p => 
      Object.values(TaskPriority).includes(p as TaskPriority)
    ) as TaskPriority[];
  }

  try {
    const result = await taskQueueService.getUserTasks(session.user.id, {
      status,
      type,
      limit: Math.min(limit, 100), // Cap at 100
      offset: Math.max(offset, 0),
    });

    // Enhance tasks with retry information
    const enhancedTasks = result.tasks.map(task => ({
      id: task.id,
      type: task.type,
      status: task.status,
      priority: task.priority,
      progress: task.progress,
      estimatedTime: task.estimatedTime,
      actualTime: task.actualTime,
      error: task.error,
      result: task.result,
      createdAt: task.createdAt,
      queuedAt: task.queuedAt,
      startedAt: task.startedAt,
      completedAt: task.completedAt,
      retryInfo: {
        currentAttempt: task.retryCount + 1,
        maxAttempts: task.maxRetries + 1,
        canRetry: (task.status === 'FAILED' || task.status === 'CANCELED') && task.retryCount < task.maxRetries,
        isRetrying: task.status === 'QUEUED' && task.retryCount > 0,
        nextRetryAt: task.status === 'QUEUED' && task.retryCount > 0 ? task.queuedAt : null,
      },
      canCancel: task.status === 'QUEUED' || task.status === 'RUNNING',
    }));

    return NextResponse.json({
      success: true,
      tasks: enhancedTasks,
      total: result.total,
      hasMore: result.total > offset + limit,
      pagination: {
        limit,
        offset,
        total: result.total,
        pages: Math.ceil(result.total / limit),
        currentPage: Math.floor(offset / limit) + 1,
      }
    });

  } catch (error) {
    console.error("Tasks fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// Export handler with enhanced error handling
export const GET = withEnhancedErrorHandler(getTasksHandler, 'get-tasks');