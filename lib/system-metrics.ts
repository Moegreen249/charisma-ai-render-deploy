import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export interface SystemMetrics {
  api_call_stats: {
    success_count: number;
    error_count: number;
    total_analyses_today: number;
    avg_response_time: number;
  };
  recent_errors: Array<{
    timestamp: string;
    error_type: string;
    message: string;
  }>;
  recent_activity: {
    last_prompt_update: string | null;
    last_analysis: string | null;
    active_users_count: number;
    total_users: number;
  };
  system_health: {
    uptime: number;
    memory_usage: {
      used: number;
      total: number;
      percentage: number;
    };
    database_status: 'connected' | 'disconnected' | 'error';
  };
  ai_configuration: {
    active_models: string[];
    primary_provider: string;
    template_version: string;
  };
}

export async function gatherSystemMetrics(): Promise<SystemMetrics> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  try {
    // Get API call statistics from analysis history
    const [
      todayAnalyses,
      recentAnalyses,
      recentErrors,
      totalUsers,
      activeUsers,
      lastAnalysis,
    ] = await Promise.all([
      // Today's analyses
      prisma.analysis.count({
        where: {
          createdAt: {
            gte: todayStart,
          },
        },
      }),
      
      // Recent analyses for success/error stats
      prisma.analysis.findMany({
        where: {
          createdAt: {
            gte: hourAgo,
          },
        },
        select: {
          id: true,
          durationMs: true,
        },
      }),

      // Recent errors from error tracking
      prisma.platformError.findMany({
        where: {
          createdAt: {
            gte: hourAgo,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        select: {
          createdAt: true,
          category: true,
          message: true,
        },
      }),

      // Total users
      prisma.user.count(),

      // Active users (users who've done something in the last 24 hours)
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Last analysis
      prisma.analysis.findFirst({
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    // Calculate success/error stats
    const successfulAnalyses = recentAnalyses.length;
    const failedAnalyses = 0;
    const avgResponseTime = recentAnalyses.length > 0 
      ? recentAnalyses.reduce((sum: number, a: any) => sum + (a.durationMs || 0), 0) / recentAnalyses.length
      : 0;

    // System health metrics
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const usedMemory = memoryUsage.heapUsed;

    // Database status check
    let databaseStatus: 'connected' | 'disconnected' | 'error' = 'connected';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      databaseStatus = 'error';
    }

    // Get AI configuration (we'll need to adapt this based on your settings storage)
    const aiConfiguration = {
      active_models: ['gemini-2.5-flash', 'gpt-4o-mini'], // This should come from your settings
      primary_provider: 'google', // This should come from your settings
      template_version: 'v1.2', // This should come from your template system
    };

    return {
      api_call_stats: {
        success_count: successfulAnalyses,
        error_count: failedAnalyses,
        total_analyses_today: todayAnalyses,
        avg_response_time: Math.round(avgResponseTime),
      },
      recent_errors: recentErrors.map((error: any) => ({
        timestamp: error.createdAt.toISOString(),
        error_type: error.category || 'Unknown',
        message: error.message || 'No message available',
      })),
      recent_activity: {
        last_prompt_update: null, // We'll need to track this in your template system
        last_analysis: lastAnalysis?.createdAt.toISOString() || null,
        active_users_count: activeUsers,
        total_users: totalUsers,
      },
      system_health: {
        uptime: process.uptime(),
        memory_usage: {
          used: usedMemory,
          total: totalMemory,
          percentage: Math.round((usedMemory / totalMemory) * 100),
        },
        database_status: databaseStatus,
      },
      ai_configuration: aiConfiguration,
    };

  } catch (error) {
    console.error('Error gathering system metrics:', error);
    // Return minimal fallback metrics
    return {
      api_call_stats: {
        success_count: 0,
        error_count: 1,
        total_analyses_today: 0,
        avg_response_time: 0,
      },
      recent_errors: [{
        timestamp: now.toISOString(),
        error_type: 'MetricsError',
        message: 'Failed to gather system metrics',
      }],
      recent_activity: {
        last_prompt_update: null,
        last_analysis: null,
        active_users_count: 0,
        total_users: 0,
      },
      system_health: {
        uptime: process.uptime(),
        memory_usage: {
          used: 0,
          total: os.totalmem(),
          percentage: 0,
        },
        database_status: 'error',
      },
      ai_configuration: {
        active_models: [],
        primary_provider: 'unknown',
        template_version: 'unknown',
      },
    };
  }
}

export async function saveSystemFeeling(feelingData: any): Promise<void> {
  const publicDir = path.join(process.cwd(), 'public');
  
  // Ensure public directory exists
  try {
    await fs.access(publicDir);
  } catch {
    await fs.mkdir(publicDir, { recursive: true });
  }

  // Save current feeling
  await fs.writeFile(
    path.join(publicDir, 'charisma_feeling.json'),
    JSON.stringify(feelingData, null, 2)
  );

  // Update mood history
  const historyPath = path.join(publicDir, 'mood_history.json');
  let history: Array<{ timestamp: string; mood_score: number }> = [];
  
  try {
    const existingHistory = await fs.readFile(historyPath, 'utf-8');
    history = JSON.parse(existingHistory);
  } catch {
    // File doesn't exist yet, start with empty array
  }

  // Add new entry
  history.push({
    timestamp: new Date().toISOString(),
    mood_score: feelingData.calculated_mood_score,
  });

  // Keep only last 100 entries to prevent file from growing too large
  if (history.length > 100) {
    history = history.slice(-100);
  }

  await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
}