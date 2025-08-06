import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export interface AIProviderConfig {
  id: string;
  name: string;
  models: string[];
  apiKeySet: boolean;
  apiKeySource?: 'environment' | 'admin';
  adminApiKey?: string;
  isEnabled: boolean;
  priority: number;
  features: string[];
  status: 'active' | 'inactive' | 'error';
  lastTested?: string;
  errorMessage?: string;
}

export interface AIFeatureConfig {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  defaultProvider: string;
  fallbackProviders: string[];
  defaultModel?: string;
  fallbackModels?: Record<string, string>; // provider -> model mapping
  settings: Record<string, any>;
}

// GET - Get all AI configuration
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all AI-related settings from AdminSettings
    const aiSettings = await prisma.adminSettings.findMany({
      where: {
        category: { in: ['ai_providers', 'ai_features', 'ai_config', 'ai_api_keys'] },
        isActive: true,
      },
      orderBy: [
        { category: 'asc' },
        { key: 'asc' },
      ],
    });

    // Build provider configurations
    const providers: AIProviderConfig[] = [
      {
        id: 'google',
        name: 'Google AI',
        models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
        apiKeySet: !!process.env.GOOGLE_GEMINI_API_KEY,
        isEnabled: true,
        priority: 1,
        features: ['chat-analysis', 'writing-assistant', 'story-generation', 'charisma-feelings'],
        status: !!process.env.GOOGLE_GEMINI_API_KEY ? 'active' : 'inactive',
      },
      {
        id: 'openai',
        name: 'OpenAI',
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4-turbo'],
        apiKeySet: !!process.env.OPENAI_API_KEY,
        isEnabled: true,
        priority: 2,
        features: ['chat-analysis', 'writing-assistant', 'story-generation', 'charisma-feelings'],
        status: !!process.env.OPENAI_API_KEY ? 'active' : 'inactive',
      },
      {
        id: 'anthropic',
        name: 'Anthropic Claude',
        models: ['claude-3-5-sonnet', 'claude-3-5-haiku', 'claude-3-opus'],
        apiKeySet: !!process.env.ANTHROPIC_API_KEY,
        isEnabled: true,
        priority: 3,
        features: ['chat-analysis', 'writing-assistant', 'story-generation', 'charisma-feelings'],
        status: !!process.env.ANTHROPIC_API_KEY ? 'active' : 'inactive',
      },
      {
        id: 'vertex-ai',
        name: 'Google Vertex AI',
        models: ['gemini-pro-vertex', 'text-bison', 'code-bison'],
        apiKeySet: !!process.env.GOOGLE_VERTEX_AI_CREDENTIALS,
        isEnabled: false,
        priority: 4,
        features: ['chat-analysis', 'writing-assistant'],
        status: !!process.env.GOOGLE_VERTEX_AI_CREDENTIALS ? 'inactive' : 'inactive',
      },
    ];

    // Apply custom settings from database
    providers.forEach(provider => {
      // Apply provider config overrides
      const providerSetting = aiSettings.find(s => 
        s.category === 'ai_providers' && s.key === provider.id
      );
      if (providerSetting) {
        const config = providerSetting.value as any;
        provider.isEnabled = config.isEnabled ?? provider.isEnabled;
        provider.priority = config.priority ?? provider.priority;
        provider.models = config.models ?? provider.models;
      }

      // Check for admin API keys
      const adminKeySetting = aiSettings.find(s => 
        s.category === 'ai_api_keys' && s.key === provider.id
      );
      
      if (adminKeySetting) {
        const keyData = adminKeySetting.value as any;
        if (keyData?.apiKey) {
          provider.apiKeySet = true;
          provider.apiKeySource = 'admin';
          provider.adminApiKey = ''; // Don't expose the actual key
          provider.status = 'active';
        }
      } else if (provider.apiKeySet) {
        provider.apiKeySource = 'environment';
      }
    });

    // Sort by priority
    providers.sort((a, b) => a.priority - b.priority);

    // Build feature configurations
    const features: AIFeatureConfig[] = [
      {
        id: 'charisma-feelings',
        name: 'CharismaAI Self-Reflection',
        description: 'AI system that monitors and reflects on platform status and mood',
        isEnabled: true,
        defaultProvider: 'google',
        fallbackProviders: ['google'],
        defaultModel: 'gemini-2.5-flash',
        fallbackModels: {
          'google': 'gemini-2.5-pro'
        },
        settings: {
          reflectionInterval: 5, // minutes
          moodHistoryLimit: 100,
          enableStatusPage: true,
        },
      },
      {
        id: 'writing-assistant',
        name: 'AI Writing Assistant',
        description: 'AI-powered writing tools for blog posts and content creation',
        isEnabled: true,
        defaultProvider: 'google',
        fallbackProviders: ['google'],
        defaultModel: 'gemini-2.5-flash',
        fallbackModels: {
          'google': 'gemini-2.5-pro'
        },
        settings: {
          maxTokens: 1000,
          temperature: 0.7,
          enableAllActions: true,
        },
      },
      {
        id: 'story-generation',
        name: 'AI Story Generation',
        description: 'AI-powered interactive story creation and narrative generation',
        isEnabled: true,
        defaultProvider: 'google',
        fallbackProviders: ['google'],
        defaultModel: 'gemini-2.5-flash',
        fallbackModels: {
          'google': 'gemini-2.5-pro'
        },
        settings: {
          maxStoryLength: 5000,
          enableCharacterGen: true,
          enablePlotGen: true,
        },
      },
      {
        id: 'chat-analysis',
        name: 'Chat Analysis',
        description: 'AI-powered conversation analysis and insights',
        isEnabled: true,
        defaultProvider: 'google',
        fallbackProviders: ['google'],
        defaultModel: 'gemini-2.5-flash',
        fallbackModels: {
          'google': 'gemini-2.5-pro'
        },
        settings: {
          enableSentimentAnalysis: true,
          enablePersonalityInsights: true,
          enableRelationshipAnalysis: true,
        },
      },
      {
        id: 'content-moderation',
        name: 'Content Moderation',
        description: 'AI-powered content filtering and safety checks',
        isEnabled: false,
        defaultProvider: 'openai',
        fallbackProviders: ['google'],
        defaultModel: 'gpt-4o-mini',
        fallbackModels: {
          'openai': 'gpt-3.5-turbo',
          'google': 'gemini-2.5-flash'
        },
        settings: {
          strictnessLevel: 'medium',
          enableProfanityFilter: true,
          enableToxicityDetection: true,
        },
      },
    ];

    // Apply custom feature settings from database
    features.forEach(feature => {
      const featureSetting = aiSettings.find(s => 
        s.category === 'ai_features' && s.key === feature.id
      );
      if (featureSetting) {
        const config = featureSetting.value as any;
        feature.isEnabled = config.isEnabled ?? feature.isEnabled;
        feature.defaultProvider = config.defaultProvider ?? feature.defaultProvider;
        feature.fallbackProviders = config.fallbackProviders ?? feature.fallbackProviders;
        feature.defaultModel = config.defaultModel ?? feature.defaultModel;
        feature.fallbackModels = config.fallbackModels ?? feature.fallbackModels;
        feature.settings = { ...feature.settings, ...config.settings };
      }
    });

    // Get global AI configuration
    const globalConfigSetting = aiSettings.find(s => 
      s.category === 'ai_config' && s.key === 'global'
    );
    
    const globalConfig = globalConfigSetting?.value as any || {
      enableAI: true,
      defaultTimeout: 30000,
      retryAttempts: 3,
      enableFallback: true,
      enableLogging: true,
      enableRateLimiting: true,
    };

    return NextResponse.json({
      providers,
      features,
      globalConfig,
      summary: {
        totalProviders: providers.length,
        activeProviders: providers.filter(p => p.status === 'active').length,
        enabledFeatures: features.filter(f => f.isEnabled).length,
        totalFeatures: features.length,
      },
    });

  } catch (error) {
    console.error('Error fetching AI configuration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI configuration' },
      { status: 500 }
    );
  }
}

// POST - Update AI configuration
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
    const { type, id, config, apiKey } = body;

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Type and ID are required' },
        { status: 400 }
      );
    }

    // Validate based on type
    if (type === 'api_key') {
      if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
        return NextResponse.json(
          { error: 'API key is required and must be a non-empty string' },
          { status: 400 }
        );
      }
    } else if (!config) {
      return NextResponse.json(
        { error: 'Config is required for non-api_key types' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let category: string;
    let value: any;
    
    switch (type) {
      case 'provider':
        category = 'ai_providers';
        value = config;
        break;
      case 'feature':
        category = 'ai_features';
        value = config;
        break;
      case 'global':
        category = 'ai_config';
        value = config;
        break;
      case 'api_key':
        category = 'ai_api_keys';
        value = { apiKey: apiKey.trim(), updatedAt: new Date().toISOString() };
        break;
      default:
        return NextResponse.json({ error: 'Invalid configuration type' }, { status: 400 });
    }

    // Upsert the configuration
    await prisma.adminSettings.upsert({
      where: {
        category_key: {
          category,
          key: id,
        },
      },
      update: {
        value: value,
        updatedBy: user.id,
      },
      create: {
        category,
        key: id,
        value: value,
        description: `AI ${type} configuration for ${id}`,
        updatedBy: user.id,
      },
    });

    console.log(`AI ${type} configuration updated for ${id} by ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: `AI ${type} configuration updated successfully`,
      type,
      id,
    });

  } catch (error) {
    console.error('Error updating AI configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update AI configuration' },
      { status: 500 }
    );
  }
}