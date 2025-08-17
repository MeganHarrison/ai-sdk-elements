import type { Env } from '../types/env';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  keyPrefix?: string; // Optional prefix for rate limit keys
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

export class RateLimiter {
  constructor(private env: Env) {}

  /**
   * Check if a request is allowed based on rate limiting rules
   */
  async check(
    identifier: string, 
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const key = `${config.keyPrefix || 'rate'}:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
      // Get current rate limit data
      const data = await this.env.RATE_LIMIT.get(key, 'json') as any;
      
      if (!data || data.windowStart < windowStart) {
        // New window or expired window
        const newData = {
          count: 1,
          windowStart: now,
          resetAt: now + config.windowMs,
        };
        
        await this.env.RATE_LIMIT.put(
          key, 
          JSON.stringify(newData),
          { expirationTtl: Math.max(60, Math.ceil(config.windowMs / 1000)) }
        );
        
        return {
          allowed: true,
          remaining: config.max - 1,
          resetAt: newData.resetAt,
        };
      }

      // Check if limit exceeded
      if (data.count >= config.max) {
        const retryAfter = Math.ceil((data.resetAt - now) / 1000);
        return {
          allowed: false,
          remaining: 0,
          resetAt: data.resetAt,
          retryAfter: retryAfter > 0 ? retryAfter : 1,
        };
      }

      // Increment counter
      data.count++;
      await this.env.RATE_LIMIT.put(
        key, 
        JSON.stringify(data),
        { expirationTtl: Math.max(60, Math.ceil((data.resetAt - now) / 1000)) }
      );

      return {
        allowed: true,
        remaining: config.max - data.count,
        resetAt: data.resetAt,
      };
    } catch (error) {
      console.error('Rate limit error:', error);
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        remaining: config.max,
        resetAt: now + config.windowMs,
      };
    }
  }

  /**
   * Reset rate limit for an identifier
   */
  async reset(identifier: string, keyPrefix?: string): Promise<void> {
    const key = `${keyPrefix || 'rate'}:${identifier}`;
    await this.env.RATE_LIMIT.delete(key);
  }
}

// Preset rate limit configurations
export const RateLimitPresets = {
  // Standard API rate limiting
  standard: {
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
  },
  
  // Strict rate limiting for expensive operations
  strict: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
  },
  
  // Search endpoint rate limiting
  search: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 searches per minute
  },
  
  // Data export rate limiting
  export: {
    windowMs: 3600 * 1000, // 1 hour
    max: 10, // 10 exports per hour
  },
} as const;