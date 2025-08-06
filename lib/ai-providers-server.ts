/**
 * Server-only AI providers utilities
 * This file contains server-side modules that cannot be used on the client
 */

// Server-only dynamic imports for heavy AI SDK modules
export async function getVertexAIModule() {
  const [VertexAI, Common] = await Promise.all([
    import('@google-cloud/aiplatform'),
    import('@google-cloud/common')
  ]);
  return { VertexAI, Common };
}

// Cache for loaded modules to avoid re-importing
const serverModuleCache = new Map<string, any>();

export async function getServerAIModule(provider: string) {
  if (serverModuleCache.has(provider)) {
    return serverModuleCache.get(provider);
  }

  let module;
  switch (provider) {
    case 'google-vertex-ai':
      module = await getVertexAIModule();
      break;
    default:
      throw new Error(`Server module not available for provider: ${provider}`);
  }

  serverModuleCache.set(provider, module);
  return module;
}