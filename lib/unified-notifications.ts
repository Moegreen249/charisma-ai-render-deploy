import { RedisService } from "./redis";
import { prisma } from "./prisma";
import { webSocketManager } from "./websocket-manager";
import { logger } from "./logger";

export interface UnifiedNotificationData {
  type: "analysis_complete" | "analysis_failed" | "task_progress" | "task_completed" | "task_failed" | "system_maintenance" | "general";
  title: string;
  message: string;
  userId?: string;
  metadata?: Record<string, any>;
  persistent?: boolean;
  action?: {
    label: string;
    url: string;
  };
  channels?: NotificationChannel[];
}

export type NotificationChannel = "database" | "websocket" | "redis" | "all";

export interface NotificationDeliveryResult {
  success: boolean;
  channels: {
    database?: { success: boolean; id?: string; error?: string };
    websocket?: { success: boolean; error?: string };
    redis?: { success: boolean; error?: string };
  };
  errors: string[];
}

export class UnifiedNotificationService {
  /**
   * Send unified notification through all specified channels
   */
  static async sendNotification(
    notification: UnifiedNotificationData,
    channels: NotificationChannel[] = ["all"]
  ): Promise<NotificationDeliveryResult> {
    const result: NotificationDeliveryResult = {
      success: true,
      channels: {},
      errors: []
    };

    // Determine which channels to use
    const useChannels = channels.includes("all") 
      ? ["database", "websocket", "redis"] as NotificationChannel[]
      : channels;

    // Send via database (persistent storage)
    if (useChannels.includes("database")) {
      try {
        const dbResult = await this.sendToDatabase(notification);
        result.channels.database = { success: true, id: dbResult.id };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Database notification failed";
        result.channels.database = { success: false, error: errorMsg };
        result.errors.push(`Database: ${errorMsg}`);
        result.success = false;
      }
    }

    // Send via WebSocket (real-time)
    if (useChannels.includes("websocket")) {
      try {
        await this.sendToWebSocket(notification);
        result.channels.websocket = { success: true };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "WebSocket notification failed";
        result.channels.websocket = { success: false, error: errorMsg };
        result.errors.push(`WebSocket: ${errorMsg}`);
        result.success = false;
      }
    }

    // Send via Redis (pub/sub)
    if (useChannels.includes("redis")) {
      try {
        await this.sendToRedis(notification);
        result.channels.redis = { success: true };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Redis notification failed";
        result.channels.redis = { success: false, error: errorMsg };
        result.errors.push(`Redis: ${errorMsg}`);
        result.success = false;
      }
    }

    // Log the result
    if (result.success) {
      logger.info(`Unified notification sent successfully`, { 
        type: notification.type, 
        userId: notification.userId,
        channels: useChannels 
      });
    } else {
      logger.error(`Unified notification partially failed`, { 
        type: notification.type, 
        userId: notification.userId,
        errors: result.errors 
      });
    }

    return result;
  }

  /**
   * Send notification to specific user across all channels
   */
  static async sendToUser(
    userId: string, 
    notification: UnifiedNotificationData,
    channels: NotificationChannel[] = ["all"]
  ): Promise<NotificationDeliveryResult> {
    return this.sendNotification({ ...notification, userId }, channels);
  }

  /**
   * Send notification to all users
   */
  static async sendToAll(
    notification: UnifiedNotificationData,
    channels: NotificationChannel[] = ["all"]
  ): Promise<NotificationDeliveryResult[]> {
    const users = await prisma.user.findMany({ select: { id: true } });
    const results: NotificationDeliveryResult[] = [];

    for (const user of users) {
      const result = await this.sendToUser(user.id, notification, channels);
      results.push(result);
    }

    return results;
  }

  /**
   * Send task-related notifications (unified task updates)
   */
  static async sendTaskNotification(
    userId: string,
    taskId: string,
    type: "progress" | "completed" | "failed",
    data: {
      progress?: number;
      currentStep?: string;
      result?: any;
      error?: string;
      estimatedTimeRemaining?: number;
    }
  ): Promise<NotificationDeliveryResult> {
    let title: string;
    let message: string;

    switch (type) {
      case "progress":
        title = "Task Progress";
        message = data.currentStep || `Task ${Math.round(data.progress || 0)}% complete`;
        break;
      case "completed":
        title = "Task Completed";
        message = "Your task has been completed successfully";
        break;
      case "failed":
        title = "Task Failed";
        message = data.error || "Task failed to complete";
        break;
    }

    return this.sendToUser(userId, {
      type: type === "progress" ? "task_progress" : type === "completed" ? "task_completed" : "task_failed",
      title,
      message,
      metadata: {
        taskId,
        ...data
      },
      persistent: type !== "progress" // Don't persist progress updates
    });
  }

  /**
   * Send analysis-related notifications
   */
  static async sendAnalysisNotification(
    userId: string,
    analysisId: string,
    type: "completed" | "failed",
    fileName: string,
    error?: string
  ): Promise<NotificationDeliveryResult> {
    const notification: UnifiedNotificationData = {
      type: type === "completed" ? "analysis_complete" : "analysis_failed",
      title: type === "completed" ? "Analysis Complete!" : "Analysis Failed",
      message: type === "completed" 
        ? `Your conversation analysis for "${fileName}" is ready to view.`
        : `There was an error processing "${fileName}": ${error}`,
      metadata: { analysisId, fileName, error },
      persistent: true,
      action: type === "completed" ? {
        label: "View Results",
        url: `/history/${analysisId}`
      } : undefined
    };

    return this.sendToUser(userId, notification);
  }

  /**
   * Send system maintenance notification
   */
  static async sendMaintenanceNotification(
    message: string,
    scheduledTime?: Date
  ): Promise<NotificationDeliveryResult[]> {
    return this.sendToAll({
      type: "system_maintenance",
      title: "System Maintenance",
      message: scheduledTime
        ? `${message} Scheduled for: ${scheduledTime.toLocaleString()}`
        : message,
      persistent: true,
      metadata: { scheduledTime }
    });
  }

  /**
   * Get all notifications for user (from database)
   */
  static async getUserNotifications(userId: string, limit = 50) {
    try {
      return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit
      });
    } catch (error) {
      logger.error("Failed to get user notifications:", error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    try {
      await prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { read: true, readAt: new Date() }
      });
    } catch (error) {
      logger.error("Failed to mark notification as read:", error);
    }
  }

  /**
   * Mark all notifications as read for user
   */
  static async markAllAsRead(userId: string) {
    try {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true, readAt: new Date() }
      });
    } catch (error) {
      logger.error("Failed to mark all notifications as read:", error);
    }
  }

  /**
   * Get notification statistics for admin
   */
  static async getNotificationStats() {
    try {
      const [total, unread, byType] = await Promise.all([
        prisma.notification.count(),
        prisma.notification.count({ where: { read: false } }),
        prisma.notification.groupBy({
          by: ['type'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } }
        })
      ]);

      return {
        total,
        unread,
        byType: byType.map(item => ({ type: item.type, count: item._count.id }))
      };
    } catch (error) {
      logger.error("Failed to get notification stats:", error);
      return { total: 0, unread: 0, byType: [] };
    }
  }

  /**
   * Clean up old notifications
   */
  static async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const deleted = await prisma.notification.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          persistent: false,
          read: true
        }
      });

      logger.info(`Cleaned up ${deleted.count} old notifications`);
      return deleted.count;
    } catch (error) {
      logger.error("Failed to cleanup old notifications:", error);
      return 0;
    }
  }

  // Private methods for individual channels

  private static async sendToDatabase(notification: UnifiedNotificationData) {
    if (!notification.userId) {
      throw new Error("Database notifications require a userId");
    }

    return await prisma.notification.create({
      data: {
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata || {},
        read: false,
        persistent: notification.persistent || false
      }
    });
  }

  private static async sendToWebSocket(notification: UnifiedNotificationData) {
    if (!notification.userId) {
      // For system-wide notifications via WebSocket
      webSocketManager.broadcastSystemMessage(
        `${notification.title}: ${notification.message}`,
        notification.type === "system_maintenance" ? "warning" : "info"
      );
      return;
    }

    // For user-specific notifications via WebSocket
    // Convert to task update format for compatibility
    if (notification.type === "task_progress" || notification.type === "task_completed" || notification.type === "task_failed") {
      const taskId = notification.metadata?.taskId || "unknown";
      
      if (notification.type === "task_progress") {
        webSocketManager.sendProgressUpdate(
          taskId,
          notification.userId,
          notification.metadata?.progress || 0,
          notification.metadata?.currentStep,
          notification.metadata?.estimatedTimeRemaining
        );
      } else {
        webSocketManager.sendStatusUpdate(
          taskId,
          notification.userId,
          notification.type === "task_completed" ? "COMPLETED" : "FAILED" as any,
          notification.metadata?.result,
          notification.metadata?.error
        );
      }
    } else {
      // For other notification types, send as system message
      webSocketManager.broadcastSystemMessage(
        `${notification.title}: ${notification.message}`,
        "info"
      );
    }
  }

  private static async sendToRedis(notification: UnifiedNotificationData) {
    const data = {
      ...notification,
      timestamp: new Date().toISOString()
    };

    if (notification.userId) {
      // Send to user-specific channel
      await RedisService.publishNotification(`user:${notification.userId}:notifications`, data);
    } else {
      // Send to system announcements channel
      await RedisService.publishNotification("system_announcements", data);
    }
  }
}

export default UnifiedNotificationService;