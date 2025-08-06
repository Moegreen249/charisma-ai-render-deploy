import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
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
    let settings;
    try {
      settings = await prisma.storySettings.findFirst({
        orderBy: { updatedAt: 'desc' },
        include: {
          updater: {
            select: { name: true, email: true }
          }
        }
      });
    } catch (error) {
      console.error("Error fetching story settings from database:", error);
      settings = null;
    }

    // Get story usage statistics
    let stats;
    try {
      stats = await getStoryStats();
    } catch (error) {
      console.error("Error fetching story stats:", error);
      stats = {
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

    return NextResponse.json({
      success: true,
      settings: settings || getDefaultStorySettings(),
      stats
    });

  } catch (error) {
    console.error("Error fetching story settings:", error);
    
    // Provide more detailed error information
    let errorMessage = "Failed to fetch story settings";
    if (error instanceof Error) {
      errorMessage = `Database error: ${error.message}`;
      
      // Handle specific Prisma error codes
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as any).code;
        switch (errorCode) {
          case 'P1001':
            errorMessage = "Cannot reach database server";
            break;
          default:
            errorMessage = `Database error (${errorCode}): ${error.message}`;
        }
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error),
        code: (error && typeof error === 'object' && 'code' in error) ? (error as any).code : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
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

    // Create or update settings (upsert logic)
    let settings;
    try {
      // Try to get existing settings first
      const existing = await prisma.storySettings.findFirst({
        orderBy: { updatedAt: 'desc' }
      });

      if (existing) {
        // Update existing settings
        settings = await prisma.storySettings.update({
          where: { id: existing.id },
          data: {
            isEnabled,
            freeTrialDays: freeTrialDays || 7,
            maxFreeStories: maxFreeStories || 3,
            systemPrompt,
            promptVersion: promptVersion || 'v1.0',
            allowedProviders: allowedProviders || ['google', 'openai', 'anthropic'],
            defaultProvider: defaultProvider || 'google',
            defaultModel: defaultModel || 'gemini-2.5-flash',
            timeoutSeconds: timeoutSeconds || 120,
            isProFeature: isProFeature !== undefined ? isProFeature : true,
            updatedBy: user.id,
          }
        });
      } else {
        // Create new settings
        settings = await prisma.storySettings.create({
          data: {
            isEnabled,
            freeTrialDays: freeTrialDays || 7,
            maxFreeStories: maxFreeStories || 3,
            systemPrompt,
            promptVersion: promptVersion || 'v1.0',
            allowedProviders: allowedProviders || ['google', 'openai', 'anthropic'],
            defaultProvider: defaultProvider || 'google',
            defaultModel: defaultModel || 'gemini-2.5-flash',
            timeoutSeconds: timeoutSeconds || 120,
            isProFeature: isProFeature !== undefined ? isProFeature : true,
            updatedBy: user.id,
          }
        });
      }
    } catch (dbError) {
      console.error("Database error in story settings:", dbError);
      throw new Error("Failed to save story settings to database");
    }

    return NextResponse.json({
      success: true,
      settings,
      message: "Story settings updated successfully"
    });

  } catch (error) {
    console.error("Error updating story settings:", error);
    
    // Provide more detailed error information
    let errorMessage = "Failed to update story settings";
    if (error instanceof Error) {
      errorMessage = `Database error: ${error.message}`;
      
      // Handle specific Prisma error codes
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as any).code;
        switch (errorCode) {
          case 'P2002':
            errorMessage = "Unique constraint violation in story settings";
            break;
          case 'P2003':
            errorMessage = "Foreign key constraint failed - admin user not found";
            break;
          case 'P2025':
            errorMessage = "Record not found for update operation";
            break;
          case 'P1001':
            errorMessage = "Cannot reach database server";
            break;
          default:
            errorMessage = `Database error (${errorCode}): ${error.message}`;
        }
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error),
        code: (error && typeof error === 'object' && 'code' in error) ? (error as any).code : undefined
      },
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
    allowedProviders: ['google', 'openai', 'anthropic'],
    defaultProvider: 'google',
    defaultModel: 'gemini-2.5-flash',
    timeoutSeconds: 120,
    isProFeature: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    updatedBy: null,
    updater: null
  };
}