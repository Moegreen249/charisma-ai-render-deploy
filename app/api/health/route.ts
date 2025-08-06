import { NextRequest, NextResponse } from 'next/server';
import { prisma, checkDatabaseHealth, withRetry } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Enhanced database health check
    const dbHealth = await checkDatabaseHealth();
    
    // Test that key tables exist with retry logic
    let dbSchemaStatus = 'ready';
    let schemaError: string | undefined;
    
    try {
      await Promise.all([
        withRetry(() => prisma.user.findFirst()),
        withRetry(() => prisma.backgroundJob.findFirst()),
        withRetry(() => prisma.analysis.findFirst()),
      ]);
    } catch (tableError) {
      console.warn('Database schema check failed:', tableError);
      dbSchemaStatus = 'migration_needed';
      schemaError = tableError instanceof Error ? tableError.message : 'Schema check failed';
    }
    
    // Check environment variables
    const envStatus = {
      database_url: !!process.env.DATABASE_URL,
      nextauth_secret: !!process.env.NEXTAUTH_SECRET,
      nextauth_url: !!process.env.NEXTAUTH_URL,
    };
    
    // Calculate overall health status
    const isHealthy = dbHealth.isHealthy && dbSchemaStatus === 'ready';
    const hasWarnings = dbHealth.isHealthy && dbSchemaStatus === 'migration_needed';
    
    const totalResponseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: isHealthy ? 'healthy' : hasWarnings ? 'warning' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: totalResponseTime,
      services: {
        database: {
          status: dbHealth.isHealthy ? 'connected' : 'disconnected',
          responseTime: dbHealth.responseTime,
          error: dbHealth.error,
        },
        schema: {
          status: dbSchemaStatus,
          error: schemaError,
        },
        environment: {
          status: Object.values(envStatus).every(Boolean) ? 'configured' : 'missing_vars',
          variables: envStatus,
        },
        auth: {
          status: process.env.NEXTAUTH_SECRET ? 'configured' : 'not_configured',
        },
      },
      metadata: {
        nodeEnv: process.env.NODE_ENV,
        version: process.env.npm_package_version || 'unknown',
        uptime: process.uptime(),
      }
    }, { 
      status: isHealthy ? 200 : hasWarnings ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    const totalResponseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: totalResponseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        database: { status: 'error' },
        schema: { status: 'unknown' },
        environment: { status: 'unknown' },
        auth: { status: 'unknown' },
      }
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  }
}