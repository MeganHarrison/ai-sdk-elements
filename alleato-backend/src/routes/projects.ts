import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from '../types/env';

const projects = new Hono<{ Bindings: Env }>();

// Enable CORS
projects.use('/*', cors());

// Get all projects
projects.get('/', async (c) => {
  try {
    const { HYPERDRIVE } = c.env;
    
    if (!HYPERDRIVE) {
      return c.json({ error: 'Hyperdrive not configured' }, 503);
    }

    // Query the projects table
    const result = await HYPERDRIVE.prepare(`
      SELECT * FROM projects 
      ORDER BY created_at DESC
    `).all();

    return c.json({
      success: true,
      data: result.results,
      count: result.results.length
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return c.json({ 
      error: 'Failed to fetch projects',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get a single project by ID
projects.get('/:id', async (c) => {
  try {
    const { HYPERDRIVE } = c.env;
    const id = c.req.param('id');
    
    if (!HYPERDRIVE) {
      return c.json({ error: 'Hyperdrive not configured' }, 503);
    }

    const result = await HYPERDRIVE.prepare(`
      SELECT * FROM projects 
      WHERE id = ?
    `).bind(id).first();

    if (!result) {
      return c.json({ error: 'Project not found' }, 404);
    }

    return c.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return c.json({ 
      error: 'Failed to fetch project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Create a new project
projects.post('/', async (c) => {
  try {
    const { HYPERDRIVE } = c.env;
    const body = await c.req.json();
    
    if (!HYPERDRIVE) {
      return c.json({ error: 'Hyperdrive not configured' }, 503);
    }

    // Validate required fields
    if (!body.name) {
      return c.json({ error: 'Project name is required' }, 400);
    }

    const result = await HYPERDRIVE.prepare(`
      INSERT INTO projects (name, description, status, metadata)
      VALUES (?, ?, ?, ?)
      RETURNING *
    `).bind(
      body.name,
      body.description || null,
      body.status || 'active',
      JSON.stringify(body.metadata || {})
    ).first();

    return c.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return c.json({ 
      error: 'Failed to create project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Update a project
projects.put('/:id', async (c) => {
  try {
    const { HYPERDRIVE } = c.env;
    const id = c.req.param('id');
    const body = await c.req.json();
    
    if (!HYPERDRIVE) {
      return c.json({ error: 'Hyperdrive not configured' }, 503);
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    
    if (body.name !== undefined) {
      updates.push('name = ?');
      values.push(body.name);
    }
    if (body.description !== undefined) {
      updates.push('description = ?');
      values.push(body.description);
    }
    if (body.status !== undefined) {
      updates.push('status = ?');
      values.push(body.status);
    }
    if (body.metadata !== undefined) {
      updates.push('metadata = ?');
      values.push(JSON.stringify(body.metadata));
    }
    
    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id); // Add ID for WHERE clause

    const result = await HYPERDRIVE.prepare(`
      UPDATE projects 
      SET ${updates.join(', ')}
      WHERE id = ?
      RETURNING *
    `).bind(...values).first();

    if (!result) {
      return c.json({ error: 'Project not found' }, 404);
    }

    return c.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return c.json({ 
      error: 'Failed to update project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Delete a project
projects.delete('/:id', async (c) => {
  try {
    const { HYPERDRIVE } = c.env;
    const id = c.req.param('id');
    
    if (!HYPERDRIVE) {
      return c.json({ error: 'Hyperdrive not configured' }, 503);
    }

    const result = await HYPERDRIVE.prepare(`
      DELETE FROM projects 
      WHERE id = ?
      RETURNING id
    `).bind(id).first();

    if (!result) {
      return c.json({ error: 'Project not found' }, 404);
    }

    return c.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return c.json({ 
      error: 'Failed to delete project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Search projects
projects.get('/search', async (c) => {
  try {
    const { HYPERDRIVE } = c.env;
    const query = c.req.query('q');
    
    if (!HYPERDRIVE) {
      return c.json({ error: 'Hyperdrive not configured' }, 503);
    }

    if (!query) {
      return c.json({ error: 'Search query is required' }, 400);
    }

    const result = await HYPERDRIVE.prepare(`
      SELECT * FROM projects 
      WHERE name ILIKE ? OR description ILIKE ?
      ORDER BY created_at DESC
    `).bind(`%${query}%`, `%${query}%`).all();

    return c.json({
      success: true,
      data: result.results,
      count: result.results.length
    });
  } catch (error) {
    console.error('Error searching projects:', error);
    return c.json({ 
      error: 'Failed to search projects',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default projects;