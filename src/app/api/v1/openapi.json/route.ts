import { NextResponse } from 'next/server'
import type { OpenAPIV3 } from 'openapi-types'

const openApiSpec: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'AI Elements Chatbot API',
    version: '1.0.0',
    description: 'API documentation for AI Elements Chatbot application',
  },
  servers: [
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
        summary: 'Chat with AI',
        tags: ['Chat'],
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
            description: 'AI response stream',
            content: {
              'text/event-stream': {
                schema: {
                  type: 'string',
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
      description: 'Database operations',
    },
    {
      name: 'Chat',
      description: 'AI chat operations',
    },
  ],
}

export async function GET() {
  return NextResponse.json(openApiSpec)
}