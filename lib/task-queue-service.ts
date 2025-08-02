import { prisma } from './prisma';
import { TaskType, TaskPriority, TaskStatus } from '@prisma/client';
import { logger } from './logger';
import { 
  TaskPayload, 
  TaskResult, 
  QueuePosition, 
  TaskMetrics, 
  TaskQueueConfig 
} from './task-queue-types';

const DEFAULT_CONFIG: TaskQueueConfig = {
  maxConcurrentTasks: 5,
  priorityWeights: {
    URGENT: 4,
    HIGH: 3,
    NORMAL: 2,
    LOW: 1,
  },
  retryDelays: [5, 15, 30, 60], // 5s, 15s, 30s, 60s
  timeoutSettings: {
    STORY_GENERATION: 300, // 5 minutes
    ANALYSIS: 180, // 3 minutes
    EXPORT: 120, // 2 minutes
  },
  estimatedProcessingTimes: {
    STORY_GENERATION: 120, // 2 minutes average
    ANALYSIS: 60, // 1 minute average
    EXPORT: 30, // 30 seconds average
  },
};

export class TaskQueueService {
  private config: TaskQueueConfig;
  private processingTasks = new Set<string>();

  constructor(config: Partial<TaskQueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Add a new task to the queue
   */
  async enqueueTask(
    userId: string,
    type: TaskType,
    payload: Record<string, any>,
    priority: TaskPriority = TaskPriority.NORMAL
  ): Promise<string> {
    try {
      const estimatedTime = this.config.estimatedProcessingTimes[type];
      
      const task = await prisma.taskQueue.create({
        data: {
          userId,
          type,
          priority,
          payload,
          estimatedTime,
          status: TaskStatus.QUEUED,
        },
      });

      logger.info(`Task enqueued: ${task.id} (type: ${type}, priority: ${priority})`);
      
      // Start processing if we have capacity
      this.processNextTask();
      
      return task.id;
    } catch (error) {
      logger.error('Failed to enqueue task:', error);
      throw new Error('Failed to enqueue task');
    }
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: string, userId?: string) {
    const where: any = { id: taskId };
    if (userId) {
      where.userId = userId;
    }

    return await prisma.taskQueue.findUnique({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get user's tasks with pagination
   */
  async getUserTasks(
    userId: string,
    options: {
      status?: TaskStatus[];
      type?: TaskType[];
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const { status, type, limit = 50, offset = 0 } = options;
    
    const where: any = { userId };
    if (status?.length) {
      where.status = { in: status };
    }
    if (type?.length) {
      where.type = { in: type };
    }

    const [tasks, total] = await Promise.all([
      prisma.taskQueue.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { queuedAt: 'asc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.taskQueue.count({ where }),
    ]);

    return { tasks, total };
  }

  /**
   * Cancel a task
   */
  async cancelTask(taskId: string, userId?: string): Promise<boolean> {
    try {
      const where: any = { id: taskId };
      if (userId) {
        where.userId = userId;
      }

      const task = await prisma.taskQueue.findUnique({ where });
      if (!task) {
        return false;
      }

      // Can only cancel queued or running tasks
      if (task.status !== TaskStatus.QUEUED && task.status !== TaskStatus.RUNNING) {
        return false;
      }

      await prisma.taskQueue.update({
        where: { id: taskId },
        data: {
          status: TaskStatus.CANCELED,
          completedAt: new Date(),
          error: 'Task cancelled by user',
        },
      });

      // Remove from processing set if it was running
      this.processingTasks.delete(taskId);

      logger.info(`Task cancelled: ${taskId}`);
      return true;
    } catch (error) {
      logger.error('Failed to cancel task:', error);
      return false;
    }
  }

  /**
   * Retry a failed task
   */
  async retryTask(taskId: string, userId?: string): Promise<boolean> {
    try {
      const where: any = { id: taskId };
      if (userId) {
        where.userId = userId;
      }

      const task = await prisma.taskQueue.findUnique({ where });
      if (!task) {
        return false;
      }

      // Can only retry failed or canceled tasks
      if (task.status !== TaskStatus.FAILED && task.status !== TaskStatus.CANCELED) {
        return false;
      }

      // Check if we've exceeded max retries
      if (task.retryCount >= task.maxRetries) {
        return false;
      }

      await prisma.taskQueue.update({
        where: { id: taskId },
        data: {
          status: TaskStatus.QUEUED,
          retryCount: task.retryCount + 1,
          error: null,
          startedAt: null,
          completedAt: null,
          progress: 0,
          queuedAt: new Date(), // Reset queue time for proper ordering
        },
      });

      logger.info(`Task retried: ${taskId} (attempt ${task.retryCount + 1})`);
      
      // Start processing
      this.processNextTask();
      
      return true;
    } catch (error) {
      logger.error('Failed to retry task:', error);
      return false;
    }
  }

  /**
   * Get queue position for a task
   */
  async getQueuePosition(taskId: string): Promise<QueuePosition | null> {
    try {
      const task = await prisma.taskQueue.findUnique({
        where: { id: taskId },
      });

      if (!task || task.status !== TaskStatus.QUEUED) {
        return null;
      }

      // Count tasks ahead in queue (higher priority or same priority but earlier queue time)
      const tasksAhead = await prisma.taskQueue.count({
        where: {
          status: TaskStatus.QUEUED,
          OR: [
            {
              priority: {
                in: this.getHigherPriorities(task.priority),
              },
            },
            {
              priority: task.priority,
              queuedAt: {
                lt: task.queuedAt,
              },
            },
          ],
        },
      });

      const position = tasksAhead + 1;
      
      // Calculate estimated wait time
      const runningTasks = await prisma.taskQueue.count({
        where: { status: TaskStatus.RUNNING },
      });
      
      const availableSlots = Math.max(0, this.config.maxConcurrentTasks - runningTasks);
      const tasksToWaitFor = Math.max(0, position - availableSlots);
      
      // Estimate based on average processing time for the task type
      const avgProcessingTime = this.config.estimatedProcessingTimes[task.type];
      const estimatedWaitTime = tasksToWaitFor * avgProcessingTime;

      return {
        position,
        estimatedWaitTime,
      };
    } catch (error) {
      logger.error('Failed to get queue position:', error);
      return null;
    }
  }

  /**
   * Get queue metrics
   */
  async getQueueMetrics(): Promise<TaskMetrics> {
    try {
      const [
        totalQueued,
        totalRunning,
        totalCompleted,
        totalFailed,
        recentTasks,
      ] = await Promise.all([
        prisma.taskQueue.count({ where: { status: TaskStatus.QUEUED } }),
        prisma.taskQueue.count({ where: { status: TaskStatus.RUNNING } }),
        prisma.taskQueue.count({ where: { status: TaskStatus.COMPLETED } }),
        prisma.taskQueue.count({ where: { status: TaskStatus.FAILED } }),
        prisma.taskQueue.findMany({
          where: {
            status: { in: [TaskStatus.COMPLETED, TaskStatus.FAILED] },
            completedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
          select: {
            status: true,
            queuedAt: true,
            startedAt: true,
            completedAt: true,
            actualTime: true,
          },
        }),
      ]);

      // Calculate averages from recent tasks
      let totalWaitTime = 0;
      let totalProcessingTime = 0;
      let successfulTasks = 0;

      recentTasks.forEach((task) => {
        if (task.startedAt) {
          totalWaitTime += task.startedAt.getTime() - task.queuedAt.getTime();
        }
        if (task.actualTime) {
          totalProcessingTime += task.actualTime;
        }
        if (task.status === TaskStatus.COMPLETED) {
          successfulTasks++;
        }
      });

      const averageWaitTime = recentTasks.length > 0 
        ? Math.round(totalWaitTime / recentTasks.length / 1000) 
        : 0;
      
      const averageProcessingTime = recentTasks.length > 0 
        ? Math.round(totalProcessingTime / recentTasks.length) 
        : 0;
      
      const successRate = recentTasks.length > 0 
        ? Math.round((successfulTasks / recentTasks.length) * 100) / 100 
        : 0;

      return {
        totalQueued,
        totalRunning,
        totalCompleted,
        totalFailed,
        averageWaitTime,
        averageProcessingTime,
        successRate,
      };
    } catch (error) {
      logger.error('Failed to get queue metrics:', error);
      throw new Error('Failed to get queue metrics');
    }
  }

  /**
   * Update task progress
   */
  async updateTaskProgress(
    taskId: string,
    progress: number,
    currentStep?: string
  ): Promise<void> {
    try {
      await prisma.taskQueue.update({
        where: { id: taskId },
        data: {
          progress: Math.max(0, Math.min(100, progress)),
          ...(currentStep && { payload: { currentStep } }),
        },
      });
    } catch (error) {
      logger.error('Failed to update task progress:', error);
    }
  }

  /**
   * Mark task as completed
   */
  async completeTask(
    taskId: string,
    result: TaskResult
  ): Promise<void> {
    try {
      const task = await prisma.taskQueue.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      const actualTime = task.startedAt 
        ? Math.round((Date.now() - task.startedAt.getTime()) / 1000)
        : null;

      await prisma.taskQueue.update({
        where: { id: taskId },
        data: {
          status: result.success ? TaskStatus.COMPLETED : TaskStatus.FAILED,
          result: result.success ? result.data : null,
          error: result.error || null,
          progress: result.success ? 100 : task.progress,
          completedAt: new Date(),
          actualTime,
        },
      });

      // Remove from processing set
      this.processingTasks.delete(taskId);

      logger.info(`Task ${result.success ? 'completed' : 'failed'}: ${taskId}`);
      
      // Process next task
      this.processNextTask();
    } catch (error) {
      logger.error('Failed to complete task:', error);
    }
  }

  /**
   * Process the next task in queue
   */
  private async processNextTask(): Promise<void> {
    try {
      // Check if we have capacity
      if (this.processingTasks.size >= this.config.maxConcurrentTasks) {
        return;
      }

      // Get next task by priority and queue time
      const nextTask = await prisma.taskQueue.findFirst({
        where: {
          status: TaskStatus.QUEUED,
        },
        orderBy: [
          { priority: 'desc' },
          { queuedAt: 'asc' },
        ],
      });

      if (!nextTask) {
        return;
      }

      // Mark as running
      await prisma.taskQueue.update({
        where: { id: nextTask.id },
        data: {
          status: TaskStatus.RUNNING,
          startedAt: new Date(),
        },
      });

      this.processingTasks.add(nextTask.id);

      logger.info(`Started processing task: ${nextTask.id}`);

      // Process the task (this would be implemented by specific task processors)
      this.executeTask(nextTask);
    } catch (error) {
      logger.error('Failed to process next task:', error);
    }
  }

  /**
   * Execute a specific task (to be implemented by task processors)
   */
  private async executeTask(task: any): Promise<void> {
    // This is a placeholder - actual task execution would be handled
    // by specific processors based on task type
    
    try {
      // Simulate task processing with timeout
      const timeout = this.config.timeoutSettings[task.type] * 1000;
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Task timeout')), timeout);
      });

      // This would be replaced with actual task processing logic
      const processingPromise = this.simulateTaskProcessing(task);

      await Promise.race([processingPromise, timeoutPromise]);
      
      await this.completeTask(task.id, {
        success: true,
        data: { message: 'Task completed successfully' },
      });
    } catch (error) {
      await this.completeTask(task.id, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Schedule retry if applicable
      if (task.retryCount < task.maxRetries) {
        const retryDelay = this.config.retryDelays[task.retryCount] || 60;
        setTimeout(() => {
          this.retryTask(task.id);
        }, retryDelay * 1000);
      }
    }
  }

  /**
   * Simulate task processing (placeholder)
   */
  private async simulateTaskProcessing(task: any): Promise<void> {
    // This is just a simulation - real implementation would handle actual task processing
    const steps = 5;
    const stepDuration = 1000; // 1 second per step

    for (let i = 0; i < steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      const progress = Math.round(((i + 1) / steps) * 100);
      await this.updateTaskProgress(task.id, progress, `Step ${i + 1} of ${steps}`);
    }
  }

  /**
   * Get higher priorities than the given priority
   */
  private getHigherPriorities(priority: TaskPriority): TaskPriority[] {
    const priorities = Object.keys(this.config.priorityWeights) as TaskPriority[];
    const currentWeight = this.config.priorityWeights[priority];
    
    return priorities.filter(p => this.config.priorityWeights[p] > currentWeight);
  }

  /**
   * Clean up old completed/failed tasks
   */
  async cleanupOldTasks(olderThanDays: number = 7): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
      
      const result = await prisma.taskQueue.deleteMany({
        where: {
          status: { in: [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELED] },
          completedAt: {
            lt: cutoffDate,
          },
        },
      });

      logger.info(`Cleaned up ${result.count} old tasks`);
      return result.count;
    } catch (error) {
      logger.error('Failed to cleanup old tasks:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const taskQueueService = new TaskQueueService();