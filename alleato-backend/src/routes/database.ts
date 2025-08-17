import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from '../types/env';
import { CacheService, CacheTTL } from '../services/cache';

const databaseRoutes = new Hono<{ Bindings: Env }>();

// Enable CORS
databaseRoutes.use('/*', cors());

// Initialize cache service
const getCacheService = (env: Env) => new CacheService(env);

// Get all tables in the database (with caching)
databaseRoutes.get('/tables', async (c) => {
  const cache = getCacheService(c.env);
  const cacheKey = cache.keys.tableList();
  
  try {
    // Check cache first
    const { data: cachedData, isStale } = await cache.get(cacheKey);
    if (cachedData && !isStale) {
      c.header('X-Cache', 'HIT');
      return c.json(cachedData);
    }

    // Cache miss or stale - fetch from database
    const { results } = await c.env.DB.prepare(
      `SELECT name, sql FROM sqlite_master 
       WHERE type='table' 
       AND name NOT LIKE 'sqlite_%' 
       AND name NOT LIKE '_cf_%'
       ORDER BY name`
    ).all();

    const response = {
      success: true,
      tables: results,
      cached: false,
    };

    // Cache the response
    await cache.set(cacheKey, response, CacheTTL.TABLE_LIST);
    
    c.header('X-Cache', 'MISS');
    return c.json(response);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch tables',
    }, 500);
  }
});

// Get table schema (with caching)
databaseRoutes.get('/tables/:tableName/schema', async (c) => {
  const tableName = c.req.param('tableName');
  const cache = getCacheService(c.env);
  const cacheKey = cache.keys.tableSchema(tableName);
  
  try {
    // Validate table name to prevent SQL injection
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return c.json({
        success: false,
        error: 'Invalid table name',
      }, 400);
    }

    // Check cache first
    const { data: cachedData, isStale } = await cache.get(cacheKey);
    if (cachedData && !isStale) {
      c.header('X-Cache', 'HIT');
      return c.json(cachedData);
    }

    // Get table info from database
    const { results } = await c.env.DB.prepare(
      `PRAGMA table_info('${tableName}')`
    ).all();

    const response = {
      success: true,
      tableName,
      columns: results,
      cached: false,
    };

    // Cache the response
    await cache.set(cacheKey, response, CacheTTL.TABLE_SCHEMA);
    
    c.header('X-Cache', 'MISS');
    return c.json(response);
  } catch (error) {
    console.error('Error fetching table schema:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch table schema',
    }, 500);
  }
});

// Get data from a specific table with pagination (with smart caching)
databaseRoutes.get('/tables/:tableName/data', async (c) => {
  const tableName = c.req.param('tableName');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '50');
  const sortBy = c.req.query('sortBy') || 'id';
  const sortOrder = c.req.query('sortOrder') || 'asc';
  const search = c.req.query('search') || '';
  
  const cache = getCacheService(c.env);
  const cacheKey = cache.keys.tableData(tableName, page, limit, sortBy, sortOrder, search);
  
  try {
    // Validate inputs
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return c.json({
        success: false,
        error: 'Invalid table name',
      }, 400);
    }
    
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(sortBy)) {
      return c.json({
        success: false,
        error: 'Invalid sort column',
      }, 400);
    }
    
    if (!['asc', 'desc'].includes(sortOrder.toLowerCase())) {
      return c.json({
        success: false,
        error: 'Invalid sort order',
      }, 400);
    }

    // Check cache for non-search queries (search results change frequently)
    if (!search) {
      const { data: cachedData, isStale } = await cache.get(cacheKey);
      if (cachedData && !isStale) {
        c.header('X-Cache', 'HIT');
        return c.json(cachedData);
      }
    }

    const offset = (page - 1) * limit;

    // Build and execute queries
    let countQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
    let dataQuery = `SELECT * FROM ${tableName}`;
    
    // Add search if provided
    if (search) {
      // Get column names first
      const { results: columns } = await c.env.DB.prepare(
        `PRAGMA table_info('${tableName}')`
      ).all();
      
      // Build search conditions for text columns
      const textColumns = columns.filter((col: any) => 
        ['TEXT', 'VARCHAR'].includes(col.type.toUpperCase()) || col.type.includes('CHAR')
      );
      
      if (textColumns.length > 0) {
        const searchConditions = textColumns
          .map((col: any) => `${col.name} LIKE ?`)
          .join(' OR ');
        
        const whereClause = ` WHERE ${searchConditions}`;
        countQuery += whereClause;
        dataQuery += whereClause;
      }
    }
    
    // Add sorting and pagination
    dataQuery += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;

    // Execute queries
    let totalCount = 0;
    let results = [];

    if (search && search.trim()) {
      // Get column names for search
      const { results: columns } = await c.env.DB.prepare(
        `PRAGMA table_info('${tableName}')`
      ).all();
      
      const textColumns = columns.filter((col: any) => 
        ['TEXT', 'VARCHAR'].includes(col.type.toUpperCase()) || col.type.includes('CHAR')
      );
      
      if (textColumns.length > 0) {
        // Prepare search parameters
        const searchParams = textColumns.map(() => `%${search}%`);
        
        // Get count with search
        const countResult = await c.env.DB.prepare(countQuery).bind(...searchParams).first();
        totalCount = countResult?.count || 0;
        
        // Get data with search
        const dataResult = await c.env.DB.prepare(dataQuery).bind(...searchParams, limit, offset).all();
        results = dataResult.results;
      }
    } else {
      // No search - use cached count if available
      const countCacheKey = cache.keys.tableCount(tableName);
      const { data: cachedCount } = await cache.get(countCacheKey);
      
      if (cachedCount) {
        totalCount = cachedCount as number;
      } else {
        const countResult = await c.env.DB.prepare(countQuery).first();
        totalCount = countResult?.count || 0;
        // Cache the count
        await cache.set(countCacheKey, totalCount, CacheTTL.TABLE_COUNT);
      }
      
      const dataResult = await c.env.DB.prepare(dataQuery)
        .bind(limit, offset)
        .all();
      results = dataResult.results;
    }

    const response = {
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      cached: false,
    };

    // Cache the response (only for non-search queries)
    if (!search) {
      await cache.set(cacheKey, response, CacheTTL.TABLE_DATA);
    }
    
    c.header('X-Cache', search ? 'BYPASS' : 'MISS');
    return c.json(response);
  } catch (error) {
    console.error('Error fetching table data:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch table data',
    }, 500);
  }
});

// Get distinct values for a column (with caching)
databaseRoutes.get('/tables/:tableName/column/:columnName/values', async (c) => {
  const tableName = c.req.param('tableName');
  const columnName = c.req.param('columnName');
  const cache = getCacheService(c.env);
  const cacheKey = cache.keys.columnValues(tableName, columnName);
  
  try {
    // Validate inputs
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return c.json({
        success: false,
        error: 'Invalid table name',
      }, 400);
    }
    
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columnName)) {
      return c.json({
        success: false,
        error: 'Invalid column name',
      }, 400);
    }

    // Check cache first
    const { data: cachedData, isStale } = await cache.get(cacheKey);
    if (cachedData && !isStale) {
      c.header('X-Cache', 'HIT');
      return c.json(cachedData);
    }

    const { results } = await c.env.DB.prepare(
      `SELECT DISTINCT ${columnName} as value, COUNT(*) as count 
       FROM ${tableName} 
       WHERE ${columnName} IS NOT NULL 
       GROUP BY ${columnName} 
       ORDER BY count DESC 
       LIMIT 100`
    ).all();

    const response = {
      success: true,
      values: results,
      cached: false,
    };

    // Cache the response
    await cache.set(cacheKey, response, CacheTTL.COLUMN_VALUES);
    
    c.header('X-Cache', 'MISS');
    return c.json(response);
  } catch (error) {
    console.error('Error fetching column values:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch column values',
    }, 500);
  }
});

// Update a single row in a table
databaseRoutes.put('/tables/:tableName/data/:id', async (c) => {
  const tableName = c.req.param('tableName');
  const id = c.req.param('id');
  const updates = await c.req.json();
  const cache = getCacheService(c.env);
  
  try {
    // Validate table name
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return c.json({
        success: false,
        error: 'Invalid table name',
      }, 400);
    }

    // Remove id from updates if present
    const { id: _, ...updateData } = updates;
    
    // Build UPDATE query
    const columns = Object.keys(updateData);
    if (columns.length === 0) {
      return c.json({
        success: false,
        error: 'No fields to update',
      }, 400);
    }

    // Validate column names
    for (const col of columns) {
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col)) {
        return c.json({
          success: false,
          error: `Invalid column name: ${col}`,
        }, 400);
      }
    }

    // Build parameterized query
    const setClause = columns.map(col => `${col} = ?`).join(', ');
    const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
    const values = [...columns.map(col => updateData[col]), id];

    // Execute update
    const result = await c.env.DB.prepare(query).bind(...values).run();

    if (result.meta.changes === 0) {
      return c.json({
        success: false,
        error: 'No rows updated. Record may not exist.',
      }, 404);
    }

    // Invalidate relevant caches
    await cache.invalidateTable(tableName);

    // Fetch the updated row
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM ${tableName} WHERE id = ?`
    ).bind(id).all();

    return c.json({
      success: true,
      data: results[0] || null,
      message: 'Record updated successfully',
    });
  } catch (error) {
    console.error('Error updating record:', error);
    return c.json({
      success: false,
      error: 'Failed to update record',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// Create a new row in a table
databaseRoutes.post('/tables/:tableName/data', async (c) => {
  const tableName = c.req.param('tableName');
  const data = await c.req.json();
  const cache = getCacheService(c.env);
  
  try {
    // Validate table name
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return c.json({
        success: false,
        error: 'Invalid table name',
      }, 400);
    }

    const columns = Object.keys(data);
    if (columns.length === 0) {
      return c.json({
        success: false,
        error: 'No data provided',
      }, 400);
    }

    // Validate column names
    for (const col of columns) {
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col)) {
        return c.json({
          success: false,
          error: `Invalid column name: ${col}`,
        }, 400);
      }
    }

    // Build INSERT query
    const columnList = columns.join(', ');
    const placeholders = columns.map(() => '?').join(', ');
    const query = `INSERT INTO ${tableName} (${columnList}) VALUES (${placeholders})`;
    const values = columns.map(col => data[col]);

    // Execute insert
    const result = await c.env.DB.prepare(query).bind(...values).run();

    // Invalidate relevant caches
    await cache.invalidateTable(tableName);

    // Fetch the created row
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM ${tableName} WHERE id = ?`
    ).bind(result.meta.last_row_id).all();

    return c.json({
      success: true,
      data: results[0] || null,
      message: 'Record created successfully',
    });
  } catch (error) {
    console.error('Error creating record:', error);
    return c.json({
      success: false,
      error: 'Failed to create record',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// Delete a row from a table
databaseRoutes.delete('/tables/:tableName/data/:id', async (c) => {
  const tableName = c.req.param('tableName');
  const id = c.req.param('id');
  const cache = getCacheService(c.env);
  
  try {
    // Validate table name
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return c.json({
        success: false,
        error: 'Invalid table name',
      }, 400);
    }

    // Execute delete
    const result = await c.env.DB.prepare(
      `DELETE FROM ${tableName} WHERE id = ?`
    ).bind(id).run();

    if (result.meta.changes === 0) {
      return c.json({
        success: false,
        error: 'No rows deleted. Record may not exist.',
      }, 404);
    }

    // Invalidate relevant caches
    await cache.invalidateTable(tableName);

    return c.json({
      success: true,
      message: 'Record deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    return c.json({
      success: false,
      error: 'Failed to delete record',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// Cache management endpoints
databaseRoutes.post('/cache/invalidate/:tableName', async (c) => {
  const tableName = c.req.param('tableName');
  const cache = getCacheService(c.env);
  
  try {
    await cache.invalidateTable(tableName);
    return c.json({
      success: true,
      message: `Cache invalidated for table: ${tableName}`,
    });
  } catch (error) {
    console.error('Error invalidating cache:', error);
    return c.json({
      success: false,
      error: 'Failed to invalidate cache',
    }, 500);
  }
});

export { databaseRoutes };