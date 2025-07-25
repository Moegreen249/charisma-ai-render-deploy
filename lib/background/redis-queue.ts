import Redis from 'ioredis'
import { BackgroundJobData } from './job-processor'
import { prisma, checkDatabaseConnection } from '@/lib/database'

// Redis Cloud connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
})

export class RedisJobQueue {
  private static instance: RedisJobQueue
  private queueKey = 'background_jobs'
  private processingKey = 'processing_jobs'
  private retryKey = 'retry_jobs'

  private constructor() {}

  public static getInstance(): RedisJobQueue {
    if (!RedisJobQueue.instance) {
      RedisJobQueue.instance = new RedisJobQueue()
    }
    return RedisJobQueue.instance
  }

  /**
   * Add job to queue
   */
  async enqueue(jobData: BackgroundJobData & { jobId: string }) {
    const job = {
      ...jobData,
      createdAt: Date.now(),
      attempts: 0,
      maxAttempts: 3
    }

    await redis.lpush(this.queueKey, JSON.stringify(job))
    console.log(`Job ${job.jobId} added to queue`)
  }

  /**
   * Get next job from queue
   */
  async dequeue(): Promise<any | null> {
    try {
      // Check database connection first
      const dbStatus = await checkDatabaseConnection()
      if (!dbStatus.connected) {
        console.error('Database not connected, skipping job dequeue:', dbStatus.error)
        return null
      }

      // Move job from queue to processing with timeout
      const jobStr = await redis.brpoplpush(this.queueKey, this.processingKey, 5)
      
      if (!jobStr) return null

      const job = JSON.parse(jobStr)
      
      // Update database status
      await prisma.backgroundJob.update({
        where: { id: job.jobId },
        data: {
          status: 'PROCESSING',
          startedAt: new Date(),
          progress: 0,
          currentStep: 'Starting analysis'
        }
      })
      
      return job
    } catch (error) {
      console.error('Error dequeuing job:', error)
      return null
    }
  }

  /**
   * Mark job as completed
   */
  async complete(jobId: string) {
    await redis.lrem(this.processingKey, 1, jobId)
    console.log(`Job ${jobId} completed`)
  }

  /**
   * Mark job as failed and potentially retry
   */
  async fail(jobId: string, error: string) {
    const jobStr = await redis.lindex(this.processingKey, -1)
    if (!jobStr) return

    const job = JSON.parse(jobStr)
    job.attempts += 1
    job.lastError = error
    job.lastAttempt = Date.now()

    // Remove from processing
    await redis.lrem(this.processingKey, 1, jobStr)

    if (job.attempts < job.maxAttempts) {
      // Retry with exponential backoff
      const delay = Math.pow(2, job.attempts) * 1000 // 2s, 4s, 8s
      await redis.zadd(this.retryKey, Date.now() + delay, JSON.stringify(job))
      console.log(`Job ${jobId} scheduled for retry in ${delay}ms`)
    } else {
      console.log(`Job ${jobId} failed permanently after ${job.attempts} attempts`)
    }
  }

  /**
   * Process retry queue
   */
  async processRetries() {
    const now = Date.now()
    const jobs = await redis.zrangebyscore(this.retryKey, 0, now)

    for (const jobStr of jobs) {
      const job = JSON.parse(jobStr)
      await redis.lpush(this.queueKey, jobStr)
      await redis.zrem(this.retryKey, jobStr)
      console.log(`Job ${job.jobId} moved from retry to main queue`)
    }
  }

  /**
   * Get queue stats
   */
  async getStats() {
    const [pending, processing, retrying] = await Promise.all([
      redis.llen(this.queueKey),
      redis.llen(this.processingKey),
      redis.zcard(this.retryKey)
    ])

    return { pending, processing, retrying }
  }

  /**
   * Clean up stuck jobs (jobs processing for too long)
   */
  async cleanupStuckJobs() {
    const stuckJobs = await redis.lrange(this.processingKey, 0, -1)
    const now = Date.now()
    const timeout = 30 * 60 * 1000 // 30 minutes

    for (const jobStr of stuckJobs) {
      const job = JSON.parse(jobStr)
      if (now - job.startedAt > timeout) {
        await this.fail(job.jobId, 'Job timeout - processing took too long')
      }
    }
  }
}

export const redisQueue = RedisJobQueue.getInstance()