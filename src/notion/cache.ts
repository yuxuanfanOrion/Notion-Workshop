import { ICache } from "./types";

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

export class LRUCache implements ICache {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly maxSize: number;
  private readonly defaultTtl: number;

  constructor(options: { maxSize?: number; defaultTtl?: number } = {}) {
    this.maxSize = options.maxSize ?? 100;
    this.defaultTtl = options.defaultTtl ?? 30000; // 30 seconds default
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end for LRU (delete and re-add)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data as T;
  }

  set(key: string, value: unknown, ttl?: number): void {
    // If key exists, delete it first (for LRU ordering)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict oldest entries if at capacity
    while (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTtl
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  get size(): number {
    return this.cache.size;
  }
}
