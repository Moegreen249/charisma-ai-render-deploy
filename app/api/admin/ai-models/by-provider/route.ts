import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { AIProvider, getAvailableModelsByProvider, AIModel } from '@/lib/ai-providers';

// GET - Get all models for a specific provider (static + custom)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('provider') as AIProvider;

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Get static models for the provider
    const staticModels = await getAvailableModelsByProvider(providerId);

    // Get custom models for the provider
    const customModels = await prisma.adminSettings.findMany({
      where: {
        category: 'ai_custom_models',
        isActive: true,
      },
    });

    const providerCustomModels = customModels
      .map((setting) => {
        const modelData = setting.value as any;
        return {
          id: setting.key,
          name: modelData.name || setting.key,
          provider: modelData.provider,
          description: modelData.description || 'Custom model added by admin',
          contextWindow: modelData.contextWindow,
          available: modelData.available ?? true,
          tier: modelData.tier || 'both',
          rpm: modelData.rpm,
          rpd: modelData.rpd,
          isCustom: true,
          addedBy: setting.updatedBy,
        } as AIModel;
      })
      .filter(model => model.provider === providerId && model.available);

    // Combine static and custom models
    const allModels = [...staticModels, ...providerCustomModels];

    return NextResponse.json({
      provider: providerId,
      models: allModels,
      total: allModels.length,
      staticCount: staticModels.length,
      customCount: providerCustomModels.length,
    });

  } catch (error) {
    console.error('Error fetching models by provider:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models for provider' },
      { status: 500 }
    );
  }
}