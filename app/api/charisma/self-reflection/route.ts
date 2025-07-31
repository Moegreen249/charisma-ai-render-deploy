import { NextRequest, NextResponse } from 'next/server';
import { performSelfReflection } from '@/lib/ai-self-reflection';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('CharismaAI: Self-reflection API endpoint called');
    
    // Optional: Add authentication check for internal calls
    const authHeader = request.headers.get('authorization');
    const internalSecret = process.env.INTERNAL_API_SECRET;
    
    if (internalSecret && authHeader !== `Bearer ${internalSecret}`) {
      // For now, we'll allow public access, but in production you might want to restrict this
      console.log('CharismaAI: Self-reflection called without proper auth, but allowing...');
    }

    const feelingData = await performSelfReflection();
    
    if (!feelingData) {
      return NextResponse.json(
        { error: 'Failed to perform self-reflection' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      feeling: feelingData,
    });

  } catch (error) {
    console.error('CharismaAI: Self-reflection API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during self-reflection' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return the latest feeling data
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const feelingPath = path.join(process.cwd(), 'public', 'charisma_feeling.json');
    const historyPath = path.join(process.cwd(), 'public', 'mood_history.json');
    
    let feeling = null;
    let history = [];
    
    try {
      const feelingData = await fs.readFile(feelingPath, 'utf-8');
      feeling = JSON.parse(feelingData);
    } catch {
      // File doesn't exist yet
    }
    
    try {
      const historyData = await fs.readFile(historyPath, 'utf-8');
      history = JSON.parse(historyData);
    } catch {
      // File doesn't exist yet
    }

    return NextResponse.json({
      feeling,
      history,
      last_updated: feeling?.timestamp || null,
    });

  } catch (error) {
    console.error('CharismaAI: Error fetching feeling data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feeling data' },
      { status: 500 }
    );
  }
}