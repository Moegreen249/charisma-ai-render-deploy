import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

// Redis utility functions
export class RedisService {
  // User session tracking
  static async trackUserActivity(
    userId: string,
    activity: {
      page?: string;
      action: string;
      timestamp?: Date;
      metadata?: any;
    },
  ) {
    const key = `user:${userId}:activity`;
    const data = {
      ...activity,
      timestamp: activity.timestamp || new Date(),
    };

    await redis.zadd(key, Date.now(), JSON.stringify(data));
    await redis.expire(key, 24 * 60 * 60); // Expire after 24 hours
  }

  // Real-time user status
  static async setUserOnline(userId: string, metadata?: any) {
    const key = `user:${userId}:online`;
    await redis.setex(
      key,
      300,
      JSON.stringify({
        // 5 minutes TTL
        lastSeen: new Date(),
        ...metadata,
      }),
    );

    // Add to active users set
    await redis.sadd("active_users", userId);
  }

  static async setUserOffline(userId: string) {
    await redis.del(`user:${userId}:online`);
    await redis.srem("active_users", userId);
  }

  static async getActiveUsers(): Promise<string[]> {
    return await redis.smembers("active_users");
  }

  static async isUserOnline(userId: string): Promise<boolean> {
    return (await redis.exists(`user:${userId}:online`)) === 1;
  }

  // Background job caching
  static async cacheJobStatus(jobId: string, status: any, ttl: number = 3600) {
    const key = `job:${jobId}:status`;
    await redis.setex(key, ttl, JSON.stringify(status));
  }

  static async getJobStatus(jobId: string) {
    const key = `job:${jobId}:status`;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  static async deleteJobCache(jobId: string) {
    await redis.del(`job:${jobId}:status`);
  }

  // System health monitoring
  static async setSystemHealth(
    component: string,
    status: {
      status: "online" | "offline" | "error";
      lastCheck: Date;
      metadata?: any;
    },
  ) {
    const key = `system:health:${component}`;
    await redis.setex(key, 300, JSON.stringify(status)); // 5 minutes TTL
  }

  static async getSystemHealth(component: string) {
    const key = `system:health:${component}`;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  static async getAllSystemHealth() {
    const keys = await redis.keys("system:health:*");
    const health: Record<string, any> = {};

    for (const key of keys) {
      const component = key.replace("system:health:", "");
      const status = await redis.get(key);
      health[component] = status ? JSON.parse(status) : null;
    }

    return health;
  }

  // Real-time notifications
  static async publishNotification(channel: string, data: any) {
    try {
      await redis.publish(channel, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to publish notification:", error);
    }
  }

  static async subscribeToNotifications(
    channel: string,
    callback: (data: any) => void,
  ) {
    const subscriber = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
    });

    subscriber.subscribe(channel);
    subscriber.on("message", (receivedChannel, message) => {
      if (receivedChannel === channel) {
        try {
          const data = JSON.parse(message);
          callback(data);
        } catch (error) {
          console.error("Error parsing notification message:", error);
        }
      }
    });

    return subscriber;
  }


  // Queue management
  static async addToQueue(queueName: string, data: any, priority: number = 0) {
    const key = `queue:${queueName}`;
    await redis.zadd(
      key,
      priority,
      JSON.stringify({
        ...data,
        id: data.id || Date.now().toString(),
        addedAt: new Date(),
      }),
    );
  }

  static async getFromQueue(queueName: string, count: number = 1) {
    const key = `queue:${queueName}`;
    const items = await redis.zrange(key, 0, count - 1);

    if (items.length > 0) {
      // Remove the items from the queue
      await redis.zrem(key, ...items);
      return items.map((item) => JSON.parse(item));
    }

    return [];
  }

  static async getQueueLength(queueName: string): Promise<number> {
    const key = `queue:${queueName}`;
    return await redis.zcard(key);
  }

  // Rate limiting
  static async checkRateLimit(
    identifier: string,
    limit: number,
    windowSecs: number,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }> {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const window = windowSecs * 1000;
    const resetTime = new Date(now + window);

    // Remove expired entries
    await redis.zremrangebyscore(key, 0, now - window);

    // Count current requests
    const current = await redis.zcard(key);

    if (current < limit) {
      // Add current request
      await redis.zadd(key, now, now);
      await redis.expire(key, windowSecs);

      return {
        allowed: true,
        remaining: limit - current - 1,
        resetTime,
      };
    }

    return {
      allowed: false,
      remaining: 0,
      resetTime,
    };
  }

  // Analytics caching
  static async cacheAnalytics(key: string, data: any, ttl: number = 300) {
    const cacheKey = `analytics:${key}`;

    // If TTL is 0 or negative, delete the key instead of setting it
    if (ttl <= 0) {
      await redis.del(cacheKey);
      return;
    }

    await redis.setex(cacheKey, ttl, JSON.stringify(data));
  }

  static async getCachedAnalytics(key: string) {
    const cacheKey = `analytics:${key}`;
    const cached = await redis.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  }

  // Health check
  static async healthCheck(): Promise<{
    status: "online" | "offline" | "error";
    latency: number;
    error?: string;
  }> {
    try {
      const start = Date.now();
      await redis.ping();
      const latency = Date.now() - start;

      return {
        status: "online",
        latency,
      };
    } catch (error) {
      return {
        status: "error",
        latency: -1,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Clean up expired keys (utility function)
  static async cleanup() {
    try {
      // Clean up expired user activities
      const userKeys = await redis.keys("user:*:activity");
      for (const key of userKeys) {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        await redis.zremrangebyscore(key, 0, oneDayAgo);
      }

      // Clean up inactive users from active set
      const activeUsers = await redis.smembers("active_users");
      for (const userId of activeUsers) {
        const isOnline = await this.isUserOnline(userId);
        if (!isOnline) {
          await redis.srem("active_users", userId);
        }
      }

      console.log("Redis cleanup completed");
    } catch (error) {
      console.error("Redis cleanup error:", error);
    }
  }
}

// Export default redis instance
export default redis;