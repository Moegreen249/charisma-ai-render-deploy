import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { generateStoryFromAnalysis } from "@/lib/story-generator";
import { validateStoryAccess } from "@/lib/story-access";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
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

    // Validate the analysis exists and belongs to the user
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: analysisId,
        userId: session.user.id,
      },
      include: {
        story: true,
      }
    });

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
        status: 'GENERATING',
        promptVersion: 'v1.0',
        aiProvider: 'pending',
        modelId: 'pending',
      }
    });

    // Generate story in background (we'll return immediately)
    generateStoryFromAnalysis(story.id, analysis.analysisResult, session.user.id)
      .catch(async (error) => {
        console.error('Story generation failed:', error);
        // Update story with error status
        await prisma.story.update({
          where: { id: story.id },
          data: {
            status: 'FAILED',
            errorMessage: error.message || 'Unknown error during story generation'
          }
        });
      });

    return NextResponse.json({
      success: true,
      story: {
        id: story.id,
        status: story.status,
        title: story.title
      },
      message: "Story generation started. Check back in a few moments."
    });

  } catch (error) {
    console.error("Story generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate story" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
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

    // Get story with analysis info
    const story = await prisma.story.findFirst({
      where: {
        id: storyId,
        userId: session.user.id,
      },
      include: {
        analysis: {
          select: {
            fileName: true,
            provider: true,
            modelId: true,
            analysisDate: true,
          }
        }
      }
    });

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

  } catch (error) {
    console.error("Story fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch story" },
      { status: 500 }
    );
  }
}