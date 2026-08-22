/**
 * Unified In-Memory (30MB) & Redis Cache Manager
 * 
 * Features:
 * - Strict 30 MB (30 * 1024 * 1024 bytes) memory limit with LRU eviction.
 * - Staggered expiry (TTL Jitter) to prevent Cache Stampedes.
 * - Dynamic Redis Cloud support if REDIS_URL is provided in .env.
 * - Read-through (getOrSet) and Write-through cache invalidation.
 * - Zero external dependency requirement (pure Node.js fallback).
 */

class MemoryLRUCache {
  constructor(maxSizeBytes = 30 * 1024 * 1024) {
    this.maxSizeBytes = maxSizeBytes;
    this.currentSizeBytes = 0;
    this.cache = new Map(); // Key -> { value, expiresAt, sizeBytes }
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }

  _calculateSize(key, value) {
    try {
      const str = typeof value === 'string' ? value : JSON.stringify(value);
      return (key.length * 2) + Buffer.byteLength(str, 'utf8') + 64; // overhead
    } catch {
      return 1024; // 1 KB fallback
    }
  }

  _evictOldest() {
    const oldestKey = this.cache.keys().next().value;
    if (oldestKey !== undefined) {
      const item = this.cache.get(oldestKey);
      if (item) {
        this.currentSizeBytes -= item.sizeBytes;
      }
      this.cache.delete(oldestKey);
      this.stats.evictions += 1;
    }
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      this.stats.misses += 1;
      return null;
    }

    // Check expiration
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.currentSizeBytes -= item.sizeBytes;
      this.cache.delete(key);
      this.stats.misses += 1;
      return null;
    }

    // Move to most recently used position (re-insert in Map)
    this.cache.delete(key);
    this.cache.set(key, item);
    this.stats.hits += 1;
    return item.value;
  }

  set(key, value, ttlSeconds = 3600, maxJitterSeconds = 300) {
    // If key exists, subtract old size
    if (this.cache.has(key)) {
      const old = this.cache.get(key);
      this.currentSizeBytes -= old.sizeBytes;
      this.cache.delete(key);
    }

    // Compute TTL with random jitter
    const jitter = Math.floor(Math.random() * maxJitterSeconds);
    const effectiveTtlMs = (ttlSeconds + jitter) * 1000;
    const expiresAt = ttlSeconds > 0 ? Date.now() + effectiveTtlMs : null;

    const sizeBytes = this._calculateSize(key, value);

    // Evict oldest items until under memory ceiling
    while (this.currentSizeBytes + sizeBytes > this.maxSizeBytes && this.cache.size > 0) {
      this._evictOldest();
    }

    this.cache.set(key, {
      value,
      expiresAt,
      sizeBytes,
    });
    this.currentSizeBytes += sizeBytes;
  }

  del(key) {
    const item = this.cache.get(key);
    if (item) {
      this.currentSizeBytes -= item.sizeBytes;
      this.cache.delete(key);
      return true;
    }
    return false;
  }

  delPattern(prefix) {
    let deletedCount = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        const item = this.cache.get(key);
        if (item) {
          this.currentSizeBytes -= item.sizeBytes;
        }
        this.cache.delete(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  clear() {
    this.cache.clear();
    this.currentSizeBytes = 0;
  }

  getStats() {
    return {
      itemsCount: this.cache.size,
      usedMemoryMB: (this.currentSizeBytes / (1024 * 1024)).toFixed(3),
      maxMemoryMB: (this.maxSizeBytes / (1024 * 1024)).toFixed(0),
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
    };
  }
}

class CacheManager {
  constructor() {
    this.memoryCache = new MemoryLRUCache(30 * 1024 * 1024); // 30 MB
    this.redisClient = null;
    this._initRedis();
  }

  async _initRedis() {
    if (process.env.REDIS_URL) {
      try {
        const { default: Redis } = await import('ioredis');
        this.redisClient = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 2,
          enableReadyCheck: true,
          lazyConnect: true,
        });

        await this.redisClient.connect();
        console.log('✅ Connected to Redis Cloud Cache');
      } catch (err) {
        console.warn('⚠️ Redis connection not available, falling back to 30MB In-Memory Cache:', err.message);
        this.redisClient = null;
      }
    }
  }

  /**
   * Get an item from Cache
   */
  async get(key) {
    if (this.redisClient) {
      try {
        const raw = await this.redisClient.get(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        // Fallback to memory on redis error
        return this.memoryCache.get(key);
      }
    }
    return this.memoryCache.get(key);
  }

  /**
   * Set an item in Cache with base TTL and jitter
   * @param {string} key
   * @param {any} value
   * @param {number} baseTtlSeconds default 3600s (1 hour)
   * @param {number} maxJitterSeconds default 300s (5 mins)
   */
  async set(key, value, baseTtlSeconds = 3600, maxJitterSeconds = 300) {
    const jitter = Math.floor(Math.random() * maxJitterSeconds);
    const effectiveTtl = baseTtlSeconds + jitter;

    if (this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(value), 'EX', effectiveTtl);
      } catch {
        this.memoryCache.set(key, value, baseTtlSeconds, maxJitterSeconds);
      }
    } else {
      this.memoryCache.set(key, value, baseTtlSeconds, maxJitterSeconds);
    }
  }

  /**
   * Delete an item from Cache
   */
  async del(key) {
    if (this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch {}
    }
    this.memoryCache.del(key);
  }

  /**
   * Delete all keys starting with prefix
   */
  async delPattern(prefix) {
    if (this.redisClient) {
      try {
        const keys = await this.redisClient.keys(`${prefix}*`);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } catch {}
    }
    this.memoryCache.delPattern(prefix);
  }

  /**
   * Cache-Aside Helper: Get from cache, or fetch from DB and cache the result
   */
  async getOrSet(key, fetchFn, baseTtlSeconds = 3600, maxJitterSeconds = 300) {
    const cached = await this.get(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const freshData = await fetchFn();
    if (freshData !== null && freshData !== undefined) {
      await this.set(key, freshData, baseTtlSeconds, maxJitterSeconds);
    }
    return freshData;
  }

  getStats() {
    return this.memoryCache.getStats();
  }
}

export const cache = new CacheManager();
export default cache;
