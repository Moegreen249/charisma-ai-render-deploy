import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { jobProcessor } from "@/lib/background/job-processor";
import { withEnhancedErrorHandler } from "@/lib/enhanced-error-handler";

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

  try {
    // Get user's background jobs (which now include both analysis and story generation)
    const jobs = await jobProcessor.getUserJobs(session.user.id, Math.min(limit, 100));

    // Filter jobs based on query parameters
    let filteredJobs = jobs;

    if (statusParam) {
      const statusFilters = statusParam.split(',');
      filteredJobs = filteredJobs.filter(job => statusFilters.includes(job.status));
    }

    if (typeParam) {
      const typeFilters = typeParam.split(',');
      filteredJobs = filteredJobs.filter(job => typeFilters.includes(job.type));
    }

    if (priorityParam) {
      const priorityFilters = priorityParam.split(',');
      filteredJobs = filteredJobs.filter(job => priorityFilters.includes(job.priority || 'NORMAL'));
    }

    // Apply pagination to filtered results
    const paginatedJobs = filteredJobs.slice(offset, offset + limit);

    // Transform background jobs to match the expected task format
    const enhancedTasks = paginatedJobs.map(job => ({
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
      retryInfo: {
        currentAttempt: (job.retryCount || 0) + 1,
        maxAttempts: (job.maxRetries || 3) + 1,
        canRetry: (job.status === 'FAILED' || job.status === 'CANCELLED') && (job.retryCount || 0) < (job.maxRetries || 3),
        isRetrying: job.status === 'PENDING' && (job.retryCount || 0) > 0,
        nextRetryAt: job.status === 'PENDING' && (job.retryCount || 0) > 0 ? job.createdAt : null,
      },
      canCancel: job.status === 'PENDING' || job.status === 'PROCESSING',
    }));

    return NextResponse.json({
      success: true,
      tasks: enhancedTasks,
      total: filteredJobs.length,
      hasMore: filteredJobs.length > offset + limit,
      pagination: {
        limit,
        offset,
        total: filteredJobs.length,
        pages: Math.ceil(filteredJobs.length / limit),
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