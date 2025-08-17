import { Context, Next } from 'hono';
import { RateLimiter, RateLimitConfig } from '../services/rate-limiter';
import type { Env } from '../types/env';

export interface RateLimitMiddlewareOptions extends RateLimitConfig {
  keyGenerator?: (c: Context) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Rate limiting middleware for Hono
 */
export function rateLimitMiddleware(options: RateLimitMiddlewareOptions) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const rateLimiter = new RateLimiter(c.env);
    
    // Generate rate limit key
    const keyGenerator = options.keyGenerator || ((ctx) => {
      // Default: Use IP address or CF-Connecting-IP header
      return ctx.req.header('CF-Connecting-IP') || 
             ctx.req.header('X-Forwarded-For')?.split(',')[0] || 
             'unknown';
    });
    
    const identifier = keyGenerator(c);
    
    // Check rate limit
    const result = await rateLimiter.check(identifier, options);
    
    // Set rate limit headers
    c.header('X-RateLimit-Limit', String(options.max));
    c.header('X-RateLimit-Remaining', String(result.remaining));
    c.header('X-RateLimit-Reset', String(result.resetAt));
    
    if (!result.allowed) {
      c.header('Retry-After', String(result.retryAfter));
      return c.json({
        success: false,
        error: 'Too many requests',
        retryAfter: result.retryAfter,
      }, 429);
    }
    
    await next();
  };
}

/**
 * Create a rate limiter for specific endpoints
 */
export function createEndpointRateLimiter(
  endpoint: string,
  config: RateLimitConfig
): RateLimitMiddlewareOptions {
  return {
    ...config,
    keyPrefix: `endpoint:${endpoint}`,
    keyGenerator: (c) => {
      const ip = c.req.header('CF-Connecting-IP') || 
                 c.req.header('X-Forwarded-For')?.split(',')[0] || 
                 'unknown';
      return `${ip}:${endpoint}`;
    },
  };
}