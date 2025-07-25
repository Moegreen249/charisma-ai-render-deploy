import { redisQueue } from './redis-queue'
import { jobProcessor } from './job-processor'
import { prisma, checkDatabaseConnection } from '@/lib/database'

export class RedisJobWorker {
  private static instance: RedisJobWorker
  private isRunning = false
  private workerInterval: NodeJS.Timeout | null = null

  private constructor() {}

  public static getInstance(): RedisJobWorker {
    if (!RedisJobWorker.instance) {
      RedisJobWorker.instance = new RedisJobWorker()
    }
    return RedisJobWorker.instance
  }

  /**
   * Start the worker
   */
  async start() {
    if (this.isRunning) {
      console.log('Redis worker is already running')
      return
    }

    this.isRunning = true
    console.log('Starting Redis job worker...')

    // Process jobs continuously
    this.processJobs()

    // Set up periodic maintenance
    this.workerInterval = setInterval(async () => {
      try {
        await redisQueue.processRetries()
        await redisQueue.cleanupStuckJobs()
      } catch (error) {
        console.error('Worker maintenance error:', error)
      }
    }, 60000) // Every minute
  }

  /**
   * Stop the worker
   */
  async stop() {
    this.isRunning = false
    
    if (this.workerInterval) {
      clearInterval(this.workerInterval)
      this.workerInterval = null
    }

    console.log('Redis job worker stopped')
  }

  /**
   * Process jobs from the queue
   */
  private async processJobs() {
    while (this.isRunning) {
      try {
        // Check database connection
        const dbStatus = await checkDatabaseConnection()
        if (!dbStatus.connected) {
          console.error('Database not connected, waiting...', dbStatus.error)
          await this.sleep(10000) // Wait 10 seconds
          continue
        }

        // Get next job from queue
        const job = await redisQueue.dequeue()
        
        if (!job) {
          await this.sleep(5000) // Wait 5 seconds if no jobs
          continue
        }

        console.log(`Processing job ${job.jobId}`)

        try {
          // Process the job using existing job processor
          const result = await this.processAnalysisJob(job)
          
          if (result.success) {
            await redisQueue.complete(job.jobId)
            
            // Update database with results
            await prisma.backgroundJob.update({
              where: { id: job.jobId },
              data: {
                status: 'COMPLETED',
                result: result.data as any,
                progress: 100,
                currentStep: 'Analysis completed successfully',
                completedAt: new Date()
              }
            })
            
            console.log(`Job ${job.jobId} completed successfully`)
          } else {
            throw new Error(result.error || 'Job processing failed')
          }
        } catch (error) {
          console.error(`Job ${job.jobId} failed:`, error)
          
          await redisQueue.fail(job.jobId, error instanceof Error ? error.message : 'Unknown error')
          
          // Update database with error
          await prisma.backgroundJob.update({
            where: { id: job.jobId },
            data: {
              status: 'FAILED',
              error: error instanceof Error ? error.message : 'Unknown error',
              currentStep: 'Analysis failed',
              completedAt: new Date()
            }
          })
        }
      } catch (error) {
        console.error('Worker loop error:', error)
        await this.sleep(5000) // Wait before retrying
      }
    }
  }

  /**
   * Process a single analysis job
   */
  private async processAnalysisJob(job: any) {
    try {
      // Create FormData for the job processor
      const formData = new FormData()
      const file = new File([job.fileContent], job.fileName, { type: 'text/plain' })
      
      formData.append('chatFile', file)
      formData.append('templateId', job.templateId)
      formData.append('modelId', job.modelId)
      formData.append('provider', job.provider)
      formData.append('apiKey', job.apiKey)

      // Use the existing background analysis method
      const result = await (jobProcessor as any).backgroundAnalyzeChat(formData, job.userId)
      
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed'
      }
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get worker status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      hasInterval: this.workerInterval !== null
    }
  }
}

export const redisWorker = RedisJobWorker.getInstance()