import { NextRequest, NextResponse } from 'next/server';
import { getAvailableModelsByProvider, getAllModelsWithCustom, getAvailableModels } from '@/lib/ai-providers';
import { AIProvider } from '@/lib/ai-providers';

// GET - Get AI models with optional provider filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') as AIProvider | null;

    let models;
    
    if (provider) {
      // Get models for specific provider
      models = await getAvailableModelsByProvider(provider);
    } else {
      // Get all available models
      models = getAvailableModels();
    }

    return NextResponse.json({
      success: true,
      models,
      total: models.length,
    });

  } catch (error) {
    console.error('Error fetching AI models:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch AI models',
        success: false,
        models: [],
        total: 0
      },
      { status: 500 }
    );
  }
}