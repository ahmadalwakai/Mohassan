/**
 * Rate Limiting Utility
 * Simple in-memory rate limiter for API routes
 */

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 60000); // Cleanup every minute

export const rateLimitConfigs: Record<string, RateLimitConfig> = {
  // Auth endpoints - strict limits
  auth: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
  },
  // AI endpoints - moderate limits
  ai: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },
  // Content creation - moderate limits
  content: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
  },
  // Report creation - strict limits (prevent spam)
  report: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3,
  },
  // Email resend - very strict
  email: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1,
  },
  // Default
  default: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
};

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Check rate limit for a given identifier and config
 */
export function checkRateLimit(
  identifier: string,
  configKey: keyof typeof rateLimitConfigs = 'default'
): RateLimitResult {
  const config = rateLimitConfigs[configKey] || rateLimitConfigs.default;
  const key = `${configKey}:${identifier}`;
  const now = Date.now();
  
  let entry = store.get(key);
  
  // Reset if window expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    };
  }
  
  // Increment count
  entry.count++;
  store.set(key, entry);
  
  const remaining = Math.max(0, config.maxRequests - entry.count);
  const success = entry.count <= config.maxRequests;
  
  return {
    success,
    remaining,
    resetAt: entry.resetAt,
    retryAfter: success ? undefined : Math.ceil((entry.resetAt - now) / 1000),
  };
}

/**
 * Get identifier from request (IP or user ID)
 */
export function getRateLimitIdentifier(
  request: Request,
  userId?: string
): string {
  if (userId) {
    return `user:${userId}`;
  }
  
  // Try to get IP from headers (behind proxy/CDN)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return `ip:${forwarded.split(',')[0].trim()}`;
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return `ip:${realIp}`;
  }
  
  // Fallback to a default (not ideal, but safe)
  return 'ip:unknown';
}

/**
 * Rate limit response headers
 */
export function rateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', result.resetAt.toString());
  if (result.retryAfter) {
    headers.set('Retry-After', result.retryAfter.toString());
  }
  return headers;
}
