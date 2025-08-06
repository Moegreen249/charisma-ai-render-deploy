import { TaskType } from '@prisma/client';
import { TaskProcessor } from './task-queue-types';
import { taskQueueService } from './task-queue-service';
import { storyGenerationProcessor } from './processors/story-generation-processor';
import { logger } from './logger';
import { prisma } from './prisma';

class TaskQueueManager {
  private processors: Map<TaskType, TaskProcessor> = new Map();
  private isRunning = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private processingTasks = new Set<string>();
  private maxConcurrentTasks = 5;

  constructor() {
    // Register task processors
    this.registerProcessor(storyGenerationProcessor);
  }

  /**
   * Register a task processor
   */
  registerProcessor(processor: TaskProcessor): void {
    this.processors.set(processor.type, processor);
    logger.info(`Registered processor for task type: ${processor.type}`);
  }

  /**
   * Start the task queue processing
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('Task queue manager is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting task queue manager');

    // Start processing loop
    this.processingInterval = setInterval(async () => {
      await this.processPendingTasks();
    }, 5000); // Check every 5 seconds

    // Process immediately
    this.processPendingTasks();
  }

  /**
   * Stop the task queue processing
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    logger.info('Stopped task queue manager');
  }

  /**
   * Process pending tasks
   */
  private async processPendingTasks(): Promise<void> {
    try {
      // Check if we have capacity
      if (this.processingTasks.size >= this.maxConcurrentTasks) {
        return;
      }

      // Get pending tasks for registered processors using Prisma directly
      const tasks = await prisma.taskQueue.findMany({
        where: {
          status: 'QUEUED',
          type: { in: Array.from(this.processors.keys()) },
          id: { notIn: Array.from(this.processingTasks) }
        },
        orderBy: [
          { priority: 'desc' },
          { queuedAt: 'asc' }
        ],
        take: this.maxConcurrentTasks - this.processingTasks.size
      });

      for (const task of tasks) {
        const processor = this.processors.get(task.type);
        if (!processor) {
          logger.warn(`No processor found for task type: ${task.type}`);
          continue;
        }

        // Mark as processing and process task in background
        this.processingTasks.add(task.id);
        this.processTask(task, processor).catch(error => {
          logger.error(`Error processing task ${task.id}`, error);
          this.processingTasks.delete(task.id);
        });
      }
    } catch (error) {
      logger.error('Error in task processing loop', error);
    }
  }

  /**
   * Process a single task
   */
  private async processTask(task: any, processor: TaskProcessor): Promise<void> {
    try {
      logger.info(`Processing task ${task.id} of type ${task.type}`);

      // Mark task as running
      await prisma.taskQueue.update({
        where: { id: task.id },
        data: {
          status: 'RUNNING',
          startedAt: new Date()
        }
      });

      // Validate payload
      if (!processor.validatePayload(task.payload)) {
        await taskQueueService.completeTask(task.id, {
          success: false,
          error: 'Invalid task payload'
        });
        return;
      }

      // Process the task
      const result = await processor.process(task.id, task.payload);

      // Complete the task
      await taskQueueService.completeTask(task.id, result);

    } catch (error) {
      logger.error(`Failed to process task ${task.id}`, error);
      
      await taskQueueService.completeTask(task.id, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      // Remove from processing set
      this.processingTasks.delete(task.id);
    }
  }

  /**
   * Enqueue a story generation task
   */
  async enqueueStoryGeneration(
    userId: string,
    storyId: string,
    analysisResult: any,
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL'
  ): Promise<string> {
    const payload = {
      storyId,
      analysisResult,
      userId
    };

    // Validate payload before enqueueing
    const processor = this.processors.get(TaskType.STORY_GENERATION);
    if (!processor || !processor.validatePayload(payload)) {
      throw new Error('Invalid story generation task payload');
    }

    return await taskQueueService.enqueueTask(
      userId,
      TaskType.STORY_GENERATION,
      payload,
      priority as any
    );
  }

  /**
   * Get task status
   */
  async getTaskStatus(taskId: string, userId?: string) {
    return await taskQueueService.getTask(taskId, userId);
  }

  /**
   * Cancel a task
   */
  async cancelTask(taskId: string, userId?: string): Promise<boolean> {
    return await taskQueueService.cancelTask(taskId, userId);
  }

  /**
   * Retry a task
   */
  async retryTask(taskId: string, userId?: string): Promise<boolean> {
    return await taskQueueService.retryTask(taskId, userId);
  }

  /**
   * Get user's tasks
   */
  async getUserTasks(userId: string, options: any = {}) {
    return await taskQueueService.getUserTasks(userId, options);
  }

  /**
   * Get queue metrics
   */
  async getQueueMetrics() {
    return await taskQueueService.getQueueMetrics();
  }
}

// Export singleton instance
export const taskQueueManager = new TaskQueueManager();

// Auto-start the task queue manager
taskQueueManager.start();