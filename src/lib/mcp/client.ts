import { createClient } from '@supabase/supabase-js';

export interface MCPConfig {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  readOnly?: boolean;
}

export class MCPClient {
  private client: any;
  private config: MCPConfig;

  constructor(config: MCPConfig) {
    this.config = config;
    this.initializeClient();
  }

  private initializeClient() {
    this.client = createClient(
      this.config.supabaseUrl,
      this.config.supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }

  async executeQuery(query: string) {
    try {
      // For read-only mode, only allow SELECT queries
      if (this.config.readOnly && !query.trim().toUpperCase().startsWith('SELECT')) {
        throw new Error('Only SELECT queries are allowed in read-only mode');
      }

      // Use Supabase's raw SQL execution via RPC or direct query
      // Note: This requires a custom RPC function in Supabase
      // For now, we'll parse and execute via Supabase client methods
      
      // Simple query parser for basic SELECT statements
      const selectMatch = query.match(/SELECT\s+(.+)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/i);
      
      if (selectMatch) {
        const [, columns, table, whereClause, orderBy, limit] = selectMatch;
        let queryBuilder = this.client.from(table).select(columns === '*' ? '*' : columns);
        
        // Parse simple WHERE clauses (basic implementation)
        if (whereClause) {
          const conditions = whereClause.split(/\s+AND\s+/i);
          for (const condition of conditions) {
            const [field, operator, value] = condition.split(/\s*(=|!=|>|<|>=|<=)\s*/);
            if (field && operator && value) {
              const cleanValue = value.replace(/['"]/g, '');
              switch(operator) {
                case '=':
                  queryBuilder = queryBuilder.eq(field, cleanValue);
                  break;
                case '!=':
                  queryBuilder = queryBuilder.neq(field, cleanValue);
                  break;
                case '>':
                  queryBuilder = queryBuilder.gt(field, cleanValue);
                  break;
                case '<':
                  queryBuilder = queryBuilder.lt(field, cleanValue);
                  break;
                case '>=':
                  queryBuilder = queryBuilder.gte(field, cleanValue);
                  break;
                case '<=':
                  queryBuilder = queryBuilder.lte(field, cleanValue);
                  break;
              }
            }
          }
        }
        
        // Handle ORDER BY
        if (orderBy) {
          const [orderField, orderDir] = orderBy.split(/\s+/);
          const ascending = !orderDir || orderDir.toUpperCase() === 'ASC';
          queryBuilder = queryBuilder.order(orderField, { ascending });
        }
        
        // Handle LIMIT
        if (limit) {
          queryBuilder = queryBuilder.limit(parseInt(limit, 10));
        }
        
        const { data, error } = await queryBuilder;
        if (error) throw error;
        return { success: true, data };
      } else {
        throw new Error('Complex queries require a custom RPC function in Supabase');
      }
    } catch (error) {
      console.error('MCP Query Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getSchema() {
    try {
      // Get all tables in the public schema
      const tablesQuery = `
        SELECT 
          t.table_name,
          t.table_type,
          obj_description(c.oid) as table_comment
        FROM information_schema.tables t
        LEFT JOIN pg_catalog.pg_class c ON c.relname = t.table_name
        WHERE t.table_schema = 'public'
        ORDER BY t.table_name
      `;
      
      // For now, return a list of known tables from your schema
      // This would ideally use the query above via RPC
      const tables = ['users', 'resources', 'projects', 'meetings', 'chunks', 'project_insights'];
      
      const schema = {};
      for (const table of tables) {
        try {
          // Get a sample row to infer schema
          const { data, error } = await this.client.from(table).select('*').limit(1);
          if (!error && data && data.length > 0) {
            schema[table] = {
              columns: Object.keys(data[0]),
              sample: data[0]
            };
          } else {
            schema[table] = { columns: [], sample: null };
          }
        } catch (err) {
          schema[table] = { error: 'Unable to fetch schema' };
        }
      }
      
      return { success: true, data: schema };
    } catch (error) {
      console.error('MCP Schema Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getTables() {
    try {
      // List of known tables in your Supabase instance
      // Ideally this would query information_schema via RPC
      const tables = [
        'users',
        'resources', 
        'projects',
        'meetings',
        'chunks',
        'project_insights',
        'meeting_summaries',
        'project_tasks'
      ];
      
      // Verify which tables actually exist
      const existingTables = [];
      for (const table of tables) {
        try {
          const { error } = await this.client.from(table).select('*').limit(0);
          if (!error) {
            existingTables.push(table);
          }
        } catch (err) {
          // Table doesn't exist or no access
        }
      }
      
      return { success: true, data: existingTables };
    } catch (error) {
      console.error('MCP Tables Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Factory function to create MCP client
export function createMCPClient(config?: Partial<MCPConfig>) {
  const finalConfig: MCPConfig = {
    supabaseUrl: config?.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseServiceRoleKey: config?.supabaseServiceRoleKey || process.env.SUPABASE_SERVICE_KEY!,
    readOnly: config?.readOnly ?? true
  };

  return new MCPClient(finalConfig);
}