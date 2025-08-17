import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { chatRoutes } from './routes/chat';
import { citationRoutes } from './routes/citation';
import { ragRoutes } from './routes/rag';
import { meetingsProdRoutes } from './routes/meetings-prod';
import { databaseRoutes } from './routes/database';
import type { Env } from './types/env';

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', cors({
  origin: (origin) => {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:3003',
      'https://alleato-ai-chat.vercel.app',
      'https://alleato.com'
    ];
    return allowed.includes(origin) ? origin : allowed[0];
  },
  credentials: true,
}));

// Health check
app.get('/health', (c) => c.json({ 
  status: 'healthy',
  version: '1.0.0',
  environment: c.env.ENVIRONMENT 
}));

// API routes
const api = app.basePath('/api/v1');
api.route('/chat', chatRoutes);
api.route('/citation', citationRoutes);
api.route('/rag', ragRoutes);
api.route('/meetings', meetingsProdRoutes);
api.route('/database', databaseRoutes);

// 404 handler
app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;