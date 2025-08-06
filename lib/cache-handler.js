/**
 * Custom Next.js incremental cache handler
 * Provides enhanced caching for better performance
 */

const { IncrementalCache } = require('next/dist/server/lib/incremental-cache');

class CustomCacheHandler {
  constructor(options) {
    this.options = options;
    this.cache = new Map();
    this.maxSize = 1000;
    this.defaultTtl = 5 * 60 * 1000; // 5 minutes
    
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000); // 1 minute
  }

  async get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return {
      value: entry.value,
      lastModified: entry.lastModified,
      age: Math.floor((Date.now() - entry.createdAt) / 1000)
    };
  }

  async set(key, data, { revalidate } = {}) {
    // Respect cache size limit
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    const ttl = revalidate ? revalidate * 1000 : this.defaultTtl;
    const now = Date.now();
    
    this.cache.set(key, {
      value: data,
      createdAt: now,
      lastModified: now,
      expiresAt: now + ttl
    });
  }

  async revalidateTag(tag) {
    // Remove all entries with matching tag
    for (const [key, entry] of this.cache.entries()) {
      if (entry.value?.tags?.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  evictOldest() {
    if (this.cache.size === 0) return;
    
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  cleanup() {
    const now = Date.now();
    const toDelete = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        toDelete.push(key);
      }
    }
    
    toDelete.forEach(key => this.cache.delete(key));
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

module.exports = CustomCacheHandler;