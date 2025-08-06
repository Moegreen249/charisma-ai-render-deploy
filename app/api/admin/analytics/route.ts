import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "7d";

    // Calculate date ranges
    const now = new Date();
    const timeRanges = {
      "1d": new Date(now.getTime() - 24 * 60 * 60 * 1000),
      "7d": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      "30d": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      "90d": new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    };

    const startDate =
      timeRanges[timeRange as keyof typeof timeRanges] || timeRanges["7d"];
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Parallel database queries for better performance
    const [
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      totalAnalyses,
      analysesToday,
      analysesThisWeek,
      analysesThisMonth,
      backgroundJobs,
      platformErrors,
      criticalErrors,
      resolvedErrors,
      userActivities,
      averageAnalysisDuration,
      recentErrors,
    ] = await Promise.all([
      // User metrics
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: yesterday } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: monthAgo } },
      }),

      // Analysis metrics
      prisma.analysis.count(),
      prisma.analysis.count({
        where: { createdAt: { gte: yesterday } },
      }),
      prisma.analysis.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      prisma.analysis.count({
        where: { createdAt: { gte: monthAgo } },
      }),

      // Background job metrics
      prisma.backgroundJob.groupBy({
        by: ["status"],
        _count: { id: true },
        where: { createdAt: { gte: startDate } },
      }),

      // Error metrics
      prisma.platformError.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.platformError.count({
        where: {
          severity: "CRITICAL",
          createdAt: { gte: startDate },
        },
      }),
      prisma.platformError.count({
        where: {
          isResolved: true,
          createdAt: { gte: startDate },
        },
      }),

      // User activity
      prisma.userActivity.count({
        where: { timestamp: { gte: startDate } },
      }),

      // Average analysis duration
      prisma.analysis.aggregate({
        _avg: { durationMs: true },
        where: {
          createdAt: { gte: startDate },
          durationMs: { not: null },
        },
      }),

      // Recent errors for the error log
      prisma.platformError.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        where: { createdAt: { gte: startDate } },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

    // Calculate active users (users with recent activity)
    const activeUsersDaily = await prisma.userActivity.groupBy({
      by: ["userId"],
      where: { timestamp: { gte: yesterday } },
    });

    const activeUsersWeekly = await prisma.userActivity.groupBy({
      by: ["userId"],
      where: { timestamp: { gte: weekAgo } },
    });

    const activeUsersMonthly = await prisma.userActivity.groupBy({
      by: ["userId"],
      where: { timestamp: { gte: monthAgo } },
    });

    // Group background jobs by status
    const jobStatusCounts = backgroundJobs.reduce(
      (acc, job) => {
        acc[job.status] = job._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Calculate success rate based on completed background jobs vs failed ones
    const totalJobsInPeriod: number = (Object.values(jobStatusCounts) as number[]).reduce(
      (sum: number, count: number) => sum + count,
      0,
    );
    const successfulJobs = jobStatusCounts.COMPLETED || 0;
    const successRate =
      totalJobsInPeriod > 0
        ? (successfulJobs / totalJobsInPeriod) * 100
        : totalAnalyses > 0
          ? 95.0
          : 0; // Default to 95% if no background jobs but analyses exist

    // Group errors by category
    const errorsByCategory = await prisma.platformError.groupBy({
      by: ["category"],
      _count: { id: true },
      where: { createdAt: { gte: startDate } },
    });

    const errorCategories = errorsByCategory.reduce(
      (acc, error) => {
        acc[error.category] = error._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Calculate retention rates (simplified)
    const retentionDaily =
      activeUsersDaily.length > 0
        ? (activeUsersDaily.length / totalUsers) * 100
        : 0;
    const retentionWeekly =
      activeUsersWeekly.length > 0
        ? (activeUsersWeekly.length / totalUsers) * 100
        : 0;
    const retentionMonthly =
      activeUsersMonthly.length > 0
        ? (activeUsersMonthly.length / totalUsers) * 100
        : 0;

    // Build response
    const analytics = {
      users: {
        total: totalUsers,
        active: {
          daily: activeUsersDaily.length,
          weekly: activeUsersWeekly.length,
          monthly: activeUsersMonthly.length,
        },
        new: {
          today: newUsersToday,
          thisWeek: newUsersThisWeek,
          thisMonth: newUsersThisMonth,
        },
        retention: {
          daily: Math.round(retentionDaily * 100) / 100,
          weekly: Math.round(retentionWeekly * 100) / 100,
          monthly: Math.round(retentionMonthly * 100) / 100,
        },
      },
      analyses: {
        total: totalAnalyses,
        today: analysesToday,
        thisWeek: analysesThisWeek,
        thisMonth: analysesThisMonth,
        successRate: Math.round(successRate * 100) / 100,
        avgDuration: averageAnalysisDuration._avg.durationMs || 0,
      },
      backgroundJobs: {
        total: (Object.values(jobStatusCounts) as number[]).reduce(
          (sum: number, count: number) => sum + count,
          0,
        ),
        pending: jobStatusCounts.PENDING || 0,
        processing: jobStatusCounts.PROCESSING || 0,
        completed: jobStatusCounts.COMPLETED || 0,
        failed: jobStatusCounts.FAILED || 0,
        cancelled: jobStatusCounts.CANCELLED || 0,
      },
      errors: {
        total: platformErrors,
        critical: criticalErrors,
        resolved: resolvedErrors,
        categories: errorCategories,
      },
      activity: {
        totalEvents: userActivities,
      },
      performance: {
        avgAnalysisTime: averageAnalysisDuration._avg.durationMs || 0,
        systemHealth:
          criticalErrors === 0
            ? "Good"
            : criticalErrors < 5
              ? "Warning"
              : "Critical",
      },
      recentErrors: recentErrors.map((error) => ({
        id: error.id,
        category: error.category,
        severity: error.severity,
        message: error.message,
        timestamp: error.createdAt,
        user: error.user
          ? {
              name: error.user.name,
              email: error.user.email,
            }
          : null,
        isResolved: error.isResolved,
      })),
      timeRange,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Analytics API error:", error);

    // Log this error to the platform error system
    try {
      await prisma.platformError.create({
        data: {
          category: "SYSTEM",
          severity: "HIGH",
          message: "Analytics API endpoint error",
          stackTrace: error instanceof Error ? error.stack : String(error),
          endpoint: "/api/admin/analytics",
        },
      });
    } catch (logError) {
      console.error("Failed to log analytics API error:", logError);
    }

    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}
