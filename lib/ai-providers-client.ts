/**
 * Client-safe AI providers utilities
 * This file contains only static data and functions safe for client-side use
 * No Prisma or server-only imports allowed here
 */

export type AIProvider =
  | 'google'
  | 'openai'
  | 'anthropic'
  | 'google-vertex-ai'
  | 'google-genai';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  contextWindow?: number;
  available: boolean;
  tier: "free" | "paid" | "both";
  rpm?: number;
  rpd?: number;
  isCustom?: boolean;
  addedBy?: string;
}

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  apiKeyName: string;
  apiKeyPlaceholder: string;
  models: AIModel[];
  getApiKeyUrl: string;
}

// Static AI provider configurations (client-safe)
export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: "google",
    name: "Google AI",
    apiKeyName: "GOOGLE_GEMINI_API_KEY",
    apiKeyPlaceholder: "AIzaSy...",
    getApiKeyUrl: "https://makersuite.google.com/app/apikey",
    models: [
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        provider: "google",
        description: "Best price-performance model with 1M token context window - RECOMMENDED DEFAULT",
        contextWindow: 1000000,
        available: true,
        tier: "both",
        rpm: 10,
        rpd: 250,
      },
      {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        provider: "google",
        description: "Most capable model for complex reasoning tasks - PREMIUM FALLBACK",
        contextWindow: 1000000,
        available: true,
        tier: "both",
        rpm: 5,
        rpd: 100,
      },
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        provider: "google",
        description: "Balanced multimodal model built for Agents era",
        contextWindow: 1000000,
        available: true,
        tier: "both",
        rpm: 15,
        rpd: 200,
      },
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash (Deprecated)",
        provider: "google",
        description: "Fast multimodal model - deprecated, use 2.5 Flash instead",
        contextWindow: 1000000,
        available: false,
        tier: "both",
        rpm: 15,
        rpd: 50,
      },
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro (Deprecated)",
        provider: "google",
        description: "High intelligence model - deprecated, use 2.5 Pro instead",
        contextWindow: 2000000,
        available: false,
        tier: "paid",
        rpm: 0,
        rpd: 0,
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    apiKeyName: "OPENAI_API_KEY",
    apiKeyPlaceholder: "sk-...",
    getApiKeyUrl: "https://platform.openai.com/api-keys",
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        provider: "openai",
        description: "Fastest and most affordable flagship model",
        contextWindow: 128000,
        available: true,
        tier: "paid",
        rpm: 10000,
        rpd: 10000,
      },
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        provider: "openai",
        description: "Small model for fast, lightweight tasks",
        contextWindow: 128000,
        available: true,
        tier: "both",
        rpm: 10000,
        rpd: 10000,
      },
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        provider: "openai",
        description: "Previous generation model",
        contextWindow: 128000,
        available: true,
        tier: "paid",
        rpm: 10000,
        rpd: 10000,
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        provider: "openai",
        description: "Legacy model",
        contextWindow: 16385,
        available: true,
        tier: "both",
        rpm: 10000,
        rpd: 10000,
      },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    apiKeyName: "ANTHROPIC_API_KEY",
    apiKeyPlaceholder: "sk-ant-...",
    getApiKeyUrl: "https://console.anthropic.com/",
    models: [
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        provider: "anthropic",
        description: "Latest version with improved accuracy and capabilities",
        contextWindow: 200000,
        available: true,
        tier: "paid",
        rpm: 50,
        rpd: 5000,
      },
      {
        id: "claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku",
        provider: "anthropic",
        description: "Fast and cost-effective model",
        contextWindow: 200000,
        available: true,
        tier: "both",
        rpm: 50,
        rpd: 5000,
      },
      {
        id: "claude-3-opus-20240229",
        name: "Claude 3 Opus",
        provider: "anthropic",
        description: "Most intelligent model for complex tasks",
        contextWindow: 200000,
        available: true,
        tier: "paid",
        rpm: 50,
        rpd: 5000,
      },
    ],
  },
  {
    id: "google-vertex-ai",
    name: "Google Vertex AI",
    apiKeyName: "GOOGLE_APPLICATION_CREDENTIALS",
    apiKeyPlaceholder: "Service account JSON key path or content",
    getApiKeyUrl: "https://console.cloud.google.com/iam-admin/serviceaccounts",
    models: [], // Dynamic models loaded separately
  },
];

// Client-safe utility functions
export function getProviderConfig(
  providerId: AIProvider,
): AIProviderConfig | undefined {
  return AI_PROVIDERS.find((p) => p.id === providerId);
}

export function getStaticModelInfo(modelId: string): AIModel | undefined {
  // Only check static providers (no server calls)
  for (const provider of AI_PROVIDERS) {
    if (provider.id !== 'google-vertex-ai') {
      const model = provider.models.find((m) => m.id === modelId);
      if (model) return model;
    }
  }
  return undefined;
}

export function getAvailableStaticModels(): AIModel[] {
  return AI_PROVIDERS.flatMap((p) => p.models).filter((m) => m.available);
}

export function getStaticModelsByProvider(providerId: AIProvider): AIModel[] {
  const provider = getProviderConfig(providerId);
  return provider ? provider.models.filter((m) => m.available) : [];
}

export function getAllStaticModels(): AIModel[] {
  return AI_PROVIDERS.flatMap((p) => p.models);
}

// Dynamic import functions for heavy AI SDK modules (reduces initial bundle size)
export async function getGoogleAIModule() {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  return { GoogleGenerativeAI };
}

export async function getOpenAIModule() {
  const OpenAI = await import('openai');
  return OpenAI;
}

export async function getAnthropicModule() {
  const Anthropic = await import('@anthropic-ai/sdk');
  return Anthropic;
}

export async function getVertexAIModule() {
  // This function is deprecated - use server-side imports instead
  throw new Error('Vertex AI modules have been moved to server-only. Use lib/ai-providers-server.ts instead.');
}

// Cache for loaded modules to avoid re-importing
const moduleCache = new Map<string, any>();

export async function getAIModule(provider: AIProvider) {
  if (moduleCache.has(provider)) {
    return moduleCache.get(provider);
  }

  let module;
  switch (provider) {
    case 'google':
    case 'google-genai':
      module = await getGoogleAIModule();
      break;
    case 'openai':
      module = await getOpenAIModule();
      break;
    case 'anthropic':
      module = await getAnthropicModule();
      break;
    case 'google-vertex-ai':
      throw new Error('Vertex AI modules are server-only. Use API endpoints or server actions instead.');
      break;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }

  moduleCache.set(provider, module);
  return module;
}

// Client-side API fetchers for dynamic data
export async function fetchAvailableModels(): Promise<AIModel[]> {
  try {
    const response = await fetch('/api/ai-models');
    if (!response.ok) throw new Error('Failed to fetch models');
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Error fetching available models:', error);
    return getAvailableStaticModels(); // Fallback to static models
  }
}

export async function fetchModelsByProvider(providerId: AIProvider): Promise<AIModel[]> {
  try {
    const response = await fetch(`/api/ai-models?provider=${providerId}`);
    if (!response.ok) throw new Error(`Failed to fetch models for ${providerId}`);
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error(`Error fetching models for ${providerId}:`, error);
    return getStaticModelsByProvider(providerId); // Fallback to static models
  }
}