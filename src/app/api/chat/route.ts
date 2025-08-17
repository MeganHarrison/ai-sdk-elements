import { UIMessage } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    model: _model,
    webSearch: _webSearch,
  }: { messages: UIMessage[]; model: string; webSearch: boolean } =
    await req.json();

  // Get the backend URL from environment or use default
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 
    'https://alleato-backend.megan-d14.workers.dev';

  // Convert UI messages to the format expected by the AI agent
  const lastUserMessage = messages[messages.length - 1];
  const query = (lastUserMessage as any)?.content || '';
  
  // Prepare chat history (exclude the last message as it's the current query)
  const chatHistory = messages.slice(0, -1).map(msg => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: (msg as any).content,
  }));

  // Determine mode based on context
  // If user asks about "last meeting" or similar, use recall mode
  const mode = query.toLowerCase().includes('last meeting') || 
               query.toLowerCase().includes('recent meeting') ||
               query.toLowerCase().includes('previous meeting') ? 'recall' : 'balanced';

  console.log('[API Route] Proxying to AI Agent:', {
    query,
    mode,
    historyLength: chatHistory.length,
    backendUrl
  });

  try {
    // Forward to the AI agent with RAG pipeline
    const response = await fetch(`${backendUrl}/api/v1/ai-agent/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        chatHistory,
        mode,
        // Generate a session ID if needed
        sessionId: req.headers.get('x-session-id') || undefined,
      }),
    });

    if (!response.ok) {
      console.error('[API Route] Backend error:', response.status, response.statusText);
      throw new Error(`Backend error: ${response.status}`);
    }

    // Stream the response back to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[API Route] Error proxying to backend:', error);
    
    // Return a fallback error response in SSE format
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const errorMessage = `I'm having trouble connecting to the knowledge base. Please try again or check if the backend service is running.`;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: errorMessage })}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
}