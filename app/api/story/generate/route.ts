import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { prisma, withRetry } from "@/lib/prisma";
import { validateStoryAccess } from "@/lib/story-access";
import { jobProcessor } from "@/lib/background/job-processor";
import { withEnhancedErrorHandler } from "@/lib/enhanced-error-handler";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Simple in-memory cache for recent story requests (expires after 5 minutes)
const storyCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedStory(key: string) {
  const cached = storyCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  storyCache.delete(key);
  return null;
}

function setCachedStory(key: string, data: any) {
  storyCache.set(key, { data, timestamp: Date.now() });
  // Clean old entries periodically
  if (storyCache.size > 100) {
    const now = Date.now();
    for (const [k, v] of storyCache.entries()) {
      if (now - v.timestamp > CACHE_DURATION) {
        storyCache.delete(k);
      }
    }
  }
}

async function postHandler(request: NextRequest): Promise<NextResponse> {
  // Check authentication
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { analysisId } = await request.json();

  if (!analysisId) {
    return NextResponse.json(
      { error: "Analysis ID is required" },
      { status: 400 }
    );
  }

  // Check cache first
  const cacheKey = `analysis-${analysisId}-${session.user.id}`;
  let analysis = getCachedStory(cacheKey);

  if (!analysis) {
    // Validate the analysis exists and belongs to the user (optimized query)
    analysis = await withRetry(() => 
      prisma.analysis.findFirst({
        where: {
          id: analysisId,
          userId: session.user.id,
        },
        select: {
          id: true,
          fileName: true,
          analysisResult: true,
          story: {
            select: {
              id: true,
              status: true,
              title: true,
              content: true,
              generatedAt: true,
            }
          }
        }
      })
    );

    if (analysis) {
      setCachedStory(cacheKey, analysis);
    }
  }

  if (!analysis) {
    return NextResponse.json(
      { error: "Analysis not found" },
      { status: 404 }
    );
  }

  // Check if story already exists
  if (analysis.story) {
    return NextResponse.json({
      success: true,
      story: analysis.story,
      message: "Story already exists for this analysis"
    });
  }

  // Validate story access (pro feature, trial limits, etc.)
  const accessValidation = await validateStoryAccess(session.user.id);
  if (!accessValidation.allowed) {
    return NextResponse.json(
      { 
        error: accessValidation.reason,
        requiresPro: accessValidation.requiresPro,
        trialExpired: accessValidation.trialExpired,
        usageExceeded: accessValidation.usageExceeded
      },
      { status: 403 }
    );
  }

  // Create pending story record
  const story = await prisma.story.create({
    data: {
      analysisId: analysis.id,
      userId: session.user.id,
      title: `Story for ${analysis.fileName}`,
      content: {},
      status: 'PENDING',
      promptVersion: 'v1.0',
      aiProvider: 'pending',
      modelId: 'pending',
    }
  });

  // Enqueue story generation as background job
  console.log('Creating story generation job for:', {
    userId: session.user.id,
    storyId: story.id,
    analysisId: analysis.id,
    priority: 'NORMAL'
  });
  
  const jobId = await jobProcessor.createStoryGenerationJob({
    userId: session.user.id,
    storyId: story.id,
    analysisId: analysis.id,
    analysisResult: analysis.analysisResult,
    priority: 'NORMAL'
  });
  
  console.log('Story generation job created with ID:', jobId);

  // Update story status to GENERATING once job is queued
  await prisma.story.update({
    where: { id: story.id },
    data: {
      status: 'GENERATING'
    }
  });

  return NextResponse.json({
    success: true,
    story: {
      id: story.id,
      status: 'GENERATING',
      title: story.title
    },
    jobId,
    retryInfo: {
      maxAttempts: 4, // Default max retries + 1 (3 retries + initial attempt)
      currentAttempt: 1,
      canRetry: false, // Not applicable for new jobs
      isRetrying: false,
    },
    message: "Story generation has been queued. You'll be notified when it's complete."
  });
}

async function getHandler(request: NextRequest): Promise<NextResponse> {
  // Check authentication
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const storyId = searchParams.get('id');

  if (!storyId) {
    return NextResponse.json(
      { error: "Story ID is required" },
      { status: 400 }
    );
  }

  // Check cache first
  const cacheKey = `story-${storyId}-${session.user.id}`;
  let story = getCachedStory(cacheKey);

  if (!story) {
    // Get story with analysis info (optimized query)
    story = await withRetry(() =>
      prisma.story.findFirst({
        where: {
          id: storyId,
          userId: session.user.id,
        },
        select: {
          id: true,
          title: true,
          content: true,
          status: true,
          generatedAt: true,
          promptVersion: true,
          aiProvider: true,
          modelId: true,
          errorMessage: true,
          analysis: {
            select: {
              fileName: true,
              provider: true,
              modelId: true,
              analysisDate: true,
            }
          }
        }
      })
    );

    if (story) {
      setCachedStory(cacheKey, story);
    }
  }

  if (!story) {
    return NextResponse.json(
      { error: "Story not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    story
  });
}

// Export handlers with enhanced error handling
export const POST = withEnhancedErrorHandler(postHandler, 'story-generation-request');
export const GET = withEnhancedErrorHandler(getHandler, 'story-fetch');