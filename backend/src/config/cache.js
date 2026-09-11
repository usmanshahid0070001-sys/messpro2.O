/**
 * Unified In-Memory (30MB) & Redis Cache Manager
 * 
 * Features:
 * - Strict 30 MB (30 * 1024 * 1024 bytes) memory limit with LRU eviction.
 * - Periodic expired-item sweep every 60 seconds.
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

    // Periodically sweep expired items to free memory proactively
    this._sweepInterval = setInterval(() => this._sweepExpired(), 60_000);
    if (this._sweepInterval.unref) this._sweepInterval.unref(); // don't block process exit
  }

  _calculateSize(key, value) {
    try {
      const str = typeof value === 'string' ? value : JSON.stringify(value);
      return (key.length * 2) + Buffer.byteLength(str, 'utf8') + 64; // overhead
    } catch {
      return 1024; // 1 KB fallback
    }
  }

  _sweepExpired() {
    const now = Date.now();
    for (const [key, item] of this.cache) {
      if (item.expiresAt && now > item.expiresAt) {
        this.currentSizeBytes -= item.sizeBytes;
        this.cache.delete(key);
      }
    }
  }

  _evictOldest() {
    // Map iteration is insertion-order; oldest = first key
    // Re-insertion on get() promotes items to tail, so head = LRU
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

    // Move to most recently used position (re-insert at tail of Map)
    this.cache.delete(key);
    this.cache.set(key, item);
    this.stats.hits += 1;
    return item.value;
  }

  /**
   * @param {string} key
   * @param {any} value
   * @param {number} effectiveTtlSeconds — already-jittered TTL (set 0 for no expiry)
   */
  set(key, value, effectiveTtlSeconds = 3600) {
    // If key exists, subtract old size first
    if (this.cache.has(key)) {
      const old = this.cache.get(key);
      this.currentSizeBytes -= old.sizeBytes;
      this.cache.delete(key);
    }

    const expiresAt = effectiveTtlSeconds > 0 ? Date.now() + effectiveTtlSeconds * 1000 : null;
    const sizeBytes = this._calculateSize(key, value);

    // Evict oldest (LRU) items until under memory ceiling
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
        // Do NOT use lazyConnect — ioredis auto-connects on construction.
        // lazyConnect + manual .connect() is incompatible and breaks silently.
        this.redisClient = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 2,
          enableReadyCheck: true,
        });

        await new Promise((resolve, reject) => {
          this.redisClient.once('ready', resolve);
          this.redisClient.once('error', reject);
        });

        console.log('✅ Connected to Redis Cloud Cache');
      } catch (err) {
        console.warn('⚠️ Redis connection failed, using 30MB In-Memory Cache:', err.message);
        if (this.redisClient) {
          this.redisClient.disconnect();
          this.redisClient = null;
        }
      }
    }
  }

  /**
   * Compute a single jittered TTL value (shared between Redis and memory paths)
   */
  _effectiveTtl(baseTtlSeconds, maxJitterSeconds) {
    const jitter = Math.floor(Math.random() * (maxJitterSeconds + 1));
    return baseTtlSeconds + jitter;
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
   * Set an item in Cache with base TTL and jitter.
   * Jitter is computed once and applied identically to both Redis and memory.
   * @param {string} key
   * @param {any} value
   * @param {number} baseTtlSeconds default 3600s (1 hour)
   * @param {number} maxJitterSeconds default 300s (5 mins)
   */
  async set(key, value, baseTtlSeconds = 3600, maxJitterSeconds = 300) {
    const ttl = this._effectiveTtl(baseTtlSeconds, maxJitterSeconds);

    if (this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(value), 'EX', ttl);
        return; // Redis write succeeded — memory cache is a fallback, don't double-write
      } catch {
        // Fall through to memory cache
      }
    }
    this.memoryCache.set(key, value, ttl); // jitter already baked into ttl
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
   * Delete all keys starting with prefix.
   * Uses SCAN (non-blocking) instead of KEYS when Redis is active.
   */
  async delPattern(prefix) {
    if (this.redisClient) {
      try {
        let cursor = '0';
        do {
          const [nextCursor, keys] = await this.redisClient.scan(
            cursor, 'MATCH', `${prefix}*`, 'COUNT', 100
          );
          cursor = nextCursor;
          if (keys.length > 0) {
            await this.redisClient.del(...keys);
          }
        } while (cursor !== '0');
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
