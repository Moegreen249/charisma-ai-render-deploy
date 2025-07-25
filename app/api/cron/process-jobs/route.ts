import { NextRequest, NextResponse } from 'next/server'
import { jobProcessor } from '@/lib/background/job-processor'
import { redisQueue } from '@/lib/background/redis-queue'
import { prisma, checkDatabaseConnection } from '@/lib/database'

// This endpoint will be called by Vercel Cron
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check database connection
    const dbStatus = await checkDatabaseConnection()
    if (!dbStatus.connected) {
      return NextResponse.json({
        error: 'Database connection failed',
        details: dbStatus.error
      }, { status: 503 })
    }

    // Process retry queue first
    await redisQueue.processRetries()
    
    // Clean up stuck jobs
    await redisQueue.cleanupStuckJobs()

    // Get pending jobs from database and add to Redis queue
    const pendingJobs = await prisma.backgroundJob.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: 10 // Process max 10 jobs per cron run
    })

    const results = []

    for (const job of pendingJobs) {
      try {
        // Add job to Redis queue if not already there
        await redisQueue.enqueue({
          jobId: job.id,
          userId: job.userId,
          templateId: job.templateId || '',
          modelId: job.modelId || '',
          provider: job.provider || '',
          fileName: job.fileName || '',
          fileContent: job.fileContent || '',
          apiKey: job.apiKey || ''
        })
        
        results.push({ jobId: job.id, status: 'queued' })
      } catch (error) {
        results.push({ 
          jobId: job.id, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    // Get queue stats
    const queueStats = await redisQueue.getStats()

    return NextResponse.json({
      success: true,
      processed: results.length,
      queueStats,
      results
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function POST() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
}