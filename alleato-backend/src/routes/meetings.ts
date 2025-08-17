import { Hono } from 'hono';
import type { Env } from '../types/env';

export const meetingsRoutes = new Hono<{ Bindings: Env }>();

// Get all meetings
meetingsRoutes.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM meetings WHERE deleted_at IS NULL ORDER BY date DESC, time DESC'
    ).all();
    
    return c.json({ meetings: results || [] });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return c.json({ error: 'Failed to fetch meetings' }, 500);
  }
});

// Get meeting by ID
meetingsRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const result = await c.env.DB.prepare(
      'SELECT * FROM meetings WHERE id = ? AND deleted_at IS NULL'
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

// Create new meeting
meetingsRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const id = crypto.randomUUID();
  const now = Date.now();
  
  try {
    await c.env.DB.prepare(
      `INSERT INTO meetings (
        id, database_id, title, type, status, date, time, 
        duration, location, organizer, attendees, agenda, 
        notes, action_items, recording_url, updated_at, updated_by, version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      body.database_id || 'fb73a7587ceb44dfaa7be6713930a705', // Default to meetings DB ID
      body.title,
      body.type || null,
      body.status || 'scheduled',
      body.date || null,
      body.time || null,
      body.duration || null,
      body.location || null,
      body.organizer || null,
      JSON.stringify(body.attendees || []),
      body.agenda || null,
      body.notes || null,
      JSON.stringify(body.action_items || []),
      body.recording_url || null,
      now,
      body.updated_by || 'api',
      0
    ).run();
    
    const newMeeting = await c.env.DB.prepare(
      'SELECT * FROM meetings WHERE id = ?'
    ).bind(id).first();
    
    return c.json({ meeting: newMeeting }, 201);
  } catch (error) {
    console.error('Error creating meeting:', error);
    return c.json({ error: 'Failed to create meeting' }, 500);
  }
});

// Update meeting
meetingsRoutes.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const now = Date.now();
  
  try {
    // Check if meeting exists
    const existing = await c.env.DB.prepare(
      'SELECT * FROM meetings WHERE id = ? AND deleted_at IS NULL'
    ).bind(id).first();
    
    if (!existing) {
      return c.json({ error: 'Meeting not found' }, 404);
    }
    
    // Update meeting
    await c.env.DB.prepare(
      `UPDATE meetings SET 
        title = ?, type = ?, status = ?, date = ?, time = ?,
        duration = ?, location = ?, organizer = ?, attendees = ?,
        agenda = ?, notes = ?, action_items = ?, recording_url = ?,
        updated_at = ?, updated_by = ?, version = version + 1
      WHERE id = ? AND deleted_at IS NULL`
    ).bind(
      body.title || existing.title,
      body.type !== undefined ? body.type : existing.type,
      body.status || existing.status,
      body.date !== undefined ? body.date : existing.date,
      body.time !== undefined ? body.time : existing.time,
      body.duration !== undefined ? body.duration : existing.duration,
      body.location !== undefined ? body.location : existing.location,
      body.organizer !== undefined ? body.organizer : existing.organizer,
      body.attendees !== undefined ? JSON.stringify(body.attendees) : existing.attendees,
      body.agenda !== undefined ? body.agenda : existing.agenda,
      body.notes !== undefined ? body.notes : existing.notes,
      body.action_items !== undefined ? JSON.stringify(body.action_items) : existing.action_items,
      body.recording_url !== undefined ? body.recording_url : existing.recording_url,
      now,
      body.updated_by || 'api',
      id
    ).run();
    
    const updatedMeeting = await c.env.DB.prepare(
      'SELECT * FROM meetings WHERE id = ?'
    ).bind(id).first();
    
    return c.json({ meeting: updatedMeeting });
  } catch (error) {
    console.error('Error updating meeting:', error);
    return c.json({ error: 'Failed to update meeting' }, 500);
  }
});

// Delete meeting (soft delete)
meetingsRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const now = Date.now();
  
  try {
    const result = await c.env.DB.prepare(
      'UPDATE meetings SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL'
    ).bind(now, id).run();
    
    if (result.meta.changes === 0) {
      return c.json({ error: 'Meeting not found' }, 404);
    }
    
    return c.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return c.json({ error: 'Failed to delete meeting' }, 500);
  }
});