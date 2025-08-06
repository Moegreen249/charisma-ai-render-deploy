import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// POST - Test AI provider connection
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { providerId, model } = await request.json();

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    const testPrompt = 'Hello! Please respond with "AI connection test successful" to confirm the connection is working.';
    const result: any = {
      providerId,
      model: model || 'default',
      success: false,
      error: null,
      responseTime: 0,
      response: null,
    };

    const startTime = Date.now();

    try {
      switch (providerId) {
        case 'google-gemini':
          if (!process.env.GOOGLE_GEMINI_API_KEY) {
            throw new Error('Google Gemini API key not configured');
          }
          
          const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
          const geminiModel = genAI.getGenerativeModel({ 
            model: model || 'gemini-2.5-flash' 
          });
          
          const geminiResult = await geminiModel.generateContent(testPrompt);
          const geminiResponse = await geminiResult.response;
          result.response = geminiResponse.text();
          result.success = true;
          break;

        case 'openai':
          if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key not configured');
          }
          
          const openai = new OpenAI({ 
            apiKey: process.env.OPENAI_API_KEY 
          });
          
          const openaiResult = await openai.chat.completions.create({
            model: model || 'gpt-4o-mini',
            messages: [{ role: 'user', content: testPrompt }],
            max_tokens: 100,
          });
          
          result.response = openaiResult.choices[0]?.message?.content || '';
          result.success = true;
          break;

        case 'anthropic':
          // Anthropic test would go here when implemented
          throw new Error('Anthropic provider test not yet implemented');

        case 'vertex-ai':
          // Vertex AI test would go here when implemented
          throw new Error('Vertex AI provider test not yet implemented');

        default:
          throw new Error(`Unknown provider: ${providerId}`);
      }

      result.responseTime = Date.now() - startTime;

    } catch (providerError: any) {
      result.success = false;
      result.error = providerError.message;
      result.responseTime = Date.now() - startTime;
    }

    // Log the test result
    console.log(`AI Provider Test - ${providerId}:`, {
      success: result.success,
      responseTime: result.responseTime,
      error: result.error,
    });

    return NextResponse.json({
      testResult: result,
      timestamp: new Date().toISOString(),
      testedBy: session.user.email,
    });

  } catch (error) {
    console.error('Error testing AI provider:', error);
    return NextResponse.json(
      { error: 'Failed to test AI provider' },
      { status: 500 }
    );
  }
}