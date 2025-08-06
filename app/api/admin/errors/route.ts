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

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    const resolved = searchParams.get('resolved');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (severity && severity !== 'all') {
      where.severity = severity;  
    }
    
    if (resolved !== null) {
      where.isResolved = resolved === 'true';
    }

    // Get errors with pagination
    const [errors, totalCount, stats] = await Promise.all([
      prisma.platformError.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          category: true,
          severity: true,
          code: true,
          message: true,
          userId: true,
          endpoint: true,
          userAgent: true,
          sessionId: true,
          stackTrace: true,
          requestData: true,
          responseData: true,
          aiProvider: true,
          modelId: true,
          isResolved: true,
          resolvedAt: true,
          resolvedBy: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      
      // Total count for pagination
      prisma.platformError.count({ where }),
      
      // Get stats
      getErrorStats()
    ]);

    // Transform errors to match expected interface
    const transformedErrors = errors.map(error => ({
      id: error.id,
      type: error.category, // Map category to type for frontend compatibility
      severity: error.severity,
      message: error.message,
      description: error.code,
      createdAt: error.createdAt.toISOString(),
      isResolved: error.isResolved,
      resolvedAt: error.resolvedAt?.toISOString(),
      resolvedBy: error.resolvedBy,
      stackTrace: error.stackTrace,
      endpoint: error.endpoint,
      userId: error.userId,
    }));

    return NextResponse.json({
      success: true,
      errors: transformedErrors,
      stats,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error("Error fetching platform errors:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform errors" },
      { status: 500 }
    );
  }
}

async function getErrorStats() {
  try {
    const [
      totalErrors,
      unresolvedErrors,
      recentErrors,
      errorsByCategory,
      errorsBySeverity
    ] = await Promise.all([
      // Total errors
      prisma.platformError.count(),
      
      // Unresolved errors
      prisma.platformError.count({
        where: { isResolved: false }
      }),
      
      // Recent errors (last 24 hours)
      prisma.platformError.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Errors by category
      prisma.platformError.groupBy({
        by: ['category'],
        _count: {
          id: true
        },
        where: { isResolved: false }
      }),
      
      // Errors by severity
      prisma.platformError.groupBy({
        by: ['severity'],
        _count: {
          id: true
        },
        where: { isResolved: false }
      })
    ]);

    return {
      total: totalErrors,
      unresolved: unresolvedErrors,
      recent: recentErrors,
      byCategory: errorsByCategory.reduce((acc, item) => {
        acc[item.category] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      bySeverity: errorsBySeverity.reduce((acc, item) => {
        acc[item.severity] = item._count.id;
        return acc;
      }, {} as Record<string, number>)
    };
  } catch (error) {
    console.error('Error getting error stats:', error);
    return {
      total: 0,
      unresolved: 0,
      recent: 0,
      byCategory: {},
      bySeverity: {}
    };
  }
}