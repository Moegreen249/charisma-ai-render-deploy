import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    
    // Test environment variables
    const envCheck = {
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nodeEnv: process.env.NODE_ENV,
    };

    return NextResponse.json({
      status: 'success',
      message: 'Auth system test completed',
      data: {
        userCount,
        environment: envCheck,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Auth test error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Auth system test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}