import { NextRequest, NextResponse } from 'next/server';
import { createMCPClient } from '@/lib/mcp/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, query, config } = body;

    // Initialize MCP client
    const mcpClient = createMCPClient(config);

    let result;
    switch (action) {
      case 'query':
        if (!query) {
          return NextResponse.json(
            { error: 'Query parameter is required' },
            { status: 400 }
          );
        }
        result = await mcpClient.executeQuery(query);
        break;
      
      case 'getSchema':
        result = await mcpClient.getSchema();
        break;
      
      case 'getTables':
        result = await mcpClient.getTables();
        break;
      
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('MCP API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'MCP API endpoint',
    availableActions: ['query', 'getSchema', 'getTables'],
    method: 'POST'
  });
}