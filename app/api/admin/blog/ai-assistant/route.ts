import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { makeAIRequest, aiService } from '@/lib/ai-service';

// GET - Get available AI providers and models (using AI service)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get writing assistant feature config from AI service
    const featureConfig = await aiService.getFeatureConfig('writing-assistant');
    
    if (!featureConfig || !featureConfig.isEnabled) {
      return NextResponse.json({ error: 'Writing assistant feature is disabled' }, { status: 503 });
    }

    return NextResponse.json({
      feature: featureConfig,
      defaultProvider: featureConfig.defaultProvider,
      fallbackProviders: featureConfig.fallbackProviders
    });

  } catch (error) {
    console.error('Error fetching AI providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI providers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (for blog editing)
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, text, selectedText, provider, model } = await request.json();

    if (!action || !text) {
      return NextResponse.json(
        { error: 'Action and text are required' },
        { status: 400 }
      );
    }

    // Check if writing assistant feature is enabled
    const featureEnabled = await aiService.isFeatureEnabled('writing-assistant');
    if (!featureEnabled) {
      return NextResponse.json(
        { error: 'Writing assistant feature is disabled' },
        { status: 503 }
      );
    }
    
    // Define prompts for different AI actions
    const prompts = {
      grammar: `Please improve the grammar and correct any errors in the following text while maintaining its original meaning and tone:\n\n"${selectedText || text}"`,
      
      engage: `Please rewrite the following text to make it more engaging, compelling, and interesting to read while preserving the core message:\n\n"${selectedText || text}"`,
      
      simplify: `Please simplify the following text to make it clearer and easier to understand while keeping all important information:\n\n"${selectedText || text}"`,
      
      examples: `Please add relevant examples or case studies to illustrate the points in the following text:\n\n"${selectedText || text}"`,
      
      outline: `Please create a structured outline based on the following content, organizing it into clear sections with headings:\n\n"${text}"`,
      
      expand: `Please expand on the following text by adding more detail, context, and supporting information:\n\n"${selectedText || text}"`,
      
      shorten: `Please condense the following text while keeping all essential information and maintaining clarity:\n\n"${selectedText || text}"`,
      
      professional: `Please rewrite the following text in a more professional and formal tone:\n\n"${selectedText || text}"`,
      
      casual: `Please rewrite the following text in a more casual and conversational tone:\n\n"${selectedText || text}"`,
      
      seo: `Please optimize the following text for SEO by improving readability, adding relevant keywords naturally, and making it more search-engine friendly:\n\n"${selectedText || text}"`
    };

    const prompt = prompts[action as keyof typeof prompts];
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Use centralized AI service
    console.log('Making AI request with:', { feature: 'writing-assistant', provider, model, action });
    
    const aiResponse = await makeAIRequest({
      feature: 'writing-assistant',
      prompt,
      provider,
      model,
      maxTokens: 1000,
      temperature: 0.7,
    });

    console.log('AI response received:', { success: aiResponse.success, provider: aiResponse.provider, error: aiResponse.error });

    if (!aiResponse.success) {
      console.error('AI request failed:', aiResponse.error);
      throw new Error(aiResponse.error || 'Failed to process AI request');
    }

    const improvedText = aiResponse.response || '';

    return NextResponse.json({
      originalText: selectedText || text,
      improvedText: improvedText.trim(),
      action,
      provider: aiResponse.provider,
      model: aiResponse.model,
      responseTime: aiResponse.responseTime,
      fallbackUsed: aiResponse.fallbackUsed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in AI Writing Assistant:', error);
    
    // Handle specific API key errors
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'AI service configuration error. Please check your API key.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}