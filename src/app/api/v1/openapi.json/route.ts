import { NextResponse } from 'next/server'
import type { OpenAPIV3 } from 'openapi-types'

const openApiSpec: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'AI Elements RAG Pipeline API',
    version: '1.0.0',
    description: 'Complete API documentation for AI Elements RAG Pipeline with Supabase integration, meeting transcript processing, and AI chat capabilities',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'Main API',
    },
    {
      url: '/api/v1',
      description: 'API v1',
    },
  ],
  paths: {
    '/database/tables': {
      get: {
        summary: 'List all database tables',
        tags: ['Database'],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    tables: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          sql: { type: 'string' },
                        },
                      },
                    },
                    cached: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/database/tables/{tableName}/schema': {
      get: {
        summary: 'Get table schema',
        tags: ['Database'],
        parameters: [
          {
            name: 'tableName',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Name of the database table',
          },
        ],
        responses: {
          '200': {
            description: 'Table schema',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    columns: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          type: { type: 'string' },
                          notnull: { type: 'number' },
                          dflt_value: { type: 'string', nullable: true },
                          pk: { type: 'number' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/database/tables/{tableName}/data': {
      get: {
        summary: 'Get table data',
        tags: ['Database'],
        parameters: [
          {
            name: 'tableName',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Name of the database table',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 100 },
            description: 'Number of records to return',
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0 },
            description: 'Number of records to skip',
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string' },
            description: 'Column to sort by',
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
            description: 'Sort order',
          },
        ],
        responses: {
          '200': {
            description: 'Table data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { type: 'object' } },
                    total: { type: 'integer' },
                    cached: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create new record',
        tags: ['Database'],
        parameters: [
          {
            name: 'tableName',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Name of the database table',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'Record data',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Record created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    id: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/database/tables/{tableName}/data/{id}': {
      put: {
        summary: 'Update record',
        tags: ['Database'],
        parameters: [
          {
            name: 'tableName',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Name of the database table',
          },
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Record ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'Updated record data',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Record updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete record',
        tags: ['Database'],
        parameters: [
          {
            name: 'tableName',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Name of the database table',
          },
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Record ID',
          },
        ],
        responses: {
          '200': {
            description: 'Record deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/chat': {
      post: {
        summary: 'Chat with AI Agent (Primary)',
        description: 'Main chat endpoint for AI-powered conversations with meeting transcript context',
        tags: ['AI Chat'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['messages'],
                properties: {
                  messages: {
                    type: 'array',
                    description: 'Chat conversation history',
                    items: {
                      type: 'object',
                      required: ['role', 'content'],
                      properties: {
                        role: { 
                          type: 'string', 
                          enum: ['user', 'assistant', 'system'],
                          description: 'Message sender role' 
                        },
                        content: { 
                          type: 'string',
                          description: 'Message content' 
                        },
                      },
                    },
                  },
                  model: {
                    type: 'string',
                    description: 'AI model to use',
                    default: 'gpt-4'
                  },
                  webSearch: {
                    type: 'boolean',
                    description: 'Enable web search for enhanced responses',
                    default: false
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'AI response stream',
            content: {
              'text/event-stream': {
                schema: {
                  type: 'string',
                  description: 'Server-sent events stream with AI responses',
                },
              },
            },
          },
        },
      },
    },
    '/chat2': {
      post: {
        summary: 'Alternative Chat Endpoint',
        description: 'Secondary chat endpoint with different processing logic',
        tags: ['AI Chat'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  messages: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        role: { type: 'string', enum: ['user', 'assistant', 'system'] },
                        content: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'AI response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                },
              },
            },
          },
        },
      },
    },
    '/ai/sql': {
      post: {
        summary: 'Generate SQL from natural language',
        description: 'Converts natural language queries to SQL statements using AI',
        tags: ['AI Tools'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['query'],
                properties: {
                  query: {
                    type: 'string',
                    description: 'Natural language query to convert to SQL',
                    example: 'Show me all users who signed up last month'
                  },
                  projectRef: {
                    type: 'string',
                    description: 'Supabase project reference',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Generated SQL query',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sql: {
                      type: 'string',
                      description: 'Generated SQL query',
                    },
                    explanation: {
                      type: 'string',
                      description: 'Explanation of the generated query',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/citation': {
      post: {
        summary: 'Extract citations from text',
        description: 'Analyzes text and extracts citations or references',
        tags: ['AI Tools'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['text'],
                properties: {
                  text: {
                    type: 'string',
                    description: 'Text to analyze for citations',
                  },
                  format: {
                    type: 'string',
                    enum: ['APA', 'MLA', 'Chicago'],
                    description: 'Citation format style',
                    default: 'APA'
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Extracted citations',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    citations: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          text: { type: 'string' },
                          source: { type: 'string' },
                          page: { type: 'number' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/supabase-proxy/{path}': {
      get: {
        summary: 'Supabase API Proxy',
        description: 'Proxies requests to Supabase API with authentication',
        tags: ['Proxy'],
        parameters: [
          {
            name: 'path',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Supabase API path to proxy',
          },
        ],
        responses: {
          '200': {
            description: 'Proxied response from Supabase',
          },
        },
      },
    },
    '/projects': {
      get: {
        summary: 'List all projects',
        description: 'Retrieves a list of all projects from the Hyperdrive Supabase projects table',
        tags: ['Projects'],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 100 },
            description: 'Number of projects to return',
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0 },
            description: 'Number of projects to skip',
          },
          {
            name: 'status',
            in: 'query',
            schema: { 
              type: 'string',
              enum: ['active', 'completed', 'on_hold', 'cancelled', 'not_started']
            },
            description: 'Filter by project status',
          },
          {
            name: 'priority',
            in: 'query',
            schema: { 
              type: 'string',
              enum: ['high', 'medium', 'low']
            },
            description: 'Filter by project priority',
          },
        ],
        responses: {
          '200': {
            description: 'List of projects',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          name: { type: 'string' },
                          title: { type: 'string' },
                          description: { type: 'string', nullable: true },
                          status: { 
                            type: 'string',
                            enum: ['active', 'completed', 'on_hold', 'cancelled', 'not_started']
                          },
                          priority: { 
                            type: 'string',
                            enum: ['high', 'medium', 'low']
                          },
                          start_date: { type: 'string', format: 'date', nullable: true },
                          due_date: { type: 'string', format: 'date', nullable: true },
                          created_at: { type: 'string', format: 'date-time' },
                          updated_at: { type: 'string', format: 'date-time' },
                          budget: { type: 'number', nullable: true },
                          team_members: { type: 'array', items: { type: 'object' } },
                          progress: { type: 'number', minimum: 0, maximum: 100 },
                          client_name: { type: 'string', nullable: true },
                          tags: { type: 'array', items: { type: 'string' } },
                          metadata: { type: 'object' },
                        },
                      },
                    },
                    total: { type: 'integer' },
                    limit: { type: 'integer' },
                    offset: { type: 'integer' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Projects table not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                    message: { type: 'string' },
                    code: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a new project',
        description: 'Creates a new project in the Hyperdrive Supabase projects table',
        tags: ['Projects'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'status'],
                properties: {
                  name: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { 
                    type: 'string',
                    enum: ['active', 'completed', 'on_hold', 'cancelled', 'not_started']
                  },
                  priority: { 
                    type: 'string',
                    enum: ['high', 'medium', 'low']
                  },
                  start_date: { type: 'string', format: 'date' },
                  due_date: { type: 'string', format: 'date' },
                  budget: { type: 'number' },
                  team_members: { type: 'array', items: { type: 'object' } },
                  progress: { type: 'number', minimum: 0, maximum: 100 },
                  client_name: { type: 'string' },
                  tags: { type: 'array', items: { type: 'string' } },
                  metadata: { type: 'object' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Project created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'object' },
                    id: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/projects/{id}': {
      get: {
        summary: 'Get project by ID',
        description: 'Retrieves a specific project from the Hyperdrive Supabase projects table',
        tags: ['Projects'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Project ID',
          },
        ],
        responses: {
          '200': {
            description: 'Project details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string', nullable: true },
                        status: { type: 'string' },
                        priority: { type: 'string' },
                        start_date: { type: 'string', format: 'date', nullable: true },
                        due_date: { type: 'string', format: 'date', nullable: true },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                        budget: { type: 'number', nullable: true },
                        team_members: { type: 'array', items: { type: 'object' } },
                        progress: { type: 'number' },
                        client_name: { type: 'string', nullable: true },
                        tags: { type: 'array', items: { type: 'string' } },
                        metadata: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Project not found',
          },
        },
      },
      put: {
        summary: 'Update project',
        description: 'Updates an existing project in the Hyperdrive Supabase projects table',
        tags: ['Projects'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Project ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string' },
                  priority: { type: 'string' },
                  start_date: { type: 'string', format: 'date' },
                  due_date: { type: 'string', format: 'date' },
                  budget: { type: 'number' },
                  team_members: { type: 'array', items: { type: 'object' } },
                  progress: { type: 'number' },
                  client_name: { type: 'string' },
                  tags: { type: 'array', items: { type: 'string' } },
                  metadata: { type: 'object' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Project updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete project',
        description: 'Deletes a project from the Hyperdrive Supabase projects table',
        tags: ['Projects'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Project ID',
          },
        ],
        responses: {
          '200': {
            description: 'Project deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {},
  },
  tags: [
    {
      name: 'Database',
      description: 'Database operations for managing tables and data',
    },
    {
      name: 'Projects',
      description: 'Hyperdrive project management endpoints for CRUD operations on the Supabase projects table',
    },
    {
      name: 'AI Chat',
      description: 'AI-powered chat endpoints with meeting transcript context and RAG capabilities',
    },
    {
      name: 'AI Tools',
      description: 'AI-powered utility endpoints for SQL generation, citation extraction, and more',
    },
    {
      name: 'Proxy',
      description: 'Proxy endpoints for external service integration',
    },
  ],
}

export async function GET() {
  return NextResponse.json(openApiSpec)
}