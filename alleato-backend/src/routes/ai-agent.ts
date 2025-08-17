import { Hono } from 'hono';
import type { Env } from '../types/env';

export const aiAgentRoutes = new Hono<{ Bindings: Env }>();

// Proxy to AI Agent Worker
aiAgentRoutes.post('/chat', async (c) => {
  const body = await c.req.json();
  
  // Get AI Agent Worker URL from environment
  const agentUrl = c.env.AI_AGENT_URL || 'http://ai-agent-worker.localhost';
  
  try {
    const response = await fetch(`${agentUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`AI Agent error: ${response.status}`);
    }

    // Stream response if available
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Regular JSON response
    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error('AI Agent proxy error:', error);
    return c.json({ 
      error: 'Failed to connect to AI agent',
      details: error.message 
    }, 500);
  }
});

// Get project summary from AI Agent
aiAgentRoutes.get('/project/:projectId/summary', async (c) => {
  const projectId = c.req.param('projectId');
  const agentUrl = c.env.AI_AGENT_URL || 'http://ai-agent-worker.localhost';
  
  try {
    const response = await fetch(`${agentUrl}/project/${projectId}/summary`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`AI Agent error: ${response.status}`);
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error('AI Agent proxy error:', error);
    return c.json({ 
      error: 'Failed to get project summary',
      details: error.message 
    }, 500);
  }
});

// Submit feedback
aiAgentRoutes.post('/feedback', async (c) => {
  const body = await c.req.json();
  const agentUrl = c.env.AI_AGENT_URL || 'http://ai-agent-worker.localhost';
  
  try {
    const response = await fetch(`${agentUrl}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`AI Agent error: ${response.status}`);
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error('AI Agent proxy error:', error);
    return c.json({ 
      error: 'Failed to submit feedback',
      details: error.message 
    }, 500);
  }
});

// Get chat session
aiAgentRoutes.get('/session/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId');
  const agentUrl = c.env.AI_AGENT_URL || 'http://ai-agent-worker.localhost';
  
  try {
    const response = await fetch(`${agentUrl}/session/${sessionId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return c.json({ error: 'Session not found' }, 404);
      }
      throw new Error(`AI Agent error: ${response.status}`);
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error('AI Agent proxy error:', error);
    return c.json({ 
      error: 'Failed to get session',
      details: error.message 
    }, 500);
  }
});

// Trigger manual sync from Fireflies
aiAgentRoutes.post('/sync/fireflies', async (c) => {
  const ingestUrl = c.env.FIREFLIES_INGEST_URL || 'http://fireflies-ingest-worker.localhost';
  
  try {
    const response = await fetch(`${ingestUrl}/sync`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Ingest worker error: ${response.status}`);
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error('Fireflies sync error:', error);
    return c.json({ 
      error: 'Failed to trigger Fireflies sync',
      details: error.message 
    }, 500);
  }
});

// Get sync status
aiAgentRoutes.get('/sync/status', async (c) => {
  const ingestUrl = c.env.FIREFLIES_INGEST_URL || 'http://fireflies-ingest-worker.localhost';
  
  try {
    const response = await fetch(`${ingestUrl}/status`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Ingest worker error: ${response.status}`);
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error('Sync status error:', error);
    return c.json({ 
      error: 'Failed to get sync status',
      details: error.message 
    }, 500);
  }
});

// Get user's chat sessions
aiAgentRoutes.get('/sessions', async (c) => {
  const agentUrl = c.env.AI_AGENT_URL || 'http://ai-agent-worker.localhost';
  const queryString = c.req.url.split('?')[1] || '';
  
  try {
    const response = await fetch(`${agentUrl}/sessions?${queryString}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`AI Agent error: ${response.status}`);
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error('AI Agent proxy error:', error);
    return c.json({ 
      error: 'Failed to get chat sessions',
      details: error.message 
    }, 500);
  }
});

// Get messages for a specific session
aiAgentRoutes.get('/sessions/:sessionId/messages', async (c) => {
  const sessionId = c.req.param('sessionId');
  const agentUrl = c.env.AI_AGENT_URL || 'http://ai-agent-worker.localhost';
  
  try {
    const response = await fetch(`${agentUrl}/sessions/${sessionId}/messages`, {
      method: 'GET',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return c.json({ error: 'Session not found' }, 404);
      }
      throw new Error(`AI Agent error: ${response.status}`);
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error('AI Agent proxy error:', error);
    return c.json({ 
      error: 'Failed to get session messages',
      details: error.message 
    }, 500);
  }
});