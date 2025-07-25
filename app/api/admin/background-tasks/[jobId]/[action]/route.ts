import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { RedisService } from "@/lib/redis";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string; action: string }> },
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

    const { jobId, action } = await params;

    if (!jobId || !action) {
      return NextResponse.json(
        { error: "Job ID and action are required" },
        { status: 400 },
      );
    }

    // Get the job first to verify it exists
    const job = await prisma.backgroundJob.findUnique({
      where: { id: jobId },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    let result;
    let message = "";

    switch (action) {
      case "cancel":
        if (!["PENDING", "PROCESSING"].includes(job.status)) {
          return NextResponse.json(
            { error: "Job cannot be cancelled in current state" },
            { status: 400 },
          );
        }

        result = await prisma.backgroundJob.update({
          where: { id: jobId },
          data: {
            status: "CANCELLED",
            error: "Cancelled by administrator",
            updatedAt: new Date(),
          },
        });

        // Clear job cache
        await RedisService.deleteJobCache(jobId);

        // Publish cancellation notification
        await RedisService.publishNotification("job_updates", {
          type: "job_cancelled",
          jobId,
          userId: job.userId,
          adminId: session.user.id,
          timestamp: new Date().toISOString(),
        });

        message = "Job cancelled successfully";
        break;

      case "retry":
        if (job.status !== "FAILED") {
          return NextResponse.json(
            { error: "Only failed jobs can be retried" },
            { status: 400 },
          );
        }

        result = await prisma.backgroundJob.update({
          where: { id: jobId },
          data: {
            status: "PENDING",
            progress: 0,
            currentStep: "Queued for retry",
            error: null,
            startedAt: null,
            completedAt: null,
            retryCount: 0,
            updatedAt: new Date(),
          },
        });

        // Clear job cache
        await RedisService.deleteJobCache(jobId);

        // Add job back to queue
        await RedisService.addToQueue("background_analysis", {
          id: jobId,
          userId: job.userId,
          type: job.type,
          templateId: job.templateId,
          modelId: job.modelId,
          provider: job.provider,
          fileName: job.fileName,
          fileContent: job.fileContent,
          apiKey: job.apiKey,
        });

        // Publish retry notification
        await RedisService.publishNotification("job_updates", {
          type: "job_retried",
          jobId,
          userId: job.userId,
          adminId: session.user.id,
          timestamp: new Date().toISOString(),
        });

        message = "Job queued for retry";
        break;

      case "delete":
        if (["PENDING", "PROCESSING"].includes(job.status)) {
          return NextResponse.json(
            { error: "Cannot delete active jobs. Cancel first." },
            { status: 400 },
          );
        }

        result = await prisma.backgroundJob.delete({
          where: { id: jobId },
        });

        // Clear job cache
        await RedisService.deleteJobCache(jobId);

        // Publish deletion notification
        await RedisService.publishNotification("job_updates", {
          type: "job_deleted",
          jobId,
          userId: job.userId,
          adminId: session.user.id,
          timestamp: new Date().toISOString(),
        });

        message = "Job deleted successfully";
        break;

      case "restart":
        if (!["COMPLETED", "FAILED", "CANCELLED"].includes(job.status)) {
          return NextResponse.json(
            { error: "Job cannot be restarted in current state" },
            { status: 400 },
          );
        }

        result = await prisma.backgroundJob.update({
          where: { id: jobId },
          data: {
            status: "PENDING",
            progress: 0,
            currentStep: "Queued for restart",
            error: null,
            result: undefined,
            startedAt: null,
            completedAt: null,
            retryCount: 0,
            updatedAt: new Date(),
          },
        });

        // Clear job cache
        await RedisService.deleteJobCache(jobId);

        // Add job back to queue
        await RedisService.addToQueue("background_analysis", {
          id: jobId,
          userId: job.userId,
          type: job.type,
          templateId: job.templateId,
          modelId: job.modelId,
          provider: job.provider,
          fileName: job.fileName,
          fileContent: job.fileContent,
          apiKey: job.apiKey,
        });

        message = "Job restarted successfully";
        break;

      case "priority":
        // Set job as high priority
        if (!["PENDING"].includes(job.status)) {
          return NextResponse.json(
            { error: "Can only prioritize pending jobs" },
            { status: 400 },
          );
        }

        // Move to high priority queue
        await RedisService.addToQueue(
          "background_analysis",
          {
            id: jobId,
            userId: job.userId,
            type: job.type,
            templateId: job.templateId,
            modelId: job.modelId,
            provider: job.provider,
            fileName: job.fileName,
            fileContent: job.fileContent,
            apiKey: job.apiKey,
          },
          -Date.now(),
        ); // Negative timestamp for high priority

        result = { affected: 1 };
        message = "Job prioritized successfully";
        break;

      case "debug":
        // Get detailed job information for debugging
        try {
          const { jobProcessor } = await import(
            "@/lib/background/job-processor"
          );
          const jobDetails = await jobProcessor.getJobDetails(jobId);
          result = { jobDetails };
          message = "Job debug information retrieved";
        } catch (debugError) {
          return NextResponse.json(
            { error: "Failed to get job debug information" },
            { status: 500 },
          );
        }
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Log the admin action
    try {
      await prisma.userActivity.create({
        data: {
          userId: session.user.id,
          action: `background_job_${action}`,
          category: "admin",
          metadata: {
            jobId,
            targetUserId: job.userId,
            targetUserEmail: job.user.email,
            jobFileName: job.fileName,
            previousStatus: job.status,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (logError) {
      console.error("Failed to log admin action:", logError);
    }

    // Log platform error if this was an error-related action
    if (["retry", "restart"].includes(action) && job.error) {
      try {
        await prisma.platformError.create({
          data: {
            category: "SYSTEM",
            severity: "MEDIUM",
            message: `Admin ${action} for failed job: ${job.error}`,
            userId: job.userId,
            endpoint: `/api/admin/background-tasks/${jobId}/${action}`,
            requestData: {
              jobId,
              originalError: job.error,
              adminAction: action,
              adminId: session.user.id,
            },
          },
        });
      } catch (logError) {
        console.error("Failed to log job error:", logError);
      }
    }

    return NextResponse.json({
      success: true,
      action,
      jobId,
      message,
      job: result || job,
    });
  } catch (error) {
    const resolvedParams = await params;
    console.error(`Background job ${resolvedParams.action} error:`, error);

    // Log this error to the platform error system
    try {
      await prisma.platformError.create({
        data: {
          category: "SYSTEM",
          severity: "HIGH",
          message: `Admin job action ${resolvedParams.action} failed`,
          stackTrace: error instanceof Error ? error.stack : String(error),
          endpoint: `/api/admin/background-tasks/${resolvedParams.jobId}/${resolvedParams.action}`,
          requestData: {
            jobId: resolvedParams.jobId,
            action: resolvedParams.action,
          },
        },
      });
    } catch (logError) {
      console.error("Failed to log job action error:", logError);
    }

    return NextResponse.json(
      { error: `Failed to ${resolvedParams.action} job` },
      { status: 500 },
    );
  }
}
