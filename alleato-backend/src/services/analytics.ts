import type { Env } from '../types/env';

export interface DatabaseQueryMetrics {
  tableName: string;
  operation: 'list' | 'schema' | 'data' | 'search' | 'values';
  queryTime: number;
  resultCount?: number;
  cacheHit: boolean;
  userId?: string;
  clientIp?: string;
}

export interface PerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  cacheStatus: 'HIT' | 'MISS' | 'BYPASS';
  userId?: string;
  userAgent?: string;
}

export class AnalyticsService {
  constructor(private env: Env) {}

  /**
   * Track database query performance and usage
   */
  async trackDatabaseQuery(metrics: DatabaseQueryMetrics): Promise<void> {
    try {
      // Note: This assumes you have Workers Analytics Engine set up
      // If not available, this will gracefully fail
      if (this.env.ANALYTICS?.writeDataPoint) {
        await this.env.ANALYTICS.writeDataPoint({
          // Blobs (string values)
          blobs: [
            metrics.tableName,
            metrics.operation,
            metrics.userId || 'anonymous',
            metrics.clientIp || 'unknown',
          ],
          
          // Doubles (numeric values)
          doubles: [
            metrics.queryTime,
            metrics.resultCount || 0,
            metrics.cacheHit ? 1 : 0,
          ],
          
          // Indexes (for filtering/grouping)
          indexes: [
            metrics.tableName,
            metrics.operation,
          ],
        });
      }
      
      // Also log to console for debugging
      console.log('DB Query:', {
        table: metrics.tableName,
        operation: metrics.operation,
        time: `${metrics.queryTime}ms`,
        cached: metrics.cacheHit,
        results: metrics.resultCount,
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  /**
   * Track general API performance
   */
  async trackApiPerformance(metrics: PerformanceMetrics): Promise<void> {
    try {
      if (this.env.ANALYTICS?.writeDataPoint) {
        await this.env.ANALYTICS.writeDataPoint({
          blobs: [
            metrics.endpoint,
            metrics.method,
            metrics.cacheStatus,
            metrics.userId || 'anonymous',
            metrics.userAgent || 'unknown',
          ],
          
          doubles: [
            metrics.responseTime,
            metrics.statusCode,
          ],
          
          indexes: [
            metrics.endpoint,
            String(metrics.statusCode),
          ],
        });
      }
    } catch (error) {
      console.error('Performance tracking error:', error);
    }
  }

  /**
   * Track popular tables for cache warming
   */
  async getPopularTables(timeRange: '1h' | '24h' | '7d' = '24h'): Promise<string[]> {
    try {
      // This would query Analytics Engine for popular tables
      // For now, return a static list or implement based on available data
      
      // In a real implementation, you'd query the analytics data:
      // const query = `
      //   SELECT blob1 as table_name, COUNT(*) as requests
      //   FROM analytics_dataset
      //   WHERE timestamp > NOW() - INTERVAL '${timeRange}'
      //   GROUP BY blob1
      //   ORDER BY requests DESC
      //   LIMIT 10
      // `;
      
      return ['projects', 'meetings', 'users']; // Fallback
    } catch (error) {
      console.error('Error getting popular tables:', error);
      return [];
    }
  }

  /**
   * Generate performance insights
   */
  async getPerformanceInsights(): Promise<{
    slowQueries: Array<{ table: string; avgTime: number }>;
    cacheHitRate: number;
    popularEndpoints: Array<{ endpoint: string; requests: number }>;
  }> {
    // This would analyze the collected metrics
    // For now, return mock data
    return {
      slowQueries: [
        { table: 'large_table', avgTime: 1500 },
        { table: 'complex_table', avgTime: 800 },
      ],
      cacheHitRate: 0.75,
      popularEndpoints: [
        { endpoint: '/api/v1/database/tables', requests: 1000 },
        { endpoint: '/api/v1/database/tables/:table/data', requests: 800 },
      ],
    };
  }
}

/**
 * Middleware to automatically track API performance
 */
export function analyticsMiddleware() {
  return async (c: any, next: any) => {
    const startTime = Date.now();
    const analytics = new AnalyticsService(c.env);
    
    await next();
    
    const responseTime = Date.now() - startTime;
    const endpoint = c.req.path;
    const method = c.req.method;
    const statusCode = c.res?.status || 200;
    const cacheStatus = c.res?.headers.get('X-Cache') as any || 'MISS';
    
    // Track the request
    await analytics.trackApiPerformance({
      endpoint,
      method,
      responseTime,
      statusCode,
      cacheStatus,
      userAgent: c.req.header('User-Agent'),
    });
  };
}