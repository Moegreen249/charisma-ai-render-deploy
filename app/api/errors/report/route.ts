import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const errorReportSchema = z.object({
  id: z.string().optional(),
  category: z.enum(['AI_PROVIDER', 'DATABASE', 'AUTHENTICATION', 'FILE_PROCESSING', 'JSON_PARSING', 'VALIDATION', 'NETWORK', 'SYSTEM', 'USER_INPUT']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  code: z.string().optional(),
  message: z.string().min(1),
  description: z.string().optional(),
  stackTrace: z.string().optional(),
  endpoint: z.string().optional(),
  userAgent: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  requestData: z.record(z.any()).optional(),
  responseData: z.record(z.any()).optional(),
  aiProvider: z.string().optional(),
  modelId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Validate the error report
    const validation = errorReportSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid error report data',
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const errorData = validation.data;

    // Create the error record in the database
    const platformError = await prisma.platformError.create({
      data: {
        category: errorData.category,
        severity: errorData.severity,
        code: errorData.code,
        message: errorData.message,
        endpoint: errorData.endpoint,
        userAgent: errorData.userAgent,
        userId: session?.user?.id || errorData.userId,
        sessionId: errorData.sessionId,
        stackTrace: errorData.stackTrace,
        requestData: errorData.requestData,
        responseData: errorData.responseData,
        aiProvider: errorData.aiProvider,
        modelId: errorData.modelId,
        isResolved: false,
      },
    });

    // Log critical errors immediately
    if (errorData.severity === 'CRITICAL') {
      console.error('CRITICAL ERROR REPORTED:', {
        id: platformError.id,
        message: errorData.message,
        category: errorData.category,
        endpoint: errorData.endpoint,
        userId: session?.user?.id,
        timestamp: new Date().toISOString(),
      });

      // You could integrate with external error tracking services here
      // e.g., Sentry, Rollbar, etc.
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        errorId: platformError.id,
        message: 'Error reported successfully',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Failed to process error report:', error);

    // Try to create a fallback error record
    try {
      await prisma.platformError.create({
        data: {
          category: 'SYSTEM',
          severity: 'HIGH',
          message: 'Failed to process error report',
          stackTrace: error instanceof Error ? error.stack : String(error),
          endpoint: '/api/errors/report',
          isResolved: false,
        },
      });
    } catch (fallbackError) {
      console.error('Failed to create fallback error record:', fallbackError);
    }

    return NextResponse.json(
      {
        error: 'Failed to process error report',
        message: 'An error occurred while reporting the error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can view error reports
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');
    const resolved = searchParams.get('resolved');
    const timeRange = searchParams.get('timeRange') || '7d';

    // Build where clause
    const where: any = {};

    if (type && type !== 'all') {
      where.category = type;
    }

    if (severity && severity !== 'all') {
      where.severity = severity;
    }

    if (resolved !== null && resolved !== 'all') {
      where.isResolved = resolved === 'true';
    }

    // Time range filter
    const timeRangeMap = {
      '1h': 1,
      '24h': 24,
      '7d': 168,
      '30d': 720,
    };
    const hours = timeRangeMap[timeRange as keyof typeof timeRangeMap] || 168;
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    where.createdAt = { gte: cutoff };

    // Get errors with pagination
    const [errors, total] = await Promise.all([
      prisma.platformError.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          category: true,
          severity: true,
          message: true,
          stackTrace: true,
          endpoint: true,
          userAgent: true,
          userId: true,
          isResolved: true,
          resolvedAt: true,
          resolvedBy: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.platformError.count({ where }),
    ]);

    // Get error statistics
    const stats = await prisma.platformError.groupBy({
      by: ['category', 'severity', 'isResolved'],
      _count: { id: true },
      where: {
        createdAt: { gte: cutoff },
      },
    });

    // Transform errors for frontend
    const transformedErrors = errors.map((error) => ({
      id: error.id,
      type: error.category,
      severity: error.severity,
      message: error.message,
      stackTrace: error.stackTrace,
      url: error.endpoint,
      userAgent: error.userAgent,
      userId: error.userId,
      resolved: error.isResolved,
      resolvedAt: error.resolvedAt,
      resolvedBy: error.resolvedBy,
      timestamp: error.createdAt,
      updatedAt: error.updatedAt,
    }));

    // Transform stats
    const transformedStats = {
      total,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      resolved: 0,
      unresolved: 0,
      recent: total,
    };

    stats.forEach((stat) => {
      const key = stat.category as string;
      (transformedStats.byType as any)[key] = ((transformedStats.byType as any)[key] || 0) + stat._count.id;
      
      const severityKey = stat.severity as string;
      (transformedStats.bySeverity as any)[severityKey] = ((transformedStats.bySeverity as any)[severityKey] || 0) + stat._count.id;
      
      if (stat.isResolved) {
        transformedStats.resolved += stat._count.id;
      } else {
        transformedStats.unresolved += stat._count.id;
      }
    });

    return NextResponse.json({
      errors: transformedErrors,
      stats: transformedStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Failed to fetch error reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch error reports' },
      { status: 500 }
    );
  }
}