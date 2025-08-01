// Comprehensive error tracking and logging system for CharismaAI
import { prisma } from "@/lib/prisma";
// Import the actual Prisma-generated enums
import type { ErrorSeverity, ErrorCategory } from "@prisma/client";

export interface ErrorLogData {
  category: ErrorCategory;
  severity?: ErrorSeverity;
  code?: string;
  message: string;
  userId?: string;
  endpoint?: string;
  userAgent?: string;
  sessionId?: string;
  stackTrace?: string;
  requestData?: any;
  responseData?: any;
  aiProvider?: string;
  modelId?: string;
}

export interface ErrorAnalytics {
  totalErrors: number;
  errorsByCategory: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  errorsByProvider: Record<string, number>;
  topErrors: Array<{
    message: string;
    count: number;
    lastOccurred: Date;
  }>;
  errorTrends: Array<{
    date: Date;
    count: number;
  }>;
  resolutionRate: number;
}

export class ErrorTracker {
  private static instance: ErrorTracker;

  private constructor() {}

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  /**
   * Log a platform error with deduplication
   */
  async logError(data: ErrorLogData): Promise<void> {
    try {
      // Sanitize sensitive data
      const sanitizedData = this.sanitizeErrorData(data);

      // Check for existing similar errors (deduplication)
      const existingError = await this.findSimilarError(sanitizedData);

      if (existingError) {
        // Update existing error occurrence count
        await prisma.platformError.update({
          where: { id: existingError.id },
          data: {
            occurrenceCount: { increment: 1 },
            lastOccurred: new Date(),
            ...(sanitizedData.stackTrace && {
              stackTrace: sanitizedData.stackTrace,
            }),
            ...(sanitizedData.requestData && {
              requestData: sanitizedData.requestData,
            }),
            ...(sanitizedData.responseData && {
              responseData: sanitizedData.responseData,
            }),
          },
        });
      } else {
        // Create new error record
        await prisma.platformError.create({
          data: {
            category: sanitizedData.category,
            severity: sanitizedData.severity || "MEDIUM",
            code: sanitizedData.code,
            message: sanitizedData.message,
            userId: sanitizedData.userId,
            endpoint: sanitizedData.endpoint,
            userAgent: sanitizedData.userAgent,
            sessionId: sanitizedData.sessionId,
            stackTrace: sanitizedData.stackTrace,
            requestData: sanitizedData.requestData,
            responseData: sanitizedData.responseData,
            aiProvider: sanitizedData.aiProvider,
            modelId: sanitizedData.modelId,
            occurrenceCount: 1,
            firstOccurred: new Date(),
            lastOccurred: new Date(),
          },
        });
      }

      // Auto-escalate critical errors
      if (sanitizedData.severity === "CRITICAL") {
        await this.escalateCriticalError(sanitizedData);
      }
    } catch (error) {
      // Fallback logging to prevent infinite error loops
      console.error("Failed to log platform error:", error);
      console.error("Original error data:", data);
    }
  }

  /**
   * Get error analytics for admin dashboard
   */
  async getErrorAnalytics(days = 30): Promise<ErrorAnalytics> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [
        totalErrors,
        errorsByCategory,
        errorsBySeverity,
        errorsByProvider,
        topErrors,
        errorTrends,
        resolvedErrors,
      ] = await Promise.all([
        // Total errors in period
        prisma.platformError.aggregate({
          where: { createdAt: { gte: startDate } },
          _sum: { occurrenceCount: true },
        }),

        // Errors by category
        prisma.platformError.groupBy({
          by: ["category"],
          where: { createdAt: { gte: startDate } },
          _sum: { occurrenceCount: true },
        }),

        // Errors by severity
        prisma.platformError.groupBy({
          by: ["severity"],
          where: { createdAt: { gte: startDate } },
          _sum: { occurrenceCount: true },
        }),

        // Errors by AI provider
        prisma.platformError.groupBy({
          by: ["aiProvider"],
          where: {
            createdAt: { gte: startDate },
            aiProvider: { not: null },
          },
          _sum: { occurrenceCount: true },
        }),

        // Top error messages
        prisma.platformError.findMany({
          where: { createdAt: { gte: startDate } },
          orderBy: { occurrenceCount: "desc" },
          take: 10,
          select: {
            message: true,
            occurrenceCount: true,
            lastOccurred: true,
          },
        }),

        // Error trends by day
        this.getErrorTrends(startDate),

        // Resolved errors count
        prisma.platformError.aggregate({
          where: {
            createdAt: { gte: startDate },
            isResolved: true,
          },
          _sum: { occurrenceCount: true },
        }),
      ]);

      const total = totalErrors._sum.occurrenceCount || 0;
      const resolved = resolvedErrors._sum.occurrenceCount || 0;

      return {
        totalErrors: total,
        errorsByCategory: this.formatGroupedData(errorsByCategory),
        errorsBySeverity: this.formatGroupedData(errorsBySeverity),
        errorsByProvider: this.formatGroupedData(errorsByProvider),
        topErrors: topErrors.map((error) => ({
          message: error.message,
          count: error.occurrenceCount,
          lastOccurred: error.lastOccurred,
        })),
        errorTrends,
        resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
      };
    } catch (error) {
      console.error("Failed to get error analytics:", error);
      throw error;
    }
  }

  /**
   * Get recent errors for admin dashboard
   */
  async getRecentErrors(limit = 50) {
    try {
      return await prisma.platformError.findMany({
        orderBy: { lastOccurred: "desc" },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      console.error("Failed to get recent errors:", error);
      throw error;
    }
  }

  /**
   * Mark error as resolved
   */
  async resolveError(errorId: string, resolvedBy: string, resolution?: string) {
    try {
      return await prisma.platformError.update({
        where: { id: errorId },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          resolvedBy,
          resolution,
        },
      });
    } catch (error) {
      console.error("Failed to resolve error:", error);
      throw error;
    }
  }

  /**
   * Get error details by ID
   */
  async getErrorDetails(errorId: string) {
    try {
      return await prisma.platformError.findUnique({
        where: { id: errorId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      console.error("Failed to get error details:", error);
      throw error;
    }
  }

  /**
   * Search errors with filters
   */
  async searchErrors(filters: {
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    aiProvider?: string;
    isResolved?: boolean;
    startDate?: Date;
    endDate?: Date;
    searchTerm?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const where: any = {};

      if (filters.category) where.category = filters.category;
      if (filters.severity) where.severity = filters.severity;
      if (filters.aiProvider) where.aiProvider = filters.aiProvider;
      if (filters.isResolved !== undefined)
        where.isResolved = filters.isResolved;

      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = filters.startDate;
        if (filters.endDate) where.createdAt.lte = filters.endDate;
      }

      if (filters.searchTerm) {
        where.OR = [
          { message: { contains: filters.searchTerm, mode: "insensitive" } },
          { code: { contains: filters.searchTerm, mode: "insensitive" } },
          { endpoint: { contains: filters.searchTerm, mode: "insensitive" } },
        ];
      }

      const [errors, total] = await Promise.all([
        prisma.platformError.findMany({
          where,
          orderBy: { lastOccurred: "desc" },
          take: filters.limit || 50,
          skip: filters.offset || 0,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        }),
        prisma.platformError.count({ where }),
      ]);

      return { errors, total };
    } catch (error) {
      console.error("Failed to search errors:", error);
      throw error;
    }
  }

  /**
   * Clean up old resolved errors
   */
  async cleanupOldErrors(daysToKeep = 90) {
    try {
      const cutoffDate = new Date(
        Date.now() - daysToKeep * 24 * 60 * 60 * 1000,
      );

      const result = await prisma.platformError.deleteMany({
        where: {
          isResolved: true,
          resolvedAt: { lt: cutoffDate },
        },
      });

      console.log(`Cleaned up ${result.count} old resolved errors`);
      return result.count;
    } catch (error) {
      console.error("Failed to cleanup old errors:", error);
      throw error;
    }
  }

  /**
   * Sanitize error data to remove sensitive information
   */
  private sanitizeErrorData(data: ErrorLogData): ErrorLogData {
    const sanitized = { ...data };

    // Remove passwords and API keys from request data
    if (sanitized.requestData) {
      sanitized.requestData = this.sanitizeObject(sanitized.requestData);
    }

    // Remove sensitive data from response
    if (sanitized.responseData) {
      sanitized.responseData = this.sanitizeObject(sanitized.responseData);
    }

    // Truncate very long messages
    if (sanitized.message && sanitized.message.length > 1000) {
      sanitized.message =
        sanitized.message.substring(0, 1000) + "... (truncated)";
    }

    // Truncate stack traces
    if (sanitized.stackTrace && sanitized.stackTrace.length > 5000) {
      sanitized.stackTrace =
        sanitized.stackTrace.substring(0, 5000) + "... (truncated)";
    }

    return sanitized;
  }

  /**
   * Sanitize object to remove sensitive keys
   */
  private sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== "object") return obj;

    const sensitiveKeys = [
      "password",
      "apikey",
      "api_key",
      "token",
      "secret",
      "authorization",
      "auth",
      "key",
      "credential",
      "pass",
    ];

    const sanitized = { ...obj };

    for (const key in sanitized) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof sanitized[key] === "object") {
        sanitized[key] = this.sanitizeObject(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Find similar existing error for deduplication
   */
  private async findSimilarError(data: ErrorLogData) {
    try {
      return await prisma.platformError.findFirst({
        where: {
          category: data.category,
          message: data.message,
          code: data.code || undefined,
          aiProvider: data.aiProvider || undefined,
          endpoint: data.endpoint || undefined,
          // Consider errors from the last 24 hours as similar
          lastOccurred: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });
    } catch (error) {
      console.error("Failed to find similar error:", error);
      return null;
    }
  }

  /**
   * Get error trends by day
   */
  private async getErrorTrends(startDate: Date) {
    try {
      // Get daily error counts using raw SQL for better performance
      const trends = (await prisma.$queryRaw`
        SELECT
          DATE(created_at) as date,
          SUM(occurrence_count) as count
        FROM platform_error
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `) as Array<{ date: Date; count: bigint }>;

      return trends.map((trend) => ({
        date: trend.date,
        count: Number(trend.count),
      }));
    } catch (error) {
      console.error("Failed to get error trends:", error);
      return [];
    }
  }

  /**
   * Format grouped data results
   */
  private formatGroupedData(groupedData: any[]): Record<string, number> {
    const result: Record<string, number> = {};

    for (const item of groupedData) {
      const key = Object.values(item)[0] as string;
      const sum = item._sum?.occurrenceCount || 0;
      result[key] = sum;
    }

    return result;
  }

  /**
   * Escalate critical errors (could integrate with notification systems)
   */
  private async escalateCriticalError(data: ErrorLogData) {
    try {
      console.error("CRITICAL ERROR DETECTED:", {
        category: data.category,
        message: data.message,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      });

      // TODO: Integrate with notification system (email, Slack, etc.)
      // await this.sendCriticalErrorNotification(data);
    } catch (error) {
      console.error("Failed to escalate critical error:", error);
    }
  }
}

// Convenience function for logging errors
export async function logPlatformError(data: ErrorLogData): Promise<void> {
  const tracker = ErrorTracker.getInstance();
  await tracker.logError(data);
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance();
