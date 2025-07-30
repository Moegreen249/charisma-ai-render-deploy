"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Helper function to check authentication
async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }
  return session;
}

/**
 * Get analysis history for the current authenticated user
 */
export async function getAnalysisHistory() {
  try {
    const session = await checkAuth();

    const analyses = await prisma.analysis.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        templateId: true,
        modelId: true,
        provider: true,
        fileName: true,
        analysisDate: true,
        durationMs: true,
        createdAt: true,
        updatedAt: true,
        analysisResult: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: analyses };
  } catch (error) {
    console.error("Error fetching analysis history:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch analysis history" };
  }
}

/**
 * Get a specific analysis by ID for the current authenticated user
 */
export async function getAnalysisById(id: string) {
  try {
    const session = await checkAuth();

    const analysis = await prisma.analysis.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      select: {
        id: true,
        userId: true,
        templateId: true,
        modelId: true,
        provider: true,
        fileName: true,
        analysisDate: true,
        durationMs: true,
        analysisResult: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!analysis) {
      return { success: false, error: "Analysis not found" };
    }

    return { success: true, data: analysis };
  } catch (error) {
    console.error("Error fetching analysis:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch analysis" };
  }
}

/**
 * Delete an analysis by ID for the current authenticated user
 */
export async function deleteAnalysis(id: string) {
  try {
    const session = await checkAuth();

    // Check if analysis exists and belongs to user
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!analysis) {
      return { success: false, error: "Analysis not found" };
    }

    // Delete the analysis
    await prisma.analysis.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/history");
    return { success: true, message: "Analysis deleted successfully" };
  } catch (error) {
    console.error("Error deleting analysis:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete analysis" };
  }
}

/**
 * Get analysis statistics for the current authenticated user
 */
export async function getAnalysisStats() {
  try {
    const session = await checkAuth();

    const stats = await prisma.analysis.groupBy({
      by: ["provider"],
      where: {
        userId: session.user.id,
      },
      _count: {
        id: true,
      },
      _sum: {
        durationMs: true,
      },
    });

    const totalAnalyses = await prisma.analysis.count({
      where: {
        userId: session.user.id,
      },
    });

    const recentAnalyses = await prisma.analysis.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    return {
      success: true,
      data: {
        totalAnalyses,
        recentAnalyses,
        byProvider: stats,
      },
    };
  } catch (error) {
    console.error("Error fetching analysis stats:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch analysis statistics" };
  }
}
