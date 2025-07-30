import { fetchVertexAiModelsServer } from '@/app/actions/vertexModels';

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
}

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  apiKeyName: string;
  apiKeyPlaceholder: string;
  models: AIModel[];
  getApiKeyUrl: string;
}

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
        description: "Hybrid reasoning model with 1M token context window",
        contextWindow: 1000000,
        available: true,
        tier: "both",
        rpm: 10,
        rpd: 250,
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
        description:
          "Fast multimodal model - deprecated, use 2.5 Flash instead",
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
        description:
          "High intelligence model - deprecated, use 2.5 Pro instead",
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
        description: "Most advanced multimodal flagship model",
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
        description: "Affordable and intelligent small model",
        contextWindow: 128000,
        available: true,
        tier: "paid",
        rpm: 30000,
        rpd: 10000,
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        provider: "openai",
        description: "Fast and cost-effective legacy model",
        contextWindow: 16385,
        available: true,
        tier: "paid",
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
    getApiKeyUrl: "https://console.anthropic.com/settings/keys",
    models: [
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        provider: "anthropic",
        description: "Most intelligent Claude model",
        contextWindow: 200000,
        available: true,
        tier: "paid",
        rpm: 4000,
        rpd: 4000,
      },
      {
        id: "claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku",
        provider: "anthropic",
        description: "Fast and cost-effective",
        contextWindow: 200000,
        available: true,
        tier: "paid",
        rpm: 4000,
        rpd: 4000,
      },
      {
        id: "claude-3-opus-20240229",
        name: "Claude 3 Opus",
        provider: "anthropic",
        description: "Most powerful previous generation model",
        contextWindow: 200000,
        available: true,
        tier: "paid",
        rpm: 4000,
        rpd: 4000,
      },
    ],
  },
  {
    id: "google-vertex-ai",
    name: "Google Vertex AI",
    apiKeyName: "VERTEX_AI_CONFIGURED", // This is not used for credentials but for status tracking
    apiKeyPlaceholder: "Configured via environment variables",
    getApiKeyUrl: "https://console.cloud.google.com/iam-admin/serviceaccounts",
    models: [
      // Gemini models
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        provider: "google-vertex-ai",
        description: "Fast, multimodal Gemini model with 1M token context window.",
        available: true,
        tier: "paid",
        contextWindow: 1000000,
      },
      {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        provider: "google-vertex-ai",
        description: "Most capable Gemini model for complex reasoning tasks.",
        available: true,
        tier: "paid",
        contextWindow: 1000000,
      },
      {
        id: "gemini-2.5-flash-lite",
        name: "Gemini 2.5 Flash-Lite (Preview)",
        provider: "google-vertex-ai",
        description: "Lightweight, preview Gemini model for fast, cost-effective tasks.",
        available: true,
        tier: "paid",
        contextWindow: 1000000,
      },
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        provider: "google-vertex-ai",
        description: "Balanced multimodal Gemini 2.0 model.",
        available: true,
        tier: "paid",
        contextWindow: 1000000,
      },
      {
        id: "gemini-2.0-flash-lite",
        name: "Gemini 2.0 Flash-Lite (Preview)",
        provider: "google-vertex-ai",
        description: "Lightweight, preview Gemini 2.0 model for fast, cost-effective tasks.",
        available: true,
        tier: "paid",
        contextWindow: 1000000,
      },
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash",
        provider: "google-vertex-ai",
        description: "Fast Gemini model, previous generation.",
        available: true,
        tier: "paid",
        contextWindow: 1000000,
      },
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        provider: "google-vertex-ai",
        description: "Advanced Gemini model, previous generation.",
        available: true,
        tier: "paid",
        contextWindow: 1000000,
      },
      {
        id: "gemini-1.0-pro",
        name: "Gemini 1.0 Pro",
        provider: "google-vertex-ai",
        description: "Gemini 1.0 Pro model for text and code tasks.",
        available: true,
        tier: "paid",
        contextWindow: 32768,
      },
      // Gemma models
      {
        id: "gemma-2.0-2b-it",
        name: "Gemma 2.0 2B IT",
        provider: "google-vertex-ai",
        description: "Gemma 2.0 2B Instruction Tuned model.",
        available: true,
        tier: "paid",
        contextWindow: 8192,
      },
      {
        id: "gemma-2.0-7b-it",
        name: "Gemma 2.0 7B IT",
        provider: "google-vertex-ai",
        description: "Gemma 2.0 7B Instruction Tuned model.",
        available: true,
        tier: "paid",
        contextWindow: 8192,
      },
      // PaLM/legacy models (mark as deprecated if needed)
      {
        id: "text-bison-001",
        name: "PaLM 2 (text-bison)",
        provider: "google-vertex-ai",
        description: "Google's PaLM 2 for text generation via Vertex AI. Deprecated.",
        available: false,
        tier: "paid",
        contextWindow: 8192,
      },
    ],
  },
  {
    id: "google-genai",
    name: "Google GenAI (Gemini)",
    apiKeyName: "GENAI_API_KEY",
    apiKeyPlaceholder: "Paste your Gemini API key here",
    getApiKeyUrl: "https://makersuite.google.com/app/apikey",
    models: [
      // Gemini models
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        provider: "google-genai",
        description: "Fast, multimodal Gemini model with 1M token context window.",
        available: true,
        tier: "free",
        contextWindow: 1000000,
      },
      {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        provider: "google-genai",
        description: "Most capable Gemini model for complex reasoning tasks.",
        available: true,
        tier: "free",
        contextWindow: 1000000,
      },
      {
        id: "gemini-2.5-flash-lite",
        name: "Gemini 2.5 Flash-Lite (Preview)",
        provider: "google-genai",
        description: "Lightweight, preview Gemini model for fast, cost-effective tasks.",
        available: true,
        tier: "free",
        contextWindow: 1000000,
      },
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        provider: "google-genai",
        description: "Balanced multimodal Gemini 2.0 model.",
        available: true,
        tier: "free",
        contextWindow: 1000000,
      },
      {
        id: "gemini-2.0-flash-lite",
        name: "Gemini 2.0 Flash-Lite (Preview)",
        provider: "google-genai",
        description: "Lightweight, preview Gemini 2.0 model for fast, cost-effective tasks.",
        available: true,
        tier: "free",
        contextWindow: 1000000,
      },
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash",
        provider: "google-genai",
        description: "Fast Gemini model, previous generation.",
        available: true,
        tier: "free",
        contextWindow: 1000000,
      },
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        provider: "google-genai",
        description: "Advanced Gemini model, previous generation.",
        available: true,
        tier: "free",
        contextWindow: 1000000,
      },
      {
        id: "gemini-1.0-pro",
        name: "Gemini 1.0 Pro",
        provider: "google-genai",
        description: "Gemini 1.0 Pro model for text and code tasks.",
        available: true,
        tier: "free",
        contextWindow: 32768,
      },
      // Gemma models
      {
        id: "gemma-2.0-2b-it",
        name: "Gemma 2.0 2B IT",
        provider: "google-genai",
        description: "Gemma 2.0 2B Instruction Tuned model.",
        available: true,
        tier: "free",
        contextWindow: 8192,
      },
      {
        id: "gemma-2.0-7b-it",
        name: "Gemma 2.0 7B IT",
        provider: "google-genai",
        description: "Gemma 2.0 7B Instruction Tuned model.",
        available: true,
        tier: "free",
        contextWindow: 8192,
      },
    ],
  },
];

export function getProviderConfig(
  providerId: AIProvider,
): AIProviderConfig | undefined {
  return AI_PROVIDERS.find((p) => p.id === providerId);
}

export async function getModelInfo(modelId: string): Promise<AIModel | undefined> {
  // Check static providers first
  for (const provider of AI_PROVIDERS) {
    if (provider.id !== 'google-vertex-ai') {
      const model = provider.models.find((m) => m.id === modelId);
      if (model) return model;
    }
  }
  // For Vertex AI, fetch dynamically
  const vertexModels = await fetchVertexAiModelsServer();
  return vertexModels.find((m) => m.id === modelId);
}

export function getAvailableModels(): AIModel[] {
  return AI_PROVIDERS.flatMap((p) => p.models).filter((m) => m.available);
}

export async function getAvailableModelsByProvider(
  providerId: AIProvider,
): Promise<AIModel[]> {
  if (providerId === 'google-vertex-ai') {
    return await fetchVertexAiModelsServer();
  }
  const provider = getProviderConfig(providerId);
  return provider ? provider.models.filter((m) => m.available) : [];
}

export function getAllModels(): AIModel[] {
  return AI_PROVIDERS.flatMap((p) => p.models);
}