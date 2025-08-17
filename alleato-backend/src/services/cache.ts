import type { Env } from '../types/env';

export interface CacheConfig {
  ttl: number; // seconds
  staleWhileRevalidate?: number; // seconds
}

export const CacheTTL = {
  TABLE_LIST: 3600, // 1 hour
  TABLE_SCHEMA: 3600, // 1 hour  
  TABLE_DATA: 300, // 5 minutes
  TABLE_COUNT: 600, // 10 minutes
  COLUMN_VALUES: 1800, // 30 minutes
} as const;

export class CacheService {
  constructor(private env: Env) {}

  // Generate cache keys
  private getCacheKey(type: string, ...params: string[]): string {
    return `${type}:${params.join(':')}`;
  }

  // Get from cache with optional stale-while-revalidate
  async get<T>(
    key: string, 
    config?: { acceptStale?: boolean }
  ): Promise<{ data: T | null; isStale: boolean }> {
    try {
      const cached = await this.env.CACHE.get(key, 'json') as any;
      if (!cached) {
        return { data: null, isStale: false };
      }

      const now = Date.now();
      const age = now - cached.timestamp;
      const isStale = age > cached.ttl * 1000;
      
      // If stale but acceptStale is true, return stale data
      if (isStale && !config?.acceptStale) {
        return { data: null, isStale: true };
      }

      return { data: cached.data, isStale };
    } catch (error) {
      console.error('Cache get error:', error);
      return { data: null, isStale: false };
    }
  }

  // Set cache with TTL
  async set<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      
      await this.env.CACHE.put(
        key, 
        JSON.stringify(cacheData),
        { expirationTtl: ttl }
      );
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Delete cache entry
  async delete(key: string): Promise<void> {
    try {
      await this.env.CACHE.delete(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  // Clear all cache entries matching a pattern
  async clearPattern(pattern: string): Promise<void> {
    try {
      // KV doesn't support pattern matching, so we need to track keys
      // This is a simplified version - in production, you'd maintain an index
      const keysToDelete = await this.getKeysMatchingPattern(pattern);
      await Promise.all(keysToDelete.map(key => this.delete(key)));
    } catch (error) {
      console.error('Cache clear pattern error:', error);
    }
  }

  // Helper to track keys (simplified version)
  private async getKeysMatchingPattern(pattern: string): Promise<string[]> {
    // In a real implementation, you'd maintain a key index
    // For now, return empty array
    return [];
  }

  // Cache key generators for different data types
  keys = {
    tableList: () => this.getCacheKey('tables', 'list'),
    tableSchema: (tableName: string) => this.getCacheKey('schema', tableName),
    tableData: (tableName: string, page: number, limit: number, sortBy: string, sortOrder: string, search: string) => 
      this.getCacheKey('data', tableName, String(page), String(limit), sortBy, sortOrder, search || 'none'),
    tableCount: (tableName: string, search?: string) => 
      this.getCacheKey('count', tableName, search || 'none'),
    columnValues: (tableName: string, columnName: string) => 
      this.getCacheKey('values', tableName, columnName),
  };

  // Invalidate all cache for a table
  async invalidateTable(tableName: string): Promise<void> {
    const keysToInvalidate = [
      this.keys.tableSchema(tableName),
      // Note: We can't easily invalidate all data keys without maintaining an index
    ];
    
    await Promise.all(keysToInvalidate.map(key => this.delete(key)));
  }
}