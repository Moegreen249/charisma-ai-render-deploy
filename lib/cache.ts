/**
 * Application-wide caching utilities
 * Provides in-memory caching with TTL, LRU eviction, and automatic cleanup
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

interface CacheConfig {
  maxSize?: number;
  defaultTTL?: number;
  cleanupInterval?: number;
}

class AppCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private defaultTTL: number;
  private cleanupInterval: number;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: CacheConfig = {}) {
    this.maxSize = config.maxSize || 1000;
    this.defaultTTL = config.defaultTTL || 5 * 60 * 1000; // 5 minutes
    this.cleanupInterval = config.cleanupInterval || 60 * 1000; // 1 minute

    // Start periodic cleanup
    this.startCleanup();
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count and timestamp for LRU
    entry.hits++;
    entry.timestamp = now;
    return entry.data;
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: ttl || this.defaultTTL,
      hits: 0,
    };

    // If cache is full, remove LRU entry
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Get or set pattern
  async getOrSet<K = T>(
    key: string,
    factory: () => Promise<K>,
    ttl?: number
  ): Promise<K> {
    const cached = this.get(key);
    if (cached !== null) return cached as unknown as K;

    const data = await factory();
    this.set(key, data as any, ttl);
    return data;
  }

  // Memoize a function with caching
  memoize<Args extends any[], Return>(
    fn: (...args: Args) => Promise<Return>,
    keyGenerator?: (...args: Args) => string,
    ttl?: number
  ): (...args: Args) => Promise<Return> {
    return async (...args: Args): Promise<Return> => {
      const key = keyGenerator 
        ? keyGenerator(...args)
        : `memoized_${fn.name}_${JSON.stringify(args)}`;
      
      return this.getOrSet(key, () => fn(...args), ttl);
    };
  }

  private evictLRU(): void {
    if (this.cache.size === 0) return;

    let oldestKey = '';
    let oldestTime = Date.now();
    let fewestHits = Infinity;

    // Find entry with fewest hits and oldest timestamp
    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < fewestHits || 
          (entry.hits === fewestHits && entry.timestamp < oldestTime)) {
        oldestKey = key;
        oldestTime = entry.timestamp;
        fewestHits = entry.hits;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      const toDelete: string[] = [];

      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          toDelete.push(key);
        }
      }

      toDelete.forEach(key => this.cache.delete(key));
    }, this.cleanupInterval);
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }

  // Get cache statistics
  getStats() {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    const valid = entries.filter(e => now - e.timestamp <= e.ttl);
    
    return {
      size: this.cache.size,
      validEntries: valid.length,
      invalidEntries: entries.length - valid.length,
      totalHits: entries.reduce((sum, e) => sum + e.hits, 0),
      averageAge: valid.length > 0 
        ? valid.reduce((sum, e) => sum + (now - e.timestamp), 0) / valid.length 
        : 0,
    };
  }
}

// Application-specific cache instances
export const apiCache = new AppCache({
  maxSize: 500,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  cleanupInterval: 60 * 1000, // 1 minute
});

export const analysisCache = new AppCache({
  maxSize: 200,
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  cleanupInterval: 2 * 60 * 1000, // 2 minutes
});

export const userCache = new AppCache({
  maxSize: 1000,
  defaultTTL: 15 * 60 * 1000, // 15 minutes
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
});

export const staticDataCache = new AppCache({
  maxSize: 100,
  defaultTTL: 60 * 60 * 1000, // 1 hour
  cleanupInterval: 10 * 60 * 1000, // 10 minutes
});

// Convenience functions for common cache patterns
export function cacheKey(...parts: (string | number)[]): string {
  return parts.filter(p => p !== null && p !== undefined).join(':');
}

export function invalidatePattern(cache: AppCache, pattern: string): void {
  const regex = new RegExp(pattern);
  const keysToDelete = cache.keys().filter(key => regex.test(key));
  keysToDelete.forEach(key => cache.delete(key));
}

// Cleanup all caches on process exit
process.on('beforeExit', () => {
  apiCache.destroy();
  analysisCache.destroy();
  userCache.destroy();
  staticDataCache.destroy();
});

export { AppCache };
export default apiCache;