import { prisma } from './prisma';
import { Role, SubscriptionTier, SubscriptionStatus, TaskType, TaskStatus, TaskPriority } from '@prisma/client';
import { z } from 'zod';

// Types and interfaces
export interface SystemMetrics {
  totalUsers: number;
  activeSubscriptions: number;
  totalStoriesGenerated: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  apiUsage: ApiUsageMetrics;
  taskQueueStats: TaskQueueStatistics;
  errorStats: ErrorStatistics;
}

export interface ApiUsageMetrics {
  totalApiCalls: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  topProviders: Array<{ provider: string; usage: number }>;
}

export interface TaskQueueStatistics {
  totalQueued: number;
  totalRunning: number;
  totalCompleted: number;
  totalFailed: number;
  averageWaitTime: number;
  averageProcessingTime: number;
  successRate: number;
}

export interface ErrorStatistics {
  totalErrors: number;
  criticalErrors: number;
  resolvedErrors: number;
  topErrorCategories: Array<{ category: string; count: number }>;
}

export interface UserStatistics {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsers: number;
  adminUsers: number;
  subscriptionBreakdown: Record<SubscriptionTier, number>;
}

export interface AIModelConfiguration {
  providers: ModelProvider[];
  defaultProvider: string;
  defaultModel: string;
  rateLimits: RateLimitConfig;
  fallbackOptions: FallbackConfig;
}

export interface ModelProvider {
  id: string;
  name: string;
  enabled: boolean;
  models: ModelConfig[];
  apiKey?: string;
  baseUrl?: string;
  timeout: number;
}

export interface ModelConfig {
  id: string;
  name: string;
  enabled: boolean;
  costPerToken: number;
  maxTokens: number;
  timeout: number;
  parameters: Record<string, any>;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  concurrentRequests: number;
}

export interface FallbackConfig {
  enabled: boolean;
  maxRetries: number;
  retryDelay: number;
  fallbackProviders: string[];
}

export interface SystemConfig {
  maintenance: {
    enabled: boolean;
    message: string;
    allowedUsers: string[];
  };
  features: {
    storyGeneration: boolean;
    subscriptions: boolean;
    adminPanel: boolean;
  };
  limits: {
    maxConcurrentTasks: number;
    taskTimeout: number;
    retryAttempts: number;
  };
}

// Validation schemas
export const adminConfigSchema = z.object({
  category: z.enum(['ai_models', 'system', 'billing', 'features']),
  key: z.string().min(1),
  value: z.any(),
  description: z.string().optional(),
  isActive: z.boolean().default(true)
});

export const modelConfigSchema = z.object({
  provider: z.string(),
  models: z.array(z.object({
    id: z.string(),
    name: z.string(),
    enabled: z.boolean(),
    costPerToken: z.number().min(0),
    maxTokens: z.number().min(1),
    timeout: z.number().min(1000),
    parameters: z.record(z.any())
  })),
  enabled: z.boolean(),
  timeout: z.number().min(1000)
});

export const userManagementSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['update_role', 'update_subscription', 'suspend', 'activate', 'delete']),
  data: z.record(z.any()).optional()
});

/**
 * Admin Service - System Configuration Management
 */
export class AdminService {
  /**
   * Get system configuration by category and key
   */
  async getConfig(category: string, key?: string) {
    try {
      const where = key ? { category, key } : { category };
      
      const configs = await prisma.adminSettings.findMany({
        where,
        include: {
          updater: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });

      return configs;
    } catch (error) {
      console.error('Error fetching admin config:', error);
      throw new Error('Failed to fetch configuration');
    }
  }

  /**
   * Update system configuration
   */
  async updateConfig(
    category: string,
    key: string,
    value: any,
    updatedBy: string,
    description?: string
  ) {
    try {
      const validatedData = adminConfigSchema.parse({
        category,
        key,
        value,
        description
      });

      const config = await prisma.adminSettings.upsert({
        where: { category_key: { category, key } },
        update: {
          value: validatedData.value,
          description: validatedData.description,
          updatedBy,
          updatedAt: new Date()
        },
        create: {
          category: validatedData.category,
          key: validatedData.key,
          value: validatedData.value,
          description: validatedData.description,
          updatedBy,
          isActive: true
        },
        include: {
          updater: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      return config;
    } catch (error) {
      console.error('Error updating admin config:', error);
      throw new Error('Failed to update configuration');
    }
  }

  /**
   * Delete system configuration
   */
  async deleteConfig(category: string, key: string) {
    try {
      await prisma.adminSettings.delete({
        where: { category_key: { category, key } }
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting admin config:', error);
      throw new Error('Failed to delete configuration');
    }
  }

  /**
   * Get all system configurations grouped by category
   */
  async getAllConfigs() {
    try {
      const configs = await prisma.adminSettings.findMany({
        include: {
          updater: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: [{ category: 'asc' }, { key: 'asc' }]
      });

      // Group by category
      const grouped = configs.reduce((acc, config) => {
        if (!acc[config.category]) {
          acc[config.category] = [];
        }
        acc[config.category].push(config);
        return acc;
      }, {} as Record<string, typeof configs>);

      return grouped;
    } catch (error) {
      console.error('Error fetching all configs:', error);
      throw new Error('Failed to fetch configurations');
    }
  }
}

/**
 * AI Model Configuration Service
 */
export class AIModelConfigService {
  /**
   * Get AI model configuration
   */
  async getModelConfig(): Promise<AIModelConfiguration> {
    try {
      const configs = await prisma.adminSettings.findMany({
        where: { category: 'ai_models' }
      });

      // Default configuration
      const defaultConfig: AIModelConfiguration = {
        providers: [
          {
            id: 'openai',
            name: 'OpenAI',
            enabled: true,
            models: [
              {
                id: 'gpt-4',
                name: 'GPT-4',
                enabled: true,
                costPerToken: 0.00003,
                maxTokens: 8192,
                timeout: 30000,
                parameters: { temperature: 0.7, top_p: 1 }
              },
              {
                id: 'gpt-3.5-turbo',
                name: 'GPT-3.5 Turbo',
                enabled: true,
                costPerToken: 0.000002,
                maxTokens: 4096,
                timeout: 30000,
                parameters: { temperature: 0.7, top_p: 1 }
              }
            ],
            timeout: 30000
          },
          {
            id: 'anthropic',
            name: 'Anthropic',
            enabled: true,
            models: [
              {
                id: 'claude-3-opus',
                name: 'Claude 3 Opus',
                enabled: true,
                costPerToken: 0.000015,
                maxTokens: 4096,
                timeout: 30000,
                parameters: { temperature: 0.7 }
              }
            ],
            timeout: 30000
          }
        ],
        defaultProvider: 'openai',
        defaultModel: 'gpt-4',
        rateLimits: {
          requestsPerMinute: 60,
          requestsPerHour: 1000,
          requestsPerDay: 10000,
          concurrentRequests: 10
        },
        fallbackOptions: {
          enabled: true,
          maxRetries: 3,
          retryDelay: 1000,
          fallbackProviders: ['openai', 'anthropic']
        }
      };

      // Override with stored configurations
      configs.forEach(config => {
        if (config.key === 'providers') {
          defaultConfig.providers = config.value as unknown as ModelProvider[];
        } else if (config.key === 'defaultProvider') {
          defaultConfig.defaultProvider = config.value as string;
        } else if (config.key === 'defaultModel') {
          defaultConfig.defaultModel = config.value as string;
        } else if (config.key === 'rateLimits') {
          defaultConfig.rateLimits = config.value as unknown as RateLimitConfig;
        } else if (config.key === 'fallbackOptions') {
          defaultConfig.fallbackOptions = config.value as unknown as FallbackConfig;
        }
      });

      return defaultConfig;
    } catch (error) {
      console.error('Error fetching model config:', error);
      throw new Error('Failed to fetch AI model configuration');
    }
  }

  /**
   * Update AI model configuration
   */
  async updateModelConfig(
    configKey: keyof AIModelConfiguration,
    value: any,
    updatedBy: string
  ) {
    try {
      // Validate based on config key
      if (configKey === 'providers') {
        // Validate provider configuration
        const validatedProviders = z.array(modelConfigSchema).parse(value);
        value = validatedProviders;
      }

      const config = await prisma.adminSettings.upsert({
        where: { category_key: { category: 'ai_models', key: configKey } },
        update: {
          value,
          updatedBy,
          updatedAt: new Date()
        },
        create: {
          category: 'ai_models',
          key: configKey,
          value,
          updatedBy,
          isActive: true
        }
      });

      return config;
    } catch (error) {
      console.error('Error updating model config:', error);
      throw new Error('Failed to update AI model configuration');
    }
  }

  /**
   * Get available AI providers
   */
  async getProviders() {
    try {
      const config = await this.getModelConfig();
      return config.providers.filter(provider => provider.enabled);
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw new Error('Failed to fetch AI providers');
    }
  }

  /**
   * Enable/disable AI provider
   */
  async toggleProvider(providerId: string, enabled: boolean, updatedBy: string) {
    try {
      const config = await this.getModelConfig();
      const providerIndex = config.providers.findIndex(p => p.id === providerId);
      
      if (providerIndex === -1) {
        throw new Error('Provider not found');
      }

      config.providers[providerIndex].enabled = enabled;
      
      // Skip validation for providers update since it's a complex nested structure
      const updatedConfig = await prisma.adminSettings.upsert({
        where: { category_key: { category: 'ai_models', key: 'providers' } },
        update: {
          value: config.providers as any,
          updatedBy,
          updatedAt: new Date()
        },
        create: {
          category: 'ai_models',
          key: 'providers',
          value: config.providers as any,
          updatedBy,
          isActive: true
        }
      });
      
      return config.providers[providerIndex];
    } catch (error) {
      console.error('Error toggling provider:', error);
      throw new Error('Failed to toggle AI provider');
    }
  }
}

/**
 * User Management Service for Admin Operations
 */
export class UserManagementService {
  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<UserStatistics> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        adminUsers,
        subscriptions
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: today } } }),
        prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
        prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
        prisma.user.count({ where: { role: Role.ADMIN } }),
        prisma.userSubscription.groupBy({
          by: ['tier'],
          _count: { tier: true }
        })
      ]);

      // Calculate active users (users with activity in last 30 days)
      const activeUsers = await prisma.user.count({
        where: {
          OR: [
            { analyses: { some: { createdAt: { gte: monthAgo } } } },
            { stories: { some: { generatedAt: { gte: monthAgo } } } },
            { activities: { some: { timestamp: { gte: monthAgo } } } }
          ]
        }
      });

      // Build subscription breakdown
      const subscriptionBreakdown = {
        FREE: 0,
        PRO: 0,
        ENTERPRISE: 0
      } as Record<SubscriptionTier, number>;

      subscriptions.forEach(sub => {
        subscriptionBreakdown[sub.tier] = sub._count.tier;
      });

      return {
        totalUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        activeUsers,
        adminUsers,
        subscriptionBreakdown
      };
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw new Error('Failed to fetch user statistics');
    }
  }

  /**
   * Get paginated user list with filters
   */
  async getUsers(
    page: number = 1,
    limit: number = 50,
    filters?: {
      role?: Role;
      subscriptionTier?: SubscriptionTier;
      search?: string;
    }
  ) {
    try {
      const offset = (page - 1) * limit;
      
      const where: any = {};
      
      if (filters?.role) {
        where.role = filters.role;
      }
      
      if (filters?.subscriptionTier) {
        where.subscription = {
          tier: filters.subscriptionTier
        };
      }
      
      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            subscription: true,
            _count: {
              select: {
                analyses: true,
                stories: true,
                backgroundJobs: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit
        }),
        prisma.user.count({ where })
      ]);

      return {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: Role, updatedBy: string) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { role },
        include: {
          subscription: true
        }
      });

      // Log the action
      await prisma.userActivity.create({
        data: {
          userId: updatedBy,
          action: 'update_user_role',
          category: 'admin',
          metadata: {
            targetUserId: userId,
            newRole: role,
            previousRole: user.role
          }
        }
      });

      return user;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  }

  /**
   * Update user subscription
   */
  async updateUserSubscription(
    userId: string,
    subscriptionData: {
      tier: SubscriptionTier;
      status: SubscriptionStatus;
    },
    updatedBy: string
  ) {
    try {
      const subscription = await prisma.userSubscription.upsert({
        where: { userId },
        update: {
          tier: subscriptionData.tier,
          status: subscriptionData.status,
          updatedAt: new Date()
        },
        create: {
          userId,
          tier: subscriptionData.tier,
          status: subscriptionData.status,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      });

      // Log the action
      await prisma.userActivity.create({
        data: {
          userId: updatedBy,
          action: 'update_user_subscription',
          category: 'admin',
          metadata: {
            targetUserId: userId,
            subscriptionTier: subscriptionData.tier,
            subscriptionStatus: subscriptionData.status
          }
        }
      });

      return subscription;
    } catch (error) {
      console.error('Error updating user subscription:', error);
      throw new Error('Failed to update user subscription');
    }
  }

  /**
   * Suspend user account
   */
  async suspendUser(userId: string, reason: string, updatedBy: string) {
    try {
      // Update user subscription to inactive
      await prisma.userSubscription.updateMany({
        where: { userId },
        data: { status: SubscriptionStatus.CANCELED }
      });

      // Cancel all running tasks
      await prisma.taskQueue.updateMany({
        where: { 
          userId,
          status: { in: [TaskStatus.QUEUED, TaskStatus.RUNNING] }
        },
        data: { status: TaskStatus.CANCELED }
      });

      // Log the action
      await prisma.userActivity.create({
        data: {
          userId: updatedBy,
          action: 'suspend_user',
          category: 'admin',
          metadata: {
            targetUserId: userId,
            reason
          }
        }
      });

      return { success: true, message: 'User suspended successfully' };
    } catch (error) {
      console.error('Error suspending user:', error);
      throw new Error('Failed to suspend user');
    }
  }

  /**
   * Delete user account
   */
  async deleteUser(userId: string, updatedBy: string) {
    try {
      // This will cascade delete related records due to Prisma schema constraints
      const user = await prisma.user.delete({
        where: { id: userId }
      });

      // Log the action
      await prisma.userActivity.create({
        data: {
          userId: updatedBy,
          action: 'delete_user',
          category: 'admin',
          metadata: {
            targetUserId: userId,
            deletedUserEmail: user.email
          }
        }
      });

      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }
}

/**
 * System Metrics Collection and Monitoring Service
 */
export class SystemMetricsService {
  /**
   * Get comprehensive system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const [
        userStats,
        apiUsage,
        taskQueueStats,
        errorStats,
        systemHealth
      ] = await Promise.all([
        this.getUserMetrics(),
        this.getApiUsageMetrics(),
        this.getTaskQueueStatistics(),
        this.getErrorStatistics(),
        this.getSystemHealth()
      ]);

      return {
        totalUsers: userStats.totalUsers,
        activeSubscriptions: userStats.activeSubscriptions,
        totalStoriesGenerated: userStats.totalStoriesGenerated,
        systemHealth,
        apiUsage,
        taskQueueStats,
        errorStats
      };
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      throw new Error('Failed to fetch system metrics');
    }
  }

  /**
   * Get user-related metrics
   */
  private async getUserMetrics() {
    const [totalUsers, activeSubscriptions, totalStoriesGenerated] = await Promise.all([
      prisma.user.count(),
      prisma.userSubscription.count({
        where: { status: SubscriptionStatus.ACTIVE }
      }),
      prisma.story.count()
    ]);

    return {
      totalUsers,
      activeSubscriptions,
      totalStoriesGenerated
    };
  }

  /**
   * Get API usage metrics
   */
  private async getApiUsageMetrics(): Promise<ApiUsageMetrics> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalAnalyses, totalStories, errors] = await Promise.all([
      prisma.analysis.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.story.count({
        where: { generatedAt: { gte: thirtyDaysAgo } }
      }),
      prisma.platformError.count({
        where: { 
          createdAt: { gte: thirtyDaysAgo },
          category: { in: ['AI_PROVIDER', 'NETWORK'] }
        }
      })
    ]);

    const totalApiCalls = totalAnalyses + totalStories;
    const errorRate = totalApiCalls > 0 ? (errors / totalApiCalls) * 100 : 0;
    const successRate = 100 - errorRate;

    // Get provider usage stats
    const providerStats = await prisma.analysis.groupBy({
      by: ['provider'],
      _count: { provider: true },
      where: { createdAt: { gte: thirtyDaysAgo } }
    });

    const topProviders = providerStats.map(stat => ({
      provider: stat.provider,
      usage: stat._count.provider
    }));

    // Calculate average response time from analysis duration
    const avgDuration = await prisma.analysis.aggregate({
      _avg: { durationMs: true },
      where: { 
        createdAt: { gte: thirtyDaysAgo },
        durationMs: { not: null }
      }
    });

    return {
      totalApiCalls,
      successRate,
      averageResponseTime: avgDuration._avg.durationMs || 0,
      errorRate,
      topProviders
    };
  }

  /**
   * Get task queue statistics
   */
  private async getTaskQueueStatistics(): Promise<TaskQueueStatistics> {
    const [
      totalQueued,
      totalRunning,
      totalCompleted,
      totalFailed
    ] = await Promise.all([
      prisma.taskQueue.count({ where: { status: TaskStatus.QUEUED } }),
      prisma.taskQueue.count({ where: { status: TaskStatus.RUNNING } }),
      prisma.taskQueue.count({ where: { status: TaskStatus.COMPLETED } }),
      prisma.taskQueue.count({ where: { status: TaskStatus.FAILED } })
    ]);

    // Calculate average wait and processing times
    const completedTasks = await prisma.taskQueue.findMany({
      where: { 
        status: TaskStatus.COMPLETED,
        startedAt: { not: null },
        completedAt: { not: null }
      },
      select: {
        queuedAt: true,
        startedAt: true,
        completedAt: true
      },
      take: 1000, // Sample recent tasks
      orderBy: { completedAt: 'desc' }
    });

    let totalWaitTime = 0;
    let totalProcessingTime = 0;

    completedTasks.forEach(task => {
      if (task.startedAt && task.completedAt) {
        const waitTime = task.startedAt.getTime() - task.queuedAt.getTime();
        const processingTime = task.completedAt.getTime() - task.startedAt.getTime();
        
        totalWaitTime += waitTime;
        totalProcessingTime += processingTime;
      }
    });

    const averageWaitTime = completedTasks.length > 0 ? totalWaitTime / completedTasks.length : 0;
    const averageProcessingTime = completedTasks.length > 0 ? totalProcessingTime / completedTasks.length : 0;

    const totalTasks = totalQueued + totalRunning + totalCompleted + totalFailed;
    const successRate = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

    return {
      totalQueued,
      totalRunning,
      totalCompleted,
      totalFailed,
      averageWaitTime,
      averageProcessingTime,
      successRate
    };
  }

  /**
   * Get error statistics
   */
  private async getErrorStatistics(): Promise<ErrorStatistics> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalErrors,
      criticalErrors,
      resolvedErrors,
      errorsByCategory
    ] = await Promise.all([
      prisma.platformError.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.platformError.count({
        where: { 
          createdAt: { gte: thirtyDaysAgo },
          severity: 'CRITICAL'
        }
      }),
      prisma.platformError.count({
        where: { 
          createdAt: { gte: thirtyDaysAgo },
          isResolved: true
        }
      }),
      prisma.platformError.groupBy({
        by: ['category'],
        _count: { category: true },
        where: { createdAt: { gte: thirtyDaysAgo } },
        orderBy: { _count: { category: 'desc' } },
        take: 10
      })
    ]);

    const topErrorCategories = errorsByCategory.map(error => ({
      category: error.category,
      count: error._count.category
    }));

    return {
      totalErrors,
      criticalErrors,
      resolvedErrors,
      topErrorCategories
    };
  }

  /**
   * Determine system health status
   */
  private async getSystemHealth(): Promise<'healthy' | 'warning' | 'critical'> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const [
      recentCriticalErrors,
      failedTasksRatio,
      activeConnections
    ] = await Promise.all([
      prisma.platformError.count({
        where: {
          createdAt: { gte: fiveMinutesAgo },
          severity: 'CRITICAL'
        }
      }),
      this.getRecentFailedTasksRatio(),
      this.getActiveConnectionsCount()
    ]);

    // Determine health based on multiple factors
    if (recentCriticalErrors > 5 || failedTasksRatio > 0.5) {
      return 'critical';
    }

    if (recentCriticalErrors > 0 || failedTasksRatio > 0.2 || activeConnections > 100) {
      return 'warning';
    }

    return 'healthy';
  }

  /**
   * Get ratio of failed tasks in recent period
   */
  private async getRecentFailedTasksRatio(): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const [totalTasks, failedTasks] = await Promise.all([
      prisma.taskQueue.count({
        where: { createdAt: { gte: oneHourAgo } }
      }),
      prisma.taskQueue.count({
        where: { 
          createdAt: { gte: oneHourAgo },
          status: TaskStatus.FAILED
        }
      })
    ]);

    return totalTasks > 0 ? failedTasks / totalTasks : 0;
  }

  /**
   * Get active connections count (approximation based on recent activity)
   */
  private async getActiveConnectionsCount(): Promise<number> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const activeUsers = await prisma.userActivity.groupBy({
      by: ['userId'],
      where: { timestamp: { gte: fiveMinutesAgo } }
    });

    return activeUsers.length;
  }

  /**
   * Get system performance metrics over time
   */
  async getPerformanceMetrics(
    startDate: Date,
    endDate: Date,
    interval: 'hour' | 'day' | 'week' = 'day'
  ) {
    try {
      // This would typically use a time-series database or aggregated metrics table
      // For now, we'll provide basic aggregation
      
      const metrics = await prisma.platformMetric.findMany({
        where: {
          periodStart: { gte: startDate },
          periodEnd: { lte: endDate }
        },
        orderBy: { periodStart: 'asc' }
      });

      return metrics;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw new Error('Failed to fetch performance metrics');
    }
  }

  /**
   * Record system metric
   */
  async recordMetric(
    name: string,
    category: string,
    value: number,
    unit?: string,
    period: string = 'point',
    metadata?: any
  ) {
    try {
      const now = new Date();
      
      await prisma.platformMetric.create({
        data: {
          name,
          category,
          value,
          unit,
          period,
          periodStart: now,
          periodEnd: now,
          metadata
        }
      });
    } catch (error) {
      console.error('Error recording metric:', error);
      throw new Error('Failed to record metric');
    }
  }
}

// Export service instances
export const adminService = new AdminService();
export const aiModelConfigService = new AIModelConfigService();
export const userManagementService = new UserManagementService();
export const systemMetricsService = new SystemMetricsService();