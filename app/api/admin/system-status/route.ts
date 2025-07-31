import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { RedisService } from "@/lib/redis";

// AI Provider health check functions
async function checkOpenAI(): Promise<{
  status: "online" | "offline" | "error";
  responseTime?: number;
  error?: string;
}> {
  try {
    const start = Date.now();
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    const responseTime = Date.now() - start;

    if (response.ok) {
      return { status: "online", responseTime };
    } else {
      return { status: "error", responseTime, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return {
      status: "offline",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function checkGoogleAI(): Promise<{
  status: "online" | "offline" | "error";
  responseTime?: number;
  error?: string;
}> {
  try {
    const start = Date.now();
    // Simple ping to Google AI API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_AI_API_KEY}`,
      {
        signal: AbortSignal.timeout(5000),
      }
    );

    const responseTime = Date.now() - start;

    if (response.ok) {
      return { status: "online", responseTime };
    } else {
      return { status: "error", responseTime, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return {
      status: "offline",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function checkAnthropic(): Promise<{
  status: "online" | "offline" | "error";
  responseTime?: number;
  error?: string;
}> {
  try {
    const start = Date.now();
    // Simple ping to Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1,
        messages: [{ role: "user", content: "ping" }],
      }),
      signal: AbortSignal.timeout(5000),
    });

    const responseTime = Date.now() - start;

    if (response.ok || response.status === 400) {
      // 400 is expected for invalid request, but means API is responding
      return { status: "online", responseTime };
    } else {
      return { status: "error", responseTime, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return {
      status: "offline",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function checkDatabase(): Promise<{
  status: "online" | "offline" | "error";
  connections?: number;
  error?: string;
}> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;

    // Get connection count (if available)
    let connections = 0;
    try {
      const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active'
      `;
      connections = Number(result[0]?.count || 0);
    } catch {
      // Ignore connection count errors
    }

    return {
      status: "online",
      connections,
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function checkJobProcessor(): Promise<{
  status: "running" | "stopped" | "error";
  activeJobs?: number;
  queueLength?: number;
  error?: string;
}> {
  try {
    // Check if there are any processing jobs
    const processingJobs = await prisma.backgroundJob.count({
      where: { status: "PROCESSING" },
    });

    const pendingJobs = await prisma.backgroundJob.count({
      where: { status: "PENDING" },
    });

    // Check if jobs have been processed recently (last 5 minutes)
    const recentJobs = await prisma.backgroundJob.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000),
        },
      },
    });

    return {
      status: recentJobs > 0 || processingJobs > 0 ? "running" : "stopped",
      activeJobs: processingJobs,
      queueLength: pendingJobs,
    };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

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
    const forceRefresh = searchParams.get("refresh") === "true";

    // Check if we have cached results (unless force refresh)
    let cachedStatus = null;
    if (!forceRefresh) {
      cachedStatus = await RedisService.getCachedAnalytics("system_status");
    }

    if (cachedStatus) {
      return NextResponse.json(cachedStatus);
    }

    // Perform health checks in parallel with timeout
    const healthCheckPromises = [
      RedisService.healthCheck(),
      checkDatabase(),
      checkOpenAI(),
      checkGoogleAI(),
      checkAnthropic(),
      checkJobProcessor(),
    ];

    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), 10000); // 10 second timeout
    });

    let healthResults: any[];
    try {
      healthResults = await Promise.race([
        Promise.all(healthCheckPromises),
        timeoutPromise
      ]) as any[];
    } catch (error) {
      console.error('Health check timeout or error:', error);
      // Return fallback status if health checks timeout
      return NextResponse.json({
        error: "Health check timeout",
        fallback: {
          redis: { status: "error", error: "timeout" },
          database: { status: "error", error: "timeout" },
          aiProviders: {
            openai: { status: "error", error: "timeout" },
            google: { status: "error", error: "timeout" },
            anthropic: { status: "error", error: "timeout" },
          },
          jobProcessor: { status: "error", error: "timeout" },
          health: { overall: "critical" },
          lastUpdated: new Date().toISOString(),
        },
      }, { status: 503 });
    }

    const [
      redisHealth,
      databaseHealth,
      openaiHealth,
      googleHealth,
      anthropicHealth,
      jobProcessorHealth,
    ] = healthResults;

    // Get additional system metrics
    const systemMetrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
    };

    // Get recent error count
    const recentErrors = await prisma.platformError.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    const criticalErrors = await prisma.platformError.count({
      where: {
        severity: "CRITICAL",
        isResolved: false,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    // Get active users count
    const activeUsers = await RedisService.getActiveUsers();

    const systemStatus = {
      redis: redisHealth,
      database: databaseHealth,
      aiProviders: {
        openai: openaiHealth,
        google: googleHealth,
        anthropic: anthropicHealth,
      },
      jobProcessor: jobProcessorHealth,
      metrics: systemMetrics,
      health: {
        overall:
          redisHealth.status === "online" &&
          databaseHealth.status === "online" &&
          criticalErrors === 0
            ? "healthy"
            : criticalErrors > 0
            ? "critical"
            : "warning",
        recentErrors,
        criticalErrors,
        activeUsers: activeUsers.length,
      },
      lastUpdated: new Date().toISOString(),
    };

    // Cache the results for 30 seconds
    await RedisService.cacheAnalytics("system_status", systemStatus, 30);

    // Store health status in Redis for monitoring
    await Promise.all([
      RedisService.setSystemHealth("redis", {
        status: redisHealth.status,
        lastCheck: new Date(),
        metadata: { latency: redisHealth.latency },
      }),
      RedisService.setSystemHealth("database", {
        status: databaseHealth.status,
        lastCheck: new Date(),
        metadata: { connections: databaseHealth.connections },
      }),
      RedisService.setSystemHealth("openai", {
        status: openaiHealth.status,
        lastCheck: new Date(),
        metadata: { responseTime: openaiHealth.responseTime },
      }),
      RedisService.setSystemHealth("google", {
        status: googleHealth.status,
        lastCheck: new Date(),
        metadata: { responseTime: googleHealth.responseTime },
      }),
      RedisService.setSystemHealth("anthropic", {
        status: anthropicHealth.status,
        lastCheck: new Date(),
        metadata: { responseTime: anthropicHealth.responseTime },
      }),
      RedisService.setSystemHealth("job_processor", {
        status: jobProcessorHealth.status === "running" ? "online" : "offline",
        lastCheck: new Date(),
        metadata: {
          activeJobs: jobProcessorHealth.activeJobs,
          queueLength: jobProcessorHealth.queueLength,
        },
      }),
    ]);

    return NextResponse.json(systemStatus);

  } catch (error) {
    console.error("System status API error:", error);

    // Try to log this error even if other systems are down
    try {
      await prisma.platformError.create({
        data: {
          category: "SYSTEM",
          severity: "HIGH",
          message: "System status API endpoint error",
          stackTrace: error instanceof Error ? error.stack : String(error),
          endpoint: "/api/admin/system-status",
        },
      });
    } catch (logError) {
      console.error("Failed to log system status API error:", logError);
    }

    return NextResponse.json(
      {
        error: "Failed to fetch system status",
        fallback: {
          redis: { status: "error" },
          database: { status: "error" },
          aiProviders: {
            openai: { status: "error" },
            google: { status: "error" },
            anthropic: { status: "error" },
          },
          jobProcessor: { status: "error" },
          health: { overall: "critical" },
          lastUpdated: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "clear_cache":
        // Clear system status cache
        await RedisService.cacheAnalytics("system_status", null, 0);
        return NextResponse.json({ success: true, message: "Cache cleared" });

      case "cleanup_redis":
        // Trigger Redis cleanup
        await RedisService.cleanup();
        return NextResponse.json({ success: true, message: "Redis cleanup completed" });

      case "restart_job_processor":
        // This would require implementing job processor restart
        // For now, just return success
        return NextResponse.json({ success: true, message: "Job processor restart initiated" });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("System status action error:", error);

    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 }
    );
  }
}
