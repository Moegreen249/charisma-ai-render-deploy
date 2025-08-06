import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { AIProvider } from '@/lib/ai-providers';

export interface CustomAIModel {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  contextWindow?: number;
  available: boolean;
  tier: 'free' | 'paid' | 'both';
  rpm?: number;
  rpd?: number;
}

// GET - Get all custom models
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const customModels = await prisma.adminSettings.findMany({
      where: {
        category: 'ai_custom_models',
        isActive: true,
      },
      orderBy: [
        { key: 'asc' },
      ],
    });

    const models = customModels.map((setting) => {
      const modelData = setting.value as any;
      return {
        id: setting.key,
        name: modelData.name || setting.key,
        provider: modelData.provider,
        description: modelData.description || 'Custom model',
        contextWindow: modelData.contextWindow,
        available: modelData.available ?? true,
        tier: modelData.tier || 'both',
        rpm: modelData.rpm,
        rpd: modelData.rpd,
        isCustom: true,
        addedBy: setting.updatedBy,
        createdAt: setting.createdAt,
        updatedAt: setting.updatedAt,
      };
    });

    return NextResponse.json({
      models,
      total: models.length,
    });

  } catch (error) {
    console.error('Error fetching custom models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom models' },
      { status: 500 }
    );
  }
}

// POST - Add a new custom model
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, provider, description, contextWindow, tier, rpm, rpd } = body;

    if (!id || !name || !provider) {
      return NextResponse.json(
        { error: 'Model ID, name, and provider are required' },
        { status: 400 }
      );
    }

    // Validate provider
    const validProviders = ['google', 'openai', 'anthropic', 'google-vertex-ai', 'google-genai'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider specified' },
        { status: 400 }
      );
    }

    // Check if model already exists
    const existingModel = await prisma.adminSettings.findUnique({
      where: {
        category_key: {
          category: 'ai_custom_models',
          key: id,
        },
      },
    });

    if (existingModel) {
      return NextResponse.json(
        { error: 'Model with this ID already exists' },
        { status: 409 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const modelData: CustomAIModel = {
      id,
      name,
      provider,
      description: description || `Custom ${provider} model`,
      contextWindow: contextWindow ? parseInt(contextWindow) : undefined,
      available: true,
      tier: tier || 'both',
      rpm: rpm ? parseInt(rpm) : undefined,
      rpd: rpd ? parseInt(rpd) : undefined,
    };

    // Create the custom model setting
    await prisma.adminSettings.create({
      data: {
        category: 'ai_custom_models',
        key: id,
        value: modelData as any,
        description: `Custom AI model: ${name} (${provider})`,
        updatedBy: user.id,
      },
    });

    console.log(`Custom AI model "${name}" added by ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Custom model added successfully',
      model: {
        ...modelData,
        isCustom: true,
        addedBy: user.id,
      },
    });

  } catch (error) {
    console.error('Error adding custom model:', error);
    return NextResponse.json(
      { error: 'Failed to add custom model' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a custom model
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('id');

    if (!modelId) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      );
    }

    // Check if model exists
    const existingModel = await prisma.adminSettings.findUnique({
      where: {
        category_key: {
          category: 'ai_custom_models',
          key: modelId,
        },
      },
    });

    if (!existingModel) {
      return NextResponse.json(
        { error: 'Custom model not found' },
        { status: 404 }
      );
    }

    // Delete the custom model
    await prisma.adminSettings.delete({
      where: {
        category_key: {
          category: 'ai_custom_models',
          key: modelId,
        },
      },
    });

    console.log(`Custom AI model "${modelId}" deleted by ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Custom model deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting custom model:', error);
    return NextResponse.json(
      { error: 'Failed to delete custom model' },
      { status: 500 }
    );
  }
}