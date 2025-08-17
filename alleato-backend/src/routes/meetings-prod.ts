import { Hono } from 'hono';
import type { Env } from '../types/env';

export const meetingsProdRoutes = new Hono<{ Bindings: Env }>();

// Get all meetings - adapted for production schema
meetingsProdRoutes.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, title, date, duration, participants, attendees, status, meeting_type, project, client, summary FROM meetings ORDER BY date DESC LIMIT 100'
    ).all();
    
    return c.json({ meetings: results || [] });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return c.json({ error: 'Failed to fetch meetings' }, 500);
  }
});

// Get meeting by ID
meetingsProdRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const result = await c.env.DB.prepare(
      'SELECT * FROM meetings WHERE id = ?'
    ).bind(id).first();
    
    if (!result) {
      return c.json({ error: 'Meeting not found' }, 404);
    }
    
    return c.json({ meeting: result });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return c.json({ error: 'Failed to fetch meeting' }, 500);
  }
});

// Search meetings
meetingsProdRoutes.get('/search', async (c) => {
  const query = c.req.query('q');
  
  if (!query) {
    return c.json({ error: 'Query parameter required' }, 400);
  }
  
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT id, title, date, duration, status, meeting_type, project, client 
       FROM meetings 
       WHERE title LIKE ? OR searchable_text LIKE ?
       ORDER BY date DESC 
       LIMIT 50`
    ).bind(`%${query}%`, `%${query}%`).all();
    
    return c.json({ meetings: results || [] });
  } catch (error) {
    console.error('Error searching meetings:', error);
    return c.json({ error: 'Failed to search meetings' }, 500);
  }
});