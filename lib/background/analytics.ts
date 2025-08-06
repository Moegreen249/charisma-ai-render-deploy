// Comprehensive analytics and user activity tracking system for CharismaAI
import { prisma } from "@/lib/prisma";

export interface UserActivityData {
  userId: string;
  action: string;
  category: string;
  page?: string;
  metadata?: any;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PlatformMetricData {
  name: string;
  category: string;
  value: number;
  unit?: string;
  period: string;
  periodStart: Date;
  periodEnd: Date;
  metadata?: any;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  newUsers: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  userRetention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  topActions: Array<{
    action: string;
    count: number;
  }>;
  userGrowthTrend: Array<{
    date: Date;
    newUsers: number;
    totalUsers: number;
  }>;
}

export interface PlatformAnalytics {
  analyses: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    successRate: number;
    avgDuration: number;
  };
  providers: Record<string, {
    count: number;
    successRate: number;
    avgDuration: number;
  }>;
  templates: Record<string, {
    usage: number;
    successRate: number;
  }>;
  performance: {
    avgResponseTime: number;
    errorRate: number;
    throughput: number;
  };
  storage: {
    totalAnalyses: number;
    totalUsers: number;
    dbSize: number;
  };
}

export class AnalyticsTracker {
  private static instance: AnalyticsTracker;

  private constructor() {
    // Start background metric collection
    this.startMetricCollection();
  }

  public static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker();
    }
    return AnalyticsTracker.instance;
  }

  /**
   * Track user activity
   */
  async trackActivity(data: UserActivityData): Promise<void> {
    try {
      await prisma.userActivity.create({
        data: {
          userId: data.userId,
          action: data.action,
          category: data.category,
          page: data.page,
          metadata: data.metadata,
          sessionId: data.sessionId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Failed to track user activity:", error);
      // Don't throw to avoid disrupting user experience
    }
  }

  /**
   * Record platform metric
   */
  async recordMetric(data: PlatformMetricData): Promise<void> {
    try {
      await prisma.platformMetric.upsert({
        where: {
          name_period_periodStart: {
            name: data.name,
            period: data.period,
            periodStart: data.periodStart,
          },
        },
        update: {
          value: data.value,
          unit: data.unit,
          periodEnd: data.periodEnd,
          metadata: data.metadata,
        },
        create: {
          name: data.name,
          category: data.category,
          value: data.value,
          unit: data.unit,
          period: data.period,
          periodStart: data.periodStart,
          periodEnd: data.periodEnd,
          metadata: data.metadata,
        },
      });
    } catch (error) {
      console.error("Failed to record metric:", error);
    }
  }

  /**
   * Get comprehensive user analytics
   */
  async getUserAnalytics(days = 30): Promise<UserAnalytics> {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        topActions,
        userGrowthTrend,
      ] = await Promise.all([
        // Total users
        prisma.user.count(),

        // Daily active users
        prisma.userActivity.groupBy({
          by: ["userId"],
          where: { timestamp: { gte: oneDayAgo } },
        }).then(result => result.length),

        // Weekly active users
        prisma.userActivity.groupBy({
          by: ["userId"],
          where: { timestamp: { gte: oneWeekAgo } },
        }).then(result => result.length),

        // Monthly active users
        prisma.userActivity.groupBy({
          by: ["userId"],
          where: { timestamp: { gte: oneMonthAgo } },
        }).then(result => result.length),

        // New users today
        prisma.user.count({
          where: { createdAt: { gte: oneDayAgo } },
        }),

        // New users this week
        prisma.user.count({
          where: { createdAt: { gte: oneWeekAgo } },
        }),

        // New users this month
        prisma.user.count({
          where: { createdAt: { gte: oneMonthAgo } },
        }),

        // Top user actions
        prisma.userActivity.groupBy({
          by: ["action"],
          where: { timestamp: { gte: startDate } },
          _count: { action: true },
          orderBy: { _count: { action: "desc" } },
          take: 10,
        }),

        // User growth trend
        this.getUserGrowthTrend(startDate),
      ]);

      // Calculate retention rates
      const dailyRetention = await this.calculateRetentionRate(oneDayAgo, oneDayAgo);
      const weeklyRetention = await this.calculateRetentionRate(oneWeekAgo, oneWeekAgo);
      const monthlyRetention = await this.calculateRetentionRate(oneMonthAgo, oneMonthAgo);

      return {
        totalUsers,
        activeUsers: {
          daily: dailyActiveUsers,
          weekly: weeklyActiveUsers,
          monthly: monthlyActiveUsers,
        },
        newUsers: {
          today: newUsersToday,
          thisWeek: newUsersThisWeek,
          thisMonth: newUsersThisMonth,
        },
        userRetention: {
          daily: dailyRetention,
          weekly: weeklyRetention,
          monthly: monthlyRetention,
        },
        topActions: topActions.map(action => ({
          action: action.action,
          count: action._count.action,
        })),
        userGrowthTrend,
      };
    } catch (error) {
      console.error("Failed to get user analytics:", error);
      throw error;
    }
  }

  /**
   * Get comprehensive platform analytics
   */
  async getPlatformAnalytics(days = 30): Promise<PlatformAnalytics> {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalAnalyses,
        todayAnalyses,
        weekAnalyses,
        monthAnalyses,
        completedAnalyses,
        failedAnalyses,
        avgDuration,
        providerStats,
        templateStats,
        errorRate,
      ] = await Promise.all([
        // Total analyses
        prisma.analysis.count(),

        // Today's analyses
        prisma.analysis.count({
          where: { createdAt: { gte: oneDayAgo } },
        }),

        // This week's analyses
        prisma.analysis.count({
          where: { createdAt: { gte: oneWeekAgo } },
        }),

        // This month's analyses
        prisma.analysis.count({
          where: { createdAt: { gte: oneMonthAgo } },
        }),

        // Completed analyses
        prisma.backgroundJob.count({
          where: {
            status: "COMPLETED",
            type: "ANALYSIS"
          },
        }),

        // Failed analyses
        prisma.backgroundJob.count({
          where: {
            status: "FAILED",
            type: "ANALYSIS"
          },
        }),

        // Average duration
        prisma.analysis.aggregate({
          _avg: { durationMs: true },
          where: { durationMs: { not: null } },
        }),

        // Provider statistics
        this.getProviderStats(),

        // Template usage statistics
        this.getTemplateStats(),

        // Error rate from platform errors
        this.getErrorRate(oneMonthAgo),
      ]);

      const totalJobs = completedAnalyses + failedAnalyses;
      const successRate = totalJobs > 0 ? (completedAnalyses / totalJobs) * 100 : 0;

      return {
        analyses: {
          total: totalAnalyses,
          today: todayAnalyses,
          thisWeek: weekAnalyses,
          thisMonth: monthAnalyses,
          successRate,
          avgDuration: avgDuration._avg.durationMs || 0,
        },
        providers: providerStats,
        templates: templateStats,
        performance: {
          avgResponseTime: avgDuration._avg.durationMs || 0,
          errorRate,
          throughput: totalAnalyses / days, // analyses per day
        },
        storage: {
          totalAnalyses,
          totalUsers: await prisma.user.count(),
          dbSize: 0, // Would need database-specific query
        },
      };
    } catch (error) {
      console.error("Failed to get platform analytics:", error);
      throw error;
    }
  }

  /**
   * Get user activity timeline
   */
  async getUserActivityTimeline(userId: string, days = 7) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      return await prisma.userActivity.findMany({
        where: {
          userId,
          timestamp: { gte: startDate },
        },
        orderBy: { timestamp: "desc" },
        take: 100,
      });
    } catch (error) {
      console.error("Failed to get user activity timeline:", error);
      throw error;
    }
  }

  /**
   * Get platform health metrics
   */
  async getPlatformHealth() {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [
        activeJobs,
        recentErrors,
        systemLoad,
        responseTime,
        uptime,
      ] = await Promise.all([
        // Active background jobs
        prisma.backgroundJob.count({
          where: { status: "PROCESSING" },
        }),

        // Recent critical errors
        prisma.platformError.count({
          where: {
            severity: "CRITICAL",
            createdAt: { gte: oneHourAgo },
            isResolved: false,
          },
        }),

        // System load (simulated)
        this.getSystemLoad(),

        // Average response time
        prisma.platformMetric.findFirst({
          where: {
            name: "avg_response_time",
            periodStart: { gte: oneDayAgo },
          },
          orderBy: { periodStart: "desc" },
        }),

        // System uptime percentage
        this.calculateUptime(oneDayAgo),
      ]);

      return {
        status: recentErrors > 0 ? "warning" : "healthy",
        activeJobs,
        recentErrors,
        systemLoad,
        responseTime: responseTime?.value || 0,
        uptime,
        lastUpdated: now,
      };
    } catch (error) {
      console.error("Failed to get platform health:", error);
      throw error;
    }
  }

  /**
   * Start background metric collection
   */
  private startMetricCollection() {
    // Collect metrics every hour
    setInterval(async () => {
      try {
        await this.collectHourlyMetrics();
      } catch (error) {
        console.error("Failed to collect hourly metrics:", error);
      }
    }, 60 * 60 * 1000); // 1 hour

    // Collect daily metrics at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.collectDailyMetrics();
      // Then collect daily metrics every 24 hours
      setInterval(() => {
        this.collectDailyMetrics();
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
  }

  /**
   * Collect hourly metrics
   */
  private async collectHourlyMetrics() {
    try {
      const now = new Date();
      const hourStart = new Date(now);
      hourStart.setMinutes(0, 0, 0);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

      // Active users this hour
      const activeUsers = await prisma.userActivity.groupBy({
        by: ["userId"],
        where: {
          timestamp: { gte: hourStart, lt: hourEnd },
        },
      });

      await this.recordMetric({
        name: "active_users_hourly",
        category: "users",
        value: activeUsers.length,
        unit: "count",
        period: "hourly",
        periodStart: hourStart,
        periodEnd: hourEnd,
      });

      // Analyses this hour
      const analyses = await prisma.analysis.count({
        where: {
          createdAt: { gte: hourStart, lt: hourEnd },
        },
      });

      await this.recordMetric({
        name: "analyses_hourly",
        category: "usage",
        value: analyses,
        unit: "count",
        period: "hourly",
        periodStart: hourStart,
        periodEnd: hourEnd,
      });

      // Error rate this hour
      const errors = await prisma.platformError.aggregate({
        where: {
          createdAt: { gte: hourStart, lt: hourEnd },
        },
        _sum: { occurrenceCount: true },
      });

      const errorRate = analyses > 0 ? ((errors._sum.occurrenceCount || 0) / analyses) * 100 : 0;

      await this.recordMetric({
        name: "error_rate_hourly",
        category: "performance",
        value: errorRate,
        unit: "percentage",
        period: "hourly",
        periodStart: hourStart,
        periodEnd: hourEnd,
      });

    } catch (error) {
      console.error("Failed to collect hourly metrics:", error);
    }
  }

  /**
   * Collect daily metrics
   */
  private async collectDailyMetrics() {
    try {
      const now = new Date();
      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      // New users today
      const newUsers = await prisma.user.count({
        where: {
          createdAt: { gte: dayStart, lt: dayEnd },
        },
      });

      await this.recordMetric({
        name: "new_users_daily",
        category: "users",
        value: newUsers,
        unit: "count",
        period: "daily",
        periodStart: dayStart,
        periodEnd: dayEnd,
      });

      // Total revenue (if applicable)
      // This would be implemented when billing is added

    } catch (error) {
      console.error("Failed to collect daily metrics:", error);
    }
  }

  /**
   * Calculate user retention rate
   */
  private async calculateRetentionRate(startDate: Date, endDate: Date): Promise<number> {
    try {
      const usersInPeriod = await prisma.userActivity.groupBy({
        by: ["userId"],
        where: {
          timestamp: { gte: startDate, lte: endDate },
        },
      });

      const nextPeriodStart = new Date(endDate.getTime() + 1);
      const nextPeriodEnd = new Date(nextPeriodStart.getTime() + (endDate.getTime() - startDate.getTime()));

      const returningUsers = await prisma.userActivity.groupBy({
        by: ["userId"],
        where: {
          userId: { in: usersInPeriod.map(u => u.userId) },
          timestamp: { gte: nextPeriodStart, lte: nextPeriodEnd },
        },
      });

      return usersInPeriod.length > 0 ? (returningUsers.length / usersInPeriod.length) * 100 : 0;
    } catch (error) {
      console.error("Failed to calculate retention rate:", error);
      return 0;
    }
  }

  /**
   * Get user growth trend
   */
  private async getUserGrowthTrend(startDate: Date) {
    try {
      const trends = await prisma.$queryRaw`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as new_users,
          SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as total_users
        FROM user
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      ` as Array<{ date: Date; new_users: bigint; total_users: bigint }>;

      return trends.map(trend => ({
        date: trend.date,
        newUsers: Number(trend.new_users),
        totalUsers: Number(trend.total_users),
      }));
    } catch (error) {
      console.error("Failed to get user growth trend:", error);
      return [];
    }
  }

  /**
   * Get provider statistics
   */
  private async getProviderStats() {
    try {
      const stats = await prisma.analysis.groupBy({
        by: ["provider"],
        _count: { provider: true },
        _avg: { durationMs: true },
      });

      const result: Record<string, any> = {};

      for (const stat of stats) {
        const provider = stat.provider || "unknown";

        // Get success rate from background jobs
        const [completed, failed] = await Promise.all([
          prisma.backgroundJob.count({
            where: { provider, status: "COMPLETED" },
          }),
          prisma.backgroundJob.count({
            where: { provider, status: "FAILED" },
          }),
        ]);

        const total = completed + failed;
        const successRate = total > 0 ? (completed / total) * 100 : 0;

        result[provider] = {
          count: stat._count.provider,
          successRate,
          avgDuration: stat._avg.durationMs || 0,
        };
      }

      return result;
    } catch (error) {
      console.error("Failed to get provider stats:", error);
      return {};
    }
  }

  /**
   * Get template usage statistics
   */
  private async getTemplateStats() {
    try {
      const stats = await prisma.analysis.groupBy({
        by: ["templateId"],
        _count: { templateId: true },
      });

      const result: Record<string, any> = {};

      for (const stat of stats) {
        const templateId = stat.templateId || "unknown";

        // Get success rate from background jobs
        const [completed, failed] = await Promise.all([
          prisma.backgroundJob.count({
            where: { templateId, status: "COMPLETED" },
          }),
          prisma.backgroundJob.count({
            where: { templateId, status: "FAILED" },
          }),
        ]);

        const total = completed + failed;
        const successRate = total > 0 ? (completed / total) * 100 : 0;

        result[templateId] = {
          usage: stat._count.templateId,
          successRate,
        };
      }

      return result;
    } catch (error) {
      console.error("Failed to get template stats:", error);
      return {};
    }
  }

  /**
   * Get error rate
   */
  private async getErrorRate(startDate: Date): Promise<number> {
    try {
      const [errors, totalRequests] = await Promise.all([
        prisma.platformError.aggregate({
          where: { createdAt: { gte: startDate } },
          _sum: { occurrenceCount: true },
        }),
        prisma.userActivity.count({
          where: {
            timestamp: { gte: startDate },
            category: "analysis",
          },
        }),
      ]);

      const errorCount = errors._sum.occurrenceCount || 0;
      return totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;
    } catch (error) {
      console.error("Failed to get error rate:", error);
      return 0;
    }
  }

  /**
   * Get system load (simulated)
   */
  private async getSystemLoad(): Promise<number> {
    try {
      // In a real implementation, this would get actual system metrics
      const activeJobs = await prisma.backgroundJob.count({
        where: { status: "PROCESSING" },
      });

      // Simulate load based on active jobs (0-100%)
      return Math.min(activeJobs * 10, 100);
    } catch (error) {
      console.error("Failed to get system load:", error);
      return 0;
    }
  }

  /**
   * Calculate system uptime
   */
  private async calculateUptime(startDate: Date): Promise<number> {
    try {
      // Calculate uptime based on critical errors
      const criticalErrors = await prisma.platformError.count({
        where: {
          severity: "CRITICAL",
          createdAt: { gte: startDate },
        },
      });

      // Simulate uptime calculation (in real implementation, use actual monitoring data)
      const totalHours = (Date.now() - startDate.getTime()) / (1000 * 60 * 60);
      const downtime = criticalErrors * 0.1; // Assume each critical error causes 6 minutes downtime
      const uptime = Math.max(0, (totalHours - downtime) / totalHours) * 100;

      return Math.min(uptime, 100);
    } catch (error) {
      console.error("Failed to calculate uptime:", error);
      return 95; // Default uptime
    }
  }
}

// Convenience function for tracking user activity
export async function trackUserActivity(data: UserActivityData): Promise<void> {
  const tracker = AnalyticsTracker.getInstance();
  await tracker.trackActivity(data);
}

// Convenience function for recording metrics
export async function recordPlatformMetric(data: PlatformMetricData): Promise<void> {
  const tracker = AnalyticsTracker.getInstance();
  await tracker.recordMetric(data);
}

// Export singleton instance
export const analyticsTracker = AnalyticsTracker.getInstance();
