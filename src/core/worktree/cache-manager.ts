import type { CacheItem } from './types.js';

/**
 * Simple cache manager for git operations
 * Provides time-based caching with optional TTL (Time To Live)
 */
export class CacheManager {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultTtl: number;

  /**
   * Creates a new cache manager
   * @param defaultTtl Default Time To Live in milliseconds (default: 30s)
   */
  constructor(defaultTtl = 30000) {
    this.defaultTtl = defaultTtl;
  }

  /**
   * Gets a value from the cache
   * @param key Cache key
   * @returns The cached value or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);

    // If item doesn't exist or is expired, return undefined
    if (!item || Date.now() - item.timestamp > this.defaultTtl) {
      return undefined;
    }

    return item.data as T;
  }

  /**
   * Stores a value in the cache
   * @param key Cache key
   * @param value Value to store
   */
  set<T>(key: string, value: T): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
    });
  }

  /**
   * Gets a value from the cache, or computes and stores it if not found/expired
   * @param key Cache key
   * @param producer Function to produce the value if not in cache
   * @returns The cached or computed value
   */
  async getOrCompute<T>(key: string, producer: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await producer();
    this.set(key, value);
    return value;
  }

  /**
   * Invalidates a specific cache entry
   * @param key Cache key to invalidate
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidates all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Creates a prefixed key
   * Useful for scoping cache entries to specific worktrees
   * @param prefix Prefix for the key
   * @param key The key to prefix
   * @returns Prefixed key
   */
  createKey(prefix: string, key: string): string {
    return `${prefix}:${key}`;
  }
}
