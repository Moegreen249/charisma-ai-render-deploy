// Comprehensive caching strategy for performance optimization
import { unstable_cache } from 'next/cache';

// Cache configuration
const CACHE_TIMES = {
  STATIC: 60 * 60 * 24, // 24 hours for static content
  USER_DATA: 60 * 5, // 5 minutes for user data
  API_RESPONSE: 60, // 1 minute for API responses
  ANALYSIS_RESULT: 60 * 60, // 1 hour for analysis results
  TEMPLATES: 60 * 30, // 30 minutes for templates
  AI_MODELS: 60 * 60 * 6, // 6 hours for AI model configs
} as const;

// In-memory cache for client-side operations
class ClientCache {
  private cache = new Map<string, { data: any; expiry: number }>();

  set(key: string, data: any, ttlSeconds: number) {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expiry });
  }

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clear(pattern?: string) {
    if (pattern) {
      const keys = Array.from(this.cache.keys());
      keys.forEach(key => {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      });
    } else {
      this.cache.clear();
    }
  }

  // Get cache statistics
  getStats() {
    const entries = Array.from(this.cache.entries());
    const totalSize = entries.reduce((acc, [key, value]) => {
      return acc + JSON.stringify(value.data).length;
    }, 0);
    
    return {
      entries: this.cache.size,
      sizeInBytes: totalSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const clientCache = new ClientCache();

// Server-side caching functions
export const cachedGetUser = unstable_cache(
  async (userId: string) => {
    const { prisma } = await import('@/lib/prisma');
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isApproved: true,
        subscription: {
          select: {
            tier: true,
            status: true,
          }
        },
      },
    });
  },
  ['user'],
  {
    revalidate: CACHE_TIMES.USER_DATA,
    tags: ['user-data'],
  }
);

export const cachedGetTemplates = unstable_cache(
  async () => {
    const { getTemplatesForUser } = await import('@/app/actions/templates');
    return getTemplatesForUser();
  },
  ['templates'],
  {
    revalidate: CACHE_TIMES.TEMPLATES,
    tags: ['templates'],
  }
);

export const cachedGetAIModels = unstable_cache(
  async () => {
    const { getAvailableModels } = await import('@/lib/ai-providers');
    return getAvailableModels();
  },
  ['ai-models'],
  {
    revalidate: CACHE_TIMES.AI_MODELS,
    tags: ['ai-models'],
  }
);

// Cache invalidation helpers
export async function invalidateUserCache(userId?: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('user-data');
  if (userId) {
    clientCache.clear(`user:${userId}`);
  }
}

export async function invalidateTemplateCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('templates');
  clientCache.clear('template');
}

export async function invalidateAIModelCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('ai-models');
  clientCache.clear('ai-model');
}

// Request deduplication for concurrent requests
const pendingRequests = new Map<string, Promise<any>>();

export async function deduplicatedRequest<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // Check if request is already pending
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as unknown as Promise<T>;
  }

  // Create new request and store promise
  const promise = fetcher().finally(() => {
    // Clean up after completion
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

// Browser storage cache wrapper
export const browserCache = {
  set(key: string, data: any, ttlMinutes: number = 60) {
    if (typeof window === 'undefined') return;
    
    const item = {
      data,
      expiry: Date.now() + ttlMinutes * 60 * 1000,
    };
    
    try {
      localStorage.setItem(`cache:${key}`, JSON.stringify(item));
    } catch (e) {
      // Handle quota exceeded or other errors
      console.warn('Failed to cache to localStorage:', e);
    }
  },

  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(`cache:${key}`);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      if (Date.now() > parsed.expiry) {
        localStorage.removeItem(`cache:${key}`);
        return null;
      }
      
      return parsed.data as unknown as T;
    } catch (e) {
      return null;
    }
  },

  clear(pattern?: string) {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache:')) {
        if (!pattern || key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      }
    });
  },
};

// Response caching headers helper
export function setCacheHeaders(
  headers: Headers,
  maxAge: number = 60,
  sMaxAge: number = 120
) {
  headers.set(
    'Cache-Control',
    `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=59`
  );
  headers.set('CDN-Cache-Control', `max-age=${sMaxAge}`);
  headers.set('Vercel-CDN-Cache-Control', `max-age=${sMaxAge}`);
}