import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { 
  createApiErrorResponse, 
  createApiSuccessResponse, 
  withApiErrorHandler, 
  ApiErrorCode,
  validateRequiredFields 
} from "@/lib/api-error-handler";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const GET = withApiErrorHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const session = await getServerSession(authConfig);

  if (!session) {
    return createApiErrorResponse(ApiErrorCode.UNAUTHORIZED);
  }

  const { id } = await params;

  // Validate story ID format
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return createApiErrorResponse(
      ApiErrorCode.INVALID_INPUT,
      "Invalid story ID provided"
    );
  }

  const story = await prisma.story.findFirst({
    where: {
      id: id.trim(),
      userId: session.user.id,
    },
    include: {
      analysis: {
        select: {
          fileName: true,
          provider: true,
          modelId: true,
          analysisDate: true,
          templateId: true,
        }
      }
    }
  });

  if (!story) {
    return createApiErrorResponse(ApiErrorCode.NOT_FOUND, "Story not found");
  }

  const responseData = {
    id: story.id,
    title: story.title,
    content: story.content,
    status: story.status,
    generatedAt: story.generatedAt,
    aiProvider: story.aiProvider,
    modelId: story.modelId,
    processingTime: story.processingTime,
    promptVersion: story.promptVersion,
    errorMessage: story.errorMessage,
    analysis: story.analysis,
  };

  return createApiSuccessResponse(responseData);
}, '/api/stories/[id]');

export const DELETE = withApiErrorHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const session = await getServerSession(authConfig);

  if (!session) {
    return createApiErrorResponse(ApiErrorCode.UNAUTHORIZED);
  }

  const { id } = await params;

  // Validate story ID format
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return createApiErrorResponse(
      ApiErrorCode.INVALID_INPUT,
      "Invalid story ID provided"
    );
  }

  // Check if story exists and belongs to user
  const story = await prisma.story.findFirst({
    where: {
      id: id.trim(),
      userId: session.user.id,
    }
  });

  if (!story) {
    return createApiErrorResponse(ApiErrorCode.NOT_FOUND, "Story not found");
  }

  // Check if story can be deleted (e.g., not currently generating)
  if (story.status === 'GENERATING') {
    return createApiErrorResponse(
      ApiErrorCode.OPERATION_NOT_ALLOWED,
      "Cannot delete story while it is being generated"
    );
  }

  // Delete the story
  await prisma.story.delete({
    where: { id: id.trim() }
  });

  return createApiSuccessResponse({ 
    message: "Story deleted successfully",
    deletedStoryId: id.trim()
  });
}, '/api/stories/[id]');

export const POST = withApiErrorHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const session = await getServerSession(authConfig);

  if (!session) {
    return createApiErrorResponse(ApiErrorCode.UNAUTHORIZED);
  }

  const { id } = await params;

  // Validate story ID format
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return createApiErrorResponse(
      ApiErrorCode.INVALID_INPUT,
      "Invalid story ID provided"
    );
  }

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return createApiErrorResponse(
      ApiErrorCode.INVALID_INPUT,
      "Invalid JSON in request body"
    );
  }

  const { action } = requestBody;

  // Validate required fields
  const validation = validateRequiredFields(requestBody, ['action']);
  if (!validation.isValid) {
    return createApiErrorResponse(
      ApiErrorCode.MISSING_REQUIRED_FIELD,
      `Missing required fields: ${validation.missingFields.join(', ')}`
    );
  }

  if (action === "download") {
    // Get story content for markdown download
    const story = await prisma.story.findFirst({
      where: {
        id: id.trim(),
        userId: session.user.id,
      },
      include: {
        analysis: {
          select: {
            fileName: true,
            analysisDate: true,
          }
        }
      }
    });

    if (!story) {
      return createApiErrorResponse(ApiErrorCode.NOT_FOUND, "Story not found");
    }

    if (story.status !== "COMPLETED" || !story.content) {
      return createApiErrorResponse(
        ApiErrorCode.STORY_NOT_COMPLETED,
        "Story is not completed yet and cannot be downloaded"
      );
    }

    // Generate markdown content
    const markdown = generateMarkdownFromStory(story.content as any, story);
    
    // Generate safe filename
    const safeTitle = story.title
      .replace(/[^a-z0-9\s-]/gi, '')
      .replace(/\s+/g, '_')
      .toLowerCase()
      .substring(0, 50); // Limit filename length
    
    const filename = `${safeTitle || 'story'}_${story.id.substring(0, 8)}.md`;
    
    return createApiSuccessResponse({ 
      markdown,
      filename,
      storyId: story.id,
      title: story.title
    });
  }

  return createApiErrorResponse(
    ApiErrorCode.INVALID_INPUT,
    `Invalid action: ${action}. Supported actions: download`
  );
}, '/api/stories/[id]');

function generateMarkdownFromStory(content: any, story: any): string {
  const { title, overview, chapters, conclusion, timeline, keyInsights } = content;
  
  let markdown = `# ${title}\n\n`;
  
  // Add metadata
  markdown += `**Generated:** ${new Date(story.generatedAt).toLocaleDateString()}\n`;
  markdown += `**Source File:** ${story.analysis.fileName}\n`;
  markdown += `**AI Provider:** ${story.aiProvider} (${story.modelId})\n\n`;
  
  // Add overview
  markdown += `## Overview\n\n${overview}\n\n`;
  
  // Add timeline summary
  if (timeline) {
    markdown += `## Timeline\n\n`;
    markdown += `- **Start:** ${timeline.start}\n`;
    markdown += `- **End:** ${timeline.end}\n`;
    markdown += `- **Duration:** ${timeline.duration}\n\n`;
  }
  
  // Add chapters
  if (chapters && chapters.length > 0) {
    markdown += `## Story Timeline\n\n`;
    
    chapters.forEach((chapter: any, index: number) => {
      markdown += `### Chapter ${index + 1}: ${chapter.title}\n\n`;
      markdown += `**Timestamp:** ${chapter.timestamp}\n`;
      if (chapter.mood) {
        markdown += `**Mood:** ${chapter.mood}\n`;
      }
      markdown += `\n${chapter.content}\n\n`;
      
      if (chapter.keyPoints && chapter.keyPoints.length > 0) {
        markdown += `**Key Points:**\n`;
        chapter.keyPoints.forEach((point: string) => {
          markdown += `- ${point}\n`;
        });
        markdown += `\n`;
      }
      
      if (chapter.insights && chapter.insights.length > 0) {
        markdown += `**Insights:**\n`;
        chapter.insights.forEach((insight: string) => {
          markdown += `- ${insight}\n`;
        });
        markdown += `\n`;
      }
      
      markdown += `---\n\n`;
    });
  }
  
  // Add conclusion
  if (conclusion) {
    markdown += `## Conclusion\n\n${conclusion}\n\n`;
  }
  
  // Add key insights
  if (keyInsights && keyInsights.length > 0) {
    markdown += `## Key Insights\n\n`;
    keyInsights.forEach((insight: string, index: number) => {
      markdown += `${index + 1}. ${insight}\n`;
    });
    markdown += `\n`;
  }
  
  // Add footer
  markdown += `---\n\n*Generated by CharismaAI Story Generator*\n`;
  
  return markdown;
}