import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authConfig);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all background jobs with their types and statuses
    const jobs = await prisma.backgroundJob.findMany({
      select: {
        id: true,
        type: true,
        status: true,
        progress: true,
        currentStep: true,
        fileName: true,
        storyId: true,
        analysisId: true,
        createdAt: true,
        startedAt: true,
        completedAt: true,
        error: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Group by type for summary
    const summary = jobs.reduce((acc, job) => {
      if (!acc[job.type]) {
        acc[job.type] = { total: 0, byStatus: {} };
      }
      acc[job.type].total++;
      if (!acc[job.type].byStatus[job.status]) {
        acc[job.type].byStatus[job.status] = 0;
      }
      acc[job.type].byStatus[job.status]++;
      return acc;
    }, {} as Record<string, { total: number; byStatus: Record<string, number> }>);

    return NextResponse.json({
      success: true,
      summary,
      jobs,
      totalJobs: jobs.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Debug jobs API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch job debug info" },
      { status: 500 }
    );
  }
}