import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Test that key tables exist
    let dbSchemaStatus = 'ready';
    try {
      await prisma.user.findFirst();
      await prisma.backgroundJob.findFirst();
    } catch (tableError) {
      console.warn('Database schema check failed:', tableError);
      dbSchemaStatus = 'migration_needed';
    }
    
    return NextResponse.json({
      status: dbSchemaStatus === 'ready' ? 'healthy' : 'warning',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        schema: dbSchemaStatus,
        auth: 'configured',
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}