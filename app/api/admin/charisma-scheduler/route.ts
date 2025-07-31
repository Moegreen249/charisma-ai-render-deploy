import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';
import { charismaScheduler } from '@/lib/background/charisma-scheduler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = charismaScheduler.getStatus();
    
    return NextResponse.json({
      scheduler_status: status,
    });

  } catch (error) {
    console.error('Error getting scheduler status:', error);
    return NextResponse.json(
      { error: 'Failed to get scheduler status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    switch (action) {
      case 'start':
        charismaScheduler.start();
        return NextResponse.json({ 
          success: true, 
          message: 'Scheduler started',
          status: charismaScheduler.getStatus()
        });

      case 'stop':
        charismaScheduler.stop();
        return NextResponse.json({ 
          success: true, 
          message: 'Scheduler stopped',
          status: charismaScheduler.getStatus()
        });

      case 'run_now':
        // Trigger an immediate self-reflection
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/charisma/self-reflection`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.INTERNAL_API_SECRET || 'dev'}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          return NextResponse.json({
            success: true,
            message: 'Self-reflection triggered',
            feeling: result.feeling,
          });
        } else {
          return NextResponse.json({
            success: false,
            message: 'Failed to trigger self-reflection',
          }, { status: 500 });
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: start, stop, or run_now' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error controlling scheduler:', error);
    return NextResponse.json(
      { error: 'Failed to control scheduler' },
      { status: 500 }
    );
  }
}