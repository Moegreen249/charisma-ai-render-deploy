import { RedisService } from "./redis";
import { prisma } from "./prisma";

export interface NotificationData {
  type: "analysis_complete" | "analysis_failed" | "background_job_progress" | "system_maintenance" | "general";
  title: string;
  message: string;
  userId?: string;
  metadata?: Record<string, any>;
  persistent?: boolean;
  action?: {
    label: string;
    url: string;
  };
}

export class NotificationService {
  /**
   * Send notification to specific user
   */
  static async sendToUser(userId: string, notification: NotificationData) {
    try {
      // Store notification in database for persistence
      const dbNotification = await prisma.notification.create({
        data: {
          userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          metadata: notification.metadata || {},
          read: false,
          persistent: notification.persistent || false,
        },
      });

      // Send real-time notification via Redis
      await RedisService.publishNotification(`user:${userId}:notifications`, {
        id: dbNotification.id,
        ...notification,
        timestamp: new Date().toISOString(),
        userId,
      });

      return dbNotification;
    } catch (error) {
      console.error("Failed to send notification to user:", error);
      throw error;
    }
  }

  /**
   * Send notification to all users
   */
  static async sendToAll(notification: NotificationData) {
    try {
      // Send via system announcements channel
      await RedisService.publishNotification("system_announcements", {
        ...notification,
        timestamp: new Date().toISOString(),
      });

      // Optionally store in database for all users (for persistent notifications)
      if (notification.persistent) {
        const users = await prisma.user.findMany({
          select: { id: true },
        });

        const notifications = users.map((user) => ({
          userId: user.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          metadata: notification.metadata || {},
          read: false,
          persistent: true,
        }));

        await prisma.notification.createMany({
          data: notifications,
        });
      }
    } catch (error) {
      console.error("Failed to send notification to all users:", error);
      throw error;
    }
  }

  /**
   * Send analysis completion notification
   */
  static async notifyAnalysisComplete(userId: string, analysisId: string, fileName: string) {
    await this.sendToUser(userId, {
      type: "analysis_complete",
      title: "Analysis Complete!",
      message: `Your conversation analysis for "${fileName}" is ready to view.`,
      metadata: { analysisId, fileName },
      action: {
        label: "View Results",
        url: `/history/${analysisId}`,
      },
    });
  }

  /**
   * Send analysis failure notification
   */
  static async notifyAnalysisFailure(userId: string, fileName: string, error: string) {
    await this.sendToUser(userId, {
      type: "analysis_failed",
      title: "Analysis Failed",
      message: `There was an error processing "${fileName}": ${error}`,
      metadata: { fileName, error },
      persistent: true,
    });
  }

  /**
   * Send background job progress notification
   */
  static async notifyJobProgress(userId: string, jobId: string, progress: number, message: string) {
    await RedisService.publishNotification(`user:${userId}:notifications`, {
      type: "background_job_progress",
      title: "Processing Update",
      message,
      userId,
      metadata: { jobId, progress },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send system maintenance notification
   */
  static async notifySystemMaintenance(message: string, scheduledTime?: Date) {
    await this.sendToAll({
      type: "system_maintenance",
      title: "System Maintenance",
      message: scheduledTime
        ? `${message} Scheduled for: ${scheduledTime.toLocaleString()}`
        : message,
      persistent: true,
      metadata: { scheduledTime },
    });
  }

  /**
   * Get unread notifications for user
   */
  static async getUserNotifications(userId: string, limit = 50) {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      });

      return notifications;
    } catch (error) {
      console.error("Failed to get user notifications:", error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    try {
      await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }

  /**
   * Mark all notifications as read for user
   */
  static async markAllAsRead(userId: string) {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }

  /**
   * Delete old notifications (cleanup job)
   */
  static async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          persistent: false,
          read: true,
        },
      });
    } catch (error) {
      console.error("Failed to cleanup old notifications:", error);
    }
  }
}

export default NotificationService;
