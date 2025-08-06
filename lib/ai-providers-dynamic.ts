// Dynamic AI Provider Loading for Performance Optimization
// Only loads the AI SDK that's actually being used

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'vertex';

interface DynamicProviderLoader {
  loadProvider: (provider: AIProvider) => Promise<any>;
  unloadUnused: () => void;
}

// Cache loaded providers to avoid re-importing
const providerCache = new Map<AIProvider, any>();

export const dynamicAIProviders: DynamicProviderLoader = {
  async loadProvider(provider: AIProvider) {
    // Return cached provider if already loaded
    if (providerCache.has(provider)) {
      return providerCache.get(provider);
    }

    let module;
    switch (provider) {
      case 'openai':
        module = await import('openai').then(m => m.default);
        break;
      case 'anthropic':
        module = await import('@anthropic-ai/sdk').then(m => m.default);
        break;
      case 'google':
        module = await import('@google/generative-ai');
        break;
      case 'vertex':
        module = await import('@google-cloud/aiplatform');
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    providerCache.set(provider, module);
    return module;
  },

  unloadUnused() {
    // Clear cache for unused providers (call after provider switch)
    if (providerCache.size > 1) {
      const currentProvider = Array.from(providerCache.keys()).pop();
      providerCache.forEach((_, key) => {
        if (key !== currentProvider) {
          providerCache.delete(key);
        }
      });
    }
  }
};

// Lazy load heavy visualization libraries
export const loadVisualizationLibrary = async (lib: 'xyflow' | 'recharts') => {
  switch (lib) {
    case 'xyflow':
      return import('@xyflow/react');
    case 'recharts':
      return import('recharts');
    default:
      throw new Error(`Unknown visualization library: ${lib}`);
  }
};