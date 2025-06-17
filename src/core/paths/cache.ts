/**
 * Simple cache implementation for path resolution
 *
 * Paths don't change during execution, so we can cache them
 * to avoid repeated git commands and file system checks
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

/**
 * Simple in-memory cache with optional TTL
 */
export class PathCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttl: number;

  constructor(ttlMs: number = Number.POSITIVE_INFINITY) {
    this.ttl = ttlMs;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check if entry has expired
    if (this.ttl !== Number.POSITIVE_INFINITY && Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }
}

// Global caches for different path types
// These persist for the lifetime of the process
export const pathContextCache = new PathCache<import('./types.js').PathContext>();
export const directoryPathCache = new PathCache<string>();
