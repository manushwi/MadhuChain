import { Redis } from 'ioredis';

/**
 * Best-effort Redis cache with an in-memory fallback so the API keeps working
 * even if Redis is not reachable (e.g. early dev). Used primarily to cache the
 * public /verify endpoint for fast consumer load.
 */
let redis: Redis | null = null;
let redisFailed = false;
const memory = new Map<string, { value: string; expires: number }>();

function getRedis(): Redis | null {
  if (redisFailed) return null;
  if (!redis) {
    try {
      redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        retryStrategy: () => null,
      });
      redis.on('error', () => {
        redisFailed = true;
        redis = null;
      });
    } catch {
      redisFailed = true;
      redis = null;
    }
  }
  return redis;
}

export async function cacheGet(key: string): Promise<string | null> {
  const client = getRedis();
  if (client) {
    try {
      const v = await client.get(key);
      return v;
    } catch {
      /* fall through */
    }
  }
  const entry = memory.get(key);
  if (entry && entry.expires > Date.now()) return entry.value;
  memory.delete(key);
  return null;
}

export async function cacheSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  const client = getRedis();
  if (client) {
    try {
      await client.set(key, value, 'EX', ttlSeconds);
      return;
    } catch {
      /* fall through */
    }
  }
  memory.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
}

export async function cacheDelete(key: string): Promise<void> {
  const client = getRedis();
  if (client) {
    try {
      await client.del(key);
    } catch {
      /* fall through to the local cache */
    }
  }
  memory.delete(key);
}
