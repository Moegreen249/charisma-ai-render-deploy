import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { makeAIRequest } from '@/lib/ai-service';

// POST - Test a custom model
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { modelId, provider } = await request.json();

    if (!modelId || !provider) {
      return NextResponse.json(
        { error: 'Model ID and provider are required' },
        { status: 400 }
      );
    }

    const testPrompt = 'Hello! Please respond with a simple confirmation that this model is working.';
    
    const startTime = Date.now();
    
    try {
      const aiResponse = await makeAIRequest({
        feature: 'chat-analysis', // Use a basic feature for testing
        prompt: testPrompt,
        provider,
        model: modelId,
        temperature: 0.7,
        maxTokens: 100,
      });

      const responseTime = Date.now() - startTime;

      if (aiResponse.success) {
        return NextResponse.json({
          success: true,
          modelId,
          provider,
          responseTime,
          response: aiResponse.response?.substring(0, 200), // Truncate for safety
          message: 'Model test successful',
        });
      } else {
        return NextResponse.json({
          success: false,
          modelId,
          provider,
          responseTime,
          error: aiResponse.error,
          message: 'Model test failed',
        });
      }

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      return NextResponse.json({
        success: false,
        modelId,
        provider,
        responseTime,
        error: error.message,
        message: 'Model test failed',
      });
    }

  } catch (error) {
    console.error('Error testing custom model:', error);
    return NextResponse.json(
      { error: 'Failed to test custom model' },
      { status: 500 }
    );
  }
}