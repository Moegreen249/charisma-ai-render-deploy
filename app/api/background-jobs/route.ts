import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, checkDatabaseConnection } from '@/lib/database'
import { redisQueue } from '@/lib/background/redis-queue'
import { jobProcessor } from '@/lib/background/job-processor'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'status':
        // Get system status
        const dbStatus = await checkDatabaseConnection()
        const redisStats = await redisQueue.getStats()
        
        return NextResponse.json({
          database: dbStatus,
          redis: redisStats,
          timestamp: new Date().toISOString()
        })

      case 'jobs':
        // Get user's jobs
        const limit = parseInt(searchParams.get('limit') || '10')
        const jobs = await jobProcessor.getUserJobs(session.user.id, limit)
        
        return NextResponse.json({ jobs })

      case 'job':
        // Get specific job status
        const jobId = searchParams.get('jobId')
        if (!jobId) {
          return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
        }
        
        const jobStatus = await jobProcessor.getJobStatus(jobId, session.user.id)
        return NextResponse.json({ job: jobStatus })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Background jobs API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, jobId } = body

    switch (action) {
      case 'cancel':
        if (!jobId) {
          return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
        }
        
        const cancelled = await jobProcessor.cancelJob(jobId, session.user.id)
        return NextResponse.json({ success: cancelled })

      case 'retry':
        if (!jobId) {
          return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
        }
        
        // Reset job to pending status
        await prisma.backgroundJob.update({
          where: { 
            id: jobId,
            userId: session.user.id 
          },
          data: {
            status: 'PENDING',
            progress: 0,
            currentStep: 'Queued for retry',
            error: null,
            startedAt: null,
            completedAt: null
          }
        })
        
        return NextResponse.json({ success: true })

      case 'cleanup':
        // Clean up stuck jobs
        await redisQueue.cleanupStuckJobs()
        await redisQueue.processRetries()
        
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Background jobs API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    // Delete job from database
    await prisma.backgroundJob.deleteMany({
      where: {
        id: jobId,
        userId: session.user.id,
        status: { in: ['COMPLETED', 'FAILED', 'CANCELLED'] }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Background jobs API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}