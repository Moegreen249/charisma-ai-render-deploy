import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get current story settings
    const settings = await prisma.storySettings.findFirst({
      orderBy: { updatedAt: 'desc' },
      include: {
        updater: {
          select: { name: true, email: true }
        }
      }
    });

    // Get story usage statistics
    const stats = await getStoryStats();

    return NextResponse.json({
      success: true,
      settings: settings || getDefaultStorySettings(),
      stats
    });

  } catch (error) {
    console.error("Error fetching story settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch story settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, id: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const {
      isEnabled,
      freeTrialDays,
      maxFreeStories,
      systemPrompt,
      promptVersion,
      allowedProviders,
      defaultProvider,
      defaultModel,
      timeoutSeconds,
      isProFeature
    } = await request.json();

    // Validate input
    if (typeof isEnabled !== 'boolean') {
      return NextResponse.json(
        { error: "isEnabled must be a boolean" },
        { status: 400 }
      );
    }

    if (freeTrialDays && (typeof freeTrialDays !== 'number' || freeTrialDays < 0)) {
      return NextResponse.json(
        { error: "freeTrialDays must be a positive number" },
        { status: 400 }
      );
    }

    if (maxFreeStories && (typeof maxFreeStories !== 'number' || maxFreeStories < 0)) {
      return NextResponse.json(
        { error: "maxFreeStories must be a positive number" },
        { status: 400 }
      );
    }

    if (!systemPrompt || typeof systemPrompt !== 'string') {
      return NextResponse.json(
        { error: "systemPrompt is required and must be a string" },
        { status: 400 }
      );
    }

    // Create or update settings
    const settings = await prisma.storySettings.create({
      data: {
        isEnabled,
        freeTrialDays: freeTrialDays || 7,
        maxFreeStories: maxFreeStories || 3,
        systemPrompt,
        promptVersion: promptVersion || 'v1.0',
        allowedProviders: allowedProviders || ['openai', 'anthropic', 'google'],
        defaultProvider: defaultProvider || 'openai',
        defaultModel: defaultModel || 'gpt-4',
        timeoutSeconds: timeoutSeconds || 120,
        isProFeature: isProFeature !== undefined ? isProFeature : true,
        updatedBy: user.id,
      }
    });

    return NextResponse.json({
      success: true,
      settings,
      message: "Story settings updated successfully"
    });

  } catch (error) {
    console.error("Error updating story settings:", error);
    return NextResponse.json(
      { error: "Failed to update story settings" },
      { status: 500 }
    );
  }
}

async function getStoryStats() {
  try {
    const [
      totalStories,
      completedStories,
      failedStories,
      generatingStories,
      totalUsers,
      proUsers,
      activeTrialUsers
    ] = await Promise.all([
      // Total stories
      prisma.story.count(),
      
      // Completed stories
      prisma.story.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Failed stories
      prisma.story.count({
        where: { status: 'FAILED' }
      }),
      
      // Currently generating
      prisma.story.count({
        where: { status: 'GENERATING' }
      }),

      // Total users with story usage
      prisma.userStoryUsage.count(),

      // Pro users
      prisma.userStoryUsage.count({
        where: { isProUser: true }
      }),

      // Active trial users (have generated at least one story, not pro)
      prisma.userStoryUsage.count({
        where: {
          isProUser: false,
          storiesGenerated: { gt: 0 }
        }
      })
    ]);

    const successRate = totalStories > 0 ? Math.round((completedStories / totalStories) * 100) : 0;

    return {
      totalStories,
      completedStories,
      failedStories,
      generatingStories,
      successRate,
      totalUsers,
      proUsers,
      activeTrialUsers,
      freeTrialUsers: activeTrialUsers
    };
  } catch (error) {
    console.error('Error getting story stats:', error);
    return {
      totalStories: 0,
      completedStories: 0,
      failedStories: 0,
      generatingStories: 0,
      successRate: 0,
      totalUsers: 0,
      proUsers: 0,
      activeTrialUsers: 0,
      freeTrialUsers: 0
    };
  }
}

function getDefaultStorySettings() {
  return {
    id: 'default',
    isEnabled: false,
    freeTrialDays: 7,
    maxFreeStories: 3,
    systemPrompt: "Transform this analysis into an engaging story with a clear timeline. Create chapters that flow naturally and make complex information easy to understand without overwhelming the reader.",
    promptVersion: 'v1.0',
    allowedProviders: ['openai', 'anthropic', 'google'],
    defaultProvider: 'openai',
    defaultModel: 'gpt-4',
    timeoutSeconds: 120,
    isProFeature: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    updatedBy: null,
    updater: null
  };
}