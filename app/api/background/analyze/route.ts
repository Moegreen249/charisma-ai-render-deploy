import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { jobProcessor } from "@/lib/background/job-processor";
import { logPlatformError } from "@/lib/background/error-tracker";
import { trackUserActivity } from "@/lib/background/analytics";
import { z } from "zod";

const analyzeRequestSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  modelId: z.string().min(1, "Model ID is required"),
  provider: z.string().min(1, "Provider is required"),
  fileName: z.string().min(1, "File name is required"),
  fileContent: z.string().min(1, "File content is required"),
  apiKey: z.string().min(1, "API key is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = analyzeRequestSchema.parse(body);

    // Create background job
    const jobId = await jobProcessor.createAnalysisJob({
      userId: session.user.id,
      templateId: validatedData.templateId,
      modelId: validatedData.modelId,
      provider: validatedData.provider,
      fileName: validatedData.fileName,
      fileContent: validatedData.fileContent,
      apiKey: validatedData.apiKey,
    });

    // Track user activity
    await trackUserActivity({
      userId: session.user.id,
      action: "background_analysis_started",
      category: "analysis",
      metadata: {
        jobId,
        fileName: validatedData.fileName,
        provider: validatedData.provider,
      },
    });

    return NextResponse.json({
      success: true,
      jobId,
      message: "Analysis started in background",
    });
  } catch (error) {
    console.error("Background analyze API error:", error);

    // Log platform error
    await logPlatformError({
      category: "AI_PROVIDER",
      severity: "HIGH",
      message: `Background analysis API failed: ${error instanceof Error ? error.message : String(error)}`,
      endpoint: "/api/background/analyze",
      userAgent: request.headers.get("user-agent") || undefined,
      stackTrace: error instanceof Error ? error.stack : undefined,
      requestData: { method: "POST" },
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to start background analysis",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (jobId) {
      // Get specific job status
      const jobStatus = await jobProcessor.getJobStatus(jobId, session.user.id);
      return NextResponse.json({
        success: true,
        job: jobStatus,
      });
    } else {
      // Get user's job history
      const jobs = await jobProcessor.getUserJobs(session.user.id, limit);
      return NextResponse.json({
        success: true,
        jobs,
      });
    }
  } catch (error) {
    console.error("Background analyze GET API error:", error);

    // Log platform error
    await logPlatformError({
      category: "DATABASE",
      severity: "MEDIUM",
      message: `Background analysis status API failed: ${error instanceof Error ? error.message : String(error)}`,
      endpoint: "/api/background/analyze",
      userAgent: request.headers.get("user-agent") || undefined,
      stackTrace: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to get job information",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get job ID from query params
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Job ID is required" },
        { status: 400 },
      );
    }

    // Cancel job
    await jobProcessor.cancelJob(jobId, session.user.id);

    // Track user activity
    await trackUserActivity({
      userId: session.user.id,
      action: "background_analysis_cancelled",
      category: "analysis",
      metadata: { jobId },
    });

    return NextResponse.json({
      success: true,
      message: "Job cancelled successfully",
    });
  } catch (error) {
    console.error("Background analyze DELETE API error:", error);

    // Log platform error
    await logPlatformError({
      category: "SYSTEM",
      severity: "MEDIUM",
      message: `Background analysis cancel API failed: ${error instanceof Error ? error.message : String(error)}`,
      endpoint: "/api/background/analyze",
      userAgent: request.headers.get("user-agent") || undefined,
      stackTrace: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to cancel job",
      },
      { status: 500 },
    );
  }
}
