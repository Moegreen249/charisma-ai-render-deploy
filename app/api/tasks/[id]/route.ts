import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { taskQueueService } from "@/lib/task-queue-service";
import { withEnhancedErrorHandler } from "@/lib/enhanced-error-handler";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getTaskHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // Check authentication
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { id: taskId } = await params;

  if (!taskId) {
    return NextResponse.json(
      { error: "Task ID is required" },
      { status: 400 }
    );
  }

  try {
    // Get task details
    const task = await taskQueueService.getTask(taskId, session.user.id);

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Get queue position if task is queued
    let queuePosition = null;
    if (task.status === 'QUEUED') {
      queuePosition = await taskQueueService.getQueuePosition(taskId);
    }

    // Calculate retry information
    const retryInfo = {
      currentAttempt: task.retryCount + 1,
      maxAttempts: task.maxRetries + 1,
      canRetry: (task.status === 'FAILED' || task.status === 'CANCELED') && task.retryCount < task.maxRetries,
      isRetrying: task.status === 'QUEUED' && task.retryCount > 0,
      nextRetryAt: task.status === 'QUEUED' && task.retryCount > 0 ? task.queuedAt : null,
    };

    // Format response
    const response = {
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
      queuePosition,
      retryInfo,
      payload: task.payload,
    };

    return NextResponse.json({
      success: true,
      task: response
    });

  } catch (error) {
    console.error("Task fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

async function retryTaskHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // Check authentication
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { id: taskId } = await params;

  if (!taskId) {
    return NextResponse.json(
      { error: "Task ID is required" },
      { status: 400 }
    );
  }

  try {
    const success = await taskQueueService.retryTask(taskId, session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: "Task cannot be retried" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task retry initiated"
    });

  } catch (error) {
    console.error("Task retry error:", error);
    return NextResponse.json(
      { error: "Failed to retry task" },
      { status: 500 }
    );
  }
}

async function cancelTaskHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // Check authentication
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { id: taskId } = await params;

  if (!taskId) {
    return NextResponse.json(
      { error: "Task ID is required" },
      { status: 400 }
    );
  }

  try {
    const success = await taskQueueService.cancelTask(taskId, session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: "Task cannot be cancelled" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task cancelled successfully"
    });

  } catch (error) {
    console.error("Task cancel error:", error);
    return NextResponse.json(
      { error: "Failed to cancel task" },
      { status: 500 }
    );
  }
}

// Export handlers with enhanced error handling
export const GET = withEnhancedErrorHandler(getTaskHandler, 'get-task');
export const POST = withEnhancedErrorHandler(retryTaskHandler, 'retry-task');
export const DELETE = withEnhancedErrorHandler(cancelTaskHandler, 'cancel-task');