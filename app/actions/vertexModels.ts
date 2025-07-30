"use server";

import { AIModel } from '@/lib/ai-providers';

// TODO: Enable dynamic fetching from Model Garden API when available
async function fetchPublisherModelsFromModelGardenAPI(projectId: string, location: string, apiKey: string): Promise<AIModel[]> {
  // This is a placeholder for the future Model Garden API endpoint
  // Replace with the actual endpoint and response mapping when Google exposes it
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models`;
  const response = await fetch(endpoint, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }
  const data = await response.json();
  // Map the response to your AIModel[] format (update as needed)
  return (data.models || []).map((model: any) => ({
    id: model.name.split('/').pop(),
    name: model.displayName || model.name,
    provider: 'google-vertex-ai',
    description: model.description || '',
    contextWindow: model.contextWindowTokens || 8192,
    available: true,
    tier: 'paid',
  }));
}

export async function fetchVertexAiModelsServer(): Promise<AIModel[]> {
  // Prepare for future dynamic fetching
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const location = process.env.GOOGLE_CLOUD_REGION;
  const apiKey = process.env.VERTEX_AI_API_KEY || '';
  // Uncomment the following block when the Model Garden API is available

  try {
    if (projectId && location && apiKey) {
      return await fetchPublisherModelsFromModelGardenAPI(projectId, location, apiKey);
    }
  } catch (err) {
    // Fallback to static list if API fails
    console.error('Failed to fetch models from Model Garden API, falling back to static list:', err);
  }

  // Static fallback list
  const predefinedModels: AIModel[] = [
    {
      id: 'gemini-1.5-pro-002',
      name: 'Gemini 1.5 Pro',
      provider: 'google-vertex-ai',
      description: 'Most capable Gemini model for complex reasoning tasks',
      contextWindow: 2000000,
      available: true,
      tier: 'paid',
    },
    {
      id: 'gemini-1.5-flash-002',
      name: 'Gemini 1.5 Flash',
      provider: 'google-vertex-ai',
      description: 'Fast and efficient Gemini model for most tasks',
      contextWindow: 1000000,
      available: true,
      tier: 'paid',
    },
    {
      id: 'gemini-1.0-pro-002',
      name: 'Gemini 1.0 Pro',
      provider: 'google-vertex-ai',
      description: 'Balanced performance for text and code generation',
      contextWindow: 32760,
      available: true,
      tier: 'paid',
    },
    {
      id: 'text-bison-001',
      name: 'PaLM 2 (text-bison)',
      provider: 'google-vertex-ai',
      description: 'Large language model for text generation',
      contextWindow: 8192,
      available: true,
      tier: 'paid',
    },
    {
      id: 'chat-bison-001',
      name: 'PaLM 2 Chat (chat-bison)',
      provider: 'google-vertex-ai',
      description: 'Conversational model optimized for dialogue',
      contextWindow: 8192,
      available: true,
      tier: 'paid',
    },
  ];
  return predefinedModels;
}
