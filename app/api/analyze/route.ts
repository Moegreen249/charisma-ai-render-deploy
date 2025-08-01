import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { analyzeChat } from "@/app/actions/analyze";
import { applyRateLimit, RATE_LIMITS, validateFileUpload, createErrorResponse, createSuccessResponse } from "@/lib/security";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  let session: any = null;
  let file: File | null = null;
  
  try {
    // Apply rate limiting
    const rateLimitResult = applyRateLimit(request, RATE_LIMITS.ANALYSIS);
    if (!rateLimitResult.success) {
      return createErrorResponse(
        "Too many analysis requests. Please wait before trying again.",
        429
      );
    }

    // Check authentication
    session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      logger.warn('Analyze API: Unauthorized access attempt', {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      });
      return createErrorResponse("Authentication required", 401);
    }

    // Get form data
    const formData = await request.formData();
    file = formData.get("chatFile") as File;

    if (!file) {
      return createErrorResponse("No file provided", 400);
    }

    // Validate file upload
    const fileValidation = validateFileUpload(file);
    if (!fileValidation.valid) {
      logger.warn('Analyze API: Invalid file upload', {
        userId: session.user.id,
        fileName: file.name,
        fileSize: file.size,
        error: fileValidation.error
      });
      return createErrorResponse(fileValidation.error || "Invalid file", 400);
    }

    logger.audit('analysis_started', {
      userId: session.user.id,
      fileName: file.name,
      fileSize: file.size
    });

    // Call the analyze action directly with the original FormData
    const result = await analyzeChat(formData);

    if (!result.success) {
      let errorMessage = result.error || "Analysis failed";

      // Log the error for debugging
      logger.error('Analysis failed', new Error(errorMessage), {
        userId: session.user.id,
        fileName: file.name
      });

      // Provide more helpful error messages
      if (
        errorMessage.includes("API key") ||
        errorMessage.includes("authentication")
      ) {
        errorMessage =
          "AI provider not configured. Please set up your API key in Settings.";
      } else if (
        errorMessage.includes("template") ||
        errorMessage.includes("Template")
      ) {
        errorMessage =
          "Analysis template not found. Please check your settings.";
      } else if (
        errorMessage.includes("model") ||
        errorMessage.includes("Model")
      ) {
        errorMessage =
          "AI model not available. Please check your model selection in Settings.";
      } else if (
        errorMessage.includes("quota") ||
        errorMessage.includes("limit")
      ) {
        errorMessage =
          "API quota exceeded. Please check your AI provider billing or try again later.";
      }

      return createErrorResponse(errorMessage, 400);
    }

    logger.audit('analysis_completed', {
      userId: session.user.id,
      fileName: file.name,
      analysisId: result.data?.id
    });

    return createSuccessResponse(result.data);
  } catch (error) {
    logger.error("Analysis API: Unexpected error", error, {
      userId: session?.user?.id,
      fileName: file?.name
    });

    let errorMessage =
      "Analysis failed. Please check your settings and try again.";

    if (error instanceof Error) {
      if (
        error.message.includes("API key") ||
        error.message.includes("authentication")
      ) {
        errorMessage =
          "AI provider not configured. Please set up your API key in Settings.";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
    }

    return createErrorResponse(errorMessage, 500);
  }
}
