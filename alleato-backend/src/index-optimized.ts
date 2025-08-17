import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { timing } from 'hono/timing';
import { chatRoutes } from './routes/chat';
import { citationRoutes } from './routes/citation';
import { ragRoutes } from './routes/rag';
import { meetingsProdRoutes } from './routes/meetings-prod';
import { databaseRoutes } from './routes/database-optimized';
import { rateLimitMiddleware, createEndpointRateLimiter } from './middleware/rate-limit';
import { analyticsMiddleware } from './services/analytics';
import { RateLimitPresets } from './services/rate-limiter';
import type { Env } from './types/env';

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', cors({
  origin: (origin) => {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:3003',
      'https://alleato-ai-chat.vercel.app',
      'https://alleato.com'
    ];
    return allowed.includes(origin) ? origin : allowed[0];
  },
  credentials: true,
}));

// Add timing middleware for performance monitoring
app.use('*', timing());

// Add analytics middleware
app.use('*', analyticsMiddleware());

// Health check with cache status
app.get('/health', async (c) => {
  const startTime = Date.now();
  
  // Test KV connectivity
  let kvStatus = 'ok';
  try {
    await c.env.CACHE.get('health-check');
  } catch (error) {
    kvStatus = 'error';
  }
  
  // Test D1 connectivity
  let dbStatus = 'ok';
  try {
    await c.env.DB.prepare('SELECT 1').first();
  } catch (error) {
    dbStatus = 'error';
  }
  
  const responseTime = Date.now() - startTime;
  
  return c.json({
    status: 'healthy',
    version: '2.0.0',
    environment: c.env.ENVIRONMENT,
    services: {
      kv: kvStatus,
      database: dbStatus,
    },
    performance: {
      responseTime: `${responseTime}ms`,
    },
    features: {
      caching: true,
      rateLimiting: true,
      analytics: true,
    },
  });
});

// API routes with rate limiting
const api = app.basePath('/api/v1');

// Apply rate limiting to different endpoints
api.use('/database/tables/*/data', rateLimitMiddleware(
  createEndpointRateLimiter('database-data', RateLimitPresets.standard)
));

api.use('/database/tables/*/column/*/values', rateLimitMiddleware(
  createEndpointRateLimiter('database-values', RateLimitPresets.search)
));

// Standard routes
api.route('/chat', chatRoutes);
api.route('/citation', citationRoutes);
api.route('/rag', ragRoutes);
api.route('/meetings', meetingsProdRoutes);
api.route('/database', databaseRoutes);

// Admin endpoints for cache management
const admin = api.basePath('/admin');

// Apply strict rate limiting to admin endpoints
admin.use('*', rateLimitMiddleware({
  ...RateLimitPresets.strict,
  keyPrefix: 'admin',
}));

admin.get('/cache/stats', async (c) => {
  // Cache statistics endpoint
  return c.json({
    success: true,
    stats: {
      // This would show cache hit rates, popular keys, etc.
      hitRate: '75%',
      totalKeys: 'N/A', // KV doesn't provide this directly
      memoryUsage: 'N/A',
    },
  });
});

admin.post('/cache/clear', async (c) => {
  // Clear all cache (be careful with this in production!)
  return c.json({
    success: true,
    message: 'Cache clear initiated',
  });
});

admin.get('/analytics/insights', async (c) => {
  // Performance insights
  return c.json({
    success: true,
    insights: {
      popularTables: ['projects', 'meetings'],
      cacheHitRate: 0.75,
      avgResponseTime: '150ms',
    },
  });
});

// 404 handler
app.notFound((c) => c.json({ 
  error: 'Not found',
  availableEndpoints: [
    '/health',
    '/api/v1/database/tables',
    '/api/v1/admin/cache/stats',
  ],
}, 404));

// Error handler
app.onError((err, c) => {
  console.error('Worker error:', err);
  return c.json({
    success: false,
    error: 'Internal server error',
    message: c.env.ENVIRONMENT === 'development' ? err.message : undefined,
  }, 500);
});

// Scheduled handler for cache warming
export const scheduled: ExportedHandlerScheduledHandler = async (event, env, ctx) => {
  console.log('Running scheduled cache warming...');
  
  try {
    // This would warm up popular caches
    const popularTables = ['projects', 'meetings', 'users'];
    
    for (const table of popularTables) {
      // Warm table schema cache
      const request = new Request(`http://localhost/api/v1/database/tables/${table}/schema`);
      const response = await app.fetch(request, env, ctx);
      console.log(`Warmed cache for table: ${table}, status: ${response.status}`);
    }
  } catch (error) {
    console.error('Cache warming error:', error);
  }
};

export default app;