import { Env } from '../types';
import { CACHE_TTL } from '@youtube-to-ersatztv/shared';

export async function getCachedData<T>(
  key: string,
  env: Env
): Promise<T | null> {
  if (!env.CACHE) {
    return null;
  }

  try {
    const cached = await env.CACHE.get(key, 'json');
    if (cached) {
      console.log(`Cache hit for key: ${key}`);
      return cached as T;
    }
  } catch (error) {
    console.error('Cache get error:', error);
  }

  return null;
}

export async function setCachedData<T>(
  key: string,
  data: T,
  env: Env,
  ttl: number = CACHE_TTL.VIDEO_METADATA
): Promise<void> {
  if (!env.CACHE) {
    return;
  }

  try {
    await env.CACHE.put(key, JSON.stringify(data), {
      expirationTtl: ttl,
    });
    console.log(`Cached data for key: ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    console.error('Cache set error:', error);
  }
}
