import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { jobProcessor } from "@/lib/background/job-processor";
import { prisma } from "@/lib/prisma";
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
    // Get job details using background job processor
    const job = await jobProcessor.getJobStatus(taskId, session.user.id);

    if (!job) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Calculate retry information
    const retryInfo = {
      currentAttempt: (job.retryCount || 0) + 1,
      maxAttempts: (job.maxRetries || 3) + 1,
      canRetry: (job.status === 'FAILED' || job.status === 'CANCELLED') && (job.retryCount || 0) < (job.maxRetries || 3),
      isRetrying: job.status === 'PENDING' && (job.retryCount || 0) > 0,
      nextRetryAt: job.status === 'PENDING' && (job.retryCount || 0) > 0 ? job.createdAt : null,
    };

    // Format response to match expected task format
    const response = {
      id: job.id,
      type: job.type,
      status: job.status,
      priority: job.priority || 'NORMAL',
      progress: job.progress,
      estimatedTime: job.estimatedTime,
      actualTime: job.actualTime,
      error: job.error,
      result: job.result,
      createdAt: job.createdAt,
      queuedAt: job.createdAt, // Background jobs use createdAt as queue time
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      currentStep: job.currentStep,
      totalSteps: job.totalSteps,
      fileName: job.fileName,
      storyId: job.storyId,
      analysisId: job.analysisId,
      queuePosition: null, // Background jobs don't have queue positions
      retryInfo,
      isComplete: job.isComplete,
      estimatedTimeRemaining: job.estimatedTimeRemaining,
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
    // For background jobs, we need to manually reset the job to retry
    // First check if the job exists and can be retried
    const job = await jobProcessor.getJobStatus(taskId, session.user.id);
    
    if (!job) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    if (job.status !== 'FAILED' && job.status !== 'CANCELLED') {
      return NextResponse.json(
        { error: "Task cannot be retried - only failed or cancelled tasks can be retried" },
        { status: 400 }
      );
    }

    if ((job.retryCount || 0) >= (job.maxRetries || 3)) {
      return NextResponse.json(
        { error: "Task has exceeded maximum retry attempts" },
        { status: 400 }
      );
    }

    // Reset the job to PENDING status for retry
    await prisma.backgroundJob.update({
      where: { id: taskId },
      data: {
        status: 'PENDING',
        progress: 0,
        currentStep: `Retrying... (attempt ${(job.retryCount || 0) + 2}/${(job.maxRetries || 3) + 1})`,
        error: null,
        startedAt: null,
        completedAt: null,
        retryCount: (job.retryCount || 0) + 1,
      },
    });

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
    // Use the background job processor's cancel method
    const success = await jobProcessor.cancelJob(taskId, session.user.id);

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