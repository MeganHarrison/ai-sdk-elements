import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from '../types/env';

const databaseRoutes = new Hono<{ Bindings: Env }>();

// Enable CORS
databaseRoutes.use('/*', cors());

// Get all tables in the database
databaseRoutes.get('/tables', async (c) => {
  try {
    // Query to get all tables from sqlite_master
    const { results } = await c.env.DB.prepare(
      `SELECT name, sql FROM sqlite_master 
       WHERE type='table' 
       AND name NOT LIKE 'sqlite_%' 
       AND name NOT LIKE '_cf_%'
       ORDER BY name`
    ).all();

    return c.json({
      success: true,
      tables: results,
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch tables',
    }, 500);
  }
});

// Get table schema
databaseRoutes.get('/tables/:tableName/schema', async (c) => {
  try {
    const tableName = c.req.param('tableName');
    
    // Validate table name to prevent SQL injection
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return c.json({
        success: false,
        error: 'Invalid table name',
      }, 400);
    }

    // Get table info
    const { results } = await c.env.DB.prepare(
      `PRAGMA table_info('${tableName}')`
    ).all();

    return c.json({
      success: true,
      tableName,
      columns: results,
    });
  } catch (error) {
    console.error('Error fetching table schema:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch table schema',
    }, 500);
  }
});

// Get data from a specific table with pagination
databaseRoutes.get('/tables/:tableName/data', async (c) => {
  try {
    const tableName = c.req.param('tableName');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');
    const sortBy = c.req.query('sortBy') || 'id';
    const sortOrder = c.req.query('sortOrder') || 'asc';
    const search = c.req.query('search') || '';
    
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

    const offset = (page - 1) * limit;

    // Get total count
    let countQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
    let dataQuery = `SELECT * FROM ${tableName}`;
    
    // Add search if provided
    if (search) {
      // Get column names first
      const { results: columns } = await c.env.DB.prepare(
        `PRAGMA table_info('${tableName}')`
      ).all();
      
      // Build search conditions for text columns
      const searchConditions = columns
        .filter((col: any) => ['TEXT', 'VARCHAR'].includes(col.type.toUpperCase()) || col.type.includes('CHAR'))
        .map((col: any) => `${col.name} LIKE ?`)
        .join(' OR ');
      
      if (searchConditions) {
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
        const countStmt = c.env.DB.prepare(countQuery);
        searchParams.forEach(param => countStmt.bind(param));
        const countResult = await countStmt.first();
        totalCount = countResult?.count || 0;
        
        // Get data with search
        const dataStmt = c.env.DB.prepare(dataQuery);
        searchParams.forEach(param => dataStmt.bind(param));
        dataStmt.bind(limit).bind(offset);
        const dataResult = await dataStmt.all();
        results = dataResult.results;
      }
    } else {
      // No search - simple queries
      const countResult = await c.env.DB.prepare(countQuery).first();
      totalCount = countResult?.count || 0;
      
      const dataResult = await c.env.DB.prepare(dataQuery)
        .bind(limit, offset)
        .all();
      results = dataResult.results;
    }

    return c.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching table data:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch table data',
    }, 500);
  }
});

// Get distinct values for a column (useful for filters)
databaseRoutes.get('/tables/:tableName/column/:columnName/values', async (c) => {
  try {
    const tableName = c.req.param('tableName');
    const columnName = c.req.param('columnName');
    
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

    const { results } = await c.env.DB.prepare(
      `SELECT DISTINCT ${columnName} as value, COUNT(*) as count 
       FROM ${tableName} 
       WHERE ${columnName} IS NOT NULL 
       GROUP BY ${columnName} 
       ORDER BY count DESC 
       LIMIT 100`
    ).all();

    return c.json({
      success: true,
      values: results,
    });
  } catch (error) {
    console.error('Error fetching column values:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch column values',
    }, 500);
  }
});

export { databaseRoutes };