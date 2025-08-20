import { NextRequest, NextResponse } from 'next/server';

const WORKER_URL = process.env.NEXT_PUBLIC_AI_WORKER_URL || 'https://ai-agent-supabase-worker.megan-d14.workers.dev';

export async function POST(request: NextRequest) {
  try {
    const { message, projectId } = await request.json();

    if (!message || !projectId) {
      return NextResponse.json(
        { error: 'Message and projectId are required' },
        { status: 400 }
      );
    }

    console.log(`Forwarding chat request to worker for project ${projectId}`);

    // Forward the request to the Cloudflare Worker
    const workerResponse = await fetch(`${WORKER_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: message,
        projectId: projectId,
        mode: 'balanced', // Can be 'recall', 'strategy', or 'balanced'
        sessionId: `web-${projectId}-${Date.now()}`, // Create a session ID
      }),
    });

    if (!workerResponse.ok) {
      throw new Error(`Worker responded with status ${workerResponse.status}`);
    }

    // Handle streaming response from worker
    if (workerResponse.headers.get('content-type')?.includes('text/event-stream')) {
      const reader = workerResponse.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let chunks = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.response) {
                  fullResponse += parsed.response;
                  chunks.push(parsed);
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      return NextResponse.json({
        message: fullResponse,
        sources: chunks.length > 0 ? Math.min(5, chunks.length) : 0, // Estimate sources
        projectId: projectId,
      });
    } else {
      // Handle non-streaming response
      const data = await workerResponse.json();
      return NextResponse.json({
        message: data.response || data.message || 'No response from AI',
        sources: data.sources || 0,
        projectId: projectId,
      });
    }

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    endpoint: '/api/chat/project',
    method: 'POST',
    required: ['message', 'projectId'],
  });
}