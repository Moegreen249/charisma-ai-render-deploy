import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { prisma, withDatabaseFallback } from './prisma';

export interface AIRequest {
  feature: string; // 'charisma-feelings', 'writing-assistant', 'story-generation', etc.
  prompt: string;
  model?: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AIResponse {
  success: boolean;
  response?: string;
  provider: string;
  model: string;
  responseTime: number;
  error?: string;
  fallbackUsed?: boolean;
}

export interface AIProviderConfig {
  isEnabled: boolean;
  priority: number;
  models: string[];
}

export interface AIFeatureConfig {
  isEnabled: boolean;
  defaultProvider: string;
  fallbackProviders: string[];
  defaultModel?: string;
  fallbackModels?: Record<string, string>; // provider -> model mapping
  settings: Record<string, any>;
}

class AIService {
  private static instance: AIService;
  private configCache = new Map<string, any>();
  private lastConfigUpdate = 0;
  private readonly CACHE_TTL = 60000; // 1 minute

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Get AI configuration from database with caching
  private async getConfig(): Promise<{
    providers: Record<string, AIProviderConfig>;
    features: Record<string, AIFeatureConfig>;
    global: any;
  }> {
    const now = Date.now();
    if (now - this.lastConfigUpdate < this.CACHE_TTL && this.configCache.has('config')) {
      return this.configCache.get('config');
    }

    return withDatabaseFallback(
      async () => {
        const settings = await prisma.adminSettings.findMany({
          where: {
            category: { in: ['ai_providers', 'ai_features', 'ai_config'] },
            isActive: true,
          },
        });

        const providers: Record<string, AIProviderConfig> = {};
      
        // Default feature configurations (same as API endpoint)
        const features: Record<string, AIFeatureConfig> = {
        'charisma-feelings': {
          isEnabled: true,
          defaultProvider: 'google',
          fallbackProviders: ['google'],
          defaultModel: 'gemini-2.5-flash',
          fallbackModels: {
            'google': 'gemini-2.5-pro'
          },
          settings: {
            reflectionInterval: 5,
            moodHistoryLimit: 100,
            enableStatusPage: true,
          },
        },
        'writing-assistant': {
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
        'story-generation': {
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
        'chat-analysis': {
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
          },
        },
      };
      
      let global: any = {
        enableAI: true,
        defaultTimeout: 30000,
        retryAttempts: 3,
        enableFallback: true,
      };

      settings.forEach(setting => {
        if (setting.category === 'ai_providers') {
          providers[setting.key] = setting.value as unknown as AIProviderConfig;
        } else if (setting.category === 'ai_features') {
          // Apply database overrides to default feature configurations
          const defaultFeature = features[setting.key];
          if (defaultFeature) {
            const config = setting.value as any;
            features[setting.key] = {
              ...defaultFeature,
              isEnabled: config.isEnabled ?? defaultFeature.isEnabled,
              defaultProvider: config.defaultProvider ?? defaultFeature.defaultProvider,
              fallbackProviders: config.fallbackProviders ?? defaultFeature.fallbackProviders,
              defaultModel: config.defaultModel ?? defaultFeature.defaultModel,
              fallbackModels: config.fallbackModels ?? defaultFeature.fallbackModels,
              settings: { ...defaultFeature.settings, ...config.settings },
            };
          } else {
            // If it's a new feature not in defaults, add it
            features[setting.key] = setting.value as unknown as AIFeatureConfig;
          }
        } else if (setting.category === 'ai_config' && setting.key === 'global') {
          global = { ...global, ...(setting.value as any) };
        }
      });

        const config = { providers, features, global };
        this.configCache.set('config', config);
        this.lastConfigUpdate = now;
        
        return config;
      },
      // Fallback configuration when database is unavailable
      {
        providers: {},
        features: {
          'charisma-feelings': {
            isEnabled: true,
            defaultProvider: 'google',
            fallbackProviders: ['openai', 'anthropic'],
            defaultModel: 'gemini-2.5-flash',
            fallbackModels: { 'google': 'gemini-2.0-flash', 'openai': 'gpt-4o-mini', 'anthropic': 'claude-3-5-haiku' },
            settings: { reflectionInterval: 5, moodHistoryLimit: 100, enableStatusPage: true },
          },
          'writing-assistant': {
            isEnabled: true,
            defaultProvider: 'google',
            fallbackProviders: ['openai', 'anthropic'],
            defaultModel: 'gemini-2.5-flash',
            fallbackModels: { 'google': 'gemini-2.0-flash', 'openai': 'gpt-4o', 'anthropic': 'claude-3-5-sonnet' },
            settings: { maxTokens: 1000, temperature: 0.7, enableAllActions: true },
          },
          'story-generation': {
            isEnabled: true,
            defaultProvider: 'google',
            fallbackProviders: ['openai', 'anthropic'],
            defaultModel: 'gemini-2.5-flash',
            fallbackModels: { 'google': 'gemini-2.0-flash', 'openai': 'gpt-4o', 'anthropic': 'claude-3-5-sonnet' },
            settings: { maxStoryLength: 5000, enableCharacterGen: true, enablePlotGen: true },
          },
          'chat-analysis': {
            isEnabled: true,
            defaultProvider: 'google',
            fallbackProviders: ['openai', 'anthropic'],
            defaultModel: 'gemini-2.5-flash',
            fallbackModels: { 'google': 'gemini-2.0-flash', 'openai': 'gpt-4o-mini', 'anthropic': 'claude-3-5-haiku' },
            settings: { enableSentimentAnalysis: true, enablePersonalityInsights: true },
          },
        },
        global: { enableAI: true, defaultTimeout: 30000, retryAttempts: 3, enableFallback: true }
      },
      'getAIConfig'
    );
  }

  // Get available providers for a feature
  private async getAvailableProviders(feature: string): Promise<string[]> {
    const config = await this.getConfig();
    const featureConfig = config.features[feature];
    
    if (!featureConfig || !featureConfig.isEnabled) {
      throw new Error(`Feature ${feature} is not enabled`);
    }

    const availableProviders: string[] = [];
    
    // Add default provider first
    if (await this.isProviderAvailable(featureConfig.defaultProvider)) {
      availableProviders.push(featureConfig.defaultProvider);
    }

    // Add fallback providers
    for (const provider of featureConfig.fallbackProviders) {
      if (await this.isProviderAvailable(provider) && !availableProviders.includes(provider)) {
        availableProviders.push(provider);
      }
    }

    if (availableProviders.length === 0) {
      const allProviders = ['google', 'openai', 'anthropic', 'vertex-ai'];
      const missingKeysChecks = await Promise.all(
        allProviders.map(async p => ({
          provider: p,
          available: await this.isProviderAvailable(p)
        }))
      );
      
      const missingKeys = missingKeysChecks
        .filter(check => !check.available)
        .map(check => this.getEnvVarName(check.provider));
      
      throw new Error(
        `No available providers for feature ${feature}. ` +
        `Please configure at least one API key (environment variable or admin config): ${missingKeys.join(', ')}`
      );
    }

    return availableProviders;
  }

  // Check if provider is available (has API key from env or admin config)
  private async isProviderAvailable(providerId: string): Promise<boolean> {
    // First check environment variables (main app infrastructure keys)
    const hasEnvKey = this.hasEnvironmentKey(providerId);
    if (hasEnvKey) return true;

    // Then check admin-configured keys in database (for system features)
    const hasAdminKey = await this.hasAdminConfiguredKey(providerId);
    return hasAdminKey;
  }

  // Check environment variables (main app infrastructure keys)
  private hasEnvironmentKey(providerId: string): boolean {
    switch (providerId) {
      case 'google':
        return !!process.env.GOOGLE_GEMINI_API_KEY;
      case 'openai':
        return !!process.env.OPENAI_API_KEY;
      case 'anthropic':
        return !!process.env.ANTHROPIC_API_KEY;
      case 'vertex-ai':
        return !!process.env.GOOGLE_VERTEX_AI_CREDENTIALS;
      default:
        return false;
    }
  }

  // Check admin-configured API keys in database (for system features)
  private async hasAdminConfiguredKey(providerId: string): Promise<boolean> {
    try {
      const setting = await prisma.adminSettings.findUnique({
        where: {
          category_key: {
            category: 'ai_api_keys',
            key: providerId,
          },
        },
      });
      
      return !!(setting?.value as any)?.apiKey;
    } catch (error) {
      console.error(`Failed to check admin API key for ${providerId}:`, error);
      return false;
    }
  }

  // Get API key for provider (env first, then admin config)
  private async getApiKey(providerId: string): Promise<string | null> {
    // Priority 1: Environment variables (infrastructure keys)
    const envKey = this.getEnvironmentKey(providerId);
    if (envKey) return envKey;

    // Priority 2: Admin-configured keys (system feature keys)
    const adminKey = await this.getAdminConfiguredKey(providerId);
    return adminKey;
  }

  // Get environment API key
  private getEnvironmentKey(providerId: string): string | null {
    switch (providerId) {
      case 'google':
        return process.env.GOOGLE_GEMINI_API_KEY || null;
      case 'openai':
        return process.env.OPENAI_API_KEY || null;
      case 'anthropic':
        return process.env.ANTHROPIC_API_KEY || null;
      case 'vertex-ai':
        return process.env.GOOGLE_VERTEX_AI_CREDENTIALS || null;
      default:
        return null;
    }
  }

  // Get admin-configured API key
  private async getAdminConfiguredKey(providerId: string): Promise<string | null> {
    try {
      const setting = await prisma.adminSettings.findUnique({
        where: {
          category_key: {
            category: 'ai_api_keys',
            key: providerId,
          },
        },
      });
      
      return (setting?.value as any)?.apiKey || null;
    } catch (error) {
      console.error(`Failed to get admin API key for ${providerId}:`, error);
      return null;
    }
  }

  // Helper to get environment variable name for provider
  private getEnvVarName(providerId: string): string {
    switch (providerId) {
      case 'google':
        return 'GOOGLE_GEMINI_API_KEY';
      case 'openai':
        return 'OPENAI_API_KEY';
      case 'anthropic':
        return 'ANTHROPIC_API_KEY';
      case 'vertex-ai':
        return 'GOOGLE_VERTEX_AI_CREDENTIALS';
      default:
        return `${providerId.toUpperCase().replace('-', '_')}_API_KEY`;
    }
  }

  // Make AI request with automatic fallback
  public async request(aiRequest: AIRequest): Promise<AIResponse> {
    const config = await this.getConfig();
    
    if (!config.global.enableAI) {
      throw new Error('AI services are globally disabled');
    }

    const availableProviders = await this.getAvailableProviders(aiRequest.feature);
    const requestedProvider = aiRequest.provider;
    
    // If specific provider requested, try it first
    if (requestedProvider && availableProviders.includes(requestedProvider)) {
      const index = availableProviders.indexOf(requestedProvider);
      availableProviders.splice(index, 1);
      availableProviders.unshift(requestedProvider);
    }

    let lastError: string = '';
    
    for (let i = 0; i < availableProviders.length; i++) {
      const providerId = availableProviders[i];
      const startTime = Date.now();
      
      try {
        // Get feature-specific model for this provider
        const model = await this.getModelForFeatureProvider(aiRequest.feature, providerId, aiRequest.model);
        const enhancedRequest = { ...aiRequest, model };
        
        const response = await this.callProvider(providerId, enhancedRequest);
        const responseTime = Date.now() - startTime;
        
        return {
          success: true,
          response,
          provider: providerId,
          model,
          responseTime,
          fallbackUsed: i > 0,
        };
      } catch (error: any) {
        lastError = error.message;
        console.warn(`AI Provider ${providerId} failed:`, error.message);
        
        // If this was the last provider, throw the error
        if (i === availableProviders.length - 1) {
          break;
        }
      }
    }

    return {
      success: false,
      provider: availableProviders[0] || 'unknown',
      model: aiRequest.model || 'unknown',
      responseTime: 0,
      error: lastError || 'All providers failed',
    };
  }

  // Call specific AI provider
  private async callProvider(providerId: string, aiRequest: AIRequest): Promise<string> {
    const model = aiRequest.model || this.getDefaultModel(providerId);
    const maxTokens = aiRequest.maxTokens || 1000;
    const temperature = aiRequest.temperature || 0.7;

    switch (providerId) {
      case 'google':
        return await this.callGoogleGemini(model, aiRequest.prompt, temperature, maxTokens);
      
      case 'openai':
        return await this.callOpenAI(model, aiRequest.prompt, temperature, maxTokens, aiRequest.systemPrompt);
      
      case 'anthropic':
        throw new Error('Anthropic provider not yet implemented');
      
      case 'vertex-ai':
        throw new Error('Vertex AI provider not yet implemented');
      
      default:
        throw new Error(`Unknown provider: ${providerId}`);
    }
  }

  private async callGoogleGemini(model: string, prompt: string, temperature: number, maxTokens: number): Promise<string> {
    const apiKey = await this.getApiKey('google');
    if (!apiKey) {
      throw new Error('Google Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ 
      model,
      generationConfig: { 
        temperature,
        maxOutputTokens: maxTokens
      }
    });
    
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private async callOpenAI(model: string, prompt: string, temperature: number, maxTokens: number, systemPrompt?: string): Promise<string> {
    const apiKey = await this.getApiKey('openai');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openai = new OpenAI({ apiKey });
    
    const messages: any[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const completion = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    });

    return completion.choices[0]?.message?.content || '';
  }

  // Get model for specific feature and provider
  private async getModelForFeatureProvider(feature: string, providerId: string, requestedModel?: string): Promise<string> {
    // If model explicitly requested, use it
    if (requestedModel) {
      return requestedModel;
    }

    const config = await this.getConfig();
    const featureConfig = config.features[feature];
    
    if (!featureConfig) {
      return this.getDefaultModel(providerId);
    }

    // If this is the default provider, use the feature's default model
    if (providerId === featureConfig.defaultProvider && featureConfig.defaultModel) {
      return featureConfig.defaultModel;
    }

    // If this is a fallback provider, use the fallback model
    if (featureConfig.fallbackModels && featureConfig.fallbackModels[providerId]) {
      return featureConfig.fallbackModels[providerId];
    }

    // Fall back to provider default
    return this.getDefaultModel(providerId);
  }

  private getDefaultModel(providerId: string): string {
    switch (providerId) {
      case 'google':
        return 'gemini-2.5-flash';
      case 'openai':
        return 'gpt-4o-mini';
      case 'anthropic':
        return 'claude-3-5-haiku';
      default:
        return 'unknown';
    }
  }

  // Get feature configuration
  public async getFeatureConfig(feature: string): Promise<AIFeatureConfig | null> {
    const config = await this.getConfig();
    return config.features[feature] || null;
  }

  // Check if feature is enabled
  public async isFeatureEnabled(feature: string): Promise<boolean> {
    const featureConfig = await this.getFeatureConfig(feature);
    return featureConfig?.isEnabled ?? false;
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();

// Convenience function for making AI requests
export async function makeAIRequest(request: AIRequest): Promise<AIResponse> {
  return await aiService.request(request);
}