import { apiClient } from '@/lib/api-client';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  // Forward the request to the backend API
  const response = await apiClient.citation.generate(prompt);
  
  // Return the streaming response from the backend
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}