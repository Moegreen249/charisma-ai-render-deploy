import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch user's analyses
    const analyses = await prisma.analysis.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: "desc"
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        fileName: true,
        templateId: true,
        analysisDate: true,
        createdAt: true,
        durationMs: true,
        provider: true,
        modelId: true
      }
    });

    // Get total count
    const totalCount = await prisma.analysis.count({
      where: {
        userId: user.id
      }
    });

    // Format response
    const formattedAnalyses = analyses.map(analysis => ({
      id: analysis.id,
      fileName: analysis.fileName,
      templateName: analysis.templateId, // Could be enhanced to fetch actual template name
      createdAt: analysis.createdAt.toISOString(),
      status: "completed",
      duration: analysis.durationMs,
      provider: analysis.provider,
      modelId: analysis.modelId
    }));

    return NextResponse.json({
      analyses: formattedAnalyses,
      totalCount,
      hasMore: (offset + limit) < totalCount
    });

  } catch (error) {
    console.error("History API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
