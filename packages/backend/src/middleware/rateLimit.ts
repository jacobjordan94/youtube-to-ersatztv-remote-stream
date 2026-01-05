import { Context, Next } from 'hono';
import { Env } from '../types';

// Simple in-memory rate limiter for development
// In production, use Cloudflare's built-in rate limiting
const requestCounts = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

/**
 * Rate limiting middleware
 * @param options - Rate limit configuration
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests } = options;

  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const clientIP =
      c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    const now = Date.now();

    // Clean up expired entries
    for (const [ip, data] of requestCounts.entries()) {
      if (now > data.resetAt) {
        requestCounts.delete(ip);
      }
    }

    // Get or create entry for this IP
    let entry = requestCounts.get(clientIP);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      requestCounts.set(clientIP, entry);
    }

    // Increment request count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      c.header('Retry-After', retryAfter.toString());
      c.header('X-RateLimit-Limit', maxRequests.toString());
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', entry.resetAt.toString());

      return c.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        },
        429
      );
    }

    // Add rate limit headers
    c.header('X-RateLimit-Limit', maxRequests.toString());
    c.header('X-RateLimit-Remaining', (maxRequests - entry.count).toString());
    c.header('X-RateLimit-Reset', entry.resetAt.toString());

    return next();
  };
}

/**
 * Cloudflare-specific rate limiting using KV
 * More robust for production than in-memory
 */
export function cloudflareRateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests } = options;

  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const env = c.env;

    // Fall back to in-memory if no KV available
    if (!env?.CACHE) {
      return rateLimit(options)(c, next);
    }

    const clientIP =
      c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    const rateLimitKey = `ratelimit:${clientIP}`;
    const now = Date.now();

    try {
      // Get current count from KV
      const stored = (await env.CACHE.get(rateLimitKey, 'json')) as {
        count: number;
        resetAt: number;
      } | null;

      let count = 1;
      let resetAt = now + windowMs;

      if (stored && now < stored.resetAt) {
        count = stored.count + 1;
        resetAt = stored.resetAt;
      }

      // Check if limit exceeded
      if (count > maxRequests) {
        const retryAfter = Math.ceil((resetAt - now) / 1000);
        c.header('Retry-After', retryAfter.toString());
        c.header('X-RateLimit-Limit', maxRequests.toString());
        c.header('X-RateLimit-Remaining', '0');
        c.header('X-RateLimit-Reset', resetAt.toString());

        return c.json(
          {
            error: 'Too many requests',
            message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          },
          429
        );
      }

      // Store updated count
      const ttl = Math.ceil((resetAt - now) / 1000);
      await env.CACHE.put(rateLimitKey, JSON.stringify({ count, resetAt }), { expirationTtl: ttl });

      // Add rate limit headers
      c.header('X-RateLimit-Limit', maxRequests.toString());
      c.header('X-RateLimit-Remaining', (maxRequests - count).toString());
      c.header('X-RateLimit-Reset', resetAt.toString());

      return next();
    } catch (error) {
      // On error, allow the request but log the issue
      console.error('Rate limit error:', error);
      return next();
    }
  };
}
