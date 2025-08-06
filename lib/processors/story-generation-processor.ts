import { TaskProcessor, TaskResult } from '../task-queue-types';
import { TaskType } from '@prisma/client';
import { prisma } from '../prisma';
import { generateStoryFromAnalysis } from '../story-generator';
import { logger } from '../logger';
import { taskQueueService } from '../task-queue-service';
import { enhancedErrorHandler } from '../enhanced-error-handler';

export class StoryGenerationProcessor implements TaskProcessor {
  type = TaskType.STORY_GENERATION;
  
  // Retry configuration for story generation
  private readonly retryConfig = {
    maxAttempts: 3,
    baseDelay: 5000, // 5 seconds
    maxDelay: 60000, // 60 seconds
    backoffMultiplier: 2,
    jitter: true,
  };

  /**
   * Process a story generation task with retry mechanism
   */
  async process(taskId: string, payload: Record<string, any>): Promise<TaskResult> {
    const { storyId, analysisResult, userId } = payload;

    if (!storyId || !analysisResult || !userId) {
      throw new Error('Missing required payload fields: storyId, analysisResult, userId');
    }

    // Get current task to check retry count
    const task = await prisma.taskQueue.findUnique({
      where: { id: taskId },
      select: { retryCount: true, maxRetries: true }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const currentAttempt = task.retryCount + 1;
    logger.info(`Starting story generation for story ${storyId} (attempt ${currentAttempt}/${task.maxRetries + 1})`);

    try {
      // Update task progress
      await this.updateProgress(taskId, 10, `Initializing story generation (attempt ${currentAttempt})`);

      // Use enhanced error handler with retry logic
      const result = await enhancedErrorHandler.executeWithRetry(
        async () => {
          await this.updateProgress(taskId, 30, 'Generating story content');
          return await generateStoryFromAnalysis(storyId, analysisResult, userId);
        },
        {
          operation: 'story-generation',
          requestId: taskId,
          userId,
          metadata: { storyId, attempt: currentAttempt }
        },
        {
          maxAttempts: 1, // Single attempt per task execution (retries handled at task level)
          baseDelay: this.retryConfig.baseDelay,
          maxDelay: this.retryConfig.maxDelay,
          backoffMultiplier: this.retryConfig.backoffMultiplier,
          jitter: this.retryConfig.jitter
        }
      );

      await this.updateProgress(taskId, 100, 'Story generation completed');
      logger.info(`Successfully generated story ${storyId} on attempt ${currentAttempt}`);

      return {
        success: true,
        data: { 
          storyId, 
          message: 'Story generated successfully',
          attempt: currentAttempt,
          totalAttempts: task.maxRetries + 1
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Story generation failed';
      logger.error(`Story generation failed for task ${taskId} (attempt ${currentAttempt}):`, error);

      // Determine if this error is retryable
      const isRetryable = await this.isRetryableError(error, storyId);
      const canRetry = currentAttempt <= task.maxRetries && isRetryable;

      // Update story status if this is the final attempt
      if (!canRetry) {
        await this.markStoryAsFailed(storyId, errorMessage, currentAttempt);
      }

      return {
        success: false,
        error: errorMessage,
        data: {
          storyId,
          attempt: currentAttempt,
          totalAttempts: task.maxRetries + 1,
          canRetry,
          isRetryable,
          nextRetryDelay: canRetry ? this.calculateRetryDelay(currentAttempt) : null
        }
      };
    }
  }

  /**
   * Estimate processing time for story generation
   */
  estimateTime(payload: Record<string, any>): number {
    // Base estimate of 2 minutes for story generation
    let estimatedTime = 120;

    // Adjust based on analysis complexity if available
    if (payload.analysisResult) {
      try {
        const analysis = payload.analysisResult;
        // Add time based on content size
        if (analysis.insights && Array.isArray(analysis.insights)) {
          estimatedTime += analysis.insights.length * 5; // 5 seconds per insight
        }
        // Cap at 5 minutes maximum
        estimatedTime = Math.min(estimatedTime, 300);
      } catch (error) {
        // Use default if analysis can't be parsed
        logger.warn('Could not parse analysis for time estimation');
      }
    }

    return estimatedTime;
  }

  /**
   * Validate the task payload
   */
  validatePayload(payload: Record<string, any>): boolean {
    const required = ['storyId', 'analysisResult', 'userId'];
    
    for (const field of required) {
      if (!payload[field]) {
        logger.error(`Missing required field: ${field}`);
        return false;
      }
    }

    // Validate storyId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(payload.storyId)) {
      logger.error('Invalid storyId format');
      return false;
    }

    // Validate userId is a valid UUID format
    if (!uuidRegex.test(payload.userId)) {
      logger.error('Invalid userId format');
      return false;
    }

    // Basic validation of analysisResult structure
    if (typeof payload.analysisResult !== 'object' || payload.analysisResult === null) {
      logger.error('analysisResult must be an object');
      return false;
    }

    return true;
  }

  /**
   * Update task progress in the database
   */
  private async updateProgress(taskId: string, progress: number, currentStep: string): Promise<void> {
    try {
      await taskQueueService.updateTaskProgress(taskId, progress, currentStep);
    } catch (error) {
      logger.error(`Failed to update task progress for ${taskId}`, error);
    }
  }

  /**
   * Determine if an error is retryable
   */
  private async isRetryableError(error: unknown, storyId: string): Promise<boolean> {
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    
    // Retryable errors
    const retryablePatterns = [
      'timeout',
      'rate limit',
      'temporary',
      'service unavailable',
      'connection',
      'network',
      'ai service',
      'parsing',
      'malformed',
      'quota',
      'throttle'
    ];

    // Non-retryable errors
    const nonRetryablePatterns = [
      'authentication',
      'unauthorized',
      'forbidden',
      'not found',
      'invalid payload',
      'missing required',
      'validation failed'
    ];

    // Check for non-retryable patterns first
    for (const pattern of nonRetryablePatterns) {
      if (errorMessage.includes(pattern)) {
        logger.info(`Error is not retryable due to pattern: ${pattern}`);
        return false;
      }
    }

    // Check for retryable patterns
    for (const pattern of retryablePatterns) {
      if (errorMessage.includes(pattern)) {
        logger.info(`Error is retryable due to pattern: ${pattern}`);
        return true;
      }
    }

    // Check if story still exists (if deleted, don't retry)
    try {
      const story = await prisma.story.findUnique({
        where: { id: storyId },
        select: { id: true, status: true }
      });

      if (!story) {
        logger.info('Story not found, marking as non-retryable');
        return false;
      }

      // If story is already completed or failed, don't retry
      if (story.status === 'COMPLETED' || story.status === 'FAILED') {
        logger.info(`Story already in final state: ${story.status}, marking as non-retryable`);
        return false;
      }
    } catch (dbError) {
      logger.warn('Could not check story status for retry decision:', dbError);
      // If we can't check the story, assume it's retryable
      return true;
    }

    // Default to retryable for unknown errors
    logger.info('Unknown error type, defaulting to retryable');
    return true;
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  private calculateRetryDelay(attempt: number): number {
    let delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
      this.retryConfig.maxDelay
    );

    if (this.retryConfig.jitter) {
      // Add jitter to prevent thundering herd
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.round(delay);
  }

  /**
   * Mark story as failed in the database
   */
  private async markStoryAsFailed(storyId: string, errorMessage: string, attempt: number): Promise<void> {
    try {
      await prisma.story.update({
        where: { id: storyId },
        data: {
          status: 'FAILED',
          errorMessage: `Failed after ${attempt} attempts: ${errorMessage}`,
          processingTime: null, // Will be calculated by the task queue
        }
      });
      
      logger.info(`Marked story ${storyId} as failed after ${attempt} attempts`);
    } catch (error) {
      logger.error(`Failed to mark story ${storyId} as failed:`, error);
    }
  }
}

// Export singleton instance
export const storyGenerationProcessor = new StoryGenerationProcessor();